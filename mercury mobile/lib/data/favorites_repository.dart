import 'package:cloud_firestore/cloud_firestore.dart';

/// Manages the user's wishlist/favorites at `users/{uid}/favorites/{productId}`.
class FavoritesRepository {
  FavoritesRepository({required this.uid, FirebaseFirestore? firestore})
      : _db = firestore ?? FirebaseFirestore.instance;

  final String uid;
  final FirebaseFirestore _db;

  CollectionReference<Map<String, dynamic>> get _favRef =>
      _db.collection('users').doc(uid).collection('favorites');

  /// Live stream of favorite product IDs.
  Stream<Set<String>> watchFavorites() {
    return _favRef.snapshots().map(
        (snap) => snap.docs.map((d) => d.id).toSet());
  }

  /// Toggle a product in/out of favorites.
  Future<bool> toggle(String productId) async {
    final doc = _favRef.doc(productId);
    final exists = (await doc.get()).exists;
    if (exists) {
      await doc.delete();
      return false;
    } else {
      await doc.set({
        'addedAt': FieldValue.serverTimestamp(),
      });
      return true;
    }
  }

  /// Check if a product is in favorites.
  Future<bool> isFavorite(String productId) async {
    final doc = await _favRef.doc(productId).get();
    return doc.exists;
  }
}
