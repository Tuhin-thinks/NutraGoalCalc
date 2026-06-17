"""Protocol and exception hierarchy for LLM-based recipe parsing."""

from typing import Protocol

from nvc.models.api import ParsedRecipe


class LLMAdapter(Protocol):
    """Interface for LLM adapters that parse recipe text into structured nutrition data."""

    async def parse_recipe(self, text: str) -> ParsedRecipe:
        """Extract nutritional information from unstructured recipe text.

        Args:
            text: Free-form recipe description or ingredient list.

        Returns:
            A `ParsedRecipe` with estimated macronutrient values.

        Raises:
            LLMNotConfiguredError: Adapter not available.
            LLMAPIConnectionError: Upstream API unreachable or returned an error.
            LLMInvalidResponseError: Response could not be parsed as valid JSON.
            LLMTimeoutError: Request timed out.
        """
        ...


class ParseRecipeError(Exception):
    """Base exception for recipe parsing failures.

    Attributes:
        status_code: HTTP status code appropriate for this error.
        detail: Human-readable description for the API response.
    """

    def __init__(self, status_code: int, detail: str) -> None:
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


class LLMNotConfiguredError(ParseRecipeError):
    """Raised when no LLM provider is configured."""

    def __init__(self) -> None:
        super().__init__(
            status_code=501,
            detail="LLM is not configured. Set NVC_LLM_PROVIDER and related "
            "environment variables to enable recipe parsing.",
        )


class LLMAPIConnectionError(ParseRecipeError):
    """Raised when the upstream LLM API cannot be reached or returns an error."""

    def __init__(self, detail: str) -> None:
        super().__init__(status_code=502, detail=detail)


class LLMInvalidResponseError(ParseRecipeError):
    """Raised when the LLM response is not valid JSON or is missing required fields."""

    def __init__(self, detail: str) -> None:
        super().__init__(status_code=422, detail=detail)


class LLMTimeoutError(ParseRecipeError):
    """Raised when the LLM request times out."""

    def __init__(self, detail: str = "Recipe analysis timed out. Try a shorter recipe description.") -> None:
        super().__init__(status_code=504, detail=detail)
