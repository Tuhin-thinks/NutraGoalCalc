"""OpenAI / ChatGPT adapter for recipe parsing."""

import json

from openai import APIError, APITimeoutError, AsyncOpenAI

from nvc.llm.protocol import (
    LLMAPIConnectionError,
    LLMInvalidResponseError,
    LLMTimeoutError,
    ParseRecipeError,
)
from nvc.models.api import ParsedRecipe

_SYSTEM_PROMPT = """\
You are a nutrition analysis assistant. Given a recipe description, extract nutritional information.
Respond with a JSON object in this exact format:
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


class OpenAIAdapter:
    """LLM adapter using OpenAI's chat completions API with JSON mode."""

    def __init__(self, api_key: str, model: str = "gpt-4o-mini") -> None:
        self._client = AsyncOpenAI(api_key=api_key)
        self._model = model

    async def parse_recipe(self, text: str) -> ParsedRecipe:
        """Send recipe text to OpenAI and return parsed nutritional data."""
        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user", "content": text},
                ],
                response_format={"type": "json_object"},
            )
        except APITimeoutError as exc:
            raise LLMTimeoutError() from exc
        except APIError as exc:
            raise LLMAPIConnectionError(
                detail=f"LLM API error: {exc.message}"
            ) from exc
        except Exception as exc:
            raise LLMAPIConnectionError(
                detail=f"Unexpected error calling LLM API: {exc}"
            ) from exc

        raw = response.choices[0].message.content
        if not raw:
            raise LLMInvalidResponseError(detail="LLM returned an empty response.")

        return self._validate(raw)

    @staticmethod
    def _validate(raw: str) -> ParsedRecipe:
        """Parse JSON string and validate against ParsedRecipe schema."""
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise LLMInvalidResponseError(
                detail=f"LLM returned invalid JSON: {exc}"
            ) from exc

        if not isinstance(data, dict):
            raise LLMInvalidResponseError(
                detail="LLM response is not a JSON object."
            )

        missing = [field for field in ParsedRecipe.model_fields if field not in data]
        if missing:
            raise LLMInvalidResponseError(
                detail=f"Missing required field(s) in LLM response: {', '.join(missing)}"
            )

        return ParsedRecipe(**data)
