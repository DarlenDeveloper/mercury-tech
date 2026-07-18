import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../models/product.dart';

/// Reads the catalog from Firestore. Prices are stored in USD; the app
/// converts to Ugandan Shillings using the admin-managed `config/rate`.
class ProductRepository {
  ProductRepository({FirebaseFirestore? firestore})
      : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  static const _pastelAccents = <Color>[
    Color(0xFFE8EEFF),
    Color(0xFFFDEEE7),
    Color(0xFFE7F6EF),
    Color(0xFFF1ECFB),
    Color(0xFFFFF3DC),
    Color(0xFFEAF4EE),
  ];

  static IconData _iconFor(String category) {
    switch (category.toLowerCase()) {
      case 'laptops':
        return IconsaxPlusBold.monitor;
      case 'desktops':
        return IconsaxPlusBold.devices;
      case 'monitors':
        return IconsaxPlusBold.monitor_mobbile;
      case 'printers':
        return IconsaxPlusBold.printer;
      case 'phones':
        return IconsaxPlusBold.mobile;
      case 'accessories':
        return IconsaxPlusBold.mouse;
      default:
        return IconsaxPlusBold.box;
    }
  }

  Future<double> _fetchRate() async {
    try {
      final doc = await _db.collection('config').doc('rate').get();
      final value = doc.data()?['usdToUgx'];
      if (value is num && value > 0) return value.toDouble();
    } catch (_) {
      // Fall through to default.
    }
    return 3780;
  }

  Product _mapDoc(
    QueryDocumentSnapshot<Map<String, dynamic>> doc,
    double rate,
    int index,
  ) {
    final data = doc.data();
    final priceUsd = (data['priceUsd'] as num?)?.toDouble() ?? 0;
    final oldPriceUsd = (data['oldPriceUsd'] as num?)?.toDouble();
    final images = (data['images'] as List?)?.cast<String>() ?? const [];
    final singleImage = data['image'] as String?;
    final productImage = images.isNotEmpty ? images.first : singleImage;
    final specs = (data['specifications'] as Map?)?.map(
          (k, v) => MapEntry(k.toString(), v.toString()),
        ) ??
        const <String, String>{};
    final category = (data['category'] as String?) ?? 'Other';

    return Product(
      id: doc.id,
      name: (data['name'] as String?) ?? 'Unnamed product',
      description: (data['description'] as String?) ?? '',
      price: (priceUsd * rate).round(),
      oldPrice: oldPriceUsd != null ? (oldPriceUsd * rate).round() : null,
      category: category,
      categoryId: (data['categoryId'] as String?),
      icon: _iconFor(category),
      accent: _pastelAccents[index % _pastelAccents.length],
      image: productImage,
      isNew: (data['isNew'] as bool?) ?? false,
      specifications: specs,
      brand: (data['brand'] as String?)?.trim(),
      stock: (data['stock'] as num?)?.toInt(),
    );
  }

  /// Fetches all published products once.
  Future<List<Product>> fetchProducts() async {
    final rate = await _fetchRate();
    final snap = await _db.collection('products').orderBy('name').get();
    var i = 0;
    return snap.docs.map((d) => _mapDoc(d, rate, i++)).toList();
  }

  /// Live stream of products (rate is read once up front).
  Stream<List<Product>> watchProducts() async* {
    final rate = await _fetchRate();
    yield* _db.collection('products').orderBy('name').snapshots().map((snap) {
      var i = 0;
      return snap.docs.map((d) => _mapDoc(d, rate, i++)).toList();
    });
  }
}
