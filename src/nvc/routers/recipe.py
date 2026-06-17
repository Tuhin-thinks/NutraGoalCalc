"""LLM-powered recipe parsing endpoints."""

from fastapi import APIRouter, HTTPException, Request, status

from nvc.llm.protocol import LLMNotConfiguredError, ParseRecipeError
from nvc.models.api import LLMStatusResponse, ParsedRecipe, RecipeParseRequest

router = APIRouter(tags=["recipe"])


@router.get("/llm/status", response_model=LLMStatusResponse)
def llm_status(request: Request) -> LLMStatusResponse:
    """Return whether an LLM provider is configured and which one."""
    llm = getattr(request.app.state, "llm", None)
    if llm is None:
        return LLMStatusResponse(configured=False)
    provider = getattr(request.app.state, "llm_provider", None)
    return LLMStatusResponse(configured=True, provider=provider)


@router.post("/foods/parse-recipe", response_model=ParsedRecipe)
async def parse_recipe(
    body: RecipeParseRequest,
    request: Request,
) -> ParsedRecipe:
    """Parse unstructured recipe text into structured nutritional data.

    Requires an LLM provider to be configured via environment variables.
    Returns **501 Not Implemented** when no LLM is configured.
    """
    llm = getattr(request.app.state, "llm", None)
    if llm is None:
        raise LLMNotConfiguredError()

    try:
        return await llm.parse_recipe(body.text)
    except ParseRecipeError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error during recipe parsing: {exc}",
        ) from exc
