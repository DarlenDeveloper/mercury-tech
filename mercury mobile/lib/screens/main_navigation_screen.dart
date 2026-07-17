import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/auth_scope.dart';
import '../data/navigation_scope.dart';
import '../widgets/mercury_bottom_nav_bar.dart';
import '../widgets/draggable_support_button.dart';
import 'cart_screen.dart';
import 'home_screen.dart';
import 'profile_screen.dart';
import 'shop_screen.dart';

/// Hosts the primary app sections behind the bottom navigation bar.
class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  int _cartCount = 0;
  StreamSubscription? _cartSub;

  static const _pages = <Widget>[
    HomeScreen(),
    ShopScreen(),
    CartScreen(),
    ProfileScreen(),
  ];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _listenToCart();
  }

  void _listenToCart() {
    _cartSub?.cancel();
    final uid = AuthScope.of(context).user?.uid;
    if (uid == null) return;
    _cartSub = FirebaseFirestore.instance
        .collection('users')
        .doc(uid)
        .collection('cart')
        .snapshots()
        .listen((snap) {
      if (!mounted) return;
      int count = 0;
      for (final doc in snap.docs) {
        count += (doc.data()['qty'] as int?) ?? 1;
      }
      setState(() => _cartCount = count);
    });
  }

  @override
  void dispose() {
    _cartSub?.cancel();
    super.dispose();
  }

  List<MercuryNavItem> get _items => [
    const MercuryNavItem(
      label: 'Home',
      icon: IconsaxPlusLinear.home_2,
      activeIcon: IconsaxPlusBold.home_2,
    ),
    const MercuryNavItem(
      label: 'Shop',
      icon: IconsaxPlusLinear.search_status_1,
      activeIcon: IconsaxPlusBold.search_status_1,
    ),
    MercuryNavItem(
      label: 'Cart',
      icon: Icons.shopping_cart_outlined,
      activeIcon: Icons.shopping_cart,
      badgeCount: _cartCount,
    ),
    const MercuryNavItem(
      label: 'Profile',
      icon: IconsaxPlusLinear.user,
      activeIcon: IconsaxPlusBold.user,
    ),
  ];

  void _onTap(int index) => setState(() => _currentIndex = index);

  @override
  Widget build(BuildContext context) {
    return NavigationScope(
      switchTab: (index) => setState(() => _currentIndex = index),
      child: Scaffold(
        backgroundColor: Colors.white,
        extendBody: true,
        body: Stack(
          children: [
            IndexedStack(index: _currentIndex, children: _pages),
            if (_currentIndex == 3)
              const DraggableSupportButton(),
          ],
        ),
        bottomNavigationBar: MercuryBottomNavBar(
          currentIndex: _currentIndex,
          items: _items,
          onTap: _onTap,
        ),
      ),
    );
  }
}
