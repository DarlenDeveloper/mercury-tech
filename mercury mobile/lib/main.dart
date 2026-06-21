import 'package:flutter/material.dart';

import 'theme/app_colors.dart';
import 'screens/main_navigation_screen.dart';

void main() {
  runApp(const MercuryApp());
}

class MercuryApp extends StatelessWidget {
  const MercuryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mercury Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primary),
        useMaterial3: true,
      ),
      home: const MainNavigationScreen(),
    );
  }
}
