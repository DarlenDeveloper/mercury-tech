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
          MediaQuery.of(context).padding.top + 12,
          20,
          120,
        ),
        children: [
          // Header
          const Text(
            'Profile',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: _ink,
            ),
          ),
          const SizedBox(height: 20),

          // Profile card
          const _ProfileCard(),
          const SizedBox(height: 24),

          // First group
          _SectionCard(
            rows: [
              _ProfileRow(
                icon: IconsaxPlusLinear.box,
                label: 'My Orders',
                onTap: () {},
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.heart,
                label: 'My Favorites',
                onTap: () {},
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.clock,
                label: 'Recently Viewed',
                onTap: () {},
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.refresh,
                label: 'Returns & Exchanges',
                onTap: () {},
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.location,
                label: 'My Location',
                onTap: () {},
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Second group
          _SectionCard(
            rows: [
              _ProfileRow(
                icon: IconsaxPlusLinear.message_question,
                label: 'Help & Support',
                onTap: () {},
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.shield_tick,
                label: 'Policies',
                onTap: () {},
              ),
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
            ],
          ),
          const SizedBox(height: 16),

          // Log out
          _SectionCard(
            rows: [
              _ProfileRow(
                icon: IconsaxPlusLinear.logout,
                label: 'Log Out',
                danger: true,
                onTap: () => AuthScope.of(context).service.signOut(),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  const _ProfileCard();

  @override
  Widget build(BuildContext context) {
    final user = AuthScope.of(context).user;
    final registered = user != null && !user.isAnonymous;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Avatar
          Container(
            width: 70,
            height: 70,
            decoration: BoxDecoration(
              color: const Color(0xFFEDF1F7),
              shape: BoxShape.circle,
              border: Border.all(
                color: const Color(0xFFE5E7EB),
                width: 2,
              ),
            ),
            child: const Icon(IconsaxPlusBold.user,
                size: 32, color: AppColors.inactive),
          ),
          const SizedBox(height: 14),
          Text(
            registered
                ? (user.displayName?.trim().isNotEmpty == true
                    ? user.displayName!
                    : 'Mercury Customer')
                : 'Guest User',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: _ProfileScreenState._ink,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            registered
                ? (user.email ?? 'Signed in')
                : 'Sign in or create an account',
            style: const TextStyle(
              fontSize: 13,
              color: AppColors.inactive,
            ),
          ),
          const SizedBox(height: 16),
          // Edit Profile / Get Started button
          ElevatedButton.icon(
            onPressed: registered
                ? () {}
                : () => showAuthFlow(
                      context,
                      reason: 'Sign in or create an account',
                    ),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.accent,
              foregroundColor: Colors.white,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
            ),
            icon: Icon(
              registered ? IconsaxPlusLinear.edit_2 : IconsaxPlusLinear.login,
              size: 16,
            ),
            label: Text(
              registered ? 'Edit Profile' : 'Get Started',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
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
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
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
                color: Color(0xFFF3F4F6),
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
    this.danger = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final iconColor = danger ? const Color(0xFFE53935) : AppColors.inactive;
    final labelColor =
        danger ? const Color(0xFFE53935) : _ProfileScreenState._ink;

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
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
            if (!danger)
              const Icon(Icons.chevron_right,
                  color: AppColors.inactive, size: 20),
          ],
        ),
      ),
    );
  }
}
