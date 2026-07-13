/**
 * Scrapes all products from the old Mercury Computers website
 * (https://mercurycomputerslimited.com) and outputs Firestore-ready JSON.
 *
 * Usage:
 *   npm run scrape
 *
 * Requirements:
 *   npm install puppeteer
 *
 * Output:
 *   ./scraped-products.json  — array of product objects ready for Firestore seeding
 */

import puppeteer from "puppeteer";
import { writeFileSync } from "fs";

const BASE_URL = "https://mercurycomputerslimited.com";
const SHOP_URL = `${BASE_URL}/shop`;
const DELAY_MS = 1500; // polite delay between requests

// ─── Category slug → Firestore categoryId mapping ──────────────────────────
const CATEGORY_MAP = {
  // Computers & Laptops
  "computers-laptops": "computers",
  laptops: "computers",
  desktops: "computers",
  monitors: "computers",
  tablets: "computers",
  "lenovo-laptops": "computers",
  "hp-laptops": "computers",
  "dell-laptops": "computers",
  "gaming-laptops": "computers",
  "apple-laptops": "computers",
  // Printers & Office
  printers: "printers-office",
  "toner-ink": "printers-office",
  "ink-tank-printers": "printers-office",
  "color-multifunction-printers": "printers-office",
  "black-white-multifunction-printers": "printers-office",
  "multifunction-all-in-one-printers": "printers-office",
  "photo-printers": "printers-office",
  "color-laser-multifunction-printers": "printers-office",
  // Components & Power
  "computer-components": "components-power",
  ups: "components-power",
  ram: "components-power",
  ssd: "components-power",
  "hard-drives": "components-power",
  // Networking & Security
  networking: "networking-security",
  "wi-fi-adapters": "networking-security",
  routers: "networking-security",
  cctv: "networking-security",
  // Phones, TV & Audio
  "tv-video": "phones-tv-audio",
  phones: "phones-tv-audio",
  iphone: "phones-tv-audio",
  "apple-iphone": "phones-tv-audio",
  speakers: "phones-tv-audio",
  // Accessories
  accessories: "accessories",
  "microsoft-licensing": "accessories",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function mapCategory(categorySlug) {
  if (!categorySlug) return "accessories";
  const slug = categorySlug.toLowerCase().replace(/\//g, "");
  return CATEGORY_MAP[slug] || "accessories";
}

// ─── Main scraping logic ────────────────────────────────────────────────────

async function scrapeAllShopProducts(page) {
  console.log(`  Loading shop page: ${SHOP_URL}`);
  
  // Intercept Supabase API calls to get the raw data
  const apiResponses = [];
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('supabase.co/rest/v1') && url.includes('product')) {
      try {
        const data = await response.json();
        if (Array.isArray(data)) {
          apiResponses.push(...data);
        }
      } catch (e) {
        // ignore non-JSON responses
      }
    }
  });

  await page.goto(SHOP_URL, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(3000);

  let allUrls = new Set();
  let pageNum = 1;
  let hasNext = true;
  let staleCount = 0;

  while (hasNext) {
    // Collect product URLs on current page view
    const urls = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/product/"]');
      const found = [];
      for (const link of links) {
        const href = link.getAttribute("href");
        if (href && href.includes('/product/')) found.push(href);
      }
      return [...new Set(found)];
    });

    const prevCount = allUrls.size;
    for (const u of urls) allUrls.add(u);
    console.log(`   Page ${pageNum}: found ${urls.length} links, ${allUrls.size} total unique`);

    // Try clicking the "Next" button
    hasNext = await page.evaluate(() => {
      // Look for pagination-specific Next button
      // The site uses "Previous" and "Next" text buttons in pagination
      const allElements = document.querySelectorAll('button, a');
      for (const el of allElements) {
        // Get only direct text content (not children)
        const directText = el.textContent.trim();
        // Exact match on "Next" (case-insensitive)
        if (directText === 'Next' || directText === 'next') {
          if (el.disabled || el.classList.contains('disabled') || 
              el.getAttribute('aria-disabled') === 'true' ||
              el.style.pointerEvents === 'none' ||
              el.style.opacity === '0.5') {
            return false;
          }
          el.click();
          return true;
        }
      }
      return false;
    });

    if (hasNext) {
      pageNum++;
      await sleep(3000); // wait for SPA to load new content
      await page.waitForNetworkIdle({ idleTime: 1500, timeout: 20000 }).catch(() => {});
    }

    // Safety: if we got no new products, increment stale counter
    if (allUrls.size === prevCount) {
      staleCount++;
      if (staleCount >= 2) {
        console.log(`   No new products for ${staleCount} pages, stopping pagination.`);
        break;
      }
    } else {
      staleCount = 0;
    }

    // Safety: max 35 pages
    if (pageNum > 35) break;
  }

  // Also check if we got data from API interception
  if (apiResponses.length > 0) {
    console.log(`\n   📡 Also intercepted ${apiResponses.length} products from Supabase API`);
  }

  return { urls: [...allUrls], apiData: apiResponses };
}

