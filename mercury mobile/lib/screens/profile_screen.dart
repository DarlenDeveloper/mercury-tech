import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/auth_scope.dart';
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

          // First group
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
  const _ProfileCard({required this.user});

  final User? user;

  @override
  Widget build(BuildContext context) {
    final registered = user != null && !user!.isAnonymous;

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
              child: Center(
                child: Text(
                  displayName.isNotEmpty ? displayName[0].toUpperCase() : 'M',
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              displayName,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: _ProfileScreenState._ink,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.inactive,
              ),
            ),
            if (profile?.location.isNotEmpty == true) ...[
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(IconsaxPlusLinear.location,
                      size: 13, color: AppColors.inactive),
                  const SizedBox(width: 4),
                  Text(
                    profile!.location,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.inactive,
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const EditProfileScreen()),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accent,
                foregroundColor: Colors.white,
                elevation: 0,
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
              icon: const Icon(IconsaxPlusLinear.edit_2, size: 16),
              label: const Text(
                'Edit Profile',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
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
