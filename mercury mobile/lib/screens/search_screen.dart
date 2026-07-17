import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/catalog_scope.dart';
import '../models/product.dart';
import '../theme/app_colors.dart';
import '../utils/format.dart';
import 'product_detail_screen.dart';

const _popular = ['Laptops', 'Printers', 'iPhone', 'Monitors', 'UPS', 'Toner'];

/// Full-screen search with live suggestions and results.
class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _controller = TextEditingController();
  final _focus = FocusNode();
  String _query = '';

  @override
  void initState() {
    super.initState();
    _focus.requestFocus();
  }

  @override
  void dispose() {
    _controller.dispose();
    _focus.dispose();
    super.dispose();
  }

  List<Product> _search(List<Product> products) {
    if (_query.isEmpty) return [];
    final q = _query.toLowerCase();
    final terms = q.split(RegExp(r'\s+'));

    final scored = <_Scored>[];
    for (final p in products) {
      final name = p.name.toLowerCase();
      final category = p.category.toLowerCase();

      int score = 0;
      if (name.contains(q)) score += 30;
      if (category.contains(q)) score += 15;

      int termsMatched = 0;
      for (final t in terms) {
        if (name.contains(t) || category.contains(t)) {
          termsMatched++;
          score += 5;
        }
      }
      if (terms.length > 1 && termsMatched < terms.length && !name.contains(q)) {
        continue;
      }
      if (score > 0) scored.add(_Scored(p, score));
    }

    scored.sort((a, b) => b.score.compareTo(a.score));
    return scored.map((s) => s.product).toList();
  }

  @override
  Widget build(BuildContext context) {
    final products = CatalogScope.of(context).products;
    final results = _search(products);
    final topPadding = MediaQuery.of(context).padding.top;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      body: Column(
        children: [
          SizedBox(height: topPadding),
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 0),
            child: Row(
              children: [
                // Back
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(IconsaxPlusLinear.arrow_left_2),
                ),
                // Input
                Expanded(
                  child: Container(
                    height: 46,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _controller,
                            focusNode: _focus,
                            onChanged: (v) => setState(() => _query = v.trim()),
                            onSubmitted: (_) => FocusScope.of(context).unfocus(),
                            textInputAction: TextInputAction.search,
                            decoration: const InputDecoration(
                              hintText: 'Search products, brands...',
                              hintStyle: TextStyle(
                                fontSize: 14,
                                color: AppColors.inactive,
                              ),
                              border: InputBorder.none,
                              isCollapsed: true,
                            ),
                            style: const TextStyle(fontSize: 14),
                          ),
                        ),
                        if (_query.isNotEmpty)
                          GestureDetector(
                            onTap: () {
                              _controller.clear();
                              setState(() => _query = '');
                            },
                            child: const Icon(Icons.close, size: 18, color: AppColors.inactive),
                          ),
                        if (_query.isEmpty)
                          const Icon(IconsaxPlusLinear.search_normal, size: 18, color: AppColors.inactive),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // Content
          Expanded(
            child: _query.isEmpty
                ? _PopularSearches(onTap: (term) {
                    _controller.text = term;
                    setState(() => _query = term);
                  })
                : results.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(IconsaxPlusLinear.search_normal,
                                size: 40, color: AppColors.inactive.withValues(alpha: 0.3)),
                            const SizedBox(height: 12),
                            Text(
                              'No results for "$_query"',
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF1F2937),
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Try different keywords or browse categories',
                              style: TextStyle(fontSize: 13, color: AppColors.inactive),
                            ),
                          ],
                        ),
                      )
                    : _ResultsList(results: results),
          ),
        ],
      ),
    );
  }
}

class _PopularSearches extends StatelessWidget {
  const _PopularSearches({required this.onTap});
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'POPULAR SEARCHES',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.2,
              color: AppColors.inactive,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _popular.map((term) {
              return GestureDetector(
                onTap: () => onTap(term),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFE5E7EB)),
                  ),
                  child: Text(
                    term,
                    style: const TextStyle(fontSize: 13, color: Color(0xFF1F2937)),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _ResultsList extends StatelessWidget {
  const _ResultsList({required this.results});
  final List<Product> results;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
      itemCount: results.length,
      separatorBuilder: (_, __) => const Divider(height: 1, color: Color(0xFFEEEFF2)),
      itemBuilder: (context, i) {
        final p = results[i];
        return _SearchResultTile(product: p);
      },
    );
  }
}

class _SearchResultTile extends StatelessWidget {
  const _SearchResultTile({required this.product});
  final Product product;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => ProductDetailScreen(product: product)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            // Image
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: const Color(0xFFF0F1F4),
                borderRadius: BorderRadius.circular(10),
              ),
              clipBehavior: Clip.antiAlias,
              child: product.image != null
                  ? Image.network(
                      product.image!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const Icon(
                        IconsaxPlusLinear.image,
                        size: 20,
                        color: AppColors.inactive,
                      ),
                    )
                  : const Icon(IconsaxPlusLinear.image, size: 20, color: AppColors.inactive),
            ),
            const SizedBox(width: 12),
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    product.category,
                    style: const TextStyle(fontSize: 11.5, color: AppColors.inactive),
                  ),
                ],
              ),
            ),
            // Price
            Text(
              formatUgx(product.price),
              style: const TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1F2937),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Scored {
  const _Scored(this.product, this.score);
  final Product product;
  final int score;
}
