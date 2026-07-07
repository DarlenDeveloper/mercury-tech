import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../widgets/mercury_bottom_nav_bar.dart';
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

  static const _items = <MercuryNavItem>[
    MercuryNavItem(
      label: 'Home',
      icon: IconsaxPlusLinear.home_2,
      activeIcon: IconsaxPlusBold.home_2,
    ),
    MercuryNavItem(
      label: 'Shop',
      icon: IconsaxPlusLinear.search_status_1,
      activeIcon: IconsaxPlusBold.search_status_1,
    ),
    MercuryNavItem(
      label: 'Cart',
      icon: Icons.shopping_cart_outlined,
      activeIcon: Icons.shopping_cart,
    ),
    MercuryNavItem(
      label: 'Profile',
      icon: IconsaxPlusLinear.user,
      activeIcon: IconsaxPlusBold.user,
    ),
  ];

  static const _pages = <Widget>[
    HomeScreen(),
    ShopScreen(),
    CartScreen(),
    ProfileScreen(),
  ];

  void _onTap(int index) => setState(() => _currentIndex = index);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      extendBody: true,
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: MercuryBottomNavBar(
        currentIndex: _currentIndex,
        items: _items,
        onTap: _onTap,
      ),
    );
  }
}
