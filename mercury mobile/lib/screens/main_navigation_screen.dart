import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../theme/app_colors.dart';
import '../widgets/mercury_bottom_nav_bar.dart';
import 'home_screen.dart';

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
      label: 'Rewards',
      icon: IconsaxPlusLinear.gift,
      activeIcon: IconsaxPlusBold.gift,
    ),
    MercuryNavItem(
      label: 'Cart',
      icon: IconsaxPlusLinear.bag_2,
      activeIcon: IconsaxPlusBold.bag_2,
    ),
    MercuryNavItem(
      label: 'Profile',
      icon: IconsaxPlusLinear.user,
      activeIcon: IconsaxPlusBold.user,
    ),
  ];

  static const _pages = <Widget>[
    HomeScreen(),
    _PlaceholderPage(title: 'Shop'),
    _PlaceholderPage(title: 'Rewards'),
    _PlaceholderPage(title: 'Cart'),
    _PlaceholderPage(title: 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      extendBody: true,
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: MercuryBottomNavBar(
        currentIndex: _currentIndex,
        items: _items,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}

/// Temporary placeholder until each real section is built.
class _PlaceholderPage extends StatelessWidget {
  const _PlaceholderPage({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        '$title — coming soon',
        style: const TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w600,
          color: AppColors.primary,
        ),
      ),
    );
  }
}
