import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../theme/app_colors.dart';

class PoliciesScreen extends StatelessWidget {
  const PoliciesScreen({super.key});

  static const _ink = Color(0xFF1F2937);
  static const _websiteUrl = 'https://www.mercurycomputerslimited.com';

  static void _launchWebsite() async {
    final uri = Uri.parse(_websiteUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  static const _sections = <(String, String)>[
    (
      'Privacy Policy',
      'Mercury Computers Limited respects your privacy. We collect only the information needed to process your orders, deliver products, and provide support — such as your name, contact details, and delivery location. We never sell your personal data to third parties. Your information is stored securely and used strictly to serve you better.',
    ),
    (
      'Data & Security',
      'We use industry-standard security measures to protect your account and personal information. Payment for orders is handled on delivery or at pickup, so no card details are stored in the app. You may request deletion of your account and associated data at any time from Privacy & Security settings.',
    ),
    (
      'Returns & Exchanges',
      'Products may be returned or exchanged within 7 days of purchase if they are faulty, damaged, or not as described. Items must be in their original condition and packaging. To start a return, contact our support team with your order details. Refunds are processed once the returned item is inspected.',
    ),
    (
      'Warranty',
      'Most products carry a manufacturer warranty. Warranty periods vary by product and brand — details are listed on each product page where available. Warranty covers manufacturing defects and does not cover physical or liquid damage caused after purchase.',
    ),
    (
      'Terms of Service',
      'By using the Mercury Computers app, you agree to provide accurate information and use the service lawfully. Prices are subject to change and product availability is not guaranteed until an order is confirmed. We reserve the right to cancel orders in cases of pricing errors or stock unavailability.',
    ),
  ];

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
                      child: Text('Policies', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: _ink)),
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
                  for (final s in _sections) ...[
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(18),
                      margin: const EdgeInsets.only(bottom: 14),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(s.$1, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: _ink)),
                          const SizedBox(height: 8),
                          Text(s.$2, style: const TextStyle(fontSize: 13.5, height: 1.6, color: AppColors.inactive)),
                          const SizedBox(height: 10),
                          InkWell(
                            onTap: _launchWebsite,
                            borderRadius: BorderRadius.circular(6),
                            child: const Padding(
                              padding: EdgeInsets.symmetric(vertical: 2),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    'Read more',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  SizedBox(width: 4),
                                  Icon(Icons.arrow_outward, size: 14, color: AppColors.primary),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 8),
                  const Center(
                    child: Text(
                      'Mercury Computers Limited\nKampala, Uganda',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF), height: 1.5),
                    ),
                  ),
                ],
              ),
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
