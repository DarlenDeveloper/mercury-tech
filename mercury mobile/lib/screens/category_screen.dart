import 'package:flutter/material.dart';

import '../data/catalog_scope.dart';
import '../models/category.dart';
import '../models/product.dart';
import '../widgets/mercury_filter_chip.dart';
import '../widgets/product_card.dart';
import 'product_detail_screen.dart';

class CategoryScreen extends StatefulWidget {
  const CategoryScreen({super.key, required this.category});

  final Category category;

  @override
  State<CategoryScreen> createState() => _CategoryScreenState();
}

class _CategoryScreenState extends State<CategoryScreen> {
  int _selected = 0;

  static const _ink = Color(0xFF1F2937);

  Category get category => widget.category;

  /// Maps category name to Firestore categoryId.
  static const _categoryIdMap = {
    'Computers': 'computers',
    'Printers & Office': 'printers-office',
    'Components & Power': 'components-power',
    'Networking & Security': 'networking-security',
    'Phones, TV & Audio': 'phones-tv-audio',
    'Accessories': 'accessories',
  };

  List<Product> _productsFrom(List<Product> all) {
    final parentId = _categoryIdMap[category.name];
    // First filter by parent category
    final categoryProducts = parentId != null
        ? all.where((p) => p.categoryId == parentId).toList()
        : all;

    if (_selected == 0) return categoryProducts;
    final label = category.subcategories[_selected].label;
    final filtered = categoryProducts.where((p) => p.category == label).toList();
    return filtered.isEmpty ? categoryProducts : filtered;
  }

  @override
  Widget build(BuildContext context) {
    final products = _productsFrom(CatalogScope.of(context).products);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        top: false,
        bottom: false,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: SizedBox(height: MediaQuery.of(context).padding.top),
            ),
            // Section A — title with back button.
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 8, 20, 4),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.of(context).maybePop(),
                      icon: const Icon(Icons.arrow_back_ios_new, size: 20),
                      color: _ink,
                    ),
                    Expanded(
                      child: Text(
                        category.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: _ink,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Section B — subcategory filters.
            SliverToBoxAdapter(
              child: SizedBox(
                height: 40,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.fromLTRB(20, 4, 20, 4),
                  itemCount: category.subcategories.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 10),
                  itemBuilder: (context, i) => MercuryFilterChip(
                    label: category.subcategories[i].label,
                    icon: category.subcategories[i].icon,
                    image: category.subcategories[i].image,
                    accent: category.color,
                    onTap: () => setState(() => _selected = i),
                  ),
                ),
              ),
            ),
            // Section D — product grid.
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 120),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 0.72,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) => ProductCard(
                    product: products[index],
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) =>
                            ProductDetailScreen(product: products[index]),
                      ),
                    ),
                  ),
                  childCount: products.length,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