async function scrapeProductDetail(page, productUrl) {
  try {
    await page.goto(productUrl, { waitUntil: "networkidle2", timeout: 60000 });
    await sleep(DELAY_MS);

    const data = await page.evaluate(() => {
      const getText = (sel) => {
        const el = document.querySelector(sel);
        return el ? el.textContent.trim() : "";
      };

      // Product name - usually in h1
      const name =
        getText("h1") ||
        document.title.replace(" - Computer Shop, Kampala Uganda", "").trim();

      // Price extraction - look for price patterns
      const allText = document.body.innerText;

      // Find prices in format "USh X,XXX,XXX"
      const priceMatches = allText.match(/USh\s+([\d,]+)/g) || [];
      const prices = priceMatches
        .map((p) => parseInt(p.replace(/USh\s+/, "").replace(/,/g, ""), 10))
        .filter((p) => p > 0 && p < 100000000);

      // Usually: sale price first, then original price
      let salePrice = null;
      let originalPrice = null;
      if (prices.length >= 2) {
        // The smaller one is usually the sale price
        const sorted = [...new Set(prices)].sort((a, b) => a - b);
        salePrice = sorted[0];
        originalPrice = sorted[1] !== sorted[0] ? sorted[1] : null;
      } else if (prices.length === 1) {
        salePrice = prices[0];
      }

      // Images from Supabase storage
      const images = [];
      const imgEls = document.querySelectorAll("img[src*='supabase.co']");
      for (const img of imgEls) {
        const src = img.getAttribute("src");
        if (src && !images.includes(src)) {
          images.push(src);
        }
      }

      // Brand
      const brandLink = document.querySelector('a[href*="?brand="]');
      const brand = brandLink ? brandLink.textContent.trim() : "";

      // Category from breadcrumb or link
      const categoryLink = document.querySelector(
        'a[href*="/product-category/"]'
      );
      let categorySlug = "";
      let categoryName = "";
      if (categoryLink) {
        const href = categoryLink.getAttribute("href") || "";
        const match = href.match(/\/product-category\/([^/]+)/);
        if (match) categorySlug = match[1];
        categoryName = categoryLink.textContent.trim();
      }

      // Key specifications
      const keySpecs = {};
      // Look for spec-like patterns in the page
      const specHeaders = document.querySelectorAll("table tr, li");
      for (const row of specHeaders) {
        const cells = row.querySelectorAll("td, th");
        if (cells.length === 2) {
          const key = cells[0].textContent.trim();
          const val = cells[1].textContent.trim();
          if (key && val && key.length < 50 && val.length < 200) {
            keySpecs[key] = val;
          }
        }
      }

      // Description - look for product description/information section
      let description = "";
      const sections = document.querySelectorAll("h3, h2");
      for (const section of sections) {
        if (
          section.textContent.includes("Product Information") ||
          section.textContent.includes("Description")
        ) {
          let el = section.nextElementSibling;
          const parts = [];
          while (el && !["H2", "H3"].includes(el.tagName)) {
            if (el.textContent.trim()) parts.push(el.textContent.trim());
            el = el.nextElementSibling;
          }
          description = parts.join("\n\n");
          break;
        }
      }

      // Short description from key specs or first spec bullet points
      const keySpecsList = document.querySelectorAll(
        '[class*="spec"], [class*="key"]'
      );
      const shortSpecs = [];
      for (const el of keySpecsList) {
        const text = el.textContent.trim();
        if (text && text.length < 100) shortSpecs.push(text);
      }

      // Stock status
      const inStock = allText.includes("In Stock");

      return {
        name,
        salePrice,
        originalPrice,
        images,
        brand,
        categorySlug,
        categoryName,
        specifications: keySpecs,
        description,
        shortSpecs,
        inStock,
      };
    });

    return data;
  } catch (err) {
    console.error(`  ❌ Error scraping ${productUrl}: ${err.message}`);
    return null;
  }
}

