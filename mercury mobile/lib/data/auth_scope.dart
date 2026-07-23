import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import 'auth_service.dart';
import 'notification_service.dart';

/// Exposes the current auth state and [AuthService] to the widget tree.
class AuthScope extends InheritedWidget {
  const AuthScope({
    super.key,
    required this.user,
    required this.service,
    required super.child,
  });

  final User? user;
  final AuthService service;

  bool get isRegistered => user != null && !user!.isAnonymous;

  static AuthScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AuthScope>();
    assert(scope != null, 'AuthScope not found in the widget tree');
    return scope!;
  }

  @override
  bool updateShouldNotify(AuthScope old) => user?.uid != old.user?.uid ||
      user?.isAnonymous != old.user?.isAnonymous ||
      user?.displayName != old.user?.displayName;
}

/// Keeps an anonymous session alive and rebuilds on auth changes.
class AuthGate extends StatefulWidget {
  const AuthGate({super.key, required this.child, this.service});

  final Widget child;
  final AuthService? service;

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  late final AuthService _service = widget.service ?? AuthService();

  @override
  void initState() {
    super.initState();
    _service.ensureSignedIn();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: _service.authStateChanges(),
      builder: (context, snapshot) {
        // Keep per-user push topic in sync with the signed-in user.
        NotificationService.instance.syncUser(snapshot.data?.uid);
        return AuthScope(
          user: snapshot.data,
          service: _service,
          child: widget.child,
        );
      },
    );
  }
}
