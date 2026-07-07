import 'package:flutter/material.dart';

/// Exposes tab navigation to child widgets.
class NavigationScope extends InheritedWidget {
  const NavigationScope({
    super.key,
    required this.switchTab,
    required super.child,
  });

  final ValueChanged<int> switchTab;

  static NavigationScope? of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<NavigationScope>();
  }

  @override
  bool updateShouldNotify(NavigationScope old) => false;
}
