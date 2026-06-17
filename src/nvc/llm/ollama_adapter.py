"""Ollama local LLM adapter for recipe parsing.

Uses the OpenAI-compatible client with a custom base URL pointed at Ollama's
``/v1`` endpoint.
"""

import json
import re

from openai import APITimeoutError, AsyncOpenAI
from openai import APIError as OpenAIAPIError

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
    """LLM adapter using a local Ollama model via the OpenAI-compatible endpoint."""

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3.2") -> None:
        self._client = AsyncOpenAI(base_url=f"{base_url}/v1", api_key="ollama")
        self._model = model

    async def parse_recipe(self, text: str) -> ParsedRecipe:
        """Send recipe text to a local Ollama model and return parsed nutritional data."""
        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user", "content": text},
                ],
            )
        except APITimeoutError as exc:
            raise LLMTimeoutError() from exc
        except OpenAIAPIError as exc:
            raise LLMAPIConnectionError(
                detail=f"Ollama API error: {exc.message}"
            ) from exc
        except Exception as exc:
            raise LLMAPIConnectionError(
                detail=f"Could not connect to Ollama at {self._client.base_url}: {exc}"
            ) from exc

        raw = response.choices[0].message.content
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

        missing = [field for field in ParsedRecipe.model_fields if field not in data]
        if missing:
            raise LLMInvalidResponseError(
                detail=f"Missing required field(s) in Ollama response: {', '.join(missing)}"
            )

        return ParsedRecipe(**data)
