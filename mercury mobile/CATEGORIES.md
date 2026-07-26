# Shop by Category

The app's departments are aligned with the web storefront taxonomy. Each
department's `slug` matches the product `categoryId` field in Firestore, and
the live subcategory list is merged from each category document's `children`
array (collection: `categories`).

## Departments (display order)

| # | Name | slug (`categoryId`) |
|---|------|---------------------|
| 1 | Laptops | `laptops` |
| 2 | Desktops (incl. monitors) | `desktops` |
| 3 | Printers & Office | `printers-office` |
| 4 | Networking & Security | `networking-security` |
| 5 | UPS & Power | `ups-power` |
| 6 | Software | `software` |
| 7 | Other Products (phones, tablets, audio, accessories) | `other` |

## How filtering works

- **Department pages / home chips:** filter products by `product.categoryId == slug`.
- **Subcategory chips (category screen):** filter by `product.category == <subcategory label>`
  (the `category` field holds the subcategory display name, e.g. "HP Laptops",
  "Monitors", "APC UPS").
- Source of truth for the department + subcategory lists is the Firestore
  `categories` collection, loaded once at startup (`CategoryLoader` /
  `CategoryScope`) with `kShopCategories` as the offline fallback.
