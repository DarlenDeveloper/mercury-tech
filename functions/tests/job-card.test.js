import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { publicJobCardData, renderJobCard } from "../job-card.js";

test("customer job-card data excludes repair staff identity and contact details", () => {
  const card = publicJobCardData({
    jobCardNumber: "JC-2026-000001",
    userName: "Preview Customer",
    userPhone: "0700 000 000",
    receivedByName: "repair.person@example.com",
    leadTechnicianName: "Private Technician",
    leadTechnicianPhone: "0777 111 222",
    technicianSnapshots: [{ name: "Private Technician", phone: "0777 111 222" }],
  });
  assert.equal(card.userPhone, "0700 000 000");
  assert.equal("receivedByName" in card, false);
  assert.equal("leadTechnicianName" in card, false);
  assert.equal("leadTechnicianPhone" in card, false);
  assert.equal("technicianSnapshots" in card, false);
});

test("job card is a single-page PDF built only from supplied repair data", async () => {
  const pdf = await renderJobCard({
    jobCardNumber: "JC-2026-000001",
    userName: "Preview Customer",
    userPhone: "0700 000 000",
    device: "Laptop",
    issue: "Does not power on",
    pickedUpAt: new Date("2026-10-26T09:00:00+03:00"),
    receivedByName: "Service desk",
    accessories: { adapter: true, bag: false },
  });
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
  assert.ok(pdf.length > 20_000);
  // PDFKit emits one /Type /Page object plus one /Type /Pages tree object.
  assert.equal((pdf.toString("latin1").match(/\/Type \/Page\b/g) || []).length, 1);
  assert.equal(pdf.toString("latin1").includes("RUBY HOSPITAL"), false);
  assert.ok((await readFile(new URL("../assets/job-card-logo.png", import.meta.url))).length > 1000);
});
