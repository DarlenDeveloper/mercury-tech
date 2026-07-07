import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/auth_scope.dart';
import '../data/user_repository.dart';
import '../theme/app_colors.dart';

class Country {
  const Country(this.name, this.dial, this.code);
  final String name;
  final String dial;
  final String code;
}

const _countries = <Country>[
  Country('Uganda', '+256', 'UG'),
  Country('Kenya', '+254', 'KE'),
  Country('Tanzania', '+255', 'TZ'),
  Country('Rwanda', '+250', 'RW'),
  Country('South Sudan', '+211', 'SS'),
  Country('United States', '+1', 'US'),
  Country('United Kingdom', '+44', 'GB'),
];

/// Full-screen auth. Phone users get a password-based account using their
/// phone number as the identifier (no SMS). Email users use email/password.
class PhoneAuthScreen extends StatefulWidget {
  const PhoneAuthScreen({super.key, this.reason});
  final String? reason;

  @override
  State<PhoneAuthScreen> createState() => _PhoneAuthScreenState();
}

class _PhoneAuthScreenState extends State<PhoneAuthScreen> {
  static const _ink = Color(0xFF1F2937);

  bool _isSignUp = true;
  bool _emailMode = false;
  bool _busy = false;
  bool _showPassword = false;
  bool _showConfirmPassword = false;
  String? _error;

  Country _country = _countries.first;
  final _phone = TextEditingController();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirmPassword = TextEditingController();
  final _location = TextEditingController();

  @override
  void initState() {
    super.initState();
    _phone.addListener(_onChanged);
    _email.addListener(_onChanged);
    _password.addListener(_onChanged);
    _confirmPassword.addListener(_onChanged);
  }

  @override
  void dispose() {
    _phone.dispose();
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _confirmPassword.dispose();
    _location.dispose();
    super.dispose();
  }

  void _onChanged() => setState(() {});

  String get _digits => _phone.text.replaceAll(RegExp(r'\D'), '');

  /// Converts phone to a fake email for Firebase Auth.
  String get _phoneEmail {
    var d = _digits;
    if (d.startsWith('0')) d = d.substring(1);
    return '${_country.dial.replaceAll('+', '')}$d@mercury.phone';
  }

  String get _e164 {
    var d = _digits;
    if (d.startsWith('0')) d = d.substring(1);
    return '${_country.dial}$d';
  }

  bool get _canContinue {
    if (_busy) return false;
    if (_emailMode) {
      final baseValid =
          _email.text.contains('@') && _password.text.length >= 6;
      if (_isSignUp) {
        return baseValid && _password.text == _confirmPassword.text;
      }
      return baseValid;
    }
    // Phone mode
    final baseValid = _digits.length >= 7 && _password.text.length >= 6;
    if (_isSignUp) {
      return baseValid && _password.text == _confirmPassword.text;
    }
    return baseValid;
  }

  Future<void> _continue() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    final auth = AuthScope.of(context).service;

