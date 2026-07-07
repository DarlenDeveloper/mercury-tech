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
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          // Hero banner.
          const _ProfileHeroBanner(),
          const SizedBox(height: 20),

          // Manage section.
          _buildSectionTitle('MANAGE'),
          const SizedBox(height: 8),
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
          const SizedBox(height: 20),

          // Info section.
          _buildSectionTitle('INFO'),
          const SizedBox(height: 8),
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
          const SizedBox(height: 20),

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
          const SizedBox(height: 120),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w800,
          color: _ink,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

/// Full-width hero banner at the top of the Profile tab.
class _ProfileHeroBanner extends StatelessWidget {
  const _ProfileHeroBanner();

  @override
  Widget build(BuildContext context) {
    final user = AuthScope.of(context).user;
    final registered = user != null && !user.isAnonymous;

    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Color(0xFF1A2E3B),
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 28),
          child: Column(
            children: [
              // Avatar.
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.3),
                    width: 2,
                  ),
                ),
                child: const Icon(
                  IconsaxPlusBold.user,
                  color: Colors.white,
                  size: 30,
                ),
              ),
              const SizedBox(height: 14),
              Text(
                registered
                    ? 'Welcome back!'
                    : 'Welcome to Mercury',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                registered
                    ? (user.email ?? 'Signed in')
                    : 'Create an account or sign in to track orders,\nand save your shopping history.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.white.withValues(alpha: 0.75),
                  height: 1.4,
                ),
              ),
              if (!registered) ...[
                const SizedBox(height: 18),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => showAuthFlow(
                      context,
                      reason: 'Sign in or create an account',
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF1A2E3B),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Get Started',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ],
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
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 12,
              offset: const Offset(0, 4),
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
                  color: Color(0xFFF0F1F4),
                ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ProfileRow extends StatelessWidget {
  const _ProfileRow({
    required this.icon,
    required this.label,
    this.onTap,
    this.showChevron = true,
    this.danger = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool showChevron;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final labelColor =
        danger ? const Color(0xFFE11D2A) : const Color(0xFF1F2937);
    final iconColor =
        danger ? const Color(0xFFE11D2A) : const Color(0xFF374151);
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
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
            if (showChevron)
              const Icon(Icons.chevron_right,
                  color: AppColors.inactive, size: 22),
          ],
        ),
      ),
    );
  }
}
