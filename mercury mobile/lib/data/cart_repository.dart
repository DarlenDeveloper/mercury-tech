import 'package:cloud_firestore/cloud_firestore.dart';

/// A single item in the user's cart stored in Firestore.
class CartItem {
  CartItem({
    required this.productId,
    required this.name,
    required this.category,
    required this.priceUsd,
    required this.qty,
    this.image,
  });

  final String productId;
  final String name;
  final String category;
  final double priceUsd;
  int qty;
  final String? image;

  Map<String, dynamic> toMap() => {
        'productId': productId,
        'name': name,
        'category': category,
        'priceUsd': priceUsd,
        'qty': qty,
        'image': image,
      };

  factory CartItem.fromMap(Map<String, dynamic> data) => CartItem(
        productId: data['productId'] as String? ?? '',
        name: data['name'] as String? ?? '',
        category: data['category'] as String? ?? '',
        priceUsd: (data['priceUsd'] as num?)?.toDouble() ?? 0,
        qty: (data['qty'] as num?)?.toInt() ?? 1,
        image: data['image'] as String?,
      );
}

/// Manages the user's cart in Firestore at `users/{uid}/cart/{productId}`.
class CartRepository {
  CartRepository({required this.uid, FirebaseFirestore? firestore})
      : _db = firestore ?? FirebaseFirestore.instance;

  final String uid;
  final FirebaseFirestore _db;

  CollectionReference<Map<String, dynamic>> get _cartRef =>
      _db.collection('users').doc(uid).collection('cart');

  /// Live stream of cart items.
  Stream<List<CartItem>> watchCart() {
    return _cartRef.snapshots().map((snap) =>
        snap.docs.map((d) => CartItem.fromMap(d.data())).toList());
  }

  /// Add a product to cart or increment quantity if already present.
  Future<void> addToCart(CartItem item) async {
    final doc = _cartRef.doc(item.productId);
    final existing = await doc.get();
    if (existing.exists) {
      await doc.update({'qty': FieldValue.increment(item.qty)});
    } else {
      await doc.set(item.toMap());
    }
  }

  /// Set the quantity for a cart item.
  Future<void> setQty(String productId, int qty) async {
    if (qty <= 0) {
      await _cartRef.doc(productId).delete();
    } else {
      await _cartRef.doc(productId).update({'qty': qty});
    }
  }

  /// Remove an item from the cart.
  Future<void> removeItem(String productId) async {
    await _cartRef.doc(productId).delete();
  }

  /// Clear the entire cart.
  Future<void> clearCart() async {
    final snap = await _cartRef.get();
    final batch = _db.batch();
    for (final doc in snap.docs) {
      batch.delete(doc.reference);
    }
    await batch.commit();
  }
}
