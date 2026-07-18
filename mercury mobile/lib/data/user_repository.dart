import 'package:cloud_firestore/cloud_firestore.dart';

/// User profile stored at `users/{uid}`.
class UserProfile {
  UserProfile({
    required this.uid,
    this.name = '',
    this.phone = '',
    this.email = '',
    this.location = '',
    this.createdAt,
  });

  final String uid;
  final String name;
  final String phone;
  final String email;
  final String location;
  final DateTime? createdAt;

  Map<String, dynamic> toMap() => {
        'name': name,
        'phone': phone,
        'email': email,
        'location': location,
        'createdAt': createdAt != null
            ? Timestamp.fromDate(createdAt!)
            : FieldValue.serverTimestamp(),
      };

  factory UserProfile.fromMap(String uid, Map<String, dynamic> data) =>
      UserProfile(
        uid: uid,
        name: data['name'] as String? ?? '',
        phone: data['phone'] as String? ?? '',
        email: data['email'] as String? ?? '',
        location: data['location'] as String? ?? '',
        createdAt: (data['createdAt'] as Timestamp?)?.toDate(),
      );

  UserProfile copyWith({
    String? name,
    String? phone,
    String? email,
    String? location,
  }) =>
      UserProfile(
        uid: uid,
        name: name ?? this.name,
        phone: phone ?? this.phone,
        email: email ?? this.email,
        location: location ?? this.location,
        createdAt: createdAt,
      );
}

/// Manages user profile documents at `users/{uid}`.
class UserRepository {
  UserRepository({FirebaseFirestore? firestore})
      : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  DocumentReference<Map<String, dynamic>> _doc(String uid) =>
      _db.collection('users').doc(uid);

  /// Get user profile, returns null if not found.
  Future<UserProfile?> getProfile(String uid) async {
    final snap = await _doc(uid).get();
    if (!snap.exists || snap.data() == null) return null;
    return UserProfile.fromMap(uid, snap.data()!);
  }

  /// Watch user profile changes.
  Stream<UserProfile?> watchProfile(String uid) {
    return _doc(uid).snapshots().map((snap) {
      if (!snap.exists || snap.data() == null) return null;
      return UserProfile.fromMap(uid, snap.data()!);
    });
  }

  /// Create or update user profile.
  Future<void> saveProfile(UserProfile profile) async {
    await _doc(profile.uid).set(profile.toMap(), SetOptions(merge: true));
  }

  /// Create profile on first sign-up if it doesn't exist.
  Future<void> ensureProfile({
    required String uid,
    String? name,
    String? phone,
    String? email,
  }) async {
    final existing = await getProfile(uid);
    if (existing != null) return;
    await saveProfile(UserProfile(
      uid: uid,
      name: name ?? '',
      phone: phone ?? '',
      email: email ?? '',
    ));
  }

  /// Deletes a user's profile document.
  Future<void> deleteProfile(String uid) async {
    await _doc(uid).delete();
  }

  /// Records why a user deleted their account (for feedback/analytics).
  Future<void> recordDeletion({
    required String uid,
    required String email,
    required String reason,
  }) async {
    await _db.collection('account_deletions').add({
      'uid': uid,
      'email': email,
      'reason': reason,
      'deletedAt': FieldValue.serverTimestamp(),
    });
  }

  /// Reads notification preferences (defaults to all enabled).
  Future<Map<String, bool>> getNotificationPrefs(String uid) async {
    final snap = await _doc(uid).get();
    final raw = snap.data()?['notificationPrefs'] as Map<String, dynamic>?;
    if (raw == null) return {};
    return raw.map((k, v) => MapEntry(k, v == true));
  }

  /// Persists a single notification preference toggle.
  Future<void> setNotificationPref(String uid, String key, bool value) async {
    await _doc(uid).set({
      'notificationPrefs': {key: value},
    }, SetOptions(merge: true));
  }
}