// ─── USD conversion ─────────────────────────────────────────────────────────
const UGX_TO_USD_RATE = 3780; // approximate rate

function ugxToUsd(ugx) {
  if (!ugx) return null;
  return Math.round((ugx / UGX_TO_USD_RATE) * 100) / 100;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Starting Mercury Computers scraper...\n");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  // Step 1: Collect all product URLs by paginating through the shop
  console.log("🔗 Collecting product URLs from shop (clicking through pages)...");
  const { urls: productUrls, apiData } = await scrapeAllShopProducts(page);

  console.log(`\n✅ Found ${productUrls.length} unique product URLs\n`);
  if (apiData.length > 0) {
    console.log(`   (Also captured ${apiData.length} products directly from Supabase API)\n`);
  }

  // Step 2: Scrape each product detail page
  console.log("📦 Scraping product details...\n");
  const products = [];
  const urls = productUrls;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    // Ensure full URL
    const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
    const slug = fullUrl.split("/product/")[1] || "";
    console.log(
      `  [${i + 1}/${urls.length}] ${slug.slice(0, 60)}...`
    );

    const data = await scrapeProductDetail(page, fullUrl);
    if (!data || !data.name) continue;

    const id = slugify(data.name) || slug;
    const categoryId = mapCategory(data.categorySlug);

    const product = {
      id,
      slug,
      name: data.name,
      description: data.description || "",
      shortDescription:
        data.shortSpecs.join(" | ") ||
        Object.entries(data.specifications)
          .slice(0, 5)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" | "),
      category: data.categoryName || "",
      categoryId,
      brand: data.brand || "",
      priceUgx: data.salePrice,
      oldPriceUgx: data.originalPrice,
      priceUsd: ugxToUsd(data.salePrice),
      oldPriceUsd: ugxToUsd(data.originalPrice),
      stock: data.inStock ? 10 : 0, // default stock since we can't know exact
      isNew: false,
      images: data.images,
      specifications: data.specifications,
      sourceUrl: fullUrl,
      status: data.inStock ? "published" : "out_of_stock",
    };

    products.push(product);
  }

  await browser.close();

  // Save raw API data if captured
  if (apiData.length > 0) {
    writeFileSync(
      "./scraped-api-raw.json",
      JSON.stringify(apiData, null, 2),
      "utf-8"
    );
    console.log(`\n   📡 Raw Supabase API data saved to ./scraped-api-raw.json`);
  }

  // Step 3: Write output
  const output = {
    scrapedAt: new Date().toISOString(),
    totalProducts: products.length,
    products,
  };

  writeFileSync(
    "./scraped-products.json",
    JSON.stringify(output, null, 2),
    "utf-8"
  );

  console.log(`\n🎉 Done! Scraped ${products.length} products.`);
  console.log(`   Output: ./scraped-products.json`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
