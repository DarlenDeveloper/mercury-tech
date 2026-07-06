import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../models/product.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';
import 'auth_flow.dart';

/// Apple Human Interface Guidelines — iOS Dynamic Type scale at the default
/// "Large" content size (SF Pro point sizes, leading and tracking). Applied to
/// the brand font to follow Apple's typographic hierarchy on this page.
/// Source: developer.apple.com/design/human-interface-guidelines/typography
class _AppleType {
  const _AppleType._();

  static const title2 = TextStyle(
    fontSize: 19,
    fontWeight: FontWeight.w700, // emphasized: Bold
    height: 28 / 22,
    letterSpacing: -0.26,
  );
  static const title3 = TextStyle(
    fontSize: 17,
    fontWeight: FontWeight.w600, // emphasized: Semibold
    height: 25 / 20,
    letterSpacing: -0.45,
  );
  static const headline = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w600, // Semibold
    height: 22 / 17,
    letterSpacing: -0.43,
  );
  static const body = TextStyle(
    fontSize: 15,
    fontWeight: FontWeight.w400,
    height: 22 / 17,
    letterSpacing: -0.43,
  );
  static const subhead = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    height: 20 / 15,
    letterSpacing: -0.23,
  );
  static const footnote = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 18 / 13,
    letterSpacing: -0.08,
  );
  static const caption1 = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w400,
    height: 16 / 12,
    letterSpacing: 0.0,
  );
  static const caption2 = TextStyle(
    fontSize: 10,
    fontWeight: FontWeight.w400,
    height: 13 / 11,
    letterSpacing: 0.06,
  );
}

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
        top: false,
        bottom: false,
        child: Column(
          children: [
            SizedBox(height: MediaQuery.of(context).padding.top + 6),
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
                    style: _AppleType.footnote.copyWith(
                      color: AppColors.inactive,
                    ),
                  ),
                  const SizedBox(height: 6),
                  _TitleRow(
                    product: product,
                    wishlisted: _wishlisted,
                    onWishlist: _toggleWishlist,
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
                    style: _AppleType.body.copyWith(
                      color: const Color(0xFF6B7280),
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
        onAddToCart: _addToCart,
      ),
    );
  }

  Future<void> _toggleWishlist() async {
    final ok = await requireAccount(
      context,
      reason: 'Sign in to save items to your wishlist.',
    );
    if (!ok) return;
    setState(() => _wishlisted = !_wishlisted);
  }

  Future<void> _addToCart() async {
    final ok = await requireAccount(
      context,
      reason: 'Sign in to add items to your cart and check out.',
    );
    if (!ok || !mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text('${product.name} (x$_qty) added to cart'),
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 1),
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
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
      child: Row(
        children: [
          _RoundButton(
            onTap: onBack,
            child: const Icon(Icons.arrow_back_ios_new,
                size: 16, color: _ProductDetailScreenState._ink),
          ),
          Expanded(
            child: Center(
              child: Text(
                'Details',
                style: _AppleType.headline.copyWith(
                  color: _ProductDetailScreenState._ink,
                ),
              ),
            ),
          ),
          _RoundButton(
            onTap: () {},
            child: const Icon(Icons.share_outlined,
                size: 18, color: _ProductDetailScreenState._ink),
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
      color: Colors.white.withValues(alpha: 0.55),
      shape: const CircleBorder(),
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: SizedBox(width: 38, height: 38, child: Center(child: child)),
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
      aspectRatio: 1.12,
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
                  child: Text(
                    'SALE',
                    style: _AppleType.caption2.copyWith(
                      color: Colors.white,
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
                style: _AppleType.title2.copyWith(
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
                  child: Text(
                    'New',
                    style: _AppleType.caption1.copyWith(
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF6B7280),
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
              width: 40,
              height: 40,
              child: Icon(
                wishlisted ? Icons.favorite : Icons.favorite_border,
                size: 20,
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
          Expanded(
            child: Text(
              'Quantity',
              style: _AppleType.headline.copyWith(
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
              style: _AppleType.headline.copyWith(
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
          width: 30,
          height: 30,
          child: Icon(
            icon,
            size: 16,
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
      style: _AppleType.title3.copyWith(
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
                      style: _AppleType.subhead.copyWith(
                        color: const Color(0xFF6B7280),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 5,
                    child: Text(
                      entries[i].value,
                      textAlign: TextAlign.right,
                      style: _AppleType.subhead.copyWith(
                        fontWeight: FontWeight.w600,
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
      child: Column(
        children: [
          const Icon(IconsaxPlusLinear.message_text, size: 30, color: AppColors.inactive),
          const SizedBox(height: 8),
          Text(
            'No reviews yet',
            style: _AppleType.subhead.copyWith(
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
                  Text(
                    'Total price',
                    style: _AppleType.footnote.copyWith(
                      color: AppColors.inactive,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: 'USh ',
                          style: _AppleType.subhead.copyWith(
                            fontWeight: FontWeight.w500,
                            color: _ProductDetailScreenState._ink,
                          ),
                        ),
                        TextSpan(
                          text: formatAmount(total),
                          style: _AppleType.title2.copyWith(
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
                  label: Text(
                    'Add to Cart',
                    style: _AppleType.headline.copyWith(color: Colors.white),
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
