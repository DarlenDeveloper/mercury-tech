import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/ai_agent_service.dart';
import '../data/catalog_scope.dart';
import '../models/product.dart';
import '../theme/app_colors.dart';
import '../widgets/product_card.dart';

/// A chat message in the shopping assistant conversation.
class _Message {
  const _Message(this.text, {required this.fromUser});
  final String text;
  final bool fromUser;
}

/// AI shopping assistant powered by the Mercury Gemini Cloud Function.
class AiAgentScreen extends StatefulWidget {
  const AiAgentScreen({super.key});

  @override
  State<AiAgentScreen> createState() => _AiAgentScreenState();
}

class _AiAgentScreenState extends State<AiAgentScreen> {
  static const _ink = Color(0xFF1F2937);

  static const _suggestions = <String>[
    'Gaming laptop under USh 3M',
    'Cheap printer under USh 200K',
  ];

  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final List<_Message> _messages = [];
  bool _sending = false;
  bool _aiMode = true;

  bool get _hasConversation => _messages.isNotEmpty;

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _send(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _sending) return;

    if (!_aiMode) {
      Navigator.of(context).maybePop();
      return;
    }

    setState(() {
      _messages.add(_Message(trimmed, fromUser: true));
      _controller.clear();
      _sending = true;
    });
    _scrollToBottom();

    final history = <Map<String, String>>[];
    for (int i = 0; i < _messages.length - 1; i++) {
      final m = _messages[i];
      history.add(<String, String>{
        'role': m.fromUser ? 'user' : 'assistant',
        'content': m.text,
      });
    }

    final reply = await AiAgentService.instance.ask(trimmed, history);

    if (!mounted) return;
    setState(() {
      _messages.add(_Message(reply, fromUser: false));
      _sending = false;
    });
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FB),
      body: SafeArea(
        top: false,
        bottom: false,
        child: Column(
          children: [
            SizedBox(height: MediaQuery.of(context).padding.top),
            // Top bar
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 8, 8, 0),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(IconsaxPlusLinear.arrow_left_2),
                    color: _ink,
                    onPressed: () => Navigator.of(context).maybePop(),
                  ),
                  const Spacer(),
                  // New chat button
                  if (_hasConversation)
                    IconButton(
                      icon: const Icon(IconsaxPlusLinear.add),
                      color: _ink,
                      onPressed: () => setState(() {
                        _messages.clear();
                        _controller.clear();
                      }),
                      tooltip: 'New chat',
                    ),
                ],
              ),
            ),
            Expanded(
              child: _hasConversation
                  ? ListView(
                      controller: _scrollController,
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                      children: [
                        for (final m in _messages)
                          _MessageBubble(message: m),
                        if (_sending) const _TypingIndicator(),
                      ],
                    )
                  : const _GreetingHero(),
            ),
            if (!_hasConversation)
              _SuggestionRow(suggestions: _suggestions, onTap: _send),
            _Composer(
              controller: _controller,
              aiMode: _aiMode,
              sending: _sending,
              onModeChanged: (v) => setState(() => _aiMode = v),
              onSend: () => _send(_controller.text),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Greeting ────────────────────────────────────────────────────────────────

class _GreetingHero extends StatelessWidget {
  const _GreetingHero();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 36),
        child: Text(
          'Hey there, what are you\nlooking for today?',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 26,
            height: 1.25,
            fontWeight: FontWeight.w700,
            color: _AiAgentScreenState._ink,
          ),
        ),
      ),
    );
  }
}

// ─── Message Bubble (with markdown + product cards) ──────────────────────────

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});
  final _Message message;

  @override
  Widget build(BuildContext context) {
    if (message.fromUser) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Flexible(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(18),
                    topRight: Radius.circular(18),
                    bottomLeft: Radius.circular(18),
                    bottomRight: Radius.circular(4),
                  ),
                ),
                child: Text(
                  message.text,
                  style: const TextStyle(fontSize: 14, height: 1.35, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      );
    }

    // AI message: parse product tags + markdown
    final parsed = _parseMessage(message.text);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Text bubble
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(18),
                topRight: Radius.circular(18),
                bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(18),
              ),
            ),
            child: _MarkdownText(text: parsed.cleanText),
          ),
          // Product cards (horizontal scroll)
          if (parsed.productIds.isNotEmpty)
            _ProductCardsRow(productIds: parsed.productIds),
        ],
      ),
    );
  }
}

// ─── Markdown text rendering ─────────────────────────────────────────────────

class _MarkdownText extends StatelessWidget {
  const _MarkdownText({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    // Parse **bold** and * bullet points
    final spans = <InlineSpan>[];
    final regex = RegExp(r'\*\*([^*]+)\*\*');
    int lastEnd = 0;

    for (final match in regex.allMatches(text)) {
      if (match.start > lastEnd) {
        spans.add(TextSpan(text: text.substring(lastEnd, match.start)));
      }
      spans.add(TextSpan(
        text: match.group(1),
        style: const TextStyle(fontWeight: FontWeight.w700),
      ));
      lastEnd = match.end;
    }
    if (lastEnd < text.length) {
      spans.add(TextSpan(text: text.substring(lastEnd)));
    }

    return RichText(
      text: TextSpan(
        style: const TextStyle(
          fontSize: 14,
          height: 1.4,
          color: _AiAgentScreenState._ink,
        ),
        children: spans,
      ),
    );
  }
}

// ─── Product cards row ───────────────────────────────────────────────────────

class _ProductCardsRow extends StatelessWidget {
  const _ProductCardsRow({required this.productIds});
  final List<String> productIds;

