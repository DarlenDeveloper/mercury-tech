import 'package:cloud_firestore/cloud_firestore.dart';

import 'cart_repository.dart';

/// Places an order in Firestore at `orders/{orderId}`.
class OrderRepository {
  OrderRepository({required this.uid, FirebaseFirestore? firestore})
      : _db = firestore ?? FirebaseFirestore.instance;

  final String uid;
  final FirebaseFirestore _db;

  /// Create an order from the current cart items.
  Future<String> placeOrder({
    required List<CartItem> items,
    required double totalUsd,
    required String paymentMethod,
    String? deliveryAddress,
  }) async {
    final doc = _db.collection('orders').doc();
    await doc.set({
      'userId': uid,
      'items': items.map((i) => i.toMap()).toList(),
      'totalUsd': totalUsd,
      'paymentMethod': paymentMethod,
      'deliveryAddress': deliveryAddress ?? 'Kampala, Uganda',
      'status': 'pending',
      'createdAt': FieldValue.serverTimestamp(),
    });
    return doc.id;
  }

  /// Stream of orders for the current user.
  Stream<List<Map<String, dynamic>>> watchOrders() {
    return _db
        .collection('orders')
        .where('userId', isEqualTo: uid)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs.map((d) {
              final data = d.data();
              data['id'] = d.id;
              return data;
            }).toList());
  }
}
