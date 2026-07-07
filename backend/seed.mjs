// Seeds Firestore (mercurycomputers-tech) with categories, products and config.
//
// Prices are stored in USD (source of truth); the app/admin convert to UGX
// using config/rate. Product images are added later via the admin dashboard.
//
// Auth: set GOOGLE_APPLICATION_CREDENTIALS to a service account key path, e.g.
//   export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
//   npm install && npm run seed
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "mercurycomputers-tech",
});

const db = admin.firestore();

const CATEGORIES = [
  { id: "computers", name: "Computers", order: 1 },
  { id: "printers-office", name: "Printers & Office", order: 2 },
  { id: "components-power", name: "Components & Power", order: 3 },
  { id: "networking-security", name: "Networking & Security", order: 4 },
  { id: "phones-tv-audio", name: "Phones, TV & Audio", order: 5 },
  { id: "accessories", name: "Accessories", order: 6 },
];

const PRODUCTS = [
  // ─── COMPUTERS ───────────────────────────────────────────────────────
  {
    id: "hp-250-g9",
    name: "HP 250 G9 Laptop",
    description: '15.6" Intel Celeron N4500, 4GB RAM, 256GB SSD',
    category: "Laptops",
    categoryId: "computers",
    priceUsd: 350,
    oldPriceUsd: 370,
    stock: 42,
    isNew: true,
    specifications: {
      Condition: "Brand New, Sealed",
      Processor: "Intel Celeron N4500 (up to 2.8 GHz)",
      "Memory (RAM)": "4GB DDR4",
      Storage: "256GB NVMe SSD",
      Display: '15.6" HD (1366 x 768), anti-glare',
      Graphics: "Intel UHD Graphics",
      "Operating System": "Windows 11 Home",
      Battery: "Up to 8 hours",
      Weight: "1.74 kg",
      Warranty: "1 Year HP Warranty",
    },
  },
  {
    id: "lenovo-ideapad-1",
    name: "Lenovo IdeaPad 1",
    description: '14" Intel Celeron N4020, 8GB RAM, 256GB SSD',
    category: "Laptops",
    categoryId: "computers",
    priceUsd: 357,
    oldPriceUsd: 397,
    stock: 18,
    isNew: true,
    specifications: {
      Condition: "Brand New, Sealed",
      Processor: "Intel Celeron N4020 (up to 2.8 GHz, 2 cores)",
      "Memory (RAM)": "8GB DDR4 2400MHz",
      Storage: "256GB M.2 PCIe NVMe SSD",
      Display: '14" FHD (1920 x 1080), anti-glare',
      Graphics: "Intel UHD Graphics 600",
      "Operating System": "Windows 11 Home",
      Connectivity: "Wi-Fi 6, Bluetooth 5.1",
      Ports: "2x USB 3.2, 1x USB-C, HDMI, SD card, 3.5mm",
      Battery: "Up to 10 hours",
      Weight: "1.4 kg",
      Warranty: "1 Year Lenovo Warranty",
    },
  },
  {
    id: "dell-optiplex-7020",
    name: "Dell OptiPlex 7020 MT",
    description: 'Core i5, 8GB RAM, 512GB SSD + 19.5" Monitor',
    category: "Desktops",
    categoryId: "computers",
    priceUsd: 694,
    oldPriceUsd: 714,
    stock: 9,
    isNew: false,
    specifications: {
      Condition: "Brand New, Sealed",
      Processor: "Intel Core i5-14500 (14 cores, up to 5.0 GHz)",
      "Memory (RAM)": "8GB DDR5 4800MHz",
      Storage: "512GB M.2 PCIe NVMe SSD",
      Graphics: "Intel UHD Graphics 770",
      "Operating System": "Windows 11 Pro",
      "Included Monitor": '19.5" Dell LED (1600 x 900)',
      Ports: "USB-C, 4x USB-A, HDMI, DisplayPort, RJ-45",
      "Optical Drive": "DVD-RW",
      Warranty: "3 Years Dell ProSupport",
    },
  },
  {
    id: "dell-e2020h",
    name: "Dell E2020H Monitor",
    description: '20" HD+ 1600x900, TN Panel, 5ms',
    category: "Monitors",
    categoryId: "computers",
    priceUsd: 116,
    oldPriceUsd: 128,
    stock: 24,
    isNew: false,
    specifications: {
      Condition: "Brand New, Sealed",
      "Screen Size": '19.5" (viewable)',
      Resolution: "1600 x 900 (HD+)",
      "Panel Type": "TN",
      "Response Time": "5ms",
      "Refresh Rate": "60Hz",
      Brightness: "250 cd/m²",
      Ports: "VGA, DisplayPort 1.2",
      "VESA Mount": "100 x 100mm",
      Warranty: "3 Years Dell Warranty",
    },
  },
  // ─── PRINTERS & OFFICE ───────────────────────────────────────────────
  {
    id: "hp-deskjet-2320",
    name: "HP DeskJet 2320",
    description: "All-in-One Printer — Print, Scan, Copy",
    category: "Printers",
    categoryId: "printers-office",
    priceUsd: 49,
    oldPriceUsd: 53,
    stock: 76,
    isNew: false,
    specifications: {
      Condition: "Brand New, Sealed",
      Functions: "Print, Scan, Copy",
      "Print Technology": "HP Thermal Inkjet",
      "Print Speed (Black)": "Up to 7.5 ppm",
      "Print Speed (Colour)": "Up to 5.5 ppm",
      Resolution: "Up to 4800 x 1200 dpi",
      "Paper Sizes": "A4, Letter, Legal, Envelopes",
      "Input Tray": "60 sheets",
      Connectivity: "USB 2.0",
      "Compatible Ink": "HP 305 Black, HP 305 Tri-colour",
      Warranty: "1 Year HP Warranty",
    },
  },
  {
    id: "hp-smart-tank-581",
    name: "HP Smart Tank 581",
    description: "All-in-One Wi-Fi Printer, High Yield Ink",
    category: "Printers",
    categoryId: "printers-office",
    priceUsd: 148,
    oldPriceUsd: 164,
    stock: 5,
    isNew: false,
    specifications: {
      Condition: "Brand New, Sealed",
      Functions: "Print, Scan, Copy",
      "Print Technology": "HP Thermal Inkjet (continuous ink)",
      "Print Speed (Black)": "Up to 12 ppm",
      "Print Speed (Colour)": "Up to 5 ppm",
      Resolution: "Up to 4800 x 1200 dpi",
      "Monthly Duty Cycle": "Up to 1,000 pages",
      Connectivity: "Wi-Fi, USB 2.0, Bluetooth LE",
      "Ink Yield": "Up to 6,000 black / 6,000 colour pages (included)",
      Warranty: "1 Year HP Warranty",
    },
  },
  // ─── COMPONENTS & POWER ─────────────────────────────────────────────
  {
    id: "crucial-8gb-ddr4-sodimm",
    name: "Crucial 8GB DDR4 2666 SODIMM",
    description: "Laptop RAM — 8GB DDR4-2666 CL19",
    category: "Components",
    categoryId: "components-power",
    priceUsd: 22,
    oldPriceUsd: null,
    stock: 120,
    isNew: false,
    specifications: {
      Condition: "Brand New, Sealed",
      "Module Type": "SODIMM (Laptop)",
      Capacity: "8GB",
      Speed: "DDR4-2666 (PC4-21300)",
      "CAS Latency": "CL19",
      Voltage: "1.2V",
      "Form Factor": "260-pin",
      Compatibility: "Intel & AMD laptops",
      Warranty: "Lifetime Limited Warranty",
    },
  },
  // ─── NETWORKING & SECURITY ─────────────────────────────────────────
  {
    id: "tp-link-mr6400",
    name: "TP-Link TL-MR6400",
    description: "300Mbps Wireless N 4G LTE Router",
    category: "Networking",
    categoryId: "networking-security",
    priceUsd: 75,
    oldPriceUsd: 85,
    stock: 34,
    isNew: false,
    specifications: {
      Condition: "Brand New, Sealed",
      "Network Type": "4G LTE (Cat4) — up to 150Mbps download, 50Mbps upload",
      "Wi-Fi Speed": "300Mbps (2.4GHz, 802.11b/g/n)",
      Antennas: "2x internal Wi-Fi + 2x detachable 4G LTE",
      "SIM Card": "Standard SIM slot (no contract needed)",
      "LAN Ports": "3x 10/100Mbps + 1x WAN/LAN",
      Security: "WPA/WPA2, Firewall, SPI",
      "Device Support": "Up to 32 connected devices",
      "Power Supply": "9V/0.85A",
      Warranty: "2 Years TP-Link Warranty",
    },
  },
  // ─── PHONES, TV & AUDIO ────────────────────────────────────────────
  {
    id: "iphone-16-pro-max-256",
    name: "Apple iPhone 16 Pro Max",
    description: "256GB, Black Titanium — Dual SIM (nano + eSIM)",
    category: "Phones",
    categoryId: "phones-tv-audio",
    priceUsd: 1199,
    oldPriceUsd: null,
    stock: 6,
    isNew: true,
    specifications: {
      Condition: "Brand New, Factory Sealed",
      Display: '6.9" Super Retina XDR, ProMotion 120Hz, 2868x1320',
      Chip: "A18 Pro (3nm, 6-core CPU, 6-core GPU, 16-core Neural Engine)",
      Storage: "256GB",
      Camera: "48MP Main + 48MP Ultra Wide + 12MP 5x Telephoto",
      "Front Camera": "12MP TrueDepth, Face ID",
      Video: "4K Dolby Vision @ 120fps, ProRes",
      Battery: "Up to 33 hours video playback",
      SIM: "Dual SIM (nano-SIM + eSIM)",
      Connectivity: "5G, Wi-Fi 7, Bluetooth 5.3, USB-C 3.0",
      "Water Resistance": "IP68 (6 metres, 30 minutes)",
      "Operating System": "iOS 18",
      Weight: "227 g",
      Warranty: "1 Year Apple Warranty",
    },
  },
  // ─── ACCESSORIES ───────────────────────────────────────────────────
  {
    id: "ps5-slim-console",
    name: "Sony PlayStation 5 Slim",
    description: "Disc Edition Console — 1TB SSD",
    category: "Accessories",
    categoryId: "accessories",
    priceUsd: 449,
    oldPriceUsd: 499,
    stock: 3,
    isNew: true,
    specifications: {
      Condition: "Brand New, Sealed",
      Storage: "1TB Custom SSD",
      "Disc Drive": "Ultra HD Blu-ray (included)",
      CPU: "AMD Zen 2, 8 cores @ 3.5GHz",
      GPU: "AMD RDNA 2, 10.28 TFLOPs",
      "Memory (RAM)": "16GB GDDR6",
      Output: "4K @ 120fps, 8K support, HDR",
      Audio: "Tempest 3D AudioTech",
      Connectivity: "Wi-Fi 6E, Bluetooth 5.1, HDMI 2.1, 2x USB-C, 1x USB-A",
      "In the Box": "Console, DualSense controller, HDMI cable, power cable, USB-C cable",
      Weight: "3.2 kg (with disc drive)",
      Warranty: "1 Year Sony Warranty",
    },
  },
];

async function run() {
  const now = admin.firestore.FieldValue.serverTimestamp();
  let batch = db.batch();

  // Config: USD -> UGX rate (managed from admin later).
  batch.set(db.collection("config").doc("rate"), {
    usdToUgx: 3780,
    updatedAt: now,
  });

  for (const c of CATEGORIES) {
    batch.set(
      db.collection("categories").doc(c.id),
      { ...c, active: true, updatedAt: now },
      { merge: true }
    );
  }

  for (const p of PRODUCTS) {
    batch.set(
      db.collection("products").doc(p.id),
      {
        ...p,
        images: [], // added via admin
        status: p.stock > 0 ? "published" : "out_of_stock",
        currency: "USD",
        updatedAt: now,
      },
      { merge: true }
    );
  }

  await batch.commit();
  console.log(
    `Seeded ${CATEGORIES.length} categories, ${PRODUCTS.length} products and config/rate.`
  );
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  });
