import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/auth_scope.dart';
import '../theme/app_colors.dart';
import 'auth_flow.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  static const _ink = Color(0xFF1F2937);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      bottom: false,
      child: ListView(
        padding: EdgeInsets.fromLTRB(
          20,
          MediaQuery.of(context).padding.top + 8,
          20,
          120,
        ),
        children: [
          // Header.
          Row(
            children: const [
              SizedBox(width: 40),
              Expanded(
                child: Center(
                  child: Text(
                    'Profile',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: _ink,
                    ),
                  ),
                ),
              ),
              Icon(IconsaxPlusLinear.notification, size: 24, color: _ink),
            ],
          ),
          const SizedBox(height: 18),

          // Profile card.
          const _ProfileHeaderCard(),
          const SizedBox(height: 18),

          // Shopping.
          _SectionCard(
            rows: [
              _ProfileRow(
                icon: IconsaxPlusLinear.box,
                label: 'My Orders',
                onTap: () {},
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.wallet_money,
                label: 'Transactions',
                onTap: () {},
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.receipt_text,
                label: 'Receipts',
                onTap: () {},
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.card,
                label: 'Payment Methods',
                onTap: () {},
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.location,
                label: 'Delivery Addresses',
                onTap: () {},
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.heart,
                label: 'Wishlist',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Account & security.
          _SectionCard(
            rows: [
              _ProfileRow(
                icon: IconsaxPlusLinear.notification,
                label: 'Notifications',
                onTap: () {},
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.setting_4,
                label: 'Preferences',
                onTap: () {},
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.global,
                label: 'Language',
                trailingText: 'English',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Support & legal.
          _SectionCard(
            rows: [
              _ProfileRow(
                icon: IconsaxPlusLinear.message_question,
                label: 'Help & Support',
                onTap: () {},
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.shield_tick,
                label: 'Privacy Policy',
                onTap: () {},
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.document_text,
                label: 'Terms of Service',
                onTap: () {},
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.message_text,
                label: 'Send Feedback',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Log out.
          _SectionCard(
            rows: [
              _ProfileRow(
                icon: IconsaxPlusLinear.logout,
                label: 'Log Out',
                danger: true,
                showChevron: false,
                onTap: () => AuthScope.of(context).service.signOut(),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProfileHeaderCard extends StatelessWidget {
  const _ProfileHeaderCard();

  @override
  Widget build(BuildContext context) {
    final user = AuthScope.of(context).user;
    final registered = user != null && !user.isAnonymous;
    String name;
    String subtitle;
    if (registered) {
      final displayName = user.displayName?.trim() ?? '';
      name = displayName.isNotEmpty ? displayName : 'Mercury Customer';
      subtitle = user.email ?? 'Signed in';
    } else {
      name = 'Guest User';
      subtitle = 'Sign in or create an account';
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: registered
            ? () {}
            : () => showAuthFlow(
                  context,
                  reason: 'Sign in or create an account',
                ),
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(IconsaxPlusBold.user,
                    color: Colors.white, size: 26),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: _ProfileScreenState._ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: const TextStyle(
                          fontSize: 13, color: AppColors.inactive),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right,
                  color: AppColors.inactive, size: 22),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.rows});

  final List<_ProfileRow> rows;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        children: [
          for (var i = 0; i < rows.length; i++) ...[
            rows[i],
            if (i != rows.length - 1)
              const Divider(
                height: 1,
                thickness: 1,
                indent: 56,
                color: Color(0xFFF0F1F4),
              ),
          ],
        ],
      ),
    );
  }
}

class _ProfileRow extends StatelessWidget {
  const _ProfileRow({
    required this.icon,
    required this.label,
    this.onTap,
    this.trailingText,
    this.showChevron = true,
    this.danger = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final String? trailingText;
  final bool showChevron;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final labelColor =
        danger ? const Color(0xFFE11D2A) : _ProfileScreenState._ink;
    final iconColor = danger ? const Color(0xFFE11D2A) : AppColors.primary;
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 22, color: iconColor),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                  color: labelColor,
                ),
              ),
            ),
            if (trailingText != null)
              Padding(
                padding: const EdgeInsets.only(right: 6),
                child: Text(
                  trailingText!,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.inactive,
                  ),
                ),
              ),
            if (showChevron)
              const Icon(Icons.chevron_right,
                  color: AppColors.inactive, size: 22),
          ],
        ),
      ),
    );
  }
}
