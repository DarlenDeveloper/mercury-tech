import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../models/category.dart';
import 'categories.dart';

/// Fetches categories from Firestore and merges subcategory names with the
/// hardcoded visual properties in [kShopCategories].
class CategoryRepository {
  CategoryRepository({FirebaseFirestore? firestore})
    : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  /// Fetches Firestore categories and returns the [kShopCategories] list with
  /// subcategories merged from Firestore's `children` arrays.
  /// Falls back to [kShopCategories] as-is if Firestore fetch fails.
  Future<List<Category>> fetchCategories() async {
    try {
      final snap = await _db.collection('categories').orderBy('order').get();
      final firestoreMap = <String, List<String>>{};
      for (final doc in snap.docs) {
        final data = doc.data();
        if (data['active'] == false) continue;
        final slug = (data['slug'] as String?) ?? doc.id;
        final children =
            (data['children'] as List?)
                ?.map(
                  (c) => (c as Map<String, dynamic>)['name'] as String? ?? '',
                )
                .where((n) => n.isNotEmpty)
                .toList() ??
            [];
        firestoreMap[slug] = children;
      }

      // Merge each local category with Firestore children. Printers and
      // Desktops intentionally lead their respective category chips.
      return kShopCategories.map((local) {
        final fsChildren = firestoreMap[local.slug];
        if (fsChildren == null || fsChildren.isEmpty) return local;

        final allIndex = local.subcategories.indexWhere(
          (subcategory) => subcategory.label == 'All',
        );
        final all = allIndex == -1 ? null : local.subcategories[allIndex];
        final merged = <Subcategory>[
          ...fsChildren.where((name) => name != 'All').map((name) {
            // Try to reuse existing chip if name matches.
            final existing = local.subcategories
                .where((s) => s.label.toLowerCase() == name.toLowerCase())
                .toList();
            if (existing.isNotEmpty) return existing.first;
            return Subcategory(name, IconsaxPlusBold.category);
          }),
          if (all != null) all,
        ];
        final preferred = switch (local.slug) {
          'printers-office' => 'Printers',
          'desktops' => 'Desktops',
          _ => null,
        };
        if (preferred != null) {
          final preferredIndex = merged.indexWhere(
            (subcategory) => subcategory.label == preferred,
          );
          if (preferredIndex != -1) {
            final preferredSubcategory = merged.removeAt(preferredIndex);
            merged.insert(0, preferredSubcategory);
          }
        } else if (all != null) {
          merged.remove(all);
          merged.insert(0, all);
        }

        return Category(
          name: local.name,
          slug: local.slug,
          color: local.color,
          image: local.image,
          photo: local.photo,
          imageScale: local.imageScale,
          imageScaleX: local.imageScaleX,
          imageRotationDeg: local.imageRotationDeg,
          subcategories: merged,
        );
      }).toList();
    } catch (_) {
      return kShopCategories;
    }
  }
}
