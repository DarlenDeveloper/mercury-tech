import 'package:flutter/material.dart';

import '../models/category.dart';
import 'categories.dart';
import 'category_repository.dart';

/// Provides the synced category list to the widget tree.
class CategoryScope extends InheritedWidget {
  const CategoryScope({
    super.key,
    required this.categories,
    required super.child,
  });

  final List<Category> categories;

  static List<Category> of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<CategoryScope>();
    return scope?.categories ?? kShopCategories;
  }

  @override
  bool updateShouldNotify(CategoryScope old) => categories != old.categories;
}

/// Loads categories from Firestore once and provides them via [CategoryScope].
class CategoryLoader extends StatefulWidget {
  const CategoryLoader({super.key, required this.child});
  final Widget child;

  @override
  State<CategoryLoader> createState() => _CategoryLoaderState();
}

class _CategoryLoaderState extends State<CategoryLoader> {
  List<Category> _categories = kShopCategories;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final repo = CategoryRepository();
    final result = await repo.fetchCategories();
    if (mounted) setState(() => _categories = result);
  }

  @override
  Widget build(BuildContext context) {
    return CategoryScope(
      categories: _categories,
      child: widget.child,
    );
  }
}
