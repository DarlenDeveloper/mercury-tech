import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/auth_scope.dart';
import '../data/currency_service.dart';
import '../data/user_repository.dart';
import '../theme/app_colors.dart';
import 'auth_flow.dart';
import 'edit_profile_screen.dart';
import 'favorites_screen.dart';
import 'order_history_screen.dart';

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
          _ProfileCard(user: AuthScope.of(context).user),
          const SizedBox(height: 24),

          // Manage section
          const _SectionLabel('Manage'),
          const SizedBox(height: 8),
          _SectionCard(
            rows: [
              _ProfileRow(
                icon: IconsaxPlusLinear.box,
                label: 'My Orders',
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const OrderHistoryScreen()),
                ),
              ),
              _ProfileRow(
                icon: IconsaxPlusLinear.heart,
                label: 'My Favorites',
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const FavoritesScreen()),
                ),
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
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const EditProfileScreen()),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Info section
          const _SectionLabel('Info'),
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
          const SizedBox(height: 16),

          // Currency
          _SectionCard(
            rows: [
              _ProfileRow(
                icon: IconsaxPlusLinear.dollar_circle,
                label: 'Currency',
                trailing: Text(
                  CurrencyScope.of(context).info.label.split(' — ').first,
                  style: const TextStyle(fontSize: 13, color: AppColors.inactive),
                ),
                onTap: () => _showCurrencyPicker(context),
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

  void _showCurrencyPicker(BuildContext context) {
    final scope = CurrencyScope.of(context);
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(width: 36, height: 4, decoration: BoxDecoration(color: const Color(0xFFD1D5DB), borderRadius: BorderRadius.circular(2))),
              ),
              const SizedBox(height: 16),
              const Text('Select currency', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              ...currencies.values.map((c) {
                final selected = scope.currency == c.code;
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(c.label, style: TextStyle(
                    fontSize: 14,
                    fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                    color: selected ? AppColors.primary : const Color(0xFF1F2937),
                  )),
                  trailing: selected ? const Icon(Icons.check_circle, color: AppColors.primary, size: 20) : null,
                  onTap: () {
                    scope.setCurrency(c.code);
                    Navigator.pop(context);
                  },
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  const _ProfileCard({required this.user});

  final User? user;

  @override
  Widget build(BuildContext context) {
    final registered = user != null && !user!.isAnonymous;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: registered
          ? _RegisteredContent(user: user!)
          : _GuestContent(),
    );
  }
}

class _RegisteredContent extends StatelessWidget {
  const _RegisteredContent({required this.user});
  final User user;

  @override
  Widget build(BuildContext context) {
    final repo = UserRepository();
    return StreamBuilder<UserProfile?>(
      stream: repo.watchProfile(user.uid),
      builder: (context, snapshot) {
        final profile = snapshot.data;
        final displayName = profile?.name.isNotEmpty == true
            ? profile!.name
            : (user.displayName?.trim().isNotEmpty == true
                ? user.displayName!
                : 'Mercury Customer');
        final subtitle = profile?.phone.isNotEmpty == true
            ? profile!.phone
            : (user.phoneNumber ?? user.email ?? 'Signed in');

        return Row(
          children: [
            // Avatar
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  displayName.isNotEmpty ? displayName[0].toUpperCase() : 'M',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),
            // Name + subtitle
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    displayName,
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
                      fontSize: 13,
                      color: AppColors.inactive,
                    ),
                  ),
                ],
              ),
            ),
            // Edit button
            GestureDetector(
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const EditProfileScreen()),
              ),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.accent,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(IconsaxPlusLinear.edit_2,
                        size: 14, color: Colors.white),
                    SizedBox(width: 6),
                    Text(
                      'Edit',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

class _GuestContent extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
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
        const Text(
          'Guest User',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: _ProfileScreenState._ink,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Sign in or create an account',
          style: TextStyle(fontSize: 13, color: AppColors.inactive),
        ),
        const SizedBox(height: 16),
        ElevatedButton.icon(
          onPressed: () => showAuthFlow(
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
          icon: const Icon(IconsaxPlusLinear.login, size: 16),
          label: const Text(
            'Get Started',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          ),
        ),
      ],
    );
  }
}


class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: AppColors.inactive,
        letterSpacing: 0.3,
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
    this.trailing,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool danger;
  final Widget? trailing;

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
            if (trailing != null) ...[trailing!, const SizedBox(width: 8)],
            if (!danger)
              const Icon(Icons.chevron_right,
                  color: AppColors.inactive, size: 20),
          ],
        ),
      ),
    );
  }
}
