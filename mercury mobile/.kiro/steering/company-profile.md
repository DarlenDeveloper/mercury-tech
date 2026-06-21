# Mercury Computers Limited — Company Profile

> Reference profile for the Mercury Mobile ecommerce app. Use this as the
> benchmark for branding, content, catalog structure, and feature scope.
> Source: https://mercurycomputerslimited.com (public website).

## Overview

Mercury Computers Limited is one of Uganda's leading independent retailers of
ICT technology and office supplies. Based in Kampala, the company sells
computer hardware and electronics and also runs a technical services arm
(repairs, IT support, networking, CCTV). They have been in business for ~17+
years.

- **Industry:** ICT / consumer & business electronics retail + IT services
- **Market:** Uganda (Kampala HQ); repair/callout coverage cited for Uganda and Rwanda
- **Experience:** 20+ years experience, 1000+ happy clients, 50+ brand partners, 24/7 support (as advertised)
- **Positioning:** Genuine, brand-new, officially sourced products at competitive prices, backed by local expert service

## Branding

- **Primary brand color: Blue.** The app's theme, primary buttons, app bar,
  links, and key accents should follow the company blue. Match the website's
  blue once the exact hex is confirmed (extract from logo/site or client brand
  guide). Until confirmed, use a close placeholder and centralize it as a single
  theme token so it can be swapped in one place.
- Keep a clean, trustworthy, retail look (the site leans on trust signals:
  "Official & Brand New", SSL secured, authorized partner badges).
- Logo files, exact palette, and typography: **to be provided by client.**

## Development Approach

- **Build page by page, incrementally and slowly.** Finish, review, and confirm
  one screen before moving to the next. No bulk scaffolding of many screens at
  once.
- Centralize theming (colors, typography, spacing) so brand changes apply
  everywhere from one place.

## Brand & Partners

- **Authorized Microsoft Partner** — reseller and Cloud Solution Provider (CSP).
  Supplies genuine Microsoft 365 (Business Standard & Premium), Windows 11 Pro
  (OEM and Volume), Windows Server 2025; offers deployment, email migration,
  security hardening (Defender, Intune, Entra ID), and end-user training.
- **Key brand partners:** HP, Dell, Lenovo, Microsoft, Cisco, Fortinet, Apple, Epson, JBL
- **Customer segments served:** businesses, banks, NGOs, schools, government departments, and home/domestic users

## Contact & Location

- **Address:** Plot 91, Kamwokya, Kira Road, Kamwokya — Kampala, Uganda (near Rubis/Kobil petrol station)
- **P.O. Box:** 14813, Kampala, Uganda
- **Phones:** 0414256136 / 0414347229 / 0707749506 / 0757346747
- **Email:** customercare@mercurycomputerslimited.com, sales@mercurycomputerslimited.com
- **WhatsApp:** +256704823800
- **Social:** Facebook (@mercuryuganda), Instagram (@mercuryuganda), Twitter/X (@mercuryuganda), YouTube

## Commerce Details (important for the app)

- **Currency:** Ugandan Shilling, displayed as `USh` with thousands separators
  (e.g. `USh 1,323,000`). Prices commonly run into the millions.
- **Pricing model:** Regular price + discounted SALE price shown together
  (e.g. `USh 1,400,000` → `USh 1,323,000`).
- **Common product badges/labels:** SALE, NEW, In Stock, Free Delivery,
  "Official & Brand New".
- **Product actions seen on site:** Add to cart, Add to compare, Wishlist.
- **Delivery:** Free shipping/free delivery promoted prominently.

## Catalog Structure

### Top-level categories (main nav)
- Computers (Computers & Laptops)
- Printers & Office
- Components & Power
- Networking & Security
- Phones, TV & Audio
- Accessories
- Deals (e.g. Black Friday)

### Notable subcategories
Laptops, Desktops, Monitors, Tablets, Printers, Toner & Ink, UPS, Speakers,
Microsoft Licensing.

### Homepage merchandising sections
- Hero banner ("Gaming & PC Components" / "Build your dream setup")
- Shop by Category
- Promotional rails: "Up to 20% off — Laptops", "Printers | Up to 50% off",
  "Best Selling Desktops", "Up to 50% Off — Monitors"
- New Arrivals (last 14 days, with "Xd ago" recency labels)

### Popular searches (good for search suggestions / quick chips)
RAM, SSD, printers, desktops, UPS, Epson, HP, Dell, Omen, iPhone, Apple,
MacBook, EliteBook, ProBook, ThinkPad, Gaming, CCTV, Routers, JBL, Laser Printer

## Services Arm (beyond ecommerce)

- Computer/laptop/printer/desktop repair (Mac and Windows friendly)
- Same/next-day repairs (90% of issues same day), onsite + in-shop
- Free callouts (no charge to call out; pay only for work done)
- Weekend and evening callouts; local technicians
- Full IT support for businesses: maintenance, networking, security, hardware advice
- CCTV, routers, switches, cabling, web-related services

## Site Pages / Information Architecture

- Home, Shop, Product, Product Category
- Cart, Wishlist, Compare
- Auth (Sign In / Register)
- About Us / Who We Are, Awards and Recognition, Contact Us, Our Solutions, Services
- Policy pages: Sales/Refunds & Returns, Shipping and Delivery, Terms of Service

## Implications for Mercury Mobile (app benchmark)

These are the experiences the mobile app should aim to match or improve on:

1. **Catalog browsing** — categories + subcategories, promotional rails,
   New Arrivals, Best Selling, Deals.
2. **Product detail** — multiple images, regular vs sale price, stock status,
   badges (Free Delivery / Official & Brand New), specs.
3. **Search & discovery** — search bar with popular-search quick chips.
4. **Cart, Wishlist, Compare** — core shopping actions.
5. **Accounts** — sign in / register, order history.
6. **Checkout & delivery** — free delivery messaging; confirm payment methods
   (mobile money is common in Uganda — to be confirmed with client).
7. **Support touchpoints** — WhatsApp chat, click-to-call, email, store location/map.
8. **Brand trust signals** — authorized partner badges, SSL/secure, official & brand new.

## Open Questions (confirm with client before/at dev kickoff)

- Is there an existing backend/API powering the website that the app can reuse?
- Which payment gateway(s)? (Card, mobile money — MTN/Airtel, bank, cash on delivery?)
- Official brand assets: logo files, exact color palette, typography.
- Should the services arm (repairs/IT support booking) be in-scope for v1, or ecommerce only?
- Auth method: email/password, phone OTP, social login?
