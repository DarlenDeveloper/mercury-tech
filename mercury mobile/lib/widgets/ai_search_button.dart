import 'package:flutter/material.dart';

import '../screens/ai_agent_screen.dart';

/// Brand AI shortcut shown at the right edge of search bars.
/// Opens the [AiAgentScreen] shopping assistant.
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
        child: Center(
          child: Image.asset(
            'assets/images/ai-icon.png',
            width: size * 0.6,
            height: size * 0.6,
            fit: BoxFit.contain,
          ),
        ),
      ),
    );
  }
}
