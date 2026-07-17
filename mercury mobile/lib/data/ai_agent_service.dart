import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/foundation.dart';

/// Service that calls the `aiAgent` Firebase Cloud Function (Gemini-backed).
class AiAgentService {
  AiAgentService._();
  static final instance = AiAgentService._();

  final _callable = FirebaseFunctions.instanceFor(region: 'us-central1')
      .httpsCallable('aiAgent');

  /// Sends a message and returns the AI's reply.
  /// [history] is the prior conversation (role: "user" or "assistant", content: text).
  Future<String> ask(String message, List<Map<String, String>> history) async {
    try {
      final result = await _callable.call({
        'message': message,
        'history': history,
      });
      final data = result.data;
      if (data is Map) {
        return (data['reply'] as String?) ?? 'Sorry, something went wrong.';
      }
      return 'Sorry, something went wrong.';
    } on FirebaseFunctionsException catch (e) {
      debugPrint('AI Agent error: ${e.code} — ${e.message}');
      if (e.code == 'unauthenticated') {
        return 'Please sign in to use the assistant.';
      }
      return 'Something went wrong. Please try again.';
    } catch (e) {
      debugPrint('AI Agent unexpected error: $e');
      return 'Something went wrong. Please try again.';
    }
  }
}
