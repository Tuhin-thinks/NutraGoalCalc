"""Ollama local LLM adapter for recipe parsing.

Posts directly to Ollama's native ``/api/chat`` endpoint via ``httpx``.
"""
import json
import re

import httpx

from nvc.llm.protocol import (
    LLMAPIConnectionError,
    LLMInvalidResponseError,
    LLMTimeoutError,
)
from nvc.models.api import ParsedRecipe

_SYSTEM_PROMPT = """\
You are a nutrition analysis assistant. Given a recipe description, extract nutritional information.
Respond with ONLY a valid JSON object. Do NOT wrap it in markdown code fences. Do NOT include any other text.
Use this exact format:
{
  "name": "Recipe Name",
  "category": "protein|carbs|fruit|vegetable|fiber|fat",
  "unit": "g|each|bowl|scoop|cup|tbsp|tsp|medium|large",
  "reference_weight_g": 100,
  "protein_g": 0.0,
  "carbs_g": 0.0,
  "fat_g": 0.0,
  "calories_kcal": 0,
  "fiber_g": 0.0,
  "min_increment": 1,
  "notes": "brief preparation notes"
}

Rules:
- name should be a descriptive title for the dish.
- Choose the most appropriate category based on the main ingredient.
- reference_weight_g is the weight for which the nutrition values are given (default 100).
- All numeric values must be numbers (not strings).
- Estimate macronutrients based on the ingredients and quantities in the recipe.
- fiber_g is optional, default to 0.
- notes can include preparation method or serving suggestions."""  # noqa: E501


def _strip_fences(raw: str) -> str:
    """Remove markdown code fences (`````json````) if present."""
    stripped = raw.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```[a-zA-Z]*\n?", "", stripped)
        stripped = re.sub(r"\n?```$", "", stripped)
    return stripped.strip()


class OllamaAdapter:
    """LLM adapter using a local Ollama model via the native ``/api/chat`` endpoint."""

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3.2") -> None:
        self._base_url = base_url.rstrip("/")
        self._model = model
        self._client = httpx.AsyncClient(timeout=httpx.Timeout(300))

    async def parse_recipe(self, text: str) -> ParsedRecipe:
        """Send recipe text to a local Ollama model and return parsed nutritional data."""
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": text},
            ],
            "think": False,
            "stream": False,
        }

        try:
            response = await self._client.post(
                f"{self._base_url}/api/chat",
                json=payload,
            )
            response.raise_for_status()
        except httpx.TimeoutException as exc:
            raise LLMTimeoutError() from exc
        except httpx.RequestError as exc:
            raise LLMAPIConnectionError(
                detail=f"Could not connect to Ollama at {self._base_url}: {exc}"
            ) from exc
        except httpx.HTTPStatusError as exc:
            raise LLMAPIConnectionError(
                detail=f"Ollama returned HTTP {exc.response.status_code}: {exc.response.text}"
            ) from exc

        data = response.json()
        raw = data.get("message", {}).get("content", "")
        if not raw:
            raise LLMInvalidResponseError(detail="Ollama returned an empty response.")

        cleaned = _strip_fences(raw)
        return self._validate(cleaned)

    @staticmethod
    def _validate(raw: str) -> ParsedRecipe:
        """Parse JSON string and validate against ParsedRecipe schema."""
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise LLMInvalidResponseError(
                detail=f"Ollama returned invalid JSON: {exc}"
            ) from exc

        if not isinstance(data, dict):
            raise LLMInvalidResponseError(
                detail="Ollama response is not a JSON object."
            )

        required_fields = [
            name
            for name, field in ParsedRecipe.model_fields.items()
            if field.is_required()
        ]
        missing = [f for f in required_fields if f not in data]
        if missing:
            raise LLMInvalidResponseError(
                detail=f"Missing required field(s) in Ollama response: {', '.join(missing)}"
            )

        return ParsedRecipe(**data)
