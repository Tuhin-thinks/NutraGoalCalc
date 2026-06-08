"""HTTP routers for the nutrition API."""

from nvc.routers.foods import router as foods_router
from nvc.routers.health import router as health_router
from nvc.routers.targets import router as targets_router

__all__ = ["foods_router", "health_router", "targets_router"]
