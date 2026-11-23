import assert from "node:assert/strict";
import test from "node:test";

import { newRunVisible } from "../src/judgment/web/static/assets/js/pages/processing.js";

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
