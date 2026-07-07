import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'data/auth_scope.dart';
import 'data/catalog_scope.dart';
import 'firebase_options.dart';
import 'theme/app_colors.dart';
import 'screens/main_navigation_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MercuryApp());
}

class MercuryApp extends StatelessWidget {
  const MercuryApp({super.key});

  @override
  Widget build(BuildContext context) {
    final baseTheme = ThemeData(
      colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primary),
      useMaterial3: true,
    );

    final navigatorKey = GlobalKey<NavigatorState>();

    return AuthGate(
      child: MaterialApp(
        title: 'Mercury Mobile',
        debugShowCheckedModeBanner: false,
        navigatorKey: navigatorKey,
        theme: baseTheme.copyWith(
          textTheme: GoogleFonts.poppinsTextTheme(baseTheme.textTheme),
          primaryTextTheme:
              GoogleFonts.poppinsTextTheme(baseTheme.primaryTextTheme),
        ),
        builder: (context, child) {
          return CatalogLoader(
            child: child ?? const SizedBox.shrink(),
          );
        },
        home: const MainNavigationScreen(),
      ),
    );
  }
}
