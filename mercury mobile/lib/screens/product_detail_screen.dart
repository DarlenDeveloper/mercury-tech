import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../models/product.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';

class ProductDetailScreen extends StatefulWidget {
  const ProductDetailScreen({super.key, required this.product});

  final Product product;

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _qty = 1;
  bool _wishlisted = false;

  static const _bg = Color(0xFFF5F7FB);
  static const _ink = Color(0xFF1F2937);

  Product get product => widget.product;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      extendBody: true,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            _TopBar(
              onBack: () => Navigator.of(context).maybePop(),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 4, 20, 130),
                children: [
                  _ImageArea(product: product),
                  const SizedBox(height: 18),
                  Text(
                    product.category,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.inactive,
                    ),
                  ),
                  const SizedBox(height: 6),
                  _TitleRow(
                    product: product,
                    wishlisted: _wishlisted,
                    onWishlist: () =>
                        setState(() => _wishlisted = !_wishlisted),
                  ),
                  const SizedBox(height: 16),
                  _QuantityCard(
                    qty: _qty,
                    onChanged: (v) => setState(() => _qty = v),
                  ),
                  const SizedBox(height: 22),
                  const _SectionTitle('Description'),
                  const SizedBox(height: 8),
                  Text(
                    product.description,
                    style: const TextStyle(
                      fontSize: 13.5,
                      height: 1.5,
                      color: Color(0xFF6B7280),
                    ),
                  ),
                  if (product.specifications.isNotEmpty) ...[
                    const SizedBox(height: 22),
                    _SpecificationsCard(specs: product.specifications),
                  ],
                  const SizedBox(height: 22),
                  const _SectionTitle('Reviews'),
                  const SizedBox(height: 10),
                  const _ReviewsPlaceholder(),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _BottomBar(
        total: product.price * _qty,
        onAddToCart: () {
          ScaffoldMessenger.of(context)
            ..hideCurrentSnackBar()
            ..showSnackBar(
              SnackBar(
                content: Text('${product.name} (x$_qty) added to cart'),
                behavior: SnackBarBehavior.floating,
                duration: const Duration(seconds: 1),
              ),
            );
        },
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.onBack});

  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
      child: Row(
        children: [
          _RoundButton(
            onTap: onBack,
            child: const Icon(Icons.arrow_back_ios_new,
                size: 18, color: _ProductDetailScreenState._ink),
          ),
          const Expanded(
            child: Center(
              child: Text(
                'Details',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: _ProductDetailScreenState._ink,
                ),
              ),
            ),
          ),
          _RoundButton(
            onTap: () {},
            child: const Icon(Icons.share_outlined,
                size: 20, color: _ProductDetailScreenState._ink),
          ),
        ],
      ),
    );
  }
}

class _RoundButton extends StatelessWidget {
  const _RoundButton({required this.child, required this.onTap});

  final Widget child;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      shape: const CircleBorder(),
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: SizedBox(width: 44, height: 44, child: Center(child: child)),
      ),
    );
  }
}

