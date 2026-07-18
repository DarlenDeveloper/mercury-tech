import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/catalog_scope.dart';
import '../data/currency_service.dart';
import '../models/category.dart';
import '../models/product.dart';
import '../widgets/product_card.dart';
import 'product_detail_screen.dart';

class CategoryScreen extends StatefulWidget {
  const CategoryScreen({super.key, required this.category});

  final Category category;

  @override
  State<CategoryScreen> createState() => _CategoryScreenState();
}

class _CategoryScreenState extends State<CategoryScreen> {
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
    final currentProducts = _productsFrom(CatalogScope.of(context).products);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
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
        resultCount: currentProducts.length,
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
                      child: Center(
                        child: Text(
                          category.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: _ink,
                          ),
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
                          border: Border.all(
                            color: _hasActiveFilters ? _ink : const Color(0xFFD1D5DB),
                            width: 1.5,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              IconsaxPlusLinear.setting_4,
                              size: 16,
                              color: _hasActiveFilters ? Colors.white : _ink,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Filters',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: _hasActiveFilters ? Colors.white : _ink,
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

// ─── Filter Sheet (multi-page: main → brand list) ────────────────────────────

class _FilterSheet extends StatefulWidget {
  const _FilterSheet({
    required this.brands,
    required this.selectedBrands,
    required this.inStockOnly,
    required this.priceRange,
    required this.minPrice,
    required this.maxPrice,
    required this.sortBy,
    required this.resultCount,
    required this.onApply,
  });

  final List<_BrandOption> brands;
  final Set<String> selectedBrands;
  final bool inStockOnly;
  final RangeValues? priceRange;
  final int minPrice;
  final int maxPrice;
  final String sortBy;
  final int resultCount;
  final void Function(Set<String>, bool, RangeValues?, String) onApply;

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
  bool _showBrandPage = false;
  String _brandSearch = '';

  @override
  void initState() {
    super.initState();
    _brands = Set.from(widget.selectedBrands);
    _inStock = widget.inStockOnly;
    _range = widget.priceRange ??
        RangeValues(widget.minPrice.toDouble(), widget.maxPrice.toDouble());
    _priceActive = widget.priceRange != null;
    _sort = widget.sortBy;
  }

  void _reset() {
    setState(() {
      _brands.clear();
      _inStock = false;
      _priceActive = false;
      _range = RangeValues(widget.minPrice.toDouble(), widget.maxPrice.toDouble());
      _sort = 'relevance';
    });
  }

  int get _activeCount =>
      _brands.length + (_inStock ? 1 : 0) + (_priceActive ? 1 : 0) + (_sort != 'relevance' ? 1 : 0);

  @override
  Widget build(BuildContext context) {
    final currency = CurrencyScope.of(context);
    return DraggableScrollableSheet(
      initialChildSize: 0.8,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        if (_showBrandPage) {
          return _buildBrandPage(context);
        }
        return _buildMainPage(context, scrollController, currency);
      },
    );
  }

  Widget _buildMainPage(BuildContext context, ScrollController sc, CurrencyScope currency) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 16, 0),
          child: Row(
            children: [
              const Text('Filter', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: _ink)),
              const Spacer(),
              IconButton(icon: const Icon(Icons.close, size: 22, color: _ink), onPressed: () => Navigator.pop(context)),
            ],
          ),
        ),
        const Divider(height: 24, color: Color(0xFFF3F4F6)),
        Expanded(
          child: ListView(
            controller: sc,
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
            children: [
              // Brand row
              _buildNavRow('Brand', _brands.isEmpty ? null : '${_brands.length} selected', () => setState(() => _showBrandPage = true)),
              const Divider(height: 1, color: Color(0xFFF3F4F6)),
              // In stock
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  children: [
                    const Text('In Stock Only', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: _ink)),
                    const Spacer(),
                    Switch.adaptive(value: _inStock, activeTrackColor: _ink, onChanged: (v) => setState(() => _inStock = v)),
                  ],
                ),
              ),
              const Divider(height: 1, color: Color(0xFFF3F4F6)),
              // Price
              Padding(
                padding: const EdgeInsets.only(top: 14, bottom: 6),
                child: Row(
                  children: [
                    const Text('Price', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: _ink)),
                    const Spacer(),
                    Switch.adaptive(value: _priceActive, activeTrackColor: _ink, onChanged: (v) => setState(() => _priceActive = v)),
                  ],
                ),
              ),
              if (_priceActive && widget.maxPrice > widget.minPrice) ...[
                RangeSlider(values: _range, min: widget.minPrice.toDouble(), max: widget.maxPrice.toDouble(), activeColor: _ink, inactiveColor: const Color(0xFFE5E7EB), onChanged: (v) => setState(() => _range = v)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    _priceBox(currency.formatCompact(_range.start.round())),
                    const Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Text('–', style: TextStyle(color: Color(0xFF9CA3AF)))),
                    _priceBox(currency.formatCompact(_range.end.round())),
                  ],
                ),
              ],
              const SizedBox(height: 16),
              const Divider(height: 1, color: Color(0xFFF3F4F6)),
              // Sort
              const Padding(padding: EdgeInsets.only(top: 14, bottom: 8), child: Text('Sort by', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: _ink))),
              Wrap(spacing: 8, runSpacing: 8, children: [
                _sortChip('Relevant', 'relevance'),
                _sortChip('Price ↑', 'price_asc'),
                _sortChip('Price ↓', 'price_desc'),
                _sortChip('A → Z', 'name_asc'),
              ]),
              const SizedBox(height: 24),
            ],
          ),
        ),
        _buildBottomBar(context),
      ],
    );
  }

  Widget _buildBrandPage(BuildContext context) {
    final filtered = _brandSearch.isEmpty
        ? widget.brands
        : widget.brands.where((b) => b.name.toLowerCase().contains(_brandSearch.toLowerCase())).toList();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(8, 16, 16, 0),
          child: Row(
            children: [
              IconButton(icon: const Icon(Icons.arrow_back, size: 22, color: _ink), onPressed: () => setState(() => _showBrandPage = false)),
              const Expanded(child: Center(child: Text('Brand', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: _ink)))),
              IconButton(icon: const Icon(Icons.close, size: 22, color: _ink), onPressed: () => Navigator.pop(context)),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
          child: Container(
            height: 44,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(color: const Color(0xFFF3F4F6), borderRadius: BorderRadius.circular(12)),
            child: Row(
              children: [
                const Icon(Icons.search, size: 20, color: Color(0xFF9CA3AF)),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    onChanged: (v) => setState(() => _brandSearch = v),
                    decoration: const InputDecoration(hintText: 'Search', border: InputBorder.none, isCollapsed: true, contentPadding: EdgeInsets.symmetric(vertical: 12), hintStyle: TextStyle(color: Color(0xFF9CA3AF), fontSize: 14)),
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
              ],
            ),
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: filtered.length,
            itemBuilder: (context, i) {
              final brand = filtered[i];
              final isSelected = _brands.contains(brand.name);
              return InkWell(
                onTap: () => setState(() => isSelected ? _brands.remove(brand.name) : _brands.add(brand.name)),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Row(
                    children: [
                      Container(
                        width: 32, height: 32,
                        decoration: BoxDecoration(color: const Color(0xFFF3F4F6), borderRadius: BorderRadius.circular(8)),
                        alignment: Alignment.center,
                        child: Text(brand.name.isNotEmpty ? brand.name[0].toUpperCase() : '?', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: _ink)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: Text(brand.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: _ink))),
                      Text('${brand.count}', style: const TextStyle(fontSize: 13, color: Color(0xFF9CA3AF))),
                      const SizedBox(width: 12),
                      Container(
                        width: 22, height: 22,
                        decoration: BoxDecoration(color: isSelected ? _ink : Colors.transparent, borderRadius: BorderRadius.circular(5), border: Border.all(color: isSelected ? _ink : const Color(0xFFD1D5DB), width: 1.5)),
                        child: isSelected ? const Icon(Icons.check, size: 14, color: Colors.white) : null,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        _buildBottomBar(context, clearLabel: 'Clear filter', clearAction: () => setState(() => _brands.clear())),
      ],
    );
  }

  Widget _buildBottomBar(BuildContext context, {String? clearLabel, VoidCallback? clearAction}) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: _activeCount > 0 ? (clearAction ?? _reset) : null,
              style: OutlinedButton.styleFrom(
                foregroundColor: _ink,
                side: const BorderSide(color: Color(0xFFE5E7EB)),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
              ),
              child: Text(clearLabel ?? 'Clear all${_activeCount > 0 ? ' ($_activeCount)' : ''}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: ElevatedButton(
              onPressed: () => widget.onApply(_brands, _inStock, _priceActive ? _range : null, _sort),
              style: ElevatedButton.styleFrom(
                backgroundColor: _ink,
                foregroundColor: Colors.white,
                elevation: 0,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
              ),
              child: Text('Show ${widget.resultCount}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavRow(String title, String? trailing, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Row(
          children: [
            Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: _ink)),
            const Spacer(),
            if (trailing != null) ...[Text(trailing, style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))), const SizedBox(width: 8)],
            const Icon(Icons.chevron_right, size: 20, color: Color(0xFF9CA3AF)),
          ],
        ),
      ),
    );
  }

  Widget _priceBox(String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(border: Border.all(color: const Color(0xFFE5E7EB)), borderRadius: BorderRadius.circular(10)),
        child: Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: _ink)),
      ),
    );
  }

  Widget _sortChip(String label, String value) {
    final isActive = value == _sort;
    return GestureDetector(
      onTap: () => setState(() => _sort = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(color: isActive ? _ink : const Color(0xFFF3F4F6), borderRadius: BorderRadius.circular(20)),
        child: Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isActive ? Colors.white : const Color(0xFF374151))),
      ),
    );
  }
}
