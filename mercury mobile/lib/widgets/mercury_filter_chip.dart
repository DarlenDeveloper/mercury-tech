import 'package:flutter/material.dart';

/// App-wide filter chip: a small white pill with a circular colored avatar
/// (image or icon) on the left and a label on the right.
class MercuryFilterChip extends StatelessWidget {
  const MercuryFilterChip({
    super.key,
    required this.label,
    required this.accent,
    required this.onTap,
    this.icon,
    this.image,
  });

  final String label;
  final Color accent;
  final VoidCallback onTap;
  final IconData? icon;
  final String? image;

  static const _ink = Color(0xFF1F2937);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.fromLTRB(4, 4, 14, 4),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: accent,
                shape: BoxShape.circle,
              ),
              clipBehavior: Clip.antiAlias,
              child: image != null
                  ? Image.asset(image!, fit: BoxFit.cover)
                  : Icon(icon, size: 15, color: Colors.white),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: _ink,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
