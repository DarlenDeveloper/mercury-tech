import 'dart:ui';

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// A single destination in the [MercuryBottomNavBar].
class MercuryNavItem {
  const MercuryNavItem({
    required this.label,
    required this.icon,
    required this.activeIcon,
    this.showBadge = false,
  });

  /// Text shown beneath the icon.
  final String label;

  /// Outline (linear) icon shown when the item is not selected.
  final IconData icon;

  /// Filled (bold) icon shown when the item is selected.
  final IconData activeIcon;

  /// Whether to show a small accent dot on the icon (e.g. notifications).
  final bool showBadge;
}

/// Rounded, floating bottom navigation bar for Mercury Mobile.
///
/// Active items use the brand blue with a filled (bold) icon; inactive items
/// use a muted grey with an outline (linear) icon.
class MercuryBottomNavBar extends StatelessWidget {
  const MercuryBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.items,
    required this.onTap,
  });

  final int currentIndex;
  final List<MercuryNavItem> items;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(38),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 22, sigmaY: 22),
            child: Container(
              decoration: BoxDecoration(
                // Light warm grey with translucency.
                color: const Color(0xFFF5F4F3).withValues(alpha: 0.85),
                borderRadius: BorderRadius.circular(38),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  vertical: 12,
                  horizontal: 8,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    for (var i = 0; i < items.length; i++)
                      _NavBarItem(
                        item: items[i],
                        selected: i == currentIndex,
                        onTap: () => onTap(i),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavBarItem extends StatelessWidget {
  const _NavBarItem({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  final MercuryNavItem item;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? AppColors.primary : AppColors.inactive.withValues(alpha: 0.5);

    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        splashColor: AppColors.primary.withValues(alpha: 0.08),
        highlightColor: AppColors.primary.withValues(alpha: 0.05),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Icon(
                    selected ? item.activeIcon : item.icon,
                    color: color,
                    size: 22,
                  ),
                  if (item.showBadge)
                    Positioned(
                      right: -2,
                      top: -1,
                      child: Container(
                        width: 9,
                        height: 9,
                        decoration: BoxDecoration(
                          color: AppColors.accent,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: AppColors.primary,
                            width: 1.5,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                item.label,
                style: TextStyle(
                  color: color,
                  fontSize: 11,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
