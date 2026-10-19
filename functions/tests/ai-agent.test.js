import test from "node:test";
import assert from "node:assert/strict";
import { buildSystemPrompt } from "../ai-agent.js";

test("assistant always routes repair and service requests to the public form", () => {
  const prompt = buildSystemPrompt({
    systemPrompt: "Keep replies welcoming.",
    storeInfo: "Custom store information without repair instructions.",
    knowledgeBase: "",
  }, []);

  assert.match(prompt, /book, create, start or request a repair or service/i);
  assert.match(prompt, /https:\/\/www\.mercurycomputerslimited\.com\/repairs/);
  assert.match(prompt, /Never claim that a repair request was created inside this chat/);
});
