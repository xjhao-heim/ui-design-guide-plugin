import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { apply, name } from "../lib/index.js";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const patch = await readFile(new URL("../cordis.patch.yml", import.meta.url), "utf8");

assert.equal(name, "ui-design-guide");
assert.equal(packageJson.dsh.bundle.patch, "./cordis.patch.yml");
assert.match(patch, /id: ui-design-guide/);
assert.match(patch, /name: '@dsh\/ui-design-guide'/);

const sections = [];
const systemPrompt = {
  section(section) {
    sections.push(section);
  },
  getSectionOrder(name) {
    assert.equal(name, "DEPLOYMENT_PERSONA_SUFFIX");
    return 100;
  }
};
apply({ get(serviceName) {
  assert.equal(serviceName, "systemPrompt");
  return systemPrompt;
} });

assert.equal(sections.length, 1);
assert.equal(sections[0].name, "ui-design-guide");
assert.equal(sections[0].order, 99);
for (const phrase of ["主窗口", "状态窗口/状态变体", "控件样式参考", "可复用控件", "ask_user_question", "设计解析结果", "人工可读的“设计图解析/人工描述提示词”", "人工描述词不是默认前置输入", "输出这份描述词后，等待用户确认"]) {
  assert.match(sections[0].text, new RegExp(phrase.replace(/[\\/]/g, "\\$&")), phrase);
}
assert.match(sections[0].text, /人工描述词不是默认前置输入/);
assert.doesNotMatch(sections[0].text, /先在用户明确提供的资料目录、当前 workspace 和消息附件中查找设计图、设计稿、描述词/);

let called = false;
apply({ get() {
  called = true;
  return undefined;
} });
assert.equal(called, true);

console.log("ui-design-guide plugin tests passed");
