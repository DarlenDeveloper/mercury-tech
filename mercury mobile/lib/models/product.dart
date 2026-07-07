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
    this.image,
    this.oldPrice,
    this.isNew = false,
    this.specifications = const {},
  });

  final String id;
  final String name;
  final String description;

  /// Current (sale) price in Ugandan Shillings.
  final int price;

  /// Optional original price, shown struck through when present.
  final int? oldPrice;

  final String category;

  /// Parent category ID (matches Firestore categoryId, e.g. "computers").
  final String? categoryId;

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

  bool get isOnSale => oldPrice != null && oldPrice! > price;
}
