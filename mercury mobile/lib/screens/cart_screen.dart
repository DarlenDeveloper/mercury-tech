import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/sample_products.dart';
import '../models/product.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';

class _CartItem {
  _CartItem(this.product, this.qty);
  final Product product;
  int qty;
}

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  static const _ink = Color(0xFF1F2937);

  late final List<_CartItem> _items = [
    _CartItem(kSampleProducts[0], 1),
    _CartItem(kSampleProducts[2], 2),
    _CartItem(kSampleProducts[3], 1),
  ];

  int get _itemTotal =>
      _items.fold(0, (sum, e) => sum + e.product.price * e.qty);

  // Sample applied promo: 5% off.
  int get _discount => (_itemTotal * 0.05).round();
  int get _subtotal => _itemTotal - _discount;

  void _changeQty(_CartItem item, int delta) {
    setState(() {
      final next = item.qty + delta;
      if (next <= 0) {
        _items.remove(item);
      } else {
        item.qty = next;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 130),
        children: [
          // Header: title + delivery location.
          Row(
            children: [
              const Text(
                'My Cart',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: _ink,
                ),
              ),
              const Spacer(),
              const Icon(IconsaxPlusLinear.location,
                  size: 18, color: AppColors.primary),
              const SizedBox(width: 4),
              const Text(
                'Kampala, UG',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: _ink,
                ),
              ),
              const Icon(Icons.keyboard_arrow_down,
                  size: 18, color: AppColors.inactive),
            ],
          ),
          const SizedBox(height: 18),
          for (final item in _items) ...[
            _CartItemCard(
              item: item,
              onAdd: () => _changeQty(item, 1),
              onRemove: () => _changeQty(item, -1),
            ),
            const SizedBox(height: 12),
          ],
          if (_items.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 40),
              child: Center(
                child: Text(
                  'Your cart is empty',
                  style: TextStyle(color: AppColors.inactive),
                ),
              ),
            ),
          if (_items.isNotEmpty) ...[
            const SizedBox(height: 4),
            _PromoRow(discount: _discount),
            const SizedBox(height: 16),
            _SummaryRow(label: 'Item Total', value: formatUgx(_itemTotal)),
            const SizedBox(height: 10),
            const _SummaryRow(label: 'Delivery Charge', value: 'Free'),
            const SizedBox(height: 10),
            _SummaryRow(
              label: 'Subtotal',
              value: formatUgx(_subtotal),
              emphasize: true,
            ),
            const SizedBox(height: 24),
            _CheckoutButton(onTap: () {}),
            const SizedBox(height: 14),
            Center(
              child: GestureDetector(
                onTap: () {},
                child: const Text(
                  'Continue shopping',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.inactive,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _CartItemCard extends StatelessWidget {
  const _CartItemCard({
    required this.item,
    required this.onAdd,
    required this.onRemove,
  });

  final _CartItem item;
  final VoidCallback onAdd;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final product = item.product;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: const Color(0xFFF0F1F4),
              borderRadius: BorderRadius.circular(14),
            ),
            clipBehavior: Clip.antiAlias,
            child: product.image != null
                ? Image.asset(product.image!, fit: BoxFit.cover)
                : Icon(product.icon,
                    size: 30, color: AppColors.primary.withValues(alpha: 0.85)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: _CartScreenState._ink,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  product.description,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: AppColors.inactive,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  formatUgx(product.price),
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                    color: _CartScreenState._ink,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          _QtyStepper(qty: item.qty, onAdd: onAdd, onRemove: onRemove),
        ],
      ),
    );
  }
}

class _QtyStepper extends StatelessWidget {
  const _QtyStepper({
    required this.qty,
    required this.onAdd,
    required this.onRemove,
  });

  final int qty;
  final VoidCallback onAdd;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _StepButton(
          icon: qty > 1 ? Icons.remove : IconsaxPlusLinear.trash,
          onTap: onRemove,
        ),
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Text(
            '$qty',
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: _CartScreenState._ink,
            ),
          ),
        ),
        _StepButton(icon: Icons.add, onTap: onAdd),
      ],
    );
  }
}

class _StepButton extends StatelessWidget {
  const _StepButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFFF0F1F4),
      shape: const CircleBorder(),
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: 30,
          height: 30,
          child: Icon(icon, size: 16, color: AppColors.primary),
        ),
      ),
    );
  }
}

class _PromoRow extends StatelessWidget {
  const _PromoRow({required this.discount});

  final int discount;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.verified, size: 20, color: AppColors.primary),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text(
                'MERCURY5',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: _CartScreenState._ink,
                ),
              ),
              SizedBox(height: 2),
              Text(
                'Promo applied successfully!',
                style: TextStyle(fontSize: 12, color: AppColors.inactive),
              ),
            ],
          ),
        ),
        Text(
          '-${formatUgx(discount)}',
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: Color(0xFF15803D),
          ),
        ),
      ],
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    this.emphasize = false,
  });

  final String label;
  final String value;
  final bool emphasize;

  @override
  Widget build(BuildContext context) {
    final weight = emphasize ? FontWeight.w800 : FontWeight.w600;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: emphasize ? FontWeight.w700 : FontWeight.w500,
            color: emphasize ? _CartScreenState._ink : AppColors.inactive,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: emphasize ? 16 : 14,
            fontWeight: weight,
            color: _CartScreenState._ink,
          ),
        ),
      ],
    );
  }
}

class _CheckoutButton extends StatelessWidget {
  const _CheckoutButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.primary,
      borderRadius: BorderRadius.circular(30),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(30),
        child: const SizedBox(
          height: 56,
          child: Center(
            child: Text(
              'Complete Order',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
