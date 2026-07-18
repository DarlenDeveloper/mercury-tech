# Mercury Mobile — TODO

## Priority Tasks

- [x] Fix negative padding crash on web (topPadding - 4 → clamp)
- [x] Cash on Delivery / Pickup (payment methods updated)
- [x] **AI Assistant** — wire to `aiAgent` Cloud Function (Gemini)
- [x] **AI Conversations** — Firestore-backed via `support_conversations` (matches web)
- [x] **Search** — live search with suggestions
- [x] **Request Quote** — single product + bulk cart
- [x] **Compact prices** — 478K / 1.2M format on cards
- [x] **Product filters** — brand, price, stock, sort on category screen
- [x] **Currency selector** — multi-currency support
- [x] **Categories synced** — read from Firestore, merged with local visuals
- [ ] Verify product images show from Firebase Storage
- [ ] Verify product gallery swipe works

## Done
- Firebase web config added
- Negative padding fix applied
- Payment methods updated to Cash on Delivery / Pickup
- AI agent wired to Firestore `support_conversations` collection
- Chat history (right-side drawer like ChatGPT), real-time admin messages, intervene flag
- Product model updated with brand + stock fields
- Category screen: brand filter, price range slider, in-stock toggle, sort options
- Active filter pills with remove + clear all
- Request Quote: single product (product detail) + bulk cart ("Request Quote for All")
- Categories fetched from Firestore and merged with hardcoded visual props (CategoryScope)
- Profile pages: Privacy & Security (password change + delete account request), Help & Support, Policies, Notifications settings
- Delete account: saves request to Firestore with reason, logs user out (manual processing)
