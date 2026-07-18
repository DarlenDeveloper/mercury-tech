import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/category_scope.dart';
import '../models/category.dart';
import '../theme/app_colors.dart';
import '../widgets/ai_search_button.dart';
import 'category_screen.dart';
import 'search_screen.dart';

class ShopScreen extends StatelessWidget {
  const ShopScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    return ListView(
      padding: EdgeInsets.fromLTRB(0, topPadding + 8, 0, 120),
      children: [
        // Search bar
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
          child: Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const SearchScreen()),
                  ),
                  child: Container(
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
                          'What are you looking for?',
                          style: TextStyle(fontSize: 14, color: AppColors.inactive),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 4),
              const AiSearchButton(size: 50),
            ],
          ),
        ),
        const SizedBox(height: 8),
        // Category cards — Phones & Accessories first
        for (final category in [
          ...CategoryScope.of(context).where((c) =>
              c.name == 'Phones, TV & Audio' || c.name == 'Accessories'),
          ...CategoryScope.of(context).where((c) =>
              c.name != 'Phones, TV & Audio' && c.name != 'Accessories'),
        ])
          _ShopCategoryCard(
            category: category,
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => CategoryScreen(category: category),
              ),
            ),
          ),
      ],
    );
  }
}

class _ShopCategoryCard extends StatelessWidget {
  const _ShopCategoryCard({required this.category, required this.onTap});

  final Category category;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 6, 12, 6),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: GestureDetector(
          onTap: onTap,
          child: SizedBox(
            height: 170,
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (category.photo != null)
                  Image.asset(category.photo!, fit: BoxFit.cover)
                else
                  Container(color: category.color),
                // Subtle scrim for text legibility
                Container(
                  color: Colors.black.withValues(alpha: 0.15),
                ),
                // Centered label
                Center(
                  child: Text(
                    category.name,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      shadows: [
                        Shadow(
                          color: Color(0x66000000),
                          blurRadius: 6,
                          offset: Offset(0, 1),
                        ),
                      ],
                    ),
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
