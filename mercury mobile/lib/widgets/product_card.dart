import 'package:flutter/material.dart';

import '../models/product.dart';
import '../screens/auth_flow.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';

/// Universal product card: a grey image tile with a wishlist heart,
/// followed by the product name, description, and price.
class ProductCard extends StatelessWidget {
  const ProductCard({
    super.key,
    required this.product,
    this.onTap,
  });

  final Product product;
  final VoidCallback? onTap;

  static const _ink = Color(0xFF1F2937);
  static const _tile = Color(0xFFF0F1F4);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image tile.
          AspectRatio(
            aspectRatio: 1,
            child: Stack(
              children: [
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      color: _tile,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: const Color(0xFFE3E5EA),
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.08),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: product.image != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(17),
                            child: Image.asset(
                              product.image!,
                              fit: BoxFit.cover,
                              width: double.infinity,
                              height: double.infinity,
                            ),
                          )
                        : Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.image_outlined,
                                  size: 28,
                                  color: AppColors.inactive.withValues(alpha: 0.4),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'No image',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: AppColors.inactive.withValues(alpha: 0.5),
                                  ),
                                ),
                              ],
                            ),
                          ),
                  ),
                ),
                if (product.isOnSale)
                  Positioned(
                    top: 10,
                    left: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'SALE',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 8,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ),
                  ),
                const Positioned(
                  right: 8,
                  bottom: 8,
                  child: _WishlistButton(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 7),
          Text(
            product.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: _ink,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            product.description,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 9.5,
              height: 1.25,
              color: AppColors.inactive,
            ),
          ),
          const SizedBox(height: 5),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                formatUgx(product.price),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: _ink,
                ),
              ),
              if (product.isOnSale) ...[
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    formatUgx(product.oldPrice!),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 8.5,
                      color: Color(0xFFE11D2A),
                      decoration: TextDecoration.lineThrough,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _WishlistButton extends StatefulWidget {
  const _WishlistButton();

  @override
  State<_WishlistButton> createState() => _WishlistButtonState();
}

class _WishlistButtonState extends State<_WishlistButton> {
  bool _on = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        final ok = await requireAccount(
          context,
          reason: 'Sign in to save items to your wishlist.',
        );
        if (!ok) return;
        setState(() => _on = !_on);
      },
      child: Container(
        width: 29,
        height: 29,
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.9),
          shape: BoxShape.circle,
        ),
        child: Icon(
          _on ? Icons.favorite : Icons.favorite_border,
          size: 15,
          color: _on ? AppColors.primary : const Color(0xFF6B7280),
        ),
      ),
    );
  }
}
