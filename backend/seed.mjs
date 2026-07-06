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
      "Operating System": "Windows 11 Home",
      Warranty: "1 Year",
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
      Processor: "Intel Celeron N4020",
      "Memory (RAM)": "8GB DDR4",
      Storage: "256GB NVMe SSD",
      "Operating System": "Windows 11 Home",
      Warranty: "1 Year",
    },
  },
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
      Type: "Inkjet",
      Connectivity: "USB 2.0",
      Warranty: "1 Year",
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
    stock: 0,
    isNew: false,
    specifications: {
      Condition: "Brand New, Sealed",
      "Screen Size": "20 inch",
      Resolution: "1600 x 900 (HD+)",
      Panel: "TN, 5ms response",
      Warranty: "3 Years",
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
      Processor: "Intel Core i5",
      "Memory (RAM)": "8GB DDR4",
      Storage: "512GB SSD",
      Includes: '19.5" LED Monitor',
      "Operating System": "Windows 11 Pro",
      Warranty: "1 Year",
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
      Type: "Ink Tank",
      Connectivity: "Wi-Fi, USB",
      Warranty: "1 Year",
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
