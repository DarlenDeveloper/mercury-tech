import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../screens/ai_agent_screen.dart';
import '../theme/app_colors.dart';

/// Brand-blue AI shortcut shown at the right edge of search bars.
///
/// Opens the [AiAgentScreen] shopping assistant. This replaces the old
/// "AI" tab that used to live in the bottom navigation bar.
class AiSearchButton extends StatelessWidget {
  const AiSearchButton({super.key, this.size = 38});

  /// Diameter of the circular button.
  final double size;

  @override
  Widget build(BuildContext context) {
    return InkResponse(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const AiAgentScreen()),
      ),
      radius: size * 0.7,
      child: SizedBox(
        width: size,
        height: size,
        child: Icon(
          IconsaxPlusBold.magic_star,
          size: size * 0.6,
          color: AppColors.primary,
        ),
      ),
    );
  }
}
