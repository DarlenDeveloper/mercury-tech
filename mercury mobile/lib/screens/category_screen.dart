import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/catalog_scope.dart';
import '../data/currency_service.dart';
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

  // Filter state
  final Set<String> _brandFilter = {};
  bool _inStockOnly = false;
  RangeValues? _priceRange;
  String _sortBy = 'relevance';

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
    var result = parentId != null
        ? all.where((p) => p.categoryId == parentId).toList()
        : List<Product>.from(all);

    // Subcategory filter
    if (_selected > 0 && _selected < category.subcategories.length) {
      final label = category.subcategories[_selected].label;
      final filtered = result.where((p) => p.category == label).toList();
      if (filtered.isNotEmpty) result = filtered;
    }

    // Brand filter
    if (_brandFilter.isNotEmpty) {
      result = result.where((p) => _brandFilter.contains(p.brand ?? '')).toList();
    }

    // Stock filter
    if (_inStockOnly) {
      result = result.where((p) => p.inStock).toList();
    }

    // Price range
    if (_priceRange != null) {
      result = result.where((p) =>
          p.price >= _priceRange!.start && p.price <= _priceRange!.end).toList();
    }

    // Sort
    switch (_sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'price_desc':
        result.sort((a, b) => b.price.compareTo(a.price));
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.compareTo(b.name));
        break;
    }

    return result;
  }

  /// Extracts brands from category products for filter options
  List<_BrandOption> _getBrands(List<Product> categoryProducts) {
    final counts = <String, int>{};
    for (final p in categoryProducts) {
      final b = (p.brand ?? '').trim();
      if (b.isNotEmpty) counts[b] = (counts[b] ?? 0) + 1;
    }
    final sorted = counts.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
    return sorted.map((e) => _BrandOption(e.key, e.value)).toList();
  }

  /// Gets price min/max from category products
  (int, int) _getPriceRange(List<Product> categoryProducts) {
    if (categoryProducts.isEmpty) return (0, 0);
    final prices = categoryProducts.map((p) => p.price).where((p) => p > 0).toList();
    if (prices.isEmpty) return (0, 0);
    prices.sort();
    return (prices.first, prices.last);
  }

  bool get _hasActiveFilters =>
      _brandFilter.isNotEmpty || _inStockOnly || _priceRange != null || _sortBy != 'relevance';

  void _clearFilters() {
    setState(() {
      _brandFilter.clear();
      _inStockOnly = false;
      _priceRange = null;
      _sortBy = 'relevance';
    });
  }

  void _openFilterSheet(List<Product> categoryProducts) {
    final brands = _getBrands(categoryProducts);
    final (minP, maxP) = _getPriceRange(categoryProducts);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _FilterSheet(
        brands: brands,
        selectedBrands: Set<String>.from(_brandFilter),
        inStockOnly: _inStockOnly,
        priceRange: _priceRange,
        minPrice: minP,
        maxPrice: maxP,
        sortBy: _sortBy,
        onApply: (brands, inStock, priceRange, sort) {
          setState(() {
            _brandFilter
              ..clear()
              ..addAll(brands);
            _inStockOnly = inStock;
            _priceRange = priceRange;
            _sortBy = sort;
          });
          Navigator.of(context).pop();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final allProducts = CatalogScope.of(context).products;
    // Get base category products for filter options (before applying filters)
    final parentId = _categoryIdMap[category.name];
    final baseProducts = parentId != null
        ? allProducts.where((p) => p.categoryId == parentId).toList()
        : allProducts;
    final products = _productsFrom(allProducts);

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
            // Title + back button
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.of(context).maybePop(),
                      icon: const Icon(IconsaxPlusLinear.arrow_left_2, size: 20),
                      color: _ink,
                    ),
                    Expanded(
                      child: Text(
                        category.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: _ink,
                        ),
                      ),
                    ),
                    // Filter button
                    GestureDetector(
                      onTap: () => _openFilterSheet(baseProducts),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: _hasActiveFilters ? _ink : const Color(0xFFF3F4F6),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              IconsaxPlusLinear.setting_4,
                              size: 16,
                              color: _hasActiveFilters ? Colors.white : const Color(0xFF6B7280),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Filters',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: _hasActiveFilters ? Colors.white : const Color(0xFF6B7280),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Subcategory chips
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
            // Active filter pills
            if (_hasActiveFilters)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      if (_brandFilter.isNotEmpty)
                        for (final b in _brandFilter)
                          _ActiveFilterPill(
                            label: b,
                            onRemove: () => setState(() => _brandFilter.remove(b)),
                          ),
                      if (_inStockOnly)
                        _ActiveFilterPill(
                          label: 'In Stock',
                          onRemove: () => setState(() => _inStockOnly = false),
                        ),
                      if (_priceRange != null)
                        _ActiveFilterPill(
                          label: 'Price filtered',
                          onRemove: () => setState(() => _priceRange = null),
                        ),
                      if (_sortBy != 'relevance')
                        _ActiveFilterPill(
                          label: _sortLabel(_sortBy),
                          onRemove: () => setState(() => _sortBy = 'relevance'),
                        ),
                      GestureDetector(
                        onTap: _clearFilters,
                        child: const Text(
                          'Clear all',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFFEF4444)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            // Result count
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
                child: Text(
                  '${products.length} product${products.length == 1 ? '' : 's'}',
                  style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
                ),
              ),
            ),
            // Product grid
            if (products.isEmpty)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.all(40),
                    child: Text(
                      'No products match your filters',
                      style: TextStyle(fontSize: 14, color: Color(0xFF6B7280)),
                    ),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 120),
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

