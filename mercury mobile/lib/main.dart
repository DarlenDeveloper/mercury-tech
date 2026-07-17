import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';

import 'data/auth_scope.dart';
import 'data/catalog_scope.dart';
import 'data/currency_service.dart';
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

    return CurrencyProvider(
      child: AuthGate(
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
        home: const _SplashGate(),
      ),
    ),
    );
  }
}

class _SplashGate extends StatefulWidget {
  const _SplashGate();

  @override
  State<_SplashGate> createState() => _SplashGateState();
}

class _SplashGateState extends State<_SplashGate> {
  bool _showHome = false;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 2800), () {
      if (mounted) setState(() => _showHome = true);
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 600),
      switchInCurve: Curves.easeOut,
      switchOutCurve: Curves.easeIn,
      transitionBuilder: (child, animation) {
        // Splash fades out, home fades in
        return FadeTransition(opacity: animation, child: child);
      },
      child: _showHome
          ? const MainNavigationScreen(key: ValueKey('home'))
          : Scaffold(
              key: const ValueKey('splash'),
              backgroundColor: Colors.white,
              body: Center(
                child: Lottie.asset(
                  'assets/animations/splash.json',
                  width: 200,
                  height: 200,
                  fit: BoxFit.contain,
                ),
              ),
            ),
    );
  }
}
