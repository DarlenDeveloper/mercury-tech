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

  /// Maps Firestore slug → local kShopCategories name.
  static const _slugToName = {
    'computers': 'Computers',
    'printers-office': 'Printers & Office',
    'components-power': 'Components & Power',
    'networking-security': 'Networking & Security',
    'phones-tv-audio': 'Phones, TV & Audio',
    'accessories': 'Accessories',
  };

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
        final children = (data['children'] as List?)
                ?.map((c) => (c as Map<String, dynamic>)['name'] as String? ?? '')
                .where((n) => n.isNotEmpty)
                .toList() ??
            [];
        firestoreMap[slug] = children;
      }

      // Merge: for each local category, replace subcategories with Firestore
      // children (keeping "All" at front and using generic icons).
      return kShopCategories.map((local) {
        final slug = _slugToName.entries
            .firstWhere((e) => e.value == local.name, orElse: () => const MapEntry('', ''))
            .key;
        final fsChildren = firestoreMap[slug];
        if (fsChildren == null || fsChildren.isEmpty) return local;

        final merged = <Subcategory>[
          // Keep the "All" chip from the hardcoded list (has image).
          if (local.subcategories.isNotEmpty) local.subcategories.first,
          // Add Firestore children as subcategories.
          ...fsChildren.map((name) {
            // Try to reuse existing chip if name matches.
            final existing = local.subcategories
                .where((s) => s.label.toLowerCase() == name.toLowerCase())
                .toList();
            if (existing.isNotEmpty) return existing.first;
            return Subcategory(name, IconsaxPlusBold.category);
          }),
        ];

        return Category(
          name: local.name,
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
