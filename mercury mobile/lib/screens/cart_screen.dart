import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/auth_scope.dart';
import '../data/cart_repository.dart';
import '../data/order_repository.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  static const _ink = Color(0xFF1F2937);
  static const _dark = Color(0xFF1A2E3B);

  CartRepository? _cartRepo;
  double _rate = 3780;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final uid = AuthScope.of(context).user?.uid;
    if (uid != null && (_cartRepo == null || _cartRepo!.uid != uid)) {
      _cartRepo = CartRepository(uid: uid);
    }
  }

  int _toUgx(double usd) => (usd * _rate).round();

  void _clearAll() {
    _cartRepo?.clearCart();
  }

  void _checkout(List<CartItem> items) {
    final total = items.fold<double>(0, (s, e) => s + e.priceUsd * e.qty);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => _OrderConfirmationSheet(
        totalUgx: _toUgx(total),
        onPlaceOrder: (paymentMethod) async {
          final uid = AuthScope.of(context).user?.uid;
          if (uid == null) return;
          final orderRepo = OrderRepository(uid: uid);
          await orderRepo.placeOrder(
            items: items,
            totalUsd: total,
            paymentMethod: paymentMethod,
          );
          await _cartRepo?.clearCart();
          if (mounted) Navigator.of(context).pop();
          if (mounted) {
            ScaffoldMessenger.of(context)
              ..hideCurrentSnackBar()
              ..showSnackBar(
                const SnackBar(
                  content: Text('Order placed successfully!'),
                  behavior: SnackBarBehavior.floating,
                ),
              );
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_cartRepo == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return StreamBuilder<List<CartItem>>(
      stream: _cartRepo!.watchCart(),
      builder: (context, snapshot) {
        final items = snapshot.data ?? [];
        final totalUgx = items.fold<int>(
            0, (s, e) => s + _toUgx(e.priceUsd * e.qty));

        return SafeArea(
          top: false,
          bottom: false,
          child: ListView(
            padding: EdgeInsets.fromLTRB(
              16,
              MediaQuery.of(context).padding.top + 12,
              16,
              130,
            ),
            children: [
              // Header
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      'My Order',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: _ink,
                      ),
                    ),
                  ),
                  if (items.isNotEmpty)
                    GestureDetector(
                      onTap: _clearAll,
                      child: const Icon(IconsaxPlusLinear.trash,
                          size: 22, color: _ink),
                    ),
                ],
              ),
              const SizedBox(height: 18),
              // Cart items
              if (items.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 40),
                  child: Center(
                    child: Text(
                      'Your cart is empty',
                      style: TextStyle(color: AppColors.inactive),
                    ),
                  ),
                ),
              for (final item in items) ...[
                _CartItemCard(
                  item: item,
                  rate: _rate,
                  onAdd: () => _cartRepo!.setQty(item.productId, item.qty + 1),
                  onRemove: () => _cartRepo!.setQty(item.productId, item.qty - 1),
                  onDelete: () => _cartRepo!.removeItem(item.productId),
                ),
                const SizedBox(height: 12),
              ],
              if (items.isNotEmpty) ...[
                const SizedBox(height: 8),
                CustomPaint(
                  painter: _DashedLinePainter(),
                  size: const Size(double.infinity, 1),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text(
                      'Delivery services:',
                      style: TextStyle(fontSize: 14, color: AppColors.inactive),
                    ),
                    Text(
                      'Free',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: _ink,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Total price',
                          style: TextStyle(fontSize: 12, color: AppColors.inactive),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          formatUgx(totalUgx),
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: _ink,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Material(
                        color: _dark,
                        borderRadius: BorderRadius.circular(30),
                        child: InkWell(
                          onTap: () => _checkout(items),
                          borderRadius: BorderRadius.circular(30),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(IconsaxPlusBold.bag_2,
                                    size: 18, color: Colors.white),
                                SizedBox(width: 8),
                                Text(
                                  'Checkout',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// Cart item card
// ─────────────────────────────────────────────────────────────────────────────

class _CartItemCard extends StatelessWidget {
  const _CartItemCard({
    required this.item,
    required this.rate,
    required this.onAdd,
    required this.onRemove,
    required this.onDelete,
  });

  final CartItem item;
  final double rate;
  final VoidCallback onAdd;
  final VoidCallback onRemove;
  final VoidCallback onDelete;

  static const _ink = Color(0xFF1F2937);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product image
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            clipBehavior: Clip.antiAlias,
            child: item.image != null
                ? Image.network(item.image!, fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const Icon(
                        IconsaxPlusBold.box, size: 34, color: AppColors.inactive))
                : const Icon(IconsaxPlusBold.box,
                    size: 34, color: AppColors.inactive),
          ),
          const SizedBox(width: 14),
          // Name + category + price + stepper
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        item.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: _ink,
                        ),
                      ),
                    ),
                    GestureDetector(
                      onTap: onDelete,
                      child: const Icon(Icons.close, size: 18, color: AppColors.inactive),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  item.category,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.inactive,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Text(
                      formatUgx((item.priceUsd * rate).round()),
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: _ink,
                      ),
                    ),
                    const Spacer(),
                    _CircleStepper(qty: item.qty, onAdd: onAdd, onRemove: onRemove),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CircleStepper extends StatelessWidget {
  const _CircleStepper({
    required this.qty,
    required this.onAdd,
    required this.onRemove,
  });

  final int qty;
  final VoidCallback onAdd;
  final VoidCallback onRemove;

  static const _ink = Color(0xFF1F2937);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Minus (outline circle)
        GestureDetector(
          onTap: onRemove,
          child: Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFD1D5DB), width: 1.5),
            ),
            child: const Icon(Icons.remove, size: 16, color: AppColors.inactive),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          child: Text(
            qty.toString().padLeft(2, '0'),
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: _ink,
            ),
          ),
        ),
        // Plus (filled black circle)
        GestureDetector(
          onTap: onAdd,
          child: Container(
            width: 30,
            height: 30,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Color(0xFF1F2937),
            ),
            child: const Icon(Icons.add, size: 16, color: Colors.white),
          ),
        ),
      ],
    );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// Dashed line painter
