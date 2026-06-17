"""LLM integration package for recipe parsing.

Provides adapters for OpenAI and local Ollama models via a common Protocol.
"""

from nvc.llm.openai_adapter import OpenAIAdapter
from nvc.llm.ollama_adapter import OllamaAdapter
from nvc.llm.protocol import LLMAdapter, ParseRecipeError, LLMNotConfiguredError

__all__ = [
    "LLMAdapter",
    "LLMNotConfiguredError",
    "OpenAIAdapter",
    "OllamaAdapter",
    "ParseRecipeError",
    "create_llm_adapter",
]


def create_llm_adapter(
    provider: str | None,
    openai_api_key: str | None,
    openai_model: str,
    ollama_base_url: str,
    ollama_model: str,
) -> LLMAdapter | None:
    """Return an LLM adapter based on the provider name, or None if not configured.

    Args:
        provider: ``"openai"``, ``"ollama"``, or ``None``.
        openai_api_key: OpenAI API key (required for ``provider="openai"``).
        openai_model: OpenAI model name (e.g. ``"gpt-4o-mini"``).
        ollama_base_url: Ollama server URL (e.g. ``"http://localhost:11434"``).
        ollama_model: Ollama model name (e.g. ``"llama3.2"``).

    Returns:
        An `LLMAdapter` instance, or `None` when *provider* is ``None`` or empty.
    """
    if not provider:
        return None

    provider = provider.strip().lower()

    if provider == "openai":
        if not openai_api_key:
            return None
        return OpenAIAdapter(api_key=openai_api_key, model=openai_model)

    if provider == "ollama":
        return OllamaAdapter(base_url=ollama_base_url, model=ollama_model)

    return None
