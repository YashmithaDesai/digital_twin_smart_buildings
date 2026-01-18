"""
Root-level ASGI app wrapper for Render deployment.
This imports the FastAPI app from the backend module.
"""
import sys
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent / "digital_twin_smart_buildings" / "backend"
sys.path.insert(0, str(backend_path))

from main import app

__all__ = ["app"]
