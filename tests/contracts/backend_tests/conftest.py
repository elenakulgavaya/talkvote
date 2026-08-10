import os
import subprocess
import time
import urllib.request
import requests
import pytest

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
BACKEND_URL = os.environ.get("PLAYWRIGHT_BACKEND_URL", "http://localhost:3001")


def _is_up(url: str) -> bool:
    try:
        urllib.request.urlopen(url, timeout=2)
        return True
    except Exception:
        return False


def _wait_for(url: str, timeout: int = 30) -> None:
    for _ in range(timeout):
        if _is_up(url):
            return
        time.sleep(1)
    raise RuntimeError(f"Timed out waiting for {url}")


@pytest.fixture(scope="session", autouse=True)
def backend():
    if _is_up(f"{BACKEND_URL}/api/health"):
        yield
        return

    proc = subprocess.Popen(
        ["npx", "tsx", "src/backend/src/server.ts"],
        cwd=PROJECT_ROOT,
        env={**os.environ, "PORT": "3001"},
    )
    _wait_for(f"{BACKEND_URL}/api/health")
    yield
    proc.terminate()
