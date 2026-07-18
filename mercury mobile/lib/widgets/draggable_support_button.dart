import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:iconsax_plus/iconsax_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../theme/app_colors.dart';

/// WhatsApp brand green.
const Color _whatsappGreen = Color(0xFF25D366);

void _launchUrl(String url) async {
  final uri = Uri.parse(url);
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

/// A floating, draggable customer-service shortcut that can be moved anywhere
/// on screen. It snaps to the nearest horizontal edge when released and stays
/// within safe bounds. Tapping it opens the support entry point.
class DraggableSupportButton extends StatefulWidget {
  const DraggableSupportButton({
    super.key,
    this.size = 56,
    this.margin = 12,
    this.onPressed,
    this.navigatorKey,
  });

  /// Diameter of the button.
  final double size;

  /// Minimum distance kept from the screen edges.
  final double margin;

  /// Called when the button is tapped (not dragged).
  final VoidCallback? onPressed;

  /// When hosted above the app's [Navigator] (e.g. in `MaterialApp.builder`),
  /// provide the app navigator key so the support sheet can be shown.
  final GlobalKey<NavigatorState>? navigatorKey;

  @override
  State<DraggableSupportButton> createState() => _DraggableSupportButtonState();
}

class _DraggableSupportButtonState extends State<DraggableSupportButton> {
  Offset? _position;

  @override
  Widget build(BuildContext context) {
    final media = MediaQuery.of(context);
    final screen = media.size;
    final padding = media.padding;
    final size = widget.size;

    // Bounds the button can occupy, accounting for safe areas + margin.
    final minX = widget.margin;
    final maxX = screen.width - size - widget.margin;
    final minY = padding.top + widget.margin;
    final maxY = screen.height - padding.bottom - size - widget.margin;

    // Default to the right edge, a bit above vertical center.
    final position = _position ??= Offset(maxX, screen.height * 0.62);
    final clamped = Offset(
      position.dx.clamp(minX, maxX),
      position.dy.clamp(minY, maxY),
    );

    return Positioned(
      left: clamped.dx,
      top: clamped.dy,
      child: GestureDetector(
        onPanUpdate: (details) {
          setState(() {
            _position = Offset(
              (clamped.dx + details.delta.dx).clamp(minX, maxX),
              (clamped.dy + details.delta.dy).clamp(minY, maxY),
            );
          });
        },
        onPanEnd: (_) {
          // Snap to whichever horizontal edge is closer.
          final current = _position ?? clamped;
          final snapX = current.dx < (minX + maxX) / 2 ? minX : maxX;
          setState(() => _position = Offset(snapX, current.dy));
        },
        child: Material(
          color: _whatsappGreen,
          shape: const CircleBorder(),
          elevation: 6,
          shadowColor: Colors.black45,
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: widget.onPressed ?? () => _showSupportSheet(context),
            child: SizedBox(
              width: size,
              height: size,
              child: const Center(
                child: FaIcon(
                  FontAwesomeIcons.whatsapp,
                  color: Colors.white,
                  size: 30,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showSupportSheet(BuildContext context) {
    // Prefer the app navigator's context (set when hosted above the
    // Navigator); fall back to the local context otherwise.
    final sheetContext = widget.navigatorKey?.currentContext ?? context;
    showModalBottomSheet<void>(
      context: sheetContext,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE2E8F0),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  'Customer support',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1F2937),
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  "We're here to help. How would you like to reach us?",
                  style: TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
                ),
                const SizedBox(height: 16),
                _SupportTile(
                  icon: Icons.chat_bubble_outline,
                  label: 'WhatsApp (0707749501)',
                  iconColor: _whatsappGreen,
                  onTap: () {
                    Navigator.of(context).pop();
                    _launchUrl('https://wa.me/256707749501?text=Hi!%20I%20need%20help.');
                  },
                ),
                _SupportTile(
                  icon: Icons.chat_bubble_outline,
                  label: 'WhatsApp (0704823800)',
                  iconColor: _whatsappGreen,
                  onTap: () {
                    Navigator.of(context).pop();
                    _launchUrl('https://wa.me/256704823800?text=Hi!%20I%20need%20help.');
                  },
                ),
                _SupportTile(
                  icon: IconsaxPlusBold.call,
                  label: 'Call 0707749501',
                  onTap: () {
                    Navigator.of(context).pop();
                    _launchUrl('tel:0707749501');
                  },
                ),
                _SupportTile(
                  icon: IconsaxPlusBold.sms,
                  label: 'Email support',
                  onTap: () {
                    Navigator.of(context).pop();
                    _launchUrl('mailto:customercare@mercurycomputerslimited.com');
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _SupportTile extends StatelessWidget {
  const _SupportTile({
    required this.icon,
    required this.label,
    required this.onTap,
    this.iconColor,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: iconColor ?? AppColors.primary, size: 20),
            ),
            const SizedBox(width: 14),
            Text(
              label,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1F2937),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
