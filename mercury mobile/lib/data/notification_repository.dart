import 'package:cloud_firestore/cloud_firestore.dart';

/// A single notification shown in the in-app notification centre.
class AppNotification {
  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.read,
    required this.createdAt,
  });

  final String id;
  final String title;
  final String body;
  final String type;
  final bool read;
  final DateTime? createdAt;
}

/// Reads the two notification sources:
///  - personal (transactional) feed at `users/<uid>/notifications`
///  - broadcast campaigns at `notifications` (status == sent)
class NotificationRepository {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  /// Live stream of a user's personal notifications, newest first.
  Stream<List<AppNotification>> streamPersonal(String uid) {
    return _db
        .collection('users')
        .doc(uid)
        .collection('notifications')
        .orderBy('createdAt', descending: true)
        .limit(50)
        .snapshots()
        .map((snap) => snap.docs.map((d) {
              final data = d.data();
              return AppNotification(
                id: d.id,
                title: (data['title'] ?? '') as String,
                body: (data['body'] ?? '') as String,
                type: (data['type'] ?? 'general') as String,
                read: data['read'] == true,
                createdAt: (data['createdAt'] as Timestamp?)?.toDate(),
              );
            }).toList());
  }

  /// Live stream of broadcast campaigns that have been sent.
  Stream<List<AppNotification>> streamCampaigns() {
    return _db
        .collection('notifications')
        .where('status', isEqualTo: 'sent')
        .orderBy('createdAt', descending: true)
        .limit(30)
        .snapshots()
        .map((snap) => snap.docs.map((d) {
              final data = d.data();
              return AppNotification(
                id: d.id,
                title: (data['title'] ?? '') as String,
                body: (data['message'] ?? '') as String,
                type: 'promo',
                read: true, // campaigns aren't per-user read-tracked
                createdAt: (data['createdAt'] as Timestamp?)?.toDate(),
              );
            }).toList());
  }

  Future<void> markRead(String uid, String id) {
    return _db
        .collection('users')
        .doc(uid)
        .collection('notifications')
        .doc(id)
        .set({'read': true}, SetOptions(merge: true));
  }

  Future<void> markAllRead(String uid) async {
    final snap = await _db
        .collection('users')
        .doc(uid)
        .collection('notifications')
        .where('read', isEqualTo: false)
        .get();
    final batch = _db.batch();
    for (final d in snap.docs) {
      batch.set(d.reference, {'read': true}, SetOptions(merge: true));
    }
    await batch.commit();
  }
}
