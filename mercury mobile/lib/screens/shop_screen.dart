import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/categories.dart';
import '../models/category.dart';
import '../theme/app_colors.dart';
import 'category_screen.dart';

class ShopScreen extends StatelessWidget {
  const ShopScreen({super.key});

  static const _ink = Color(0xFF1F2937);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 130),
        children: [
          const _SearchField(),
          const SizedBox(height: 22),
          const Text(
            'Browse categories',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: _ink,
            ),
          ),
          const SizedBox(height: 16),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 14,
            crossAxisSpacing: 14,
            childAspectRatio: 1.12,
            children: [
              for (final category in kShopCategories)
                _CategoryCard(
                  category: category,
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => CategoryScreen(category: category),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          const _MoreButton(),
        ],
      ),
    );
  }
}

class _SearchField extends StatelessWidget {
  const _SearchField();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFFEDF1F7),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Row(
        children: const [
          Icon(IconsaxPlusLinear.search_normal,
              size: 20, color: AppColors.inactive),
          SizedBox(width: 12),
          Text(
            'Search',
            style: TextStyle(fontSize: 14, color: AppColors.inactive),
          ),
        ],
      ),
    );
  }
}

class _CategoryCard extends StatelessWidget {
  const _CategoryCard({required this.category, required this.onTap});

  final Category category;
  final VoidCallback onTap;

  Color get _darker => Color.lerp(category.color, Colors.black, 0.32)!;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          child: Ink(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [category.color, _darker],
              ),
            ),
            child: Stack(
              children: [
                // Transparent product image, enlarged and bottom-anchored.
                Positioned.fill(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(4, 30, 4, 0),
                    child: Align(
                      alignment: Alignment.bottomCenter,
                      child: Transform.rotate(
                        angle: category.imageRotationDeg * math.pi / 180,
                        child: Transform.scale(
                          scaleX: category.imageScaleX ?? category.imageScale,
                          scaleY: category.imageScale,
                          child: Image.asset(
                            category.image,
                            fit: BoxFit.contain,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                // Category name (up to two lines so long names don't clip).
                Positioned(
                  top: 14,
                  left: 14,
                  right: 40,
                  child: Text(
                    category.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14.5,
                      height: 1.15,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
                // Explore affordance.
                const Positioned(
                  top: 14,
                  right: 12,
                  child: Icon(
                    IconsaxPlusLinear.arrow_right_3,
                    size: 18,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _MoreButton extends StatelessWidget {
  const _MoreButton();

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(30),
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(30),
        child: Container(
          height: 52,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: const Color(0xFFE5E7EB)),
          ),
          child: const Text(
            'More',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: ShopScreen._ink,
            ),
          ),
        ),
      ),
    );
  }
}
