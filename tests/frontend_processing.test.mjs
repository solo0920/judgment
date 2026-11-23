import assert from "node:assert/strict";
import test from "node:test";

import {
  clearUpdateConsumed,
  markUpdateConsumed,
  newRunVisible,
  workflowPanelMarkup,
} from "../src/judgment/web/static/assets/js/pages/processing.js";

test("pending workflow unlocks only when a new run is visible", () => {
  assert.equal(newRunVisible(null, "old"), false);
  assert.equal(
    newRunVisible({ active_run: null, last_run: { id: "old" } }, "old"),
    false,
  );
  assert.equal(
    newRunVisible({ active_run: { id: "new" }, last_run: { id: "old" } }, "old"),
    true,
  );
  assert.equal(
    newRunVisible({ active_run: null, last_run: { id: "new" } }, "old"),
    true,
  );
  assert.equal(
    newRunVisible({ active_run: null, last_run: { id: "new" } }, ""),
    true,
  );
});

test("workflow intro keeps one action set and collapses execution details", () => {
  const html = workflowPanelMarkup({
    id: "law_download",
    label: "法規下載",
    description: "比對並下載最新法規 ZIP。",
    branch: "law",
    program: "judgment-law-download --source law",
    script: "src/judgment/law_download/cli.py",
    command: ["python", "-m", "judgment.law_download.cli", "--source", "law"],
    can_run: true,
    update_available: true,
    update_count: 1,
    update_origin: "線上來源",
    update_mechanism: "ZIP size check",
    update_message: "可更新",
    update_status: { checked_at: "2026-11-23T00:00:00Z" },
    progress: { stages: [], active_stage: "" },
    recent_runs: [],
    update_history: [],
    index_timelines: [],
  });

  assert.equal(html.includes("processing-workflow-intro"), true);
  assert.equal((html.match(/data-processing-action="run-workflow"/g) || []).length, 1);
  assert.equal((html.match(/data-processing-action="check-updates"/g) || []).length, 1);
  assert.equal(html.includes("processing-workflow-details"), true);
  assert.equal(html.includes("processing-update-action"), false);
  assert.equal(html.includes("<span>更新</span>"), true);
  assert.ok(
    html.indexOf('data-processing-action="check-updates"') <
      html.indexOf('data-processing-action="run-workflow"'),
  );
});

test("download update stays locked until a check finds an update", () => {
  const base = {
    id: "law_download",
    label: "法規下載",
    description: "比對並下載最新法規 ZIP。",
    branch: "law",
    program: "judgment-law-download --source law",
    script: "src/judgment/law_download/cli.py",
    command: ["python", "-m", "judgment.law_download.cli", "--source", "law"],
    can_run: true,
    progress: { stages: [], active_stage: "" },
    recent_runs: [],
    update_history: [],
    index_timelines: [],
  };
  const locked = workflowPanelMarkup({
    ...base,
    update_available: false,
    update_status: { status: "up_to_date" },
  });
  assert.match(
    locked,
    /data-processing-action="run-workflow"[\s\S]{0,180}disabled/,
  );
  assert.equal(
    locked.includes("目前已是最新版本，沒有可更新內容。"),
    true,
  );

  const unchecked = workflowPanelMarkup({
    ...base,
    update_available: false,
    update_status: {},
  });
  assert.equal(
    unchecked.includes("請先按「檢查更新」，確認是否有新版。"),
    true,
  );

  const available = workflowPanelMarkup({
    ...base,
    update_available: true,
    update_status: { status: "update_available" },
  });
  assert.doesNotMatch(
    available,
    /data-processing-action="run-workflow"[\s\S]{0,160}disabled/,
  );

  markUpdateConsumed("law_download");
  try {
    const consumed = workflowPanelMarkup({
      ...base,
      update_available: true,
      update_status: { status: "update_available" },
    });
    assert.match(
      consumed,
      /data-processing-action="run-workflow"[\s\S]{0,180}disabled/,
    );
    assert.equal(consumed.includes("processing-inline-update"), false);
    assert.equal(consumed.includes("請先按「檢查更新」"), true);
  } finally {
    clearUpdateConsumed("law_download");
  }
});

test("index update stays locked until a rebuild is detected", () => {
  for (const id of ["legal_index_versions", "index_versions"]) {
    const base = {
      id,
      label: id === "legal_index_versions" ? "法規／命令索引" : "判決向量索引",
      description: "索引工作流程。",
      branch: "system",
      program: "judgment-index",
      script: "src/judgment/index.py",
      command: ["python", "-m", "judgment.index"],
      can_run: true,
      update_available: false,
      update_count: 0,
      pending_count: 0,
      update_status: {},
      progress: { stages: [], active_stage: "" },
      recent_runs: [],
      update_history: [],
      index_timelines: [],
    };
    const locked = workflowPanelMarkup(base);
    assert.match(
      locked,
      /data-processing-action="run-workflow"[\s\S]{0,180}disabled/,
      `${id} should stay locked without a detected update`,
    );
    assert.equal(
      locked.includes("目前未偵測到可重建的索引內容。"),
      true,
      `${id} should explain why the update is locked`,
    );
    assert.equal(locked.includes("processing-inline-update"), false);

    const available = workflowPanelMarkup({
      ...base,
      update_available: true,
      update_count: 1,
      pending_count: 1,
      update_message: "偵測到需要重建的索引內容。",
    });
    assert.doesNotMatch(
      available,
      /data-processing-action="run-workflow"[\s\S]{0,160}disabled/,
      `${id} should be enabled when a rebuild is detected`,
    );
    assert.equal(available.includes("processing-inline-update"), true);
  }
});