class _ImageArea extends StatelessWidget {
  const _ImageArea({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 0.92,
      child: Container(
        decoration: BoxDecoration(
          color: product.accent,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Stack(
          children: [
            if (product.image != null)
              Positioned.fill(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Image.asset(product.image!, fit: BoxFit.cover),
                ),
              )
            else
              Center(
                child: Icon(
                  product.icon,
                  size: 140,
                  color: AppColors.primary.withValues(alpha: 0.85),
                ),
              ),
            if (product.isOnSale)
              Positioned(
                top: 14,
                left: 14,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text(
                    'SALE',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _TitleRow extends StatelessWidget {
  const _TitleRow({
    required this.product,
    required this.wishlisted,
    required this.onWishlist,
  });

  final Product product;
  final bool wishlisted;
  final VoidCallback onWishlist;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Wrap(
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 10,
            runSpacing: 4,
            children: [
              Text(
                product.name,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: _ProductDetailScreenState._ink,
                ),
              ),
              if (product.isNew)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEDF1F7),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'New',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF6B7280),
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        Material(
          color: AppColors.surface,
          shape: const CircleBorder(),
          child: InkWell(
            onTap: onWishlist,
            customBorder: const CircleBorder(),
            child: SizedBox(
              width: 46,
              height: 46,
              child: Icon(
                wishlisted ? Icons.favorite : Icons.favorite_border,
                size: 22,
                color: wishlisted ? AppColors.primary : _ProductDetailScreenState._ink,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _QuantityCard extends StatelessWidget {
  const _QuantityCard({required this.qty, required this.onChanged});

  final int qty;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          const Expanded(
            child: Text(
              'Quantity',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: _ProductDetailScreenState._ink,
              ),
            ),
          ),
          _StepperButton(
            icon: Icons.remove,
            onTap: qty > 1 ? () => onChanged(qty - 1) : null,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              '$qty',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: _ProductDetailScreenState._ink,
              ),
            ),
          ),
          _StepperButton(
            icon: Icons.add,
            onTap: () => onChanged(qty + 1),
          ),
        ],
      ),
    );
  }
}

class _StepperButton extends StatelessWidget {
  const _StepperButton({required this.icon, this.onTap});

  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final enabled = onTap != null;
    return Material(
      color: const Color(0xFFEDF1F7),
      shape: const CircleBorder(),
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: 34,
          height: 34,
          child: Icon(
            icon,
            size: 18,
            color: enabled
                ? _ProductDetailScreenState._ink
                : AppColors.inactive.withValues(alpha: 0.5),
          ),
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: _ProductDetailScreenState._ink,
      ),
    );
  }
}

class _SpecificationsCard extends StatelessWidget {
  const _SpecificationsCard({required this.specs});

  final Map<String, String> specs;

  @override
  Widget build(BuildContext context) {
    final entries = specs.entries.toList();
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 14),
            child: Align(
              alignment: Alignment.centerLeft,
              child: _SectionTitle('Specifications'),
            ),
          ),
          for (var i = 0; i < entries.length; i++) ...[
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 4,
                    child: Text(
                      entries[i].key,
                      style: const TextStyle(
                        fontSize: 13.5,
                        color: Color(0xFF6B7280),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 5,
                    child: Text(
                      entries[i].value,
                      textAlign: TextAlign.right,
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: _ProductDetailScreenState._ink,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            if (i != entries.length - 1)
              const Divider(height: 1, color: Color(0xFFEDF1F7)),
          ],
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _ReviewsPlaceholder extends StatelessWidget {
  const _ReviewsPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
      ),
      child: const Column(
        children: [
          Icon(IconsaxPlusLinear.message_text, size: 30, color: AppColors.inactive),
          SizedBox(height: 8),
          Text(
            'No reviews yet',
            style: TextStyle(
              fontSize: 13,
              color: AppColors.inactive,
            ),
          ),
        ],
      ),
    );
  }
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({required this.total, required this.onAddToCart});

  final int total;
  final VoidCallback onAddToCart;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.all(Radius.circular(32)),
          boxShadow: [
            BoxShadow(
              color: AppColors.shadow,
              blurRadius: 24,
              offset: Offset(0, 8),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 14, 16, 14),
          child: Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Total price',
                    style: TextStyle(fontSize: 13, color: AppColors.inactive),
                  ),
                  const SizedBox(height: 2),
                  Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: 'USh ',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: _ProductDetailScreenState._ink,
                          ),
                        ),
                        TextSpan(
                          text: formatAmount(total),
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: _ProductDetailScreenState._ink,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: onAddToCart,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                  ),
                  icon: const Icon(IconsaxPlusBold.bag_2, size: 20),
                  label: const Text(
                    'Add to Cart',
                    style:
                        TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
