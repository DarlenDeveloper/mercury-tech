import 'package:flutter/material.dart';

/// A simple product model for the catalog.
///
/// Until a backend/API is connected, products are created from sample data.
/// [accent] and [icon] provide a lightweight visual placeholder in place of
/// real product imagery.
class Product {
  const Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    required this.icon,
    required this.accent,
    this.categoryId,
    this.subcategorySlugs = const [],
    this.image,
    this.oldPrice,
    this.priceUsd = 0,
    this.isNew = false,
    this.specifications = const {},
    this.brand,
    this.stock,
  });

  final String id;
  final String name;
  final String description;

  /// Current (sale) price in Ugandan Shillings.
  final int price;

  /// Base price in USD (before rate conversion). Used to recompute promo
  /// prices for the flash sale without a second rate lookup.
  final double priceUsd;

  /// Optional original price, shown struck through when present.
  final int? oldPrice;

  final String category;

  /// Parent category ID (matches Firestore categoryId, e.g. "computers").
  final String? categoryId;

  /// Subcategory slugs this product belongs to. A product may appear in more
  /// than one storefront subcategory while retaining one primary [category].
  final List<String> subcategorySlugs;

  /// Placeholder glyph used when no [image] is available.
  final IconData icon;

  /// Pastel background behind the placeholder glyph.
  final Color accent;

  /// Optional product photo asset path or URL.
  final String? image;

  /// Marks the product with a "New" badge.
  final bool isNew;

  /// Ordered label -> value specification rows.
  final Map<String, String> specifications;

  /// Brand name (e.g. "HP", "Dell", "Samsung").
  final String? brand;

  /// Stock quantity. Null or 0 means out of stock.
  final int? stock;

  bool get isOnSale => oldPrice != null && oldPrice! > price;
  bool get inStock => (stock ?? 0) > 0;

  /// Whether the product has a real image (not a placeholder).
  bool get hasImage => image != null && image!.trim().isNotEmpty;

  Product copyWith({int? price, int? oldPrice}) {
    return Product(
      id: id,
      name: name,
      description: description,
      price: price ?? this.price,
      category: category,
      icon: icon,
      accent: accent,
      categoryId: categoryId,
      subcategorySlugs: subcategorySlugs,
      image: image,
      oldPrice: oldPrice ?? this.oldPrice,
      priceUsd: priceUsd,
      isNew: isNew,
      specifications: specifications,
      brand: brand,
      stock: stock,
    );
  }
}
