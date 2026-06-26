import 'package:flutter/material.dart';

/// A subcategory filter shown on the category screen.
class Subcategory {
  const Subcategory(this.label, this.icon, {this.image});

  final String label;
  final IconData icon;

  /// Optional image asset shown in the filter chip avatar. When present it is
  /// used instead of [icon], matching the Home page filter chips.
  final String? image;
}

/// A top-level shop category.
class Category {
  const Category({
    required this.name,
    required this.color,
    required this.image,
    required this.subcategories,
    this.photo,
    this.imageScale = 1.0,
    this.imageScaleX,
    this.imageRotationDeg = 0,
  });

  final String name;
  final Color color;
  final String image;

  /// Optional full-bleed background photo for the shop category card.
  /// When present, the card shows this photo (cover) with a centered label
  /// instead of the colored placeholder card.
  final String? photo;

  /// Subcategory filters (the first entry is typically "All").
  final List<Subcategory> subcategories;

  /// Uniform scale applied to the product image on the Shop card.
  final double imageScale;

  /// Optional horizontal-only scale override (falls back to [imageScale]).
  final double? imageScaleX;

  /// Rotation in degrees; negative is anti-clockwise.
  final double imageRotationDeg;
}