    try {
      if (_emailMode) {
        if (_isSignUp) {
          await auth.signUp(
            email: _email.text.trim(),
            password: _password.text,
            name: _name.text.trim(),
          );
          await _saveLocation();
        } else {
          await auth.signIn(
            email: _email.text.trim(),
            password: _password.text,
          );
        }
      } else {
        // Phone mode — use phone-derived email with password.
        if (_isSignUp) {
          await auth.signUp(
            email: _phoneEmail,
            password: _password.text,
            name: _name.text.trim(),
          );
          // Save phone number and location to profile.
          final uid = AuthScope.of(context).user?.uid;
          if (uid != null) {
            final repo = UserRepository();
            final existing = await repo.getProfile(uid);
            if (existing != null) {
              await repo.saveProfile(existing.copyWith(
                phone: _e164,
                location: _location.text.trim(),
              ));
            } else {
              await repo.saveProfile(UserProfile(
                uid: uid,
                name: _name.text.trim(),
                phone: _e164,
                location: _location.text.trim(),
              ));
            }
          }
        } else {
          await auth.signIn(
            email: _phoneEmail,
            password: _password.text,
          );
        }
      }
      if (mounted) Navigator.of(context).pop(true);
    } on FirebaseAuthException catch (e) {
      setState(() => _error = _friendly(e));
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _saveLocation() async {
    if (_location.text.trim().isEmpty) return;
    final uid = AuthScope.of(context).user?.uid;
    if (uid == null) return;
    final repo = UserRepository();
    final existing = await repo.getProfile(uid);
    if (existing != null) {
      await repo.saveProfile(existing.copyWith(location: _location.text.trim()));
    }
  }

  String _friendly(FirebaseAuthException e) {
    switch (e.code) {
      case 'email-already-in-use':
        return 'This phone number or email already has an account. Try signing in.';
      case 'invalid-email':
        return 'Please enter a valid email address.';
      case 'weak-password':
        return 'Password should be at least 6 characters.';
      case 'wrong-password':
      case 'invalid-credential':
        return 'Incorrect password. Please try again.';
      case 'user-not-found':
        return 'No account found. Please sign up first.';
      case 'too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'network-request-failed':
        return 'Network error. Check your connection.';
      default:
        return e.message ?? 'Something went wrong. Please try again.';
    }
  }

  void _pickCountry() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 12),
            Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFE5E7EB),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 8),
            for (final c in _countries)
              ListTile(
                leading: _CountryBadge(code: c.code),
                title: Text(c.name),
                trailing: Text(
                  c.dial,
                  style: const TextStyle(color: AppColors.inactive),
                ),
                onTap: () {
                  setState(() => _country = c);
                  Navigator.pop(context);
                },
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top bar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _CircleBack(onTap: () => Navigator.of(context).maybePop()),
                  Image.asset('assets/images/logo.png',
                      width: 40, height: 40, fit: BoxFit.contain),
                ],
              ),
              const SizedBox(height: 28),

              Text(
                _isSignUp ? 'Create account' : 'Welcome Back!',
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: _ink,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                widget.reason ?? (_isSignUp
                    ? 'Create your account to get started.'
                    : 'Sign in to continue.'),
                style: const TextStyle(fontSize: 13.5, color: AppColors.inactive),
              ),
              const SizedBox(height: 28),

              Expanded(
                child: ListView(
                  children: [
                    if (_emailMode)
                      ..._emailFields()
                    else
                      ..._phoneFields(),

                    if (_error != null) ...[
                      const SizedBox(height: 12),
                      Text(
                        _error!,
                        style: const TextStyle(
                          fontSize: 12.5,
                          color: Color(0xFFE11D2A),
                        ),
                      ),
                    ],

                    const SizedBox(height: 28),
                    _ContinueButton(
                      enabled: _canContinue,
                      busy: _busy,
                      onTap: _continue,
                    ),
                    const SizedBox(height: 16),
                    Center(
                      child: GestureDetector(
                        onTap: () => setState(() {
                          _isSignUp = !_isSignUp;
                          _error = null;
                        }),
                        child: Text.rich(
                          TextSpan(
                            text: _isSignUp
                                ? 'Already have an account? '
                                : "Don't have an account? ",
                            style: const TextStyle(
                              fontSize: 13.5,
                              color: AppColors.inactive,
                            ),
                            children: [
                              TextSpan(
                                text: _isSignUp ? 'Sign in' : 'Sign up',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  color: _ink,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              Center(
                child: TextButton(
                  onPressed: () => setState(() {
                    _emailMode = !_emailMode;
                    _error = null;
                  }),
                  child: Text(
                    _emailMode ? 'Use phone number instead' : 'Use email instead',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<Widget> _phoneFields() {
    return [
      if (_isSignUp) ...[
        _boxField(_name, 'Full name', IconsaxPlusLinear.user),
        const SizedBox(height: 12),
      ],
      const Text(
        'Phone Number',
        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: _ink),
      ),
      const SizedBox(height: 8),
      Row(
        children: [
          GestureDetector(
            onTap: _pickCountry,
            child: Container(
              height: 56,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFF4F5F8),
                borderRadius: BorderRadius.circular(28),
              ),
              child: Row(
                children: [
                  _CountryBadge(code: _country.code),
                  const SizedBox(width: 4),
                  const Icon(Icons.keyboard_arrow_down, size: 18),
                ],
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Container(
              height: 56,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFF4F5F8),
                borderRadius: BorderRadius.circular(28),
              ),
              alignment: Alignment.centerLeft,
              child: TextField(
                controller: _phone,
                keyboardType: TextInputType.phone,
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'[0-9 ]')),
                ],
                decoration: const InputDecoration(
                  hintText: 'e.g. 780 123 456',
                  border: InputBorder.none,
                  isCollapsed: true,
                  hintStyle: TextStyle(color: Color(0xFF9CA3AF)),
                ),
                style: const TextStyle(fontSize: 15, color: _ink),
              ),
            ),
          ),
        ],
      ),
      const SizedBox(height: 12),
      _passwordField(_password, 'Create password', _showPassword, (v) {
        setState(() => _showPassword = v);
      }),
      if (_isSignUp) ...[
        const SizedBox(height: 12),
        _passwordField(
            _confirmPassword, 'Confirm password', _showConfirmPassword, (v) {
          setState(() => _showConfirmPassword = v);
        }),
        const SizedBox(height: 12),
        _boxField(_location, 'Location (e.g. Kampala)', IconsaxPlusLinear.location),
      ],
    ];
  }

  List<Widget> _emailFields() {
    return [
      if (_isSignUp) ...[
        _boxField(_name, 'Full name', IconsaxPlusLinear.user),
        const SizedBox(height: 12),
      ],
      _boxField(_email, 'Email address', IconsaxPlusLinear.sms,
          keyboardType: TextInputType.emailAddress),
      const SizedBox(height: 12),
      _passwordField(_password, 'Password', _showPassword, (v) {
        setState(() => _showPassword = v);
      }),
      if (_isSignUp) ...[
        const SizedBox(height: 12),
        _passwordField(
            _confirmPassword, 'Confirm password', _showConfirmPassword, (v) {
          setState(() => _showConfirmPassword = v);
        }),
        const SizedBox(height: 12),
        _boxField(_location, 'Location (e.g. Kampala)', IconsaxPlusLinear.location),
      ],
    ];
  }

  Widget _passwordField(
    TextEditingController c,
    String hint,
    bool visible,
    ValueChanged<bool> onToggle,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF4F5F8),
        borderRadius: BorderRadius.circular(28),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Row(
        children: [
          Icon(IconsaxPlusLinear.lock, size: 18, color: AppColors.inactive),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              controller: c,
              obscureText: !visible,
              decoration: InputDecoration(
                hintText: hint,
                border: InputBorder.none,
                isCollapsed: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 18),
                hintStyle: const TextStyle(color: Color(0xFF9CA3AF)),
              ),
              style: const TextStyle(fontSize: 15),
            ),
          ),
          GestureDetector(
            onTap: () => onToggle(!visible),
            child: Icon(
              visible ? IconsaxPlusLinear.eye : IconsaxPlusLinear.eye_slash,
              size: 18,
              color: AppColors.inactive,
            ),
          ),
        ],
      ),
    );
  }

  Widget _boxField(
    TextEditingController c,
    String hint,
    IconData icon, {
    bool obscure = false,
    TextInputType? keyboardType,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF4F5F8),
        borderRadius: BorderRadius.circular(28),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.inactive),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              controller: c,
              obscureText: obscure,
              keyboardType: keyboardType,
              decoration: InputDecoration(
                hintText: hint,
                border: InputBorder.none,
                isCollapsed: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 18),
                hintStyle: const TextStyle(color: Color(0xFF9CA3AF)),
              ),
              style: const TextStyle(fontSize: 15),
            ),
          ),
        ],
      ),
    );
  }
}

class _CountryBadge extends StatelessWidget {
  const _CountryBadge({required this.code});
  final String code;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(3),
      child: SvgPicture.asset(
        'assets/flags/${code.toLowerCase()}.svg',
        width: 28,
        height: 20,
        fit: BoxFit.cover,
      ),
    );
  }
}

class _CircleBack extends StatelessWidget {
  const _CircleBack({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      customBorder: const CircleBorder(),
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        child: const Icon(Icons.arrow_back_ios_new, size: 16),
      ),
    );
  }
}

class _ContinueButton extends StatelessWidget {
  const _ContinueButton({
    required this.enabled,
    required this.busy,
    required this.onTap,
  });

  final bool enabled;
  final bool busy;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: enabled ? onTap : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          disabledBackgroundColor: const Color(0xFFEDEDED),
          foregroundColor: Colors.white,
          disabledForegroundColor: const Color(0xFF9CA3AF),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(28),
          ),
        ),
        child: busy
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.4,
                  color: Colors.white,
                ),
              )
            : const Text(
                'Continue',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              ),
      ),
    );
  }
}