// ─────────────────────────────────────────────────────────────────────────────

class _DashedLinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFD1D5DB)
      ..strokeWidth = 1;
    const dashWidth = 6.0;
    const gap = 4.0;
    var x = 0.0;
    while (x < size.width) {
      canvas.drawLine(Offset(x, 0), Offset(x + dashWidth, 0), paint);
      x += dashWidth + gap;
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Order confirmation bottom sheet (MTN & Airtel)
// ─────────────────────────────────────────────────────────────────────────────

class _OrderConfirmationSheet extends StatefulWidget {
  const _OrderConfirmationSheet({required this.totalUgx, required this.onPlaceOrder});

  final int totalUgx;
  final Future<void> Function(String paymentMethod) onPlaceOrder;

  @override
  State<_OrderConfirmationSheet> createState() =>
      _OrderConfirmationSheetState();
}

class _OrderConfirmationSheetState extends State<_OrderConfirmationSheet> {
  int _selectedPayment = 0; // 0 = MTN, 1 = Airtel

  static const _ink = Color(0xFF1F2937);
  static const _dark = Color(0xFF1A2E3B);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
          20, 12, 20, MediaQuery.of(context).padding.bottom + 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: const Color(0xFFD1D5DB),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Order confirmation',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: _ink,
            ),
          ),
          const SizedBox(height: 20),
          // MTN Mobile Money
          _PaymentOption(
            selected: _selectedPayment == 0,
            onTap: () => setState(() => _selectedPayment = 0),
            label: 'MTN Mobile Money',
            subtitle: 'Pay with MTN MoMo',
            logo: 'assets/images/mtn-logo.jpeg',
          ),
          const SizedBox(height: 10),
          // Airtel Money
          _PaymentOption(
            selected: _selectedPayment == 1,
            onTap: () => setState(() => _selectedPayment = 1),
            label: 'Airtel Money',
            subtitle: 'Pay with Airtel Money',
            logo: 'assets/images/airtel-logo.jpeg',
          ),
          const SizedBox(height: 24),
          // Divider
          const Divider(height: 1, color: Color(0xFFE5E7EB)),
          const SizedBox(height: 20),
          // Delivery address
          const Text(
            'Delivery address',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: _ink,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFFF0F1F4),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(IconsaxPlusLinear.location,
                    size: 20, color: _ink),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Kampala, Uganda',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: _ink,
                      ),
                    ),
                    Text(
                      'Enter delivery address',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.inactive,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(IconsaxPlusLinear.edit_2,
                  size: 18, color: AppColors.inactive),
            ],
          ),
          const SizedBox(height: 20),
          // Estimated delivery
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text(
                'Estimated delivery time:',
                style: TextStyle(
                  fontSize: 13,
                  fontStyle: FontStyle.italic,
                  color: AppColors.inactive,
                ),
              ),
              Text(
                '1-3 days',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: _ink,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          // Bottom: total + place order
          Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Total price',
                    style: TextStyle(fontSize: 12, color: AppColors.inactive),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    formatUgx(widget.totalUgx),
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: _ink,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              Material(
                color: _dark,
                borderRadius: BorderRadius.circular(30),
                elevation: 4,
                shadowColor: _dark.withValues(alpha: 0.3),
                child: InkWell(
                  onTap: () {
                    final method = _selectedPayment == 0
                        ? 'MTN Mobile Money'
                        : 'Airtel Money';
                    widget.onPlaceOrder(method);
                  },
                  borderRadius: BorderRadius.circular(30),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                        vertical: 14, horizontal: 24),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(IconsaxPlusBold.shield_tick,
                            size: 16, color: Colors.white),
                        SizedBox(width: 8),
                        Text(
                          'Place Order',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PaymentOption extends StatelessWidget {
  const _PaymentOption({
    required this.selected,
    required this.onTap,
    required this.label,
    required this.subtitle,
    required this.logo,
  });

  final bool selected;
  final VoidCallback onTap;
  final String label;
  final String subtitle;
  final String logo;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFF1A2E3B) : const Color(0xFFF7F7F8),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
              ),
              clipBehavior: Clip.antiAlias,
              child: Image.asset(logo, fit: BoxFit.cover),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: selected ? Colors.white : const Color(0xFF1F2937),
                    ),
                  ),
                  const SizedBox(height: 1),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 11.5,
                      color: selected
                          ? Colors.white.withValues(alpha: 0.6)
                          : AppColors.inactive,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              selected ? Icons.radio_button_checked : Icons.radio_button_off,
              size: 20,
              color: selected ? Colors.white : AppColors.inactive,
            ),
          ],
        ),
      ),
    );
  }
}
