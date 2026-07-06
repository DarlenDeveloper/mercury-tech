import 'package:flutter/material.dart';

import '../data/auth_scope.dart';
import 'phone_auth_screen.dart';

/// Opens the full-screen phone/email auth flow. Returns `true` when the user
/// finishes signed in.
Future<bool> showAuthFlow(BuildContext context, {String? reason}) async {
  final result = await Navigator.of(context).push<bool>(
    MaterialPageRoute(builder: (_) => PhoneAuthScreen(reason: reason)),
  );
  return result ?? false;
}

/// Returns true if already registered; otherwise prompts sign in / sign up and
/// returns whether the user completed it. Gate account-only actions with this.
Future<bool> requireAccount(BuildContext context, {String? reason}) async {
  if (AuthScope.of(context).isRegistered) return true;
  return showAuthFlow(context, reason: reason);
}
