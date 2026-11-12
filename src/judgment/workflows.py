from __future__ import annotations

import sys
from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass(frozen=True)
class WorkflowDefinition:
    id: str
    label: str
    description: str
    branch: str
    stage: str
    kind: str
    program: str
    script: str
    command: tuple[str, ...]
    mode: str = "runner"  # runner or update
    long_running: bool = False

    def as_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "description": self.description,
            "branch": self.branch,
            "stage": self.stage,
            "kind": self.kind,
            "program": self.program,
            "script": self.script,
            "command": list(self.command),
            "mode": self.mode,
            "long_running": self.long_running,
        }


WORKFLOWS: tuple[WorkflowDefinition, ...] = (
    WorkflowDefinition(
        id="full_update",
        label="資料更新（完整）",
        description="檢查線上法規／命令、處理未匯入的判決壓縮檔，可選擇接續 Qdrant 向量索引。",
        branch="system",
        stage="download",
        kind="update",
        program="python -m judgment.processing_update",
        script="src/judgment/processing_update.py",
        command=(sys.executable, "-m", "judgment.processing_update"),
        mode="update",
        long_running=True,
    ),
    WorkflowDefinition(
        id="law_download",
        label="法規下載",
        description="比對並下載最新法規 ZIP，寫入原始 Parquet、解析條文並更新 PostgreSQL。",
        branch="law",
        stage="download",
        kind="law_download",
        program="judgment-law-download --source law",
        script="src/judgment/law_download/cli.py",
        command=(
            sys.executable,
            "-m",
            "judgment.law_download.cli",
            "--source",
            "law",
        ),
        long_running=True,
    ),
    WorkflowDefinition(
        id="order_download",
        label="命令下載",
        description="比對並下載最新命令 ZIP，寫入原始 Parquet、解析條文並更新 PostgreSQL。",
        branch="order",
        stage="download",
        kind="order_download",
        program="judgment-law-download --source order",
        script="src/judgment/law_download/cli.py",
        command=(
            sys.executable,
            "-m",
            "judgment.law_download.cli",
            "--source",
            "order",
        ),
        long_running=True,
    ),
    WorkflowDefinition(
        id="judgment_download",
        label="判決下載",
        description="優先續傳待補齊的裁判書月份，完成後由最新月份往回驗證既有檔案；缺檔下載、舊版以新 fileset 取代，預設非 API 時段也可下載（一次一個），可跨時段續傳。",
        branch="judgment",
        stage="download",
        kind="judgment_download",
        program="judgment-download",
        script="src/judgment/judgment_download.py",
        command=(sys.executable, "-m", "judgment.judgment_download"),
        long_running=True,
    ),
    WorkflowDefinition(
        id="judgment_import",
        label="判決匯入",
        description="掃描本機未處理的判決 .rar，建立原始 Parquet 備份並匯入符合金融法規清單的判決。",
        branch="judgment",
        stage="postgres",
        kind="judgment_import",
        program="judgment-import-judgments",
        script="src/judgment/judgment_import.py",
        command=(sys.executable, "-m", "judgment.judgment_import"),
        long_running=True,
    ),
    WorkflowDefinition(
        id="judgment_parquet",
        label="判決 Parquet 匯出",
        description="將 PostgreSQL 的 judgment_documents 匯出為可續跑的 Parquet 快照。",
        branch="judgment",
        stage="parquet",
        kind="judgment_parquet",
        program="python -m judgment.judgment_parquet",
        script="src/judgment/judgment_parquet.py",
        command=(sys.executable, "-m", "judgment.judgment_parquet"),
        long_running=False,
    ),
    WorkflowDefinition(
        id="index_versions",
        label="Qdrant 版本建置",
        description="先測試 Ollama 主機與 embedding 模型，建立完整的新版本 collection，複製可重用向量、只 embedding 差異資料，驗證後原子切換 alias。",
        branch="judgment",
        stage="qdrant",
        kind="index_versions",
        program="judgment-index-vectors --build-version --activate",
        script="scripts/index_full_task.sh",
        command=(
            sys.executable,
            "-m",
            "judgment.judgment_index",
            "--build-version",
            "--activate",
            "--batch-size",
            "64",
        ),
        long_running=True,
    ),
    WorkflowDefinition(
        id="normalize_courts",
        label="法院名稱正規化",
        description="將 judgment_documents.court 正規化為標準法院名稱，保留原始欄位。",
        branch="judgment",
        stage="postgres",
        kind="normalize_courts",
        program="judgment-normalize-courts",
        script="src/judgment/court_normalize.py",
        command=(sys.executable, "-m", "judgment.court_normalize"),
        long_running=False,
    ),
    WorkflowDefinition(
        id="backfill_law_articles",
        label="建立條文歷史",
        description="為既有法規／命令版本建立歷史條文快照與變更紀錄，讓資料頁能切換歷史版本並比較條文差異。",
        branch="law",
        stage="postgres",
        kind="backfill_law_articles",
        program="judgment-backfill-law-articles",
        script="src/judgment/law_article_versions.py",
        command=(sys.executable, "-m", "judgment.law_article_versions"),
        long_running=True,
    ),
)

WORKFLOW_BY_ID = {workflow.id: workflow for workflow in WORKFLOWS}


def workflow_definition(workflow_id: str) -> Optional[WorkflowDefinition]:
    return WORKFLOW_BY_ID.get(str(workflow_id or ""))


def workflow_catalog() -> List[Dict[str, Any]]:
    return [workflow.as_dict() for workflow in WORKFLOWS]
