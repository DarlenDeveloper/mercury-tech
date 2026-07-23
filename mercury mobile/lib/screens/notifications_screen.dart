import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/auth_scope.dart';
import '../data/notification_repository.dart';
import '../theme/app_colors.dart';

/// In-app notification centre: personal order/quotation/repair updates plus
/// broadcast announcements.
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final NotificationRepository _repo = NotificationRepository();

  @override
  Widget build(BuildContext context) {
    final uid = AuthScope.of(context).user?.uid;

    return Scaffold(
      backgroundColor: const Color(0xFFF6F7F9),
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.inactive,
        elevation: 0,
        actions: [
          if (uid != null)
            TextButton(
              onPressed: () => _repo.markAllRead(uid),
              child: const Text('Mark all read'),
            ),
        ],
      ),
      body: uid == null
          ? const _EmptyState(message: 'Sign in to see your notifications.')
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _SectionTitle('Updates'),
                StreamBuilder<List<AppNotification>>(
                  stream: _repo.streamPersonal(uid),
                  builder: (context, snap) {
                    final items = snap.data ?? [];
                    if (snap.connectionState == ConnectionState.waiting) {
                      return const _Loading();
                    }
                    if (items.isEmpty) {
                      return const _EmptyState(
                        message: 'No updates yet. Your order, quote and repair '
                            'updates will appear here.',
                      );
                    }
                    return Column(
                      children: items
                          .map((n) => _NotificationTile(
                                notification: n,
                                onTap: n.read
                                    ? null
                                    : () => _repo.markRead(uid, n.id),
                              ))
                          .toList(),
                    );
                  },
                ),
                const SizedBox(height: 20),
                _SectionTitle('Announcements'),
                StreamBuilder<List<AppNotification>>(
                  stream: _repo.streamCampaigns(),
                  builder: (context, snap) {
                    final items = snap.data ?? [];
                    if (snap.connectionState == ConnectionState.waiting) {
                      return const _Loading();
                    }
                    if (items.isEmpty) {
                      return const _EmptyState(
                        message: 'No announcements right now.',
                      );
                    }
                    return Column(
                      children: items
                          .map((n) => _NotificationTile(notification: n))
                          .toList(),
                    );
                  },
                ),
              ],
            ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10, top: 4),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 15,
          fontWeight: FontWeight.w700,
          color: AppColors.inactive,
        ),
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({required this.notification, this.onTap});

  final AppNotification notification;
  final VoidCallback? onTap;

  IconData get _icon {
    switch (notification.type) {
      case 'order':
        return IconsaxPlusLinear.box;
      case 'quotation':
        return IconsaxPlusLinear.receipt_text;
      case 'repair':
        return IconsaxPlusLinear.setting_4;
      case 'promo':
        return IconsaxPlusLinear.discount_shape;
      default:
        return IconsaxPlusLinear.notification;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: notification.read ? AppColors.surface : const Color(0xFFEAF1FC),
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(color: AppColors.shadow, blurRadius: 10, offset: Offset(0, 2)),
        ],
      ),
      child: ListTile(
        onTap: onTap,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        leading: CircleAvatar(
          backgroundColor: AppColors.primary.withValues(alpha: 0.10),
          child: Icon(_icon, color: AppColors.primary, size: 20),
        ),
        title: Text(
          notification.title,
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 2),
          child: Text(
            notification.body,
            style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B)),
          ),
        ),
        trailing: notification.read
            ? null
            : Container(
                width: 9,
                height: 9,
                decoration: const BoxDecoration(
                  color: AppColors.accent,
                  shape: BoxShape.circle,
                ),
              ),
      ),
    );
  }
}

class _Loading extends StatelessWidget {
  const _Loading();
  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 24),
      child: Center(child: CircularProgressIndicator()),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        message,
        textAlign: TextAlign.center,
        style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
      ),
    );
  }
}
