"""HTTP routers for the nutrition API."""

from nvc.routers.calculate import router as calculate_router
from nvc.routers.foods import router as foods_router
from nvc.routers.health import router as health_router
from nvc.routers.recipe import router as recipe_router

__all__ = ["calculate_router", "foods_router", "health_router", "recipe_router"]
