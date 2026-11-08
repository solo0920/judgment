"""Law and order dataset download, version detection and persistence."""

from .cli import build_sources, main
from .client import LawApiClient, LawApiError
from .parser import LawParseError, parse_dataset
from .repository import LawRepository
from .service import LawDownloadService
from .storage import LawStorage
from .types import SourceSpec, SourceType

__all__ = [
    "LawApiClient",
    "LawApiError",
    "LawDownloadService",
    "LawParseError",
    "LawRepository",
    "LawStorage",
    "SourceSpec",
    "SourceType",
    "build_sources",
    "main",
    "parse_dataset",
]
