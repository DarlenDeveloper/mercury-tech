import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/auth_scope.dart';
import '../theme/app_colors.dart';

const _statusLabels = {
  'received': 'Received',
  'in_progress': 'In Progress',
  'awaiting_parts': 'Awaiting Parts',
  'completed': 'Completed',
};

const _statusColors = {
  'received': Color(0xFF6B7280),
  'in_progress': Color(0xFF1f3e97),
  'awaiting_parts': Color(0xFFB45309),
  'completed': Color(0xFF16A34A),
};

// ─── Repairs List Screen ─────────────────────────────────────────────────────

class RepairsScreen extends StatelessWidget {
  const RepairsScreen({super.key});

  static const _ink = Color(0xFF1F2937);

  @override
  Widget build(BuildContext context) {
    final uid = AuthScope.of(context).user?.uid;
    final topPadding = MediaQuery.of(context).padding.top;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      body: Column(
        children: [
          SizedBox(height: topPadding),
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 12, 8, 0),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(IconsaxPlusLinear.arrow_left_2),
                  color: _ink,
                  onPressed: () => Navigator.pop(context),
                ),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Repairs & Services',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: _ink),
                  ),
                ),
                // Plus button
                IconButton(
                  icon: const Icon(IconsaxPlusLinear.add),
                  color: _ink,
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const _NewRepairScreen()),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Tickets list
          Expanded(
            child: uid == null
                ? const Center(child: Text('Sign in to view your repairs', style: TextStyle(color: AppColors.inactive)))
                : StreamBuilder<QuerySnapshot>(
                    stream: FirebaseFirestore.instance
                        .collection('repair_tickets')
                        .where('userId', isEqualTo: uid)
                        .orderBy('createdAt', descending: true)
                        .snapshots(),
                    builder: (context, snap) {
                      if (snap.connectionState == ConnectionState.waiting) {
                        return const Center(child: CircularProgressIndicator());
                      }
                      final docs = snap.data?.docs ?? [];
                      if (docs.isEmpty) {
                        return Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(IconsaxPlusLinear.cpu_setting, size: 48, color: AppColors.inactive.withValues(alpha: 0.3)),
                              const SizedBox(height: 12),
                              const Text('No repair tickets', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: _ink)),
                              const SizedBox(height: 4),
                              const Text('Tap + to submit a repair request', style: TextStyle(fontSize: 13, color: AppColors.inactive)),
                            ],
                          ),
                        );
                      }
                      return ListView.separated(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
                        itemCount: docs.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (_, i) => _TicketCard(data: docs[i].data() as Map<String, dynamic>),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _TicketCard extends StatelessWidget {
  const _TicketCard({required this.data});
  final Map<String, dynamic> data;

  static const _ink = Color(0xFF1F2937);

  @override
  Widget build(BuildContext context) {
    final status = data['status'] as String? ?? 'received';
    final device = data['device'] as String? ?? '';
    final deviceType = data['deviceType'] as String? ?? '';
    final issue = data['issue'] as String? ?? '';
    final urgency = data['urgency'] as String? ?? '';
    final technician = data['technician'] as String? ?? '';
    final createdAt = data['createdAt'] as Timestamp?;
    final date = createdAt?.toDate();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(device, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: _ink)),
                    if (deviceType.isNotEmpty)
                      Text(deviceType, style: const TextStyle(fontSize: 12, color: AppColors.inactive)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: (_statusColors[status] ?? AppColors.inactive).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _statusLabels[status] ?? status,
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: _statusColors[status] ?? AppColors.inactive),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(issue, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, color: AppColors.inactive)),
          const SizedBox(height: 10),
          Row(
            children: [
              if (urgency.isNotEmpty) ...[
                Icon(IconsaxPlusLinear.warning_2, size: 14, color: urgency == 'High' ? const Color(0xFFE53935) : AppColors.inactive),
                const SizedBox(width: 4),
                Text(urgency, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: urgency == 'High' ? const Color(0xFFE53935) : AppColors.inactive)),
                const SizedBox(width: 12),
              ],
              if (technician.isNotEmpty) ...[
                const Icon(IconsaxPlusLinear.user, size: 14, color: AppColors.inactive),
                const SizedBox(width: 4),
                Text(technician, style: const TextStyle(fontSize: 11, color: AppColors.inactive)),
              ],
              const Spacer(),
              if (date != null)
                Text('${date.day}/${date.month}/${date.year}', style: const TextStyle(fontSize: 11, color: AppColors.inactive)),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── New Repair Request Screen ───────────────────────────────────────────────

class _NewRepairScreen extends StatefulWidget {
  const _NewRepairScreen();

  @override
  State<_NewRepairScreen> createState() => _NewRepairScreenState();
}

class _NewRepairScreenState extends State<_NewRepairScreen> {
  static const _ink = Color(0xFF1F2937);

  final _deviceCtrl = TextEditingController();
  final _issueCtrl = TextEditingController();
  String _deviceType = 'Laptop';
  String _urgency = 'Normal';
  int _quantity = 1;
  DateTime? _availableDate;
  bool _busy = false;

  static const _deviceTypes = ['Laptop', 'Desktop', 'Printer', 'Monitor', 'UPS', 'Networking', 'Phone', 'Other'];
  static const _urgencyLevels = ['Low', 'Normal', 'High'];

  @override
  void dispose() {
    _deviceCtrl.dispose();
    _issueCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_deviceCtrl.text.trim().isEmpty || _issueCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in device and issue'), behavior: SnackBarBehavior.floating),
      );
      return;
    }

    final user = AuthScope.of(context).user;
    if (user == null) return;

    setState(() => _busy = true);

    await FirebaseFirestore.instance.collection('repair_tickets').add({
      'userId': user.uid,
      'userName': user.displayName ?? '',
      'userEmail': user.email ?? '',
      'userPhone': '',
      'device': _deviceCtrl.text.trim(),
      'deviceType': _deviceType,
      'issue': _issueCtrl.text.trim(),
      'urgency': _urgency,
      'quantity': _quantity,
      'availableDate': _availableDate != null ? Timestamp.fromDate(_availableDate!) : null,
      'service': 'Repair',
      'status': 'received',
      'technician': '',
      'notes': '',
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    });

    if (!mounted) return;
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Repair request submitted!'), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;

    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          SizedBox(height: topPadding),
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 12, 16, 0),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.close),
                  color: _ink,
                  onPressed: () => Navigator.pop(context),
                ),
                const SizedBox(width: 8),
                const Text('New Repair Request', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: _ink)),
              ],
            ),
          ),

          // Form
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
              children: [
                // Device name
                _Label('Device'),
                const SizedBox(height: 6),
                _InputField(controller: _deviceCtrl, hint: 'e.g. HP ProBook 450 G8'),

                const SizedBox(height: 20),

                // Device type chips
                _Label('Type'),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _deviceTypes.map((t) {
                    final selected = _deviceType == t;
                    return GestureDetector(
                      onTap: () => setState(() => _deviceType = t),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: selected ? _ink : Colors.transparent,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: selected ? _ink : const Color(0xFFE5E7EB)),
                        ),
                        child: Text(t, style: TextStyle(
                          fontSize: 13, fontWeight: FontWeight.w500,
                          color: selected ? Colors.white : _ink,
                        )),
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 20),

                // Issue description
                _Label('Issue Description'),
                const SizedBox(height: 6),
                TextField(
                  controller: _issueCtrl,
                  maxLines: 4,
                  decoration: InputDecoration(
                    hintText: 'Describe the problem in detail...',
                    hintStyle: const TextStyle(color: AppColors.inactive, fontSize: 14),
                    filled: true,
                    fillColor: const Color(0xFFF9FAFB),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: AppColors.primary)),
                  ),
                ),

                const SizedBox(height: 20),

                // Urgency
                _Label('Urgency'),
                const SizedBox(height: 8),
                Row(
                  children: _urgencyLevels.map((u) {
                    final selected = _urgency == u;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: GestureDetector(
                        onTap: () => setState(() => _urgency = u),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: selected ? _ink : Colors.transparent,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: selected ? _ink : const Color(0xFFE5E7EB)),
                          ),
                          child: Text(u, style: TextStyle(
                            fontSize: 13, fontWeight: FontWeight.w500,
                            color: selected ? Colors.white : _ink,
                          )),
                        ),
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 20),

                // Quantity
                _Label('Quantity'),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _CounterButton(icon: Icons.remove, onTap: () { if (_quantity > 1) setState(() => _quantity--); }),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text('$_quantity', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: _ink)),
                    ),
                    _CounterButton(icon: Icons.add, onTap: () => setState(() => _quantity++)),
                  ],
                ),

                const SizedBox(height: 20),

                // Available date
                _Label('Date of Availability'),
                const SizedBox(height: 6),
                GestureDetector(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: DateTime.now(),
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 90)),
                    );
                    if (picked != null) setState(() => _availableDate = picked);
                  },
                  child: Container(
                    height: 48,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF9FAFB),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            _availableDate != null
                                ? '${_availableDate!.day}/${_availableDate!.month}/${_availableDate!.year}'
                                : 'Select date',
                            style: TextStyle(fontSize: 14, color: _availableDate != null ? _ink : AppColors.inactive),
                          ),
                        ),
                        const Icon(IconsaxPlusLinear.calendar_1, size: 20, color: AppColors.inactive),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Submit button
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _busy ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _ink,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                    disabledBackgroundColor: _ink.withValues(alpha: 0.5),
                  ),
                  child: Text(
                    _busy ? 'Submitting...' : 'Submit Request',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Label extends StatelessWidget {
  const _Label(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1F2937)));
  }
}

class _InputField extends StatelessWidget {
  const _InputField({required this.controller, required this.hint});
  final TextEditingController controller;
  final String hint;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: AppColors.inactive, fontSize: 14),
        filled: true,
        fillColor: const Color(0xFFF9FAFB),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: AppColors.primary)),
      ),
    );
  }
}

class _CounterButton extends StatelessWidget {
  const _CounterButton({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36, height: 36,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        child: Icon(icon, size: 18, color: const Color(0xFF1F2937)),
      ),
    );
  }
}
