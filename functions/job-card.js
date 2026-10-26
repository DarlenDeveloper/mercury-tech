import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const DEFAULT_LOGO = fileURLToPath(new URL("./assets/job-card-logo.png", import.meta.url));
const BLUE = "#148ec4";
const INK = "#27313d";
const MUTED = "#596474";

function clean(value, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function displayDate(value) {
  const date = value?.toDate?.() || (value instanceof Date ? value : null);
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-UG", { timeZone: "Africa/Kampala", day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function moneyOrBlank(value) {
  return Number.isSafeInteger(value) && value > 0 ? `UGX ${value.toLocaleString("en-UG")}` : "";
}

function drawCell(doc, x, y, width, height, label, value, { labelWidth = 86, fontSize = 8.5 } = {}) {
  doc.rect(x, y, width, height).strokeColor(INK).lineWidth(0.7).stroke();
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(INK).text(label.toUpperCase(), x + 6, y + 7, { width: labelWidth - 10, height: height - 10 });
  doc.font("Helvetica").fontSize(fontSize).fillColor(INK).text(clean(value, 500), x + labelWidth, y + 7, { width: width - labelWidth - 7, height: height - 10, ellipsis: true });
}

function checkbox(value) {
  return value === true ? "Yes" : value === false ? "No" : "";
}

/** Only customer and device-intake data is allowed onto the customer-facing card. */
export function publicJobCardData(ticket = {}) {
  return {
    jobCardNumber: clean(ticket.jobCardNumber, 80),
    userName: clean(ticket.userName, 150),
    userPhone: clean(ticket.userPhone, 40),
    device: clean(ticket.device, 300),
    issue: clean(ticket.issue, 3000),
    pickedUpAt: ticket.pickedUpAt,
    createdAt: ticket.createdAt,
    serialNumber: clean(ticket.serialNumber, 150),
    specification: clean(ticket.specification, 500),
    intakeRemarks: clean(ticket.intakeRemarks, 1000),
    accessories: ticket.accessories && typeof ticket.accessories === "object" ? ticket.accessories : {},
    chargeable: typeof ticket.chargeable === "boolean" ? ticket.chargeable : null,
    warrantyType: clean(ticket.warrantyType, 100),
    amc: typeof ticket.amc === "boolean" ? ticket.amc : null,
    proofOfPurchase: typeof ticket.proofOfPurchase === "boolean" ? ticket.proofOfPurchase : null,
    diagnosisFee: ticket.diagnosisFee,
    amountDue: ticket.amountDue,
    totalPaid: ticket.totalPaid,
  };
}

/** Build the immutable A4 pickup job card from the repair snapshot. */
export function renderJobCard(input, { logoPath = DEFAULT_LOGO } = {}) {
  return new Promise((resolve, reject) => {
    const ticket = publicJobCardData(input);
    const chunks = [];
    const doc = new PDFDocument({ size: "A4", margin: 0, compress: true, info: { Title: `Job card ${clean(ticket.jobCardNumber)}`, Author: "Mercury Computers Limited" } });
    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const left = 31;
    const contentWidth = pageWidth - 62;

    // The same supplied logo is used for the watermark and header mark.
    doc.save().opacity(0.045).image(logoPath, 153, 260, { fit: [290, 290], align: "center", valign: "center" }).restore();
    doc.rect(24, 24, pageWidth - 48, doc.page.height - 48).lineWidth(2.2).strokeColor(BLUE).stroke();
    doc.image(logoPath, left + 7, 39, { fit: [64, 64], align: "center", valign: "center" });
    doc.font("Helvetica-Bold").fontSize(20).fillColor(INK).text("MERCURY COMPUTERS LIMITED", 107, 42, { width: 440, align: "center" });
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text("Plot 93/97, Kamwokya, Kira Road, Kampala, Uganda", 107, 69, { width: 440, align: "center" });
    doc.text("Tel: 0414-256136 / 347229, 0705-997906", 107, 81, { width: 440, align: "center" });
    doc.text("support@mercurycomputerslimited.com  |  mercurycomputerslimited.com", 107, 93, { width: 440, align: "center" });
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK).text("AN ISO 9001:2015 CERTIFIED COMPANY", 107, 107, { width: 440, align: "center" });
    doc.font("Helvetica-Bold").fontSize(18).text("REPAIR JOB CARD", left, 125, { width: contentWidth, align: "center" });
    doc.fontSize(8).fillColor(BLUE).text("UNDER DIAGNOSIS - ALLOW 24 TO 48 HOURS", left, 148, { width: contentWidth, align: "center", characterSpacing: 0.8 });

    drawCell(doc, left, 169, 318, 30, "Client", ticket.userName, { labelWidth: 62, fontSize: 9 });
    drawCell(doc, left + 318, 169, contentWidth - 318, 30, "Date", displayDate(ticket.pickedUpAt || ticket.createdAt), { labelWidth: 45, fontSize: 9 });
    drawCell(doc, left, 199, 267, 28, "Phone", ticket.userPhone, { labelWidth: 62 });
    drawCell(doc, left + 267, 199, contentWidth - 267, 28, "Job card no.", ticket.jobCardNumber, { labelWidth: 78 });
    drawCell(doc, left, 227, contentWidth, 28, "Brand / model", ticket.device, { labelWidth: 83 });
    drawCell(doc, left, 255, contentWidth, 28, "Serial no.", ticket.serialNumber, { labelWidth: 83 });
    drawCell(doc, left, 283, contentWidth, 28, "Specification", ticket.specification, { labelWidth: 83 });
    drawCell(doc, left, 311, contentWidth, 43, "Reported problem", ticket.issue, { labelWidth: 98, fontSize: 8.2 });
    drawCell(doc, left, 354, contentWidth, 36, "Intake remarks", ticket.intakeRemarks, { labelWidth: 98, fontSize: 8.2 });

    doc.rect(left, 390, contentWidth, 26).strokeColor(INK).lineWidth(0.7).stroke();
    doc.font("Helvetica-Bold").fontSize(7.5).fillColor(INK).text("ACCESSORIES", left + 6, 398);
    const accessories = ticket.accessories || {};
    const accessoryText = [
      ["Keyboard", accessories.keyboard], ["Battery", accessories.battery], ["Adapter", accessories.adapter],
      ["Bag", accessories.bag], ["Storage", accessories.storage], ["Other", accessories.other],
    ].map(([label, value]) => `${label}: ${typeof value === "string" ? clean(value, 40) : checkbox(value)}`).join("    ");
    doc.font("Helvetica").fontSize(8).text(accessoryText, left + 92, 398, { width: contentWidth - 100, ellipsis: true });

    drawCell(doc, left, 416, contentWidth / 4, 27, "Chargeable", checkbox(ticket.chargeable), { labelWidth: 70 });
    drawCell(doc, left + contentWidth / 4, 416, contentWidth / 4, 27, "Warranty", clean(ticket.warrantyType), { labelWidth: 62 });
    drawCell(doc, left + contentWidth / 2, 416, contentWidth / 4, 27, "AMC", checkbox(ticket.amc), { labelWidth: 39 });
    drawCell(doc, left + (contentWidth * 3) / 4, 416, contentWidth / 4, 27, "POP", checkbox(ticket.proofOfPurchase), { labelWidth: 38 });

    doc.font("Helvetica-BoldOblique").fontSize(11).fillColor(INK).text("TERMS AND CONDITIONS", left + 7, 452);
    const terms = [
      "Diagnosis normally takes 24 to 48 hours after the device is received.",
      "Back up important data before service. Mercury is not responsible for data loss caused by an existing fault.",
      "The repair amount is communicated after diagnosis and payment is due when the approved work is complete.",
      "The original job card must be presented when collecting the device.",
    ];
    doc.font("Helvetica").fontSize(7.2).fillColor(MUTED);
    terms.forEach((term, index) => doc.text(`${index + 1}. ${term}`, left + 7, 470 + index * 13, { width: contentWidth - 14, lineBreak: false, ellipsis: true }));

    drawCell(doc, left, 526, contentWidth / 2, 31, "Diagnosis fee", moneyOrBlank(ticket.diagnosisFee), { labelWidth: 92 });
    drawCell(doc, left + contentWidth / 2, 526, contentWidth / 2, 31, "Estimated cost", moneyOrBlank(ticket.amountDue), { labelWidth: 92 });
    drawCell(doc, left, 557, contentWidth / 2, 31, "Payment", moneyOrBlank(ticket.totalPaid), { labelWidth: 92 });
    drawCell(doc, left + contentWidth / 2, 557, contentWidth / 2, 31, "Balance", ticket.amountDue ? moneyOrBlank(Math.max(0, ticket.amountDue - (ticket.totalPaid || 0))) : "", { labelWidth: 92 });

    doc.font("Helvetica-Bold").fontSize(8).fillColor(INK).text("CUSTOMER ACKNOWLEDGEMENT", left + 7, 601);
    doc.font("Helvetica").fontSize(7.5).fillColor(MUTED).text("I confirm that the device and listed accessories were received as recorded above.", left + 7, 616, { width: contentWidth - 14 });
    doc.font("Helvetica-Bold").fontSize(8).fillColor(INK).text("Customer signature:", left + 7, 640);
    doc.moveTo(left + 91, 650).lineTo(left + 265, 650).strokeColor(MUTED).lineWidth(0.5).stroke();
    doc.text("Received by:", left + 300, 640);
    doc.moveTo(left + 363, 650).lineTo(left + contentWidth - 7, 650).stroke();

    doc.save().dash(4, { space: 3 }).moveTo(left, 671).lineTo(left + contentWidth, 671).strokeColor(MUTED).lineWidth(0.7).stroke().restore();
    doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text("CUSTOMER COLLECTION SLIP", left + 7, 684);
    drawCell(doc, left + 7, 704, 245, 31, "Job card no.", ticket.jobCardNumber, { labelWidth: 81, fontSize: 9 });
    drawCell(doc, left + 252, 704, contentWidth - 259, 31, "Date", displayDate(ticket.pickedUpAt || ticket.createdAt), { labelWidth: 42 });
    drawCell(doc, left + 7, 735, contentWidth - 14, 31, "Device", ticket.device, { labelWidth: 57, fontSize: 9 });
    doc.font("Helvetica-Bold").fontSize(8).fillColor(BLUE).text("KEEP THIS SLIP. PRESENT IT WHEN COLLECTING THE DEVICE.", left + 7, 778, { width: contentWidth - 14, align: "center" });

    doc.end();
  });
}

