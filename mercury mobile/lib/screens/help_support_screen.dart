import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:iconsax_plus/iconsax_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../theme/app_colors.dart';

const Color _whatsappGreen = Color(0xFF25D366);

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  static const _ink = Color(0xFF1F2937);

  static const _faqs = [
    (
      'How long does delivery take?',
      'Orders within Kampala are typically delivered within 24 hours. Upcountry deliveries take 2-3 business days.',
    ),
    (
      'What payment methods do you accept?',
      'We accept Cash on Delivery and Pickup from Store. Payment is made when you receive or collect your order.',
    ),
    (
      'Can I return a product?',
      'Yes. Products can be returned within 7 days of purchase if they are faulty or not as described. Contact support to start a return.',
    ),
    (
      'Do you offer repairs?',
      'Yes, we offer repair and maintenance services for computers, printers, and other devices. Book a repair from the Repairs & Services section.',
    ),
    (
      'How do I request a quotation?',
      'Open any product and tap "Request Quote", or request a quote for multiple items from your cart at checkout.',
    ),
  ];

  static void _launch(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _showWhatsAppPicker(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(child: Container(width: 36, height: 4, decoration: BoxDecoration(color: const Color(0xFFE2E8F0), borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 16),
              const Text('Choose a number', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: _ink)),
              const SizedBox(height: 8),
              _waTile(ctx, '0707 749 501', '256707749501'),
              _waTile(ctx, '0704 823 800', '256704823800'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _waTile(BuildContext ctx, String label, String number) {
    return ListTile(
      leading: Container(
        width: 40, height: 40,
        decoration: BoxDecoration(color: _whatsappGreen.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
        child: const FaIcon(FontAwesomeIcons.whatsapp, color: _whatsappGreen, size: 20),
      ),
      title: Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
      onTap: () {
        Navigator.pop(ctx);
        _launch('https://wa.me/$number?text=Hi!%20I%20need%20help.');
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              child: Row(
                children: [
                  _CircleBack(onTap: () => Navigator.of(context).maybePop()),
                  const Expanded(
                    child: Center(
                      child: Text('Help & Support', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: _ink)),
                    ),
                  ),
                  const SizedBox(width: 40),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 40),
                children: [
                  const Text('Contact us', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: _ink)),
                  const SizedBox(height: 12),
                  _ContactCard(
                    icon: const FaIcon(FontAwesomeIcons.whatsapp, color: _whatsappGreen, size: 20),
                    iconColor: _whatsappGreen,
                    title: 'WhatsApp',
                    subtitle: 'Chat with us instantly',
                    onTap: () => _showWhatsAppPicker(context),
                  ),
                  const SizedBox(height: 10),
                  _ContactCard(
                    icon: const Icon(IconsaxPlusBold.call, color: AppColors.primary, size: 22),
                    iconColor: AppColors.primary,
                    title: 'Call us',
                    subtitle: '0707 749 501',
                    onTap: () => _launch('tel:0707749501'),
                  ),
                  const SizedBox(height: 10),
                  _ContactCard(
                    icon: const Icon(IconsaxPlusBold.sms, color: AppColors.accent, size: 22),
                    iconColor: AppColors.accent,
                    title: 'Email',
                    subtitle: 'customercare@mercurycomputerslimited.com',
                    onTap: () => _launch('mailto:customercare@mercurycomputerslimited.com'),
                  ),
                  const SizedBox(height: 28),
                  const Text('Frequently asked questions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: _ink)),
                  const SizedBox(height: 12),
                  ..._faqs.map((f) => _FaqTile(question: f.$1, answer: f.$2)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ContactCard extends StatelessWidget {
  const _ContactCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final Widget icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(color: iconColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                alignment: Alignment.center,
                child: icon,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF1F2937))),
                    const SizedBox(height: 2),
                    Text(subtitle, style: const TextStyle(fontSize: 12.5, color: AppColors.inactive), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.inactive, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _FaqTile extends StatefulWidget {
  const _FaqTile({required this.question, required this.answer});
  final String question;
  final String answer;

  @override
  State<_FaqTile> createState() => _FaqTileState();
}

class _FaqTileState extends State<_FaqTile> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(14))),
          collapsedShape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(14))),
          onExpansionChanged: (v) => setState(() => _expanded = v),
          trailing: Icon(_expanded ? Icons.remove : Icons.add, size: 20, color: AppColors.inactive),
          title: Text(widget.question, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1F2937))),
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: Text(widget.answer, style: const TextStyle(fontSize: 13.5, height: 1.5, color: AppColors.inactive)),
            ),
          ],
        ),
      ),
    );
  }
}

class _CircleBack extends StatelessWidget {
  const _CircleBack({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      customBorder: const CircleBorder(),
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: const Color(0xFFE5E7EB))),
        child: const Icon(Icons.arrow_back_ios_new, size: 16),
      ),
    );
  }
}
