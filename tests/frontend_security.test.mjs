import assert from "node:assert/strict";
import test from "node:test";

import { securityAuditRows } from "../src/judgment/web/static/assets/js/pages/admin.js";

test("security audit rows escape untrusted event fields", () => {
  const payload = '<img src=x onerror="alert(1)"><script>alert(2)</script>';
  const html = securityAuditRows([
    {
      created_at: payload,
      event_type: payload,
      outcome: payload,
      method: payload,
      path: payload,
      actor: payload,
      source: payload,
      client_ip_hash: payload,
    },
  ]);

  assert.equal(html.includes("<img"), false);
  assert.equal(html.includes("<script"), false);
  assert.equal(html.includes("&lt;img"), true);
  assert.equal(html.includes("&lt;script&gt;"), true);
});

test("security audit rows keep an empty state without markup injection", () => {
  assert.equal(securityAuditRows([]).includes("尚無安全稽核事件。"), true);
});
