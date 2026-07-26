import 'package:flutter/material.dart';

import '../models/product.dart';
import 'product_repository.dart';

/// Exposes the loaded catalog to the widget tree.
class CatalogScope extends InheritedWidget {
  const CatalogScope({
    super.key,
    required this.products,
    required this.loading,
    required this.error,
    required this.reload,
    required this.flashSale,
    required this.flashSaleTitle,
    required super.child,
  });

  final List<Product> products;
  final bool loading;
  final Object? error;
  final Future<void> Function() reload;

  /// Admin-curated flash-sale products (promo price applied), in order.
  final List<Product> flashSale;
  final String flashSaleTitle;

  static CatalogScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<CatalogScope>();
    assert(scope != null, 'CatalogScope not found in the widget tree');
    return scope!;
  }

  /// Products filtered by a category label ("All Products" returns everything).
  List<Product> byCategory(String category) {
    if (category.toLowerCase().startsWith('all')) return products;
    return products.where((p) => p.category == category).toList();
  }

  @override
  bool updateShouldNotify(CatalogScope old) =>
      products != old.products ||
      loading != old.loading ||
      error != old.error ||
      flashSale != old.flashSale;
}

/// Loads the catalog from Firestore once and provides it via [CatalogScope].
class CatalogLoader extends StatefulWidget {
  const CatalogLoader({super.key, required this.child, this.repository});

  final Widget child;
  final ProductRepository? repository;

  @override
  State<CatalogLoader> createState() => _CatalogLoaderState();
}

class _CatalogLoaderState extends State<CatalogLoader> {
  late final ProductRepository _repo = widget.repository ?? ProductRepository();

  List<Product> _products = const [];
  List<Product> _flashSale = const [];
  String _flashSaleTitle = 'Flash Sale';
  bool _loading = true;
  Object? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final products = await _repo.fetchProducts();
      final homepage = await _repo.fetchHomepage();
      // Build the flash-sale list: match each config entry to a product and
      // apply the promo price (converted with the same rate baked into price).
      final byId = {for (final p in products) p.id: p};
      final flash = <Product>[];
      for (final e in homepage.entries) {
        final p = byId[e.id];
        if (p == null || p.priceUsd <= 0) continue;
        final rate = p.price / p.priceUsd;
        final sale = (e.salePriceUsd * rate).round();
        flash.add(p.copyWith(
          price: sale,
          oldPrice: sale < p.price ? p.price : null,
        ));
      }
      if (!mounted) return;
      setState(() {
        _products = products;
        _flashSale = flash;
        _flashSaleTitle = homepage.title;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return CatalogScope(
      products: _products,
      loading: _loading,
      error: _error,
      reload: _load,
      flashSale: _flashSale,
      flashSaleTitle: _flashSaleTitle,
      child: widget.child,
    );
  }
}
