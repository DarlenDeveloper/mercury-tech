import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/auth_scope.dart';
import '../data/catalog_scope.dart';
import '../data/favorites_repository.dart';
import '../theme/app_colors.dart';
import '../widgets/product_card.dart';
import 'product_detail_screen.dart';

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final uid = AuthScope.of(context).user?.uid;
    if (uid == null) {
      return Scaffold(
        backgroundColor: const Color(0xFFF5F7FB),
        appBar: _buildAppBar(context),
        body: const Center(
          child: Text('Sign in to view your favorites.',
              style: TextStyle(color: AppColors.inactive)),
        ),
      );
    }

    final favRepo = FavoritesRepository(uid: uid);
    final catalog = CatalogScope.of(context).products;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      appBar: _buildAppBar(context),
      body: StreamBuilder<Set<String>>(
        stream: favRepo.watchFavorites(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final favIds = snapshot.data ?? {};
          if (favIds.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(IconsaxPlusLinear.heart,
                      size: 56, color: AppColors.inactive.withValues(alpha: 0.4)),
                  const SizedBox(height: 16),
                  const Text(
                    'No favorites yet',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Items you love will appear here.',
                    style: TextStyle(fontSize: 13, color: AppColors.inactive),
                  ),
                ],
              ),
            );
          }

          final favProducts = catalog
              .where((p) => favIds.contains(p.id))
              .toList();

          return GridView.builder(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.62,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: favProducts.length,
            itemBuilder: (context, i) => ProductCard(
              product: favProducts[i],
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) =>
                      ProductDetailScreen(product: favProducts[i]),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: const Color(0xFFF5F7FB),
      elevation: 0,
      leading: IconButton(
        onPressed: () => Navigator.of(context).maybePop(),
        icon: const Icon(Icons.arrow_back_ios_new, size: 18),
      ),
      title: const Text(
        'My Favorites',
        style: TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.w700,
          color: Color(0xFF1F2937),
        ),
      ),
      centerTitle: true,
    );
  }
}
