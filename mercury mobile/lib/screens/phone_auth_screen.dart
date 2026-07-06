import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/auth_scope.dart';
import '../theme/app_colors.dart';
import 'otp_screen.dart';

class Country {
  const Country(this.name, this.dial, this.flag);
  final String name;
  final String dial;
  final String flag;
}

const _countries = <Country>[
  Country('Uganda', '+256', '🇺🇬'),
  Country('Kenya', '+254', '🇰🇪'),
  Country('Tanzania', '+255', '🇹🇿'),
  Country('Rwanda', '+250', '🇷🇼'),
  Country('South Sudan', '+211', '🇸🇸'),
  Country('United States', '+1', '🇺🇸'),
  Country('United Kingdom', '+44', '🇬🇧'),
];

/// Full-screen phone/email authentication. Pops `true` when the user finishes
/// signed in (via OTP or email).
class PhoneAuthScreen extends StatefulWidget {
  const PhoneAuthScreen({super.key, this.reason});
  final String? reason;

  @override
  State<PhoneAuthScreen> createState() => _PhoneAuthScreenState();
}

class _PhoneAuthScreenState extends State<PhoneAuthScreen> {
  static const _ink = Color(0xFF1F2937);

  bool _isSignUp = false;
  bool _emailMode = false;
  bool _busy = false;
  String? _error;

  Country _country = _countries.first;
  final _phone = TextEditingController();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();

  @override
  void initState() {
    super.initState();
    _phone.addListener(_onChanged);
    _email.addListener(_onChanged);
    _password.addListener(_onChanged);
  }

  @override
  void dispose() {
    _phone.dispose();
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  void _onChanged() => setState(() {});

  String get _digits => _phone.text.replaceAll(RegExp(r'\D'), '');

  bool get _canContinue {
    if (_busy) return false;
    if (_emailMode) {
      return _email.text.contains('@') && _password.text.length >= 6;
    }
    return _digits.length >= 7;
  }

  String get _e164 {
    var d = _digits;
    if (d.startsWith('0')) d = d.substring(1);
    return '${_country.dial}$d';
  }

  Future<void> _continue() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    final auth = AuthScope.of(context).service;

    if (_emailMode) {
      try {
        if (_isSignUp) {
          await auth.signUp(
            email: _email.text.trim(),
            password: _password.text,
            name: _name.text,
          );
        } else {
          await auth.signIn(
            email: _email.text.trim(),
            password: _password.text,
          );
        }
        if (mounted) Navigator.of(context).pop(true);
      } on FirebaseAuthException catch (e) {
        setState(() => _error = _friendly(e));
      } finally {
        if (mounted) setState(() => _busy = false);
      }
      return;
    }

    // Phone flow.
    try {
      await auth.verifyPhone(
        phoneNumber: _e164,
        autoVerified: () {
          if (mounted) Navigator.of(context).pop(true);
        },
        verificationFailed: (e) {
          if (mounted) {
            setState(() {
              _error = _friendly(e);
              _busy = false;
            });
          }
        },
        codeSent: (verificationId) async {
          if (!mounted) return;
          setState(() => _busy = false);
          final ok = await Navigator.of(context).push<bool>(
            MaterialPageRoute(
              builder: (_) => OtpScreen(
                verificationId: verificationId,
                phoneNumber: _e164,
              ),
            ),
          );
          if (ok == true && mounted) Navigator.of(context).pop(true);
        },
      );
    } on FirebaseAuthException catch (e) {
      if (mounted) {
        setState(() {
          _error = _friendly(e);
          _busy = false;
        });
      }
    }
  }

  String _friendly(FirebaseAuthException e) {
    switch (e.code) {
      case 'invalid-phone-number':
        return 'Please enter a valid phone number.';
      case 'too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'email-already-in-use':
        return 'That email already has an account. Try signing in.';
      case 'invalid-email':
        return 'Please enter a valid email address.';
      case 'weak-password':
        return 'Password should be at least 6 characters.';
      case 'wrong-password':
      case 'invalid-credential':
        return 'Incorrect email or password.';
      case 'operation-not-allowed':
        return 'This sign-in method is not enabled yet.';
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
                leading: Text(c.flag, style: const TextStyle(fontSize: 22)),
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
              // Top bar: back + logo.
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
                widget.reason ??
                    (_emailMode
                        ? 'Access your account with your email'
                        : 'Access your account through your phone number'),
                style: const TextStyle(fontSize: 13.5, color: AppColors.inactive),
              ),
              const SizedBox(height: 28),

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
                          text: _isSignUp ? 'Sign in' : 'Signup',
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
              const Spacer(),
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
      const Text(
        'Enter Your Phone Number',
        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: _ink),
      ),
      const SizedBox(height: 10),
      Row(
        children: [
          GestureDetector(
            onTap: _pickCountry,
            child: Container(
              height: 56,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFF4F5F8),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Row(
                children: [
                  Text(_country.flag, style: const TextStyle(fontSize: 20)),
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
                borderRadius: BorderRadius.circular(14),
              ),
              alignment: Alignment.centerLeft,
              child: TextField(
                controller: _phone,
                autofocus: true,
                keyboardType: TextInputType.phone,
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'[0-9 ]')),
                ],
                decoration: const InputDecoration(
                  hintText: 'EX: 3834 3939 393',
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
      _boxField(_password, 'Password', IconsaxPlusLinear.lock, obscure: true),
    ];
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
        borderRadius: BorderRadius.circular(14),
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
