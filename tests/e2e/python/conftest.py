import os
import subprocess
import time
import urllib.request
import urllib.error
import pytest

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
FRONTEND_URL = os.environ.get("PLAYWRIGHT_FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.environ.get("PLAYWRIGHT_BACKEND_URL", "http://localhost:3001")


def _is_up(url: str) -> bool:
    try:
        urllib.request.urlopen(url, timeout=2)
        return True
    except Exception:
        return False


def _wait_for(url: str, timeout: int = 20) -> None:
    for _ in range(timeout):
        if _is_up(url):
            return
        time.sleep(1)


@pytest.fixture(scope="session")
def base_url() -> str:
    return FRONTEND_URL


@pytest.fixture(scope="session", autouse=True)
def servers():
    if os.environ.get("PLAYWRIGHT_FRONTEND_URL"):
        yield
        return

    procs = []

    if not _is_up(f"{BACKEND_URL}/api/health"):
        p = subprocess.Popen(
            ["npx", "tsx", "src/backend/src/server.ts"],
            cwd=PROJECT_ROOT,
            env={**os.environ, "FRONTEND_ORIGIN": FRONTEND_URL},
        )
        procs.append(p)
        _wait_for(f"{BACKEND_URL}/api/health")

    if not _is_up(FRONTEND_URL):
        p = subprocess.Popen(
            ["npx", "vite", "src/frontend"],
            cwd=PROJECT_ROOT,
            env={**os.environ, "VITE_API_URL": BACKEND_URL},
        )
        procs.append(p)
        _wait_for(FRONTEND_URL)

    yield

    for p in procs:
        p.terminate()
