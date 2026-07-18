import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/auth_scope.dart';
import '../theme/app_colors.dart';

class PrivacySecurityScreen extends StatefulWidget {
  const PrivacySecurityScreen({super.key});

  @override
  State<PrivacySecurityScreen> createState() => _PrivacySecurityScreenState();
}

class _PrivacySecurityScreenState extends State<PrivacySecurityScreen> {
  static const _ink = Color(0xFF1F2937);

  final _currentController = TextEditingController();
  final _newController = TextEditingController();
  final _confirmController = TextEditingController();

  bool _changingPassword = false;

  @override
  void dispose() {
    _currentController.dispose();
    _newController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  void _snack(String message, {bool error = false}) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          behavior: SnackBarBehavior.floating,
          backgroundColor: error ? const Color(0xFFE53935) : null,
        ),
      );
  }

  Future<void> _changePassword() async {
    final current = _currentController.text;
    final next = _newController.text;
    final confirm = _confirmController.text;

    if (current.isEmpty || next.isEmpty) {
      _snack('Fill in all password fields', error: true);
      return;
    }
    if (next.length < 6) {
      _snack('New password must be at least 6 characters', error: true);
      return;
    }
    if (next != confirm) {
      _snack('New passwords do not match', error: true);
      return;
    }

    setState(() => _changingPassword = true);
    try {
      await AuthScope.of(context).service.changePassword(
            currentPassword: current,
            newPassword: next,
          );
      if (!mounted) return;
      _currentController.clear();
      _newController.clear();
      _confirmController.clear();
      _snack('Password updated');
    } on FirebaseAuthException catch (e) {
      final msg = switch (e.code) {
        'wrong-password' || 'invalid-credential' => 'Current password is incorrect',
        'weak-password' => 'New password is too weak',
        'requires-recent-login' => 'Please sign in again to change your password',
        _ => e.message ?? 'Could not change password',
      };
      _snack(msg, error: true);
    } catch (_) {
      _snack('Could not change password', error: true);
    } finally {
      if (mounted) setState(() => _changingPassword = false);
    }
  }

  void _openDeleteDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _DeleteAccountSheet(
        onDeleted: () {
          Navigator.of(context).pop(); // close sheet
          Navigator.of(context).maybePop(); // close screen
          _snack('Your deletion request has been submitted. You have been logged out.');
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      body: SafeArea(
        child: Column(
          children: [
            // Top bar
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Row(
                children: [
                  _CircleBack(onTap: () => Navigator.of(context).maybePop()),
                  const Expanded(
                    child: Center(
                      child: Text(
                        'Privacy & Security',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: _ink),
                      ),
                    ),
                  ),
                  const SizedBox(width: 40),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 40),
                children: [
                  // ── Change password ──
                  const _SectionTitle('Change Password'),
                  const SizedBox(height: 12),
                  if (!AuthScope.of(context).service.hasPasswordProvider)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Row(
                        children: [
                          Icon(IconsaxPlusLinear.info_circle, size: 20, color: AppColors.inactive),
                          SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Password change is only available for accounts created with an email and password.',
                              style: TextStyle(fontSize: 13, color: AppColors.inactive, height: 1.4),
                            ),
                          ),
                        ],
                      ),
                    )
                  else ...[
                    _PasswordField(controller: _currentController, label: 'Current Password', hint: 'Enter current password'),
                    const SizedBox(height: 16),
                    _PasswordField(controller: _newController, label: 'New Password', hint: 'At least 6 characters'),
                    const SizedBox(height: 16),
                    _PasswordField(controller: _confirmController, label: 'Confirm New Password', hint: 'Re-enter new password'),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: _changingPassword ? null : _changePassword,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                        ),
                        child: _changingPassword
                            ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white))
                            : const Text('Update Password', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],

                  const SizedBox(height: 36),

                  // ── Danger zone ──
                  const _SectionTitle('Danger Zone'),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Request Account Deletion',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFFB91C1C)),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Submit a request to delete your account. Our team will process it and remove all associated data. You will be logged out immediately.',
                          style: TextStyle(fontSize: 13, color: Color(0xFF991B1B), height: 1.4),
                        ),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton.icon(
                            onPressed: _openDeleteDialog,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFDC2626),
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                            ),
                            icon: const Icon(IconsaxPlusLinear.trash, size: 18),
                            label: const Text('Request Deletion', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Delete account sheet (reasons + confirmation) ───────────────────────────

class _DeleteAccountSheet extends StatefulWidget {
  const _DeleteAccountSheet({required this.onDeleted});
  final VoidCallback onDeleted;

  @override
  State<_DeleteAccountSheet> createState() => _DeleteAccountSheetState();
}

class _DeleteAccountSheetState extends State<_DeleteAccountSheet> {
  static const _ink = Color(0xFF1F2937);

  static const _reasons = [
    'No longer needed',
    'Privacy concerns',
    'Found a better alternative',
    'Too many notifications',
    'Difficult to use',
    'Other',
  ];

  String? _selectedReason;
  final _detailsController = TextEditingController();
  bool _deleting = false;

  @override
  void dispose() {
    _detailsController.dispose();
    super.dispose();
  }

  Future<void> _confirmDelete() async {
    if (_selectedReason == null) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(const SnackBar(
          content: Text('Please select a reason'),
          behavior: SnackBarBehavior.floating,
          backgroundColor: Color(0xFFE53935),
        ));
      return;
    }

    setState(() => _deleting = true);

    final reason = _selectedReason == 'Other' && _detailsController.text.trim().isNotEmpty
        ? _detailsController.text.trim()
        : [_selectedReason, if (_detailsController.text.trim().isNotEmpty) _detailsController.text.trim()].join(' — ');

    try {
      await AuthScope.of(context).service.requestAccountDeletion(reason: reason);
      if (!mounted) return;
      widget.onDeleted();
    } catch (_) {
      if (!mounted) return;
      setState(() => _deleting = false);
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(const SnackBar(
          content: Text('Could not submit deletion request'),
          behavior: SnackBarBehavior.floating,
          backgroundColor: Color(0xFFE53935),
        ));
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: DraggableScrollableSheet(
        initialChildSize: 0.75,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 36, height: 4, decoration: BoxDecoration(color: const Color(0xFFD1D5DB), borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 16),
              const Text('Request Account Deletion', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Color(0xFFDC2626))),
              const SizedBox(height: 6),
              const Text(
                'We\'re sorry to see you go. Your request will be reviewed by our team. Please tell us why.',
                style: TextStyle(fontSize: 13, color: AppColors.inactive, height: 1.4),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  children: [
                    const Text('Reason for leaving', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: _ink)),
                    const SizedBox(height: 10),
                    ..._reasons.map((r) {
                      final selected = _selectedReason == r;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedReason = r),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            color: selected ? AppColors.primary.withValues(alpha: 0.06) : const Color(0xFFF9FAFB),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: selected ? AppColors.primary : const Color(0xFFE5E7EB)),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                selected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                                size: 20,
                                color: selected ? AppColors.primary : const Color(0xFF9CA3AF),
                              ),
                              const SizedBox(width: 12),
                              Text(r, style: TextStyle(fontSize: 14, fontWeight: selected ? FontWeight.w600 : FontWeight.w500, color: _ink)),
                            ],
                          ),
                        ),
                      );
                    }),
                    const SizedBox(height: 8),
                    const Text('Additional details (optional)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: _ink)),
                    const SizedBox(height: 8),
                    Container(
                      decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE5E7EB))),
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      child: TextField(
                        controller: _detailsController,
                        maxLines: 3,
                        decoration: const InputDecoration(
                          hintText: 'Tell us more...',
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(vertical: 12),
                          hintStyle: TextStyle(color: Color(0xFF9CA3AF)),
                        ),
                        style: const TextStyle(fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 52,
                      child: OutlinedButton(
                        onPressed: _deleting ? null : () => Navigator.of(context).pop(),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: _ink,
                          side: const BorderSide(color: Color(0xFFE5E7EB)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                        ),
                        child: const Text('Cancel', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: SizedBox(
                      height: 52,
                      child: ElevatedButton(
                        onPressed: _deleting ? null : _confirmDelete,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFDC2626),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                        ),
                        child: _deleting
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white))
                            : const Text('Delete', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Shared bits ─────────────────────────────────────────────────────────────

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF1F2937)),
    );
  }
}

class _PasswordField extends StatefulWidget {
  const _PasswordField({required this.controller, required this.label, required this.hint});
  final TextEditingController controller;
  final String label;
  final String hint;

  @override
  State<_PasswordField> createState() => _PasswordFieldState();
}

class _PasswordFieldState extends State<_PasswordField> {
  bool _obscure = true;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1F2937))),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(28)),
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: Row(
            children: [
              const Icon(IconsaxPlusLinear.lock, size: 18, color: AppColors.inactive),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: widget.controller,
                  obscureText: _obscure,
                  decoration: InputDecoration(
                    hintText: widget.hint,
                    border: InputBorder.none,
                    isCollapsed: true,
                    contentPadding: const EdgeInsets.symmetric(vertical: 16),
                    hintStyle: const TextStyle(color: Color(0xFF9CA3AF)),
                  ),
                  style: const TextStyle(fontSize: 15),
                ),
              ),
              GestureDetector(
                onTap: () => setState(() => _obscure = !_obscure),
                child: Icon(
                  _obscure ? IconsaxPlusLinear.eye_slash : IconsaxPlusLinear.eye,
                  size: 18,
                  color: AppColors.inactive,
                ),
              ),
            ],
          ),
        ),
      ],
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
