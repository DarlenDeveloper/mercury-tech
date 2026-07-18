import 'package:flutter/material.dart';

import '../data/auth_scope.dart';
import '../data/user_repository.dart';
import '../theme/app_colors.dart';

class NotificationsSettingsScreen extends StatefulWidget {
  const NotificationsSettingsScreen({super.key});

  @override
  State<NotificationsSettingsScreen> createState() => _NotificationsSettingsScreenState();
}

class _NotificationsSettingsScreenState extends State<NotificationsSettingsScreen> {
  static const _ink = Color(0xFF1F2937);

  final _repo = UserRepository();
  bool _loading = true;

  // key -> (title, subtitle)
  static const _options = <(String, String, String)>[
    ('orderUpdates', 'Order Updates', 'Status of your orders and deliveries'),
    ('promotions', 'Promotions & Offers', 'Deals, discounts and new arrivals'),
    ('repairUpdates', 'Repair Updates', 'Progress on your repair tickets'),
    ('quoteReplies', 'Quotation Replies', 'When we respond to your quote requests'),
    ('supportMessages', 'Support Messages', 'Replies from customer care'),
  ];

  final Map<String, bool> _prefs = {};

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_loading) _load();
  }

  Future<void> _load() async {
    final uid = AuthScope.of(context).user?.uid;
    if (uid == null) {
      setState(() => _loading = false);
      return;
    }
    final stored = await _repo.getNotificationPrefs(uid);
    if (!mounted) return;
    setState(() {
      for (final o in _options) {
        _prefs[o.$1] = stored[o.$1] ?? true; // default on
      }
      _loading = false;
    });
  }

  Future<void> _toggle(String key, bool value) async {
    setState(() => _prefs[key] = value);
    final uid = AuthScope.of(context).user?.uid;
    if (uid != null) {
      await _repo.setNotificationPref(uid, key, value);
    }
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
                      child: Text('Notifications', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: _ink)),
                    ),
                  ),
                  const SizedBox(width: 40),
                ],
              ),
            ),
            Expanded(
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : ListView(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 40),
                      children: [
                        Container(
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)),
                          child: Column(
                            children: [
                              for (var i = 0; i < _options.length; i++) ...[
                                _ToggleRow(
                                  title: _options[i].$2,
                                  subtitle: _options[i].$3,
                                  value: _prefs[_options[i].$1] ?? true,
                                  onChanged: (v) => _toggle(_options[i].$1, v),
                                ),
                                if (i != _options.length - 1)
                                  const Divider(height: 1, thickness: 1, indent: 16, endIndent: 16, color: Color(0xFFF3F4F6)),
                              ],
                            ],
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

class _ToggleRow extends StatelessWidget {
  const _ToggleRow({required this.title, required this.subtitle, required this.value, required this.onChanged});
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF1F2937))),
                const SizedBox(height: 2),
                Text(subtitle, style: const TextStyle(fontSize: 12.5, color: AppColors.inactive)),
              ],
            ),
          ),
          Switch.adaptive(
            value: value,
            activeTrackColor: AppColors.primary,
            onChanged: onChanged,
          ),
        ],
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