  @override
  Widget build(BuildContext context) {
    final allProducts = CatalogScope.of(context).products;
    final products = <Product>[];
    for (final id in productIds) {
      final match = allProducts.where((p) => p.id == id).toList();
      if (match.isNotEmpty) products.add(match.first);
    }
    if (products.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: SizedBox(
        height: 200,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: products.length,
          separatorBuilder: (_, __) => const SizedBox(width: 10),
          itemBuilder: (context, i) => SizedBox(
            width: 155,
            child: ProductCard(product: products[i]),
          ),
        ),
      ),
    );
  }
}

// ─── Parse [[id:...]] tags ───────────────────────────────────────────────────

class _ParsedMessage {
  const _ParsedMessage(this.cleanText, this.productIds);
  final String cleanText;
  final List<String> productIds;
}

_ParsedMessage _parseMessage(String text) {
  final ids = <String>[];
  final clean = text
      .replaceAllMapped(RegExp(r'\[\[id:([^\]]+)\]\]'), (m) {
        final id = m.group(1)?.trim() ?? '';
        if (id.isNotEmpty && !ids.contains(id)) ids.add(id);
        return '';
      })
      .replaceAll(RegExp(r'[ \t]+\n'), '\n')
      .replaceAll(RegExp(r'\n{3,}'), '\n\n')
      .trim();
  return _ParsedMessage(clean, ids);
}

// ─── Typing indicator ────────────────────────────────────────────────────────

class _TypingIndicator extends StatelessWidget {
  const _TypingIndicator();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18).copyWith(
                bottomLeft: const Radius.circular(4),
              ),
            ),
            child: const SizedBox(
              width: 40,
              height: 10,
              child: _AnimatedDots(),
            ),
          ),
        ],
      ),
    );
  }
}

class _AnimatedDots extends StatefulWidget {
  const _AnimatedDots();
  @override
  State<_AnimatedDots> createState() => _AnimatedDotsState();
}

class _AnimatedDotsState extends State<_AnimatedDots>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) => Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: List.generate(3, (i) {
          final offset = (_ctrl.value * 3 - i).clamp(0.0, 1.0);
          final opacity = 0.3 + 0.7 * (1 - (offset - 0.5).abs() * 2).clamp(0.0, 1.0);
          return Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: Colors.grey.withValues(alpha: opacity),
              shape: BoxShape.circle,
            ),
          );
        }),
      ),
    );
  }
}

// ─── Suggestions ─────────────────────────────────────────────────────────────

class _SuggestionRow extends StatelessWidget {
  const _SuggestionRow({required this.suggestions, required this.onTap});
  final List<String> suggestions;
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
      child: Row(
        children: [
          for (final s in suggestions) ...[
            Expanded(
              child: GestureDetector(
                onTap: () => onTap(s),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F2F4),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Text(
                    s,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12.5, height: 1.25, color: Color(0xFF4B5563)),
                  ),
                ),
              ),
            ),
            if (s != suggestions.last) const SizedBox(width: 12),
          ],
        ],
      ),
    );
  }
}

// ─── Composer ────────────────────────────────────────────────────────────────

class _Composer extends StatelessWidget {
  const _Composer({
    required this.controller,
    required this.aiMode,
    required this.sending,
    required this.onModeChanged,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool aiMode;
  final bool sending;
  final ValueChanged<bool> onModeChanged;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
        20, 0, 20, MediaQuery.of(context).padding.bottom + 20,
      ),
      child: Container(
        padding: const EdgeInsets.fromLTRB(18, 14, 12, 12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(26),
          border: Border.all(color: const Color(0xFFE5E7EB)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: controller,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => onSend(),
              decoration: const InputDecoration(
                hintText: 'Start searching',
                hintStyle: TextStyle(color: Color(0xFF9CA3AF), fontSize: 15),
                border: InputBorder.none,
                isCollapsed: true,
              ),
              style: const TextStyle(fontSize: 15),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                _ModeChip(label: 'AI mode', selected: aiMode, onTap: () => onModeChanged(true)),
                const SizedBox(width: 6),
                _ModeChip(label: 'Standard', selected: !aiMode, onTap: () => onModeChanged(false)),
                const Spacer(),
                GestureDetector(
                  onTap: sending ? null : onSend,
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: sending ? const Color(0xFF9CA3AF) : _AiAgentScreenState._ink,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.arrow_upward_rounded, size: 20, color: Colors.white),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ModeChip extends StatelessWidget {
  const _ModeChip({required this.label, required this.selected, required this.onTap});
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isAi = label == 'AI mode';
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? AppColors.surface : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? const Color(0xFFE5E7EB) : Colors.transparent,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isAi)
              Container(
                width: 16, height: 16,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                    colors: [Color(0xFFFFB053), AppColors.accent],
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
              )
            else
              const Icon(IconsaxPlusLinear.search_normal, size: 16, color: Color(0xFF6B7280)),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: selected ? _AiAgentScreenState._ink : const Color(0xFF6B7280),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
