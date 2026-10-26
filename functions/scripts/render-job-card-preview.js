import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { renderJobCard } from "../job-card.js";

const outputDirectory = resolve("../output/pdf");
await mkdir(outputDirectory, { recursive: true });
const pdf = await renderJobCard({
  jobCardNumber: "PREVIEW",
  userName: "",
  userPhone: "",
  device: "",
  issue: "",
  pickedUpAt: new Date(),
  accessories: {},
});
await writeFile(resolve(outputDirectory, "repair-job-card-preview.pdf"), pdf);
console.log("Created output/pdf/repair-job-card-preview.pdf");