String _sortLabel(String sortBy) {
  switch (sortBy) {
    case 'price_asc':
      return 'Price: Low → High';
    case 'price_desc':
      return 'Price: High → Low';
    case 'name_asc':
      return 'Name: A → Z';
    default:
      return 'Sort';
  }
}

// ─── Active filter pill ──────────────────────────────────────────────────────

class _ActiveFilterPill extends StatelessWidget {
  const _ActiveFilterPill({required this.label, required this.onRemove});
  final String label;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(10, 4, 6, 4),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF374151))),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: onRemove,
            child: const Icon(Icons.close, size: 14, color: Color(0xFF6B7280)),
          ),
        ],
      ),
    );
  }
}

// ─── Brand option helper ─────────────────────────────────────────────────────

class _BrandOption {
  const _BrandOption(this.name, this.count);
  final String name;
  final int count;
}

// ─── Filter Bottom Sheet ─────────────────────────────────────────────────────

class _FilterSheet extends StatefulWidget {
  const _FilterSheet({
    required this.brands,
    required this.selectedBrands,
    required this.inStockOnly,
    required this.priceRange,
    required this.minPrice,
    required this.maxPrice,
    required this.sortBy,
    required this.onApply,
  });

  final List<_BrandOption> brands;
  final Set<String> selectedBrands;
  final bool inStockOnly;
  final RangeValues? priceRange;
  final int minPrice;
  final int maxPrice;
  final String sortBy;
  final void Function(Set<String> brands, bool inStock, RangeValues? priceRange, String sort) onApply;

  @override
  State<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<_FilterSheet> {
  static const _ink = Color(0xFF1F2937);

  late Set<String> _brands;
  late bool _inStock;
  late RangeValues _range;
  late String _sort;
  bool _priceActive = false;

  @override
  void initState() {
    super.initState();
    _brands = Set.from(widget.selectedBrands);
    _inStock = widget.inStockOnly;
    _range = widget.priceRange ?? RangeValues(widget.minPrice.toDouble(), widget.maxPrice.toDouble());
    _priceActive = widget.priceRange != null;
    _sort = widget.sortBy;
  }

  @override
  Widget build(BuildContext context) {
    final currency = CurrencyScope.of(context);
    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 36, height: 4, decoration: BoxDecoration(color: const Color(0xFFD1D5DB), borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 16),
              Row(
                children: [
                  const Expanded(
                    child: Text('Filters', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: _ink)),
                  ),
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _brands.clear();
                        _inStock = false;
                        _priceActive = false;
                        _range = RangeValues(widget.minPrice.toDouble(), widget.maxPrice.toDouble());
                        _sort = 'relevance';
                      });
                    },
                    child: const Text('Reset', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFFEF4444))),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  children: [
                    // Sort
                    const Text('Sort by', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: _ink)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _SortChip(label: 'Relevant', value: 'relevance', selected: _sort, onTap: (v) => setState(() => _sort = v)),
                        _SortChip(label: 'Price ↑', value: 'price_asc', selected: _sort, onTap: (v) => setState(() => _sort = v)),
                        _SortChip(label: 'Price ↓', value: 'price_desc', selected: _sort, onTap: (v) => setState(() => _sort = v)),
                        _SortChip(label: 'A → Z', value: 'name_asc', selected: _sort, onTap: (v) => setState(() => _sort = v)),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // In stock
                    Row(
                      children: [
                        const Text('In Stock Only', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: _ink)),
                        const Spacer(),
                        Switch.adaptive(
                          value: _inStock,
                          activeTrackColor: _ink,
                          onChanged: (v) => setState(() => _inStock = v),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Price range
                    Row(
                      children: [
                        const Text('Price Range', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: _ink)),
                        const Spacer(),
                        Switch.adaptive(
                          value: _priceActive,
                          activeTrackColor: _ink,
                          onChanged: (v) => setState(() => _priceActive = v),
                        ),
                      ],
                    ),
                    if (_priceActive && widget.maxPrice > widget.minPrice) ...[
                      const SizedBox(height: 8),
                      RangeSlider(
                        values: _range,
                        min: widget.minPrice.toDouble(),
                        max: widget.maxPrice.toDouble(),
                        activeColor: _ink,
                        inactiveColor: const Color(0xFFE5E7EB),
                        onChanged: (v) => setState(() => _range = v),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              currency.formatCompact(_range.start.round()),
                              style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
                            ),
                            Text(
                              currency.formatCompact(_range.end.round()),
                              style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 20),
                    // Brands
                    if (widget.brands.isNotEmpty) ...[
                      const Text('Brand', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: _ink)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: widget.brands.take(12).map((b) {
                          final selected = _brands.contains(b.name);
                          return GestureDetector(
                            onTap: () => setState(() {
                              if (selected) {
                                _brands.remove(b.name);
                              } else {
                                _brands.add(b.name);
                              }
                            }),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: selected ? _ink : const Color(0xFFF3F4F6),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                '${b.name} (${b.count})',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: selected ? Colors.white : const Color(0xFF374151),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 12),
              // Apply button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    widget.onApply(
                      _brands,
                      _inStock,
                      _priceActive ? _range : null,
                      _sort,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _ink,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('Apply Filters', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SortChip extends StatelessWidget {
  const _SortChip({required this.label, required this.value, required this.selected, required this.onTap});
  final String label;
  final String value;
  final String selected;
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) {
    final isActive = value == selected;
    return GestureDetector(
      onTap: () => onTap(value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF1F2937) : const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isActive ? Colors.white : const Color(0xFF374151),
          ),
        ),
      ),
    );
  }
}
