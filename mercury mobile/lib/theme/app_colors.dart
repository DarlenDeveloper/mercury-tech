import 'package:flutter/material.dart';

/// Centralized color tokens for Mercury Mobile.
///
/// The brand is blue. Until the client confirms the exact brand hex,
/// [primary] holds a close placeholder taken from the design reference.
/// Change it here once and it updates everywhere in the app.
class AppColors {
  AppColors._();

  /// Primary brand blue, from the Mercury brand color (#1F3E97).
  static const Color primary = Color(0xFF1F3E97);

  /// Secondary brand accent (orange), sampled from the Mercury logo.
  static const Color accent = Color(0xFFFF7A00);

  /// Pure surface used for cards and the bottom navigation bar.
  static const Color surface = Color(0xFFFFFFFF);

  /// Default label/icon color for inactive navigation items.
  static const Color inactive = Color(0xFF334155);

  /// Subtle shadow color for elevated surfaces.
  static const Color shadow = Color(0x14000000);
}
