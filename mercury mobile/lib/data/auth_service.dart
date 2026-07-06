import 'package:firebase_auth/firebase_auth.dart';

/// Wraps Firebase Auth for the app's "anonymous-first" model:
/// every visitor gets an anonymous session; gated actions (wishlist, cart,
/// profile) prompt them to upgrade to a real account, which links to the
/// existing anonymous user so their data carries over.
class AuthService {
  AuthService({FirebaseAuth? auth}) : _auth = auth ?? FirebaseAuth.instance;

  final FirebaseAuth _auth;

  User? get currentUser => _auth.currentUser;

  /// A user is "registered" when they exist and are not anonymous.
  bool get isRegistered =>
      _auth.currentUser != null && !_auth.currentUser!.isAnonymous;

  Stream<User?> authStateChanges() => _auth.authStateChanges();

  /// Ensures there is always a session (anonymous if not signed in).
  Future<void> ensureSignedIn() async {
    if (_auth.currentUser == null) {
      await _auth.signInAnonymously();
    }
  }

  /// Creates a real account. If the current session is anonymous, the new
  /// email/password credential is linked to it (preserving the uid + data).
  Future<void> signUp({
    required String email,
    required String password,
    String? name,
  }) async {
    final current = _auth.currentUser;
    if (current != null && current.isAnonymous) {
      final cred =
          EmailAuthProvider.credential(email: email, password: password);
      final result = await current.linkWithCredential(cred);
      if (name != null && name.trim().isNotEmpty) {
        await result.user?.updateDisplayName(name.trim());
      }
    } else {
      final result = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      if (name != null && name.trim().isNotEmpty) {
        await result.user?.updateDisplayName(name.trim());
      }
    }
  }

  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    await _auth.signInWithEmailAndPassword(email: email, password: password);
  }

  Future<void> sendPasswordReset(String email) =>
      _auth.sendPasswordResetEmail(email: email);

  // --- Phone auth -----------------------------------------------------------

  /// Starts phone verification. [codeSent] fires with a verificationId when an
  /// SMS is dispatched; [verificationCompleted] may fire for instant/auto
  /// verification (Android). [verificationFailed] surfaces errors.
  Future<void> verifyPhone({
    required String phoneNumber, // E.164, e.g. +256704823800
    required void Function(String verificationId) codeSent,
    required void Function(FirebaseAuthException e) verificationFailed,
    void Function()? autoVerified,
  }) async {
    await _auth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: (credential) async {
        await _signInOrLink(credential);
        autoVerified?.call();
      },
      verificationFailed: verificationFailed,
      codeSent: (verificationId, _) => codeSent(verificationId),
      codeAutoRetrievalTimeout: (_) {},
      timeout: const Duration(seconds: 60),
    );
  }

  /// Confirms the SMS code and signs in (linking to the anonymous session).
  Future<void> confirmSmsCode({
    required String verificationId,
    required String smsCode,
  }) async {
    final credential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode,
    );
    await _signInOrLink(credential);
  }

  /// Links the credential to the current anonymous user when possible,
  /// otherwise signs in with it directly.
  Future<void> _signInOrLink(AuthCredential credential) async {
    final current = _auth.currentUser;
    if (current != null && current.isAnonymous) {
      try {
        await current.linkWithCredential(credential);
        return;
      } on FirebaseAuthException catch (e) {
        // Phone already belongs to another account — sign in to it instead.
        if (e.code == 'credential-already-in-use') {
          await _auth.signInWithCredential(e.credential ?? credential);
          return;
        }
        rethrow;
      }
    }
    await _auth.signInWithCredential(credential);
  }

  /// Signs out and returns to a fresh anonymous session.
  Future<void> signOut() async {
    await _auth.signOut();
    await ensureSignedIn();
  }
}
