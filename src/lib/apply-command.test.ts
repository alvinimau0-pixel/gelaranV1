import assert from "node:assert/strict";
import test from "node:test";
import { isMutatingCommand } from "./command-safety";

test("isMutatingCommand identifies shared-data changes", () => {
  assert.equal(isMutatingCommand("mark everyone present today"), true);
  assert.equal(isMutatingCommand("update transfer pump tower A level 20 to level 29 95%"), true);
  assert.equal(isMutatingCommand("remove worker Rahim"), true);
  assert.equal(isMutatingCommand("status"), false);
  assert.equal(isMutatingCommand("who is absent today"), false);
});
