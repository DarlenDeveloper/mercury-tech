import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/auth_scope.dart';
import '../data/order_repository.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';

class OrderHistoryScreen extends StatelessWidget {
  const OrderHistoryScreen({super.key});

  static const _ink = Color(0xFF1F2937);

  @override
  Widget build(BuildContext context) {
    final uid = AuthScope.of(context).user?.uid;
    if (uid == null) {
      return const Scaffold(
        body: Center(child: Text('Sign in to view orders')),
      );
    }

    final orderRepo = OrderRepository(uid: uid);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 20, 4),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).maybePop(),
                    icon: const Icon(Icons.arrow_back_ios_new, size: 20),
                    color: _ink,
                  ),
                  const Expanded(
                    child: Text(
                      'My Orders',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: _ink,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Orders list
            Expanded(
              child: StreamBuilder<List<Map<String, dynamic>>>(
                stream: orderRepo.watchOrders(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  final orders = snapshot.data ?? [];

                  if (orders.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(IconsaxPlusLinear.box,
                              size: 48, color: AppColors.inactive.withValues(alpha: 0.4)),
                          const SizedBox(height: 12),
                          const Text(
                            'No orders yet',
                            style: TextStyle(
                              fontSize: 16,
                              color: AppColors.inactive,
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: orders.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, i) => _OrderCard(order: orders[i]),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order});

  final Map<String, dynamic> order;

  static const _ink = Color(0xFF1F2937);

  @override
  Widget build(BuildContext context) {
    final items = (order['items'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final totalUsd = (order['totalUsd'] as num?)?.toDouble() ?? 0;
    final status = order['status'] as String? ?? 'pending';
    final payment = order['paymentMethod'] as String? ?? '';
    final createdAt = order['createdAt'];
    String dateStr = '';
    if (createdAt is Timestamp) {
      final d = createdAt.toDate();
      dateStr = '${d.day}/${d.month}/${d.year}';
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  '${items.length} item${items.length == 1 ? '' : 's'}',
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: _ink,
                  ),
                ),
              ),
              _StatusBadge(status: status),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'USh ${formatAmount((totalUsd * 3780).round())}',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: _ink,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Text(
                payment,
                style: const TextStyle(fontSize: 12, color: AppColors.inactive),
              ),
              if (dateStr.isNotEmpty) ...[
                const Text(' · ', style: TextStyle(color: AppColors.inactive)),
                Text(
                  dateStr,
                  style: const TextStyle(fontSize: 12, color: AppColors.inactive),
                ),
              ],
            ],
          ),
          if (items.isNotEmpty) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: items
                  .take(3)
                  .map((item) => Chip(
                        label: Text(
                          item['name'] as String? ?? '',
                          style: const TextStyle(fontSize: 11),
                        ),
                        visualDensity: VisualDensity.compact,
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ))
                  .toList(),
            ),
          ],
        ],
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    switch (status) {
      case 'completed':
        bg = const Color(0xFFD1FAE5);
        fg = const Color(0xFF065F46);
        break;
      case 'processing':
        bg = const Color(0xFFFEF3C7);
        fg = const Color(0xFF92400E);
        break;
      default:
        bg = const Color(0xFFE5E7EB);
        fg = const Color(0xFF374151);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        status[0].toUpperCase() + status.substring(1),
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: fg),
      ),
    );
  }
}
