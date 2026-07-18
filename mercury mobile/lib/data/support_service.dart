import 'package:cloud_firestore/cloud_firestore.dart';

/// Mirrors the web's lib/support.ts — shared support_conversations collection.
class SupportMessage {
  const SupportMessage({required this.role, required this.text, required this.at});
  final String role; // "user", "assistant", "admin"
  final String text;
  final String at; // ISO timestamp

  Map<String, dynamic> toMap() => {'role': role, 'text': text, 'at': at};

  factory SupportMessage.fromMap(Map<String, dynamic> m) => SupportMessage(
    role: m['role'] as String? ?? 'user',
    text: m['text'] as String? ?? '',
    at: m['at'] as String? ?? '',
  );
}

class SupportConversation {
  const SupportConversation({
    required this.id,
    required this.userId,
    required this.userName,
    required this.userEmail,
    required this.title,
    required this.messages,
    required this.status,
    required this.intervened,
    required this.updatedAt,
  });

  final String id;
  final String userId;
  final String userName;
  final String userEmail;
  final String title;
  final List<SupportMessage> messages;
  final String status; // "open" | "resolved"
  final bool intervened;
  final DateTime updatedAt;

  factory SupportConversation.fromDoc(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>? ?? {};
    final msgs = (data['messages'] as List?)
        ?.map((m) => SupportMessage.fromMap(Map<String, dynamic>.from(m as Map)))
        .toList() ?? [];
    return SupportConversation(
      id: doc.id,
      userId: data['userId'] as String? ?? '',
      userName: data['userName'] as String? ?? '',
      userEmail: data['userEmail'] as String? ?? '',
      title: data['title'] as String? ?? 'New chat',
      messages: msgs,
      status: data['status'] as String? ?? 'open',
      intervened: data['intervened'] as bool? ?? false,
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
    );
  }
}

class SupportService {
  SupportService._();
  static final instance = SupportService._();

  final _col = FirebaseFirestore.instance.collection('support_conversations');

  String newConversationId() => 'conv_${DateTime.now().millisecondsSinceEpoch}_${DateTime.now().microsecond}';

  /// Creates a new conversation.
  Future<void> upsertConversation(String convId, {
    required String userId,
    required String userName,
    required String userEmail,
    required List<SupportMessage> messages,
    required String title,
  }) async {
    await _col.doc(convId).set({
      'userId': userId,
      'userName': userName,
      'userEmail': userEmail,
      'messages': messages.map((m) => m.toMap()).toList(),
      'title': title,
      'status': 'open',
      'intervened': false,
      'intervenedBy': '',
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  /// Appends a message to an existing conversation.
  Future<void> appendMessage(String convId, SupportMessage message) async {
    await _col.doc(convId).update({
      'messages': FieldValue.arrayUnion([message.toMap()]),
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  /// Real-time stream for a single conversation.
  Stream<SupportConversation?> watchConversation(String convId) {
    return _col.doc(convId).snapshots().map((snap) {
      if (!snap.exists) return null;
      return SupportConversation.fromDoc(snap);
    });
  }

  /// Lists all conversations for a user (sorted by most recent).
  Future<List<SupportConversation>> listMyConversations(String uid) async {
    final snap = await _col.get();
    final all = snap.docs
        .map((d) => SupportConversation.fromDoc(d))
        .where((c) => c.userId == uid)
        .toList();
    all.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    return all;
  }
}
