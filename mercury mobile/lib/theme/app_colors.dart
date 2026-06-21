import 'package:flutter/material.dart';

/// Centralized color tokens for Mercury Mobile.
///
/// The brand is blue. Until the client confirms the exact brand hex,
/// [primary] holds a close placeholder taken from the design reference.
/// Change it here once and it updates everywhere in the app.
class AppColors {
  AppColors._();

  /// Primary brand blue. TODO: confirm exact hex with client / brand guide.
  static const Color primary = Color(0xFF2D6BFF);

  /// Pure surface used for cards and the bottom navigation bar.
  static const Color surface = Color(0xFFFFFFFF);

  /// Default label/icon color for inactive navigation items.
  static const Color inactive = Color(0xFF334155);

  /// Subtle shadow color for elevated surfaces.
  static const Color shadow = Color(0x14000000);
}
