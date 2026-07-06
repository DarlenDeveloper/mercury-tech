import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../data/auth_scope.dart';
import '../theme/app_colors.dart';

/// Enter the 6-digit SMS code. Pops `true` on successful verification.
class OtpScreen extends StatefulWidget {
  const OtpScreen({
    super.key,
    required this.verificationId,
    required this.phoneNumber,
  });

  final String verificationId;
  final String phoneNumber;

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  static const _ink = Color(0xFF1F2937);
  static const _length = 6;

  final _controller = TextEditingController();
  final _focus = FocusNode();
  late String _verificationId = widget.verificationId;
  bool _busy = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _focus.requestFocus());
  }

  @override
  void dispose() {
    _controller.dispose();
    _focus.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    if (_controller.text.length < _length) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await AuthScope.of(context).service.confirmSmsCode(
            verificationId: _verificationId,
            smsCode: _controller.text,
          );
      if (mounted) Navigator.of(context).pop(true);
    } on FirebaseAuthException catch (e) {
      setState(() {
        _error = e.code == 'invalid-verification-code'
            ? 'That code is incorrect. Please try again.'
            : (e.message ?? 'Verification failed.');
        _busy = false;
      });
    }
  }

  Future<void> _resend() async {
    setState(() => _error = null);
    try {
      await AuthScope.of(context).service.verifyPhone(
            phoneNumber: widget.phoneNumber,
            autoVerified: () {
              if (mounted) Navigator.of(context).pop(true);
            },
            verificationFailed: (e) =>
                setState(() => _error = e.message ?? 'Could not resend code.'),
            codeSent: (id) {
              _verificationId = id;
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('A new code was sent.')),
                );
              }
            },
          );
    } on FirebaseAuthException catch (e) {
      setState(() => _error = e.message ?? 'Could not resend code.');
    }
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  InkWell(
                    onTap: () => Navigator.of(context).maybePop(),
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
                  ),
                  Image.asset('assets/images/logo.png',
                      width: 40, height: 40, fit: BoxFit.contain),
                ],
              ),
              const SizedBox(height: 28),
              const Text(
                'Verify your number',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: _ink,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Enter the 6-digit code sent to ${widget.phoneNumber}',
                style: const TextStyle(fontSize: 13.5, color: AppColors.inactive),
              ),
              const SizedBox(height: 28),

              // OTP cells backed by a hidden field.
              GestureDetector(
                onTap: () => _focus.requestFocus(),
                child: Stack(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: List.generate(_length, (i) {
                        final text = _controller.text;
                        final filled = i < text.length;
                        final active = i == text.length;
                        return Container(
                          width: 48,
                          height: 56,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF4F5F8),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: active
                                  ? AppColors.primary
                                  : Colors.transparent,
                              width: 1.5,
                            ),
                          ),
                          child: Text(
                            filled ? text[i] : '',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                              color: _ink,
                            ),
                          ),
                        );
                      }),
                    ),
                    Opacity(
                      opacity: 0,
                      child: TextField(
                        controller: _controller,
                        focusNode: _focus,
                        autofocus: true,
                        keyboardType: TextInputType.number,
                        maxLength: _length,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                        ],
                        onChanged: (v) {
                          setState(() {});
                          if (v.length == _length) _verify();
                        },
                      ),
                    ),
                  ],
                ),
              ),

              if (_error != null) ...[
                const SizedBox(height: 14),
                Text(
                  _error!,
                  style: const TextStyle(
                    fontSize: 12.5,
                    color: Color(0xFFE11D2A),
                  ),
                ),
              ],

              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed:
                      _busy || _controller.text.length < _length ? null : _verify,
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
                  child: _busy
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.4,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Verify',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: GestureDetector(
                  onTap: _resend,
                  child: Text.rich(
                    const TextSpan(
                      text: "Didn't get a code? ",
                      style: TextStyle(
                        fontSize: 13.5,
                        color: AppColors.inactive,
                      ),
                      children: [
                        TextSpan(
                          text: 'Resend',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
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
      ),
    );
  }
}
