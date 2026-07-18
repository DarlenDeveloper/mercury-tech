import 'dart:async';

import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/ai_agent_service.dart';
import '../data/auth_scope.dart';
import '../data/catalog_scope.dart';
import '../data/support_service.dart';
import '../models/product.dart';
import '../theme/app_colors.dart';
import '../widgets/product_card.dart';
import 'auth_flow.dart';

/// AI shopping assistant powered by the Mercury Gemini Cloud Function.
/// Backed by Firestore `support_conversations` — mirrors the web implementation.
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
  final _scaffoldKey = GlobalKey<ScaffoldState>();
  bool _sending = false;
  bool _aiMode = true;

  // Firestore-backed conversation state (mirrors web)
  String? _activeId;
  SupportConversation? _conversation;
  List<SupportConversation> _chats = [];
  StreamSubscription? _conversationSub;

  List<SupportMessage> get _messages => _conversation?.messages ?? [];
  bool get _hasConversation => _messages.isNotEmpty;
  bool get _intervened => _conversation?.intervened ?? false;

  @override
  void initState() {
    super.initState();
    _refreshChats();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    _conversationSub?.cancel();
    super.dispose();
  }

  // ─── Firestore helpers (mirroring web) ──────────────────────────────────────

  Future<void> _refreshChats() async {
    final user = AuthScope.of(context).user;
    if (user == null || user.isAnonymous) return;
    try {
      final convs = await SupportService.instance.listMyConversations(user.uid);
      if (mounted) setState(() => _chats = convs);
    } catch (_) {}
  }

  void _watchConversation(String convId) {
    _conversationSub?.cancel();
    _conversationSub = SupportService.instance.watchConversation(convId).listen((conv) {
      if (conv != null && mounted) {
        setState(() => _conversation = conv);
        _scrollToBottom();
      }
    });
  }

  void _startNewChat() {
    _conversationSub?.cancel();
    setState(() {
      _activeId = null;
      _conversation = null;
      _controller.clear();
    });
  }

  void _openChat(SupportConversation conv) {
    setState(() {
      _activeId = conv.id;
      _conversation = conv;
    });
    _watchConversation(conv.id);
    _scaffoldKey.currentState?.closeEndDrawer();
  }

  void _openHistory() {
    _refreshChats();
    _scaffoldKey.currentState?.openEndDrawer();
  }

  // ─── Send message ───────────────────────────────────────────────────────────

  Future<void> _send(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _sending) return;

    // Auth gate — require sign in
    final user = AuthScope.of(context).user;
    if (user == null || user.isAnonymous) {
      await requireAccount(context, reason: 'Sign in to use the AI assistant.');
      if (!mounted) return;
      final u = AuthScope.of(context).user;
      if (u == null || u.isAnonymous) return;
    }

    if (!_aiMode) {
      // Standard mode — just pop back (search handled elsewhere)
      Navigator.of(context).maybePop();
      return;
    }

    setState(() {
      _controller.clear();
      _sending = true;
    });

    final currentUser = AuthScope.of(context).user!;
    final userMsg = SupportMessage(
      role: 'user',
      text: trimmed,
      at: DateTime.now().toIso8601String(),
    );

    try {
      String convId = _activeId ?? SupportService.instance.newConversationId();

      if (_activeId == null) {
        // Create new conversation in Firestore
        await SupportService.instance.upsertConversation(
          convId,
          userId: currentUser.uid,
          userName: currentUser.displayName ?? '',
          userEmail: currentUser.email ?? '',
          messages: [userMsg],
          title: trimmed.length > 60 ? trimmed.substring(0, 60) : trimmed,
        );
        setState(() => _activeId = convId);
        _watchConversation(convId);
      } else {
        // Append to existing conversation
        await SupportService.instance.appendMessage(convId, userMsg);
      }

      _refreshChats();

      // If admin has intervened, don't call AI
      if (_intervened) {
        setState(() => _sending = false);
        return;
      }

      // Build history for AI
      final history = <Map<String, String>>[];
      for (final m in _messages) {
        if (m.role == 'user' || m.role == 'assistant') {
          history.add({
            'role': m.role == 'user' ? 'user' : 'assistant',
            'content': m.text,
          });
        }
      }

      final reply = await AiAgentService.instance.ask(trimmed, history);

      // Append AI reply to Firestore
      final assistantMsg = SupportMessage(
        role: 'assistant',
        text: reply.isNotEmpty ? reply : 'Sorry, I couldn\'t process that. Please try again.',
        at: DateTime.now().toIso8601String(),
      );
      await SupportService.instance.appendMessage(convId, assistantMsg);
      _refreshChats();
    } catch (_) {
      // Append error message
      if (_activeId != null) {
        try {
          await SupportService.instance.appendMessage(
            _activeId!,
            SupportMessage(
              role: 'assistant',
              text: 'Something went wrong. Please try again.',
              at: DateTime.now().toIso8601String(),
            ),
          );
        } catch (_) {}
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }

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
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFF5F7FB),
      endDrawer: _HistoryPanel(
        chats: _chats,
        activeId: _activeId,
        onNewChat: () {
          _scaffoldKey.currentState?.closeEndDrawer();
          _startNewChat();
        },
        onOpenChat: _openChat,
      ),
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
                  // History icon
                  IconButton(
                    icon: const Icon(IconsaxPlusLinear.clock),
                    color: _ink,
                    onPressed: _openHistory,
                    tooltip: 'Chat history',
                  ),
                  // New chat
                  if (_hasConversation)
                    IconButton(
                      icon: const Icon(IconsaxPlusLinear.add),
                      color: _ink,
                      onPressed: _startNewChat,
                      tooltip: 'New chat',
                    ),
                ],
              ),
            ),
            Expanded(
              child: _hasConversation
                  ? ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
                      itemCount: _messages.length + (_sending && !_intervened ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index == _messages.length) return const _TypingIndicator();
                        return _MessageBubble(message: _messages[index]);
                      },
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

// ─── History Panel (ChatGPT-style right drawer) ──────────────────────────────

class _HistoryPanel extends StatelessWidget {
  const _HistoryPanel({
    required this.chats,
    required this.activeId,
    required this.onNewChat,
    required this.onOpenChat,
  });

  static const _ink = Color(0xFF1F2937);

  final List<SupportConversation> chats;
  final String? activeId;
  final VoidCallback onNewChat;
  final void Function(SupportConversation) onOpenChat;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return Drawer(
      width: width * 0.82,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.horizontal(left: Radius.circular(20)),
      ),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 16, 8),
              child: Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Chat History',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: _ink),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(IconsaxPlusLinear.close_circle, color: _ink),
                    onPressed: () => Scaffold.of(context).closeEndDrawer(),
                  ),
                ],
              ),
            ),
            // New chat button
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
              child: GestureDetector(
                onTap: onNewChat,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: _ink,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(IconsaxPlusLinear.add, size: 18, color: Colors.white),
                      SizedBox(width: 6),
                      Text('New chat', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
                    ],
                  ),
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.fromLTRB(20, 8, 20, 6),
              child: Text(
                'RECENT',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.5, color: Color(0xFF9CA3AF)),
              ),
            ),
            // Chat list
            Expanded(
              child: chats.isEmpty
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: Text('No conversations yet', style: TextStyle(color: Color(0xFF6B7280))),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      itemCount: chats.length,
                      itemBuilder: (context, i) {
                        final chat = chats[i];
                        final isActive = chat.id == activeId;
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 2),
                          child: Material(
                            color: isActive ? AppColors.primary.withValues(alpha: 0.08) : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: () => onOpenChat(chat),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                child: Row(
                                  children: [
                                    Icon(
                                      IconsaxPlusLinear.message_text,
                                      size: 18,
                                      color: isActive ? AppColors.primary : const Color(0xFF6B7280),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Text(
                                        chat.title,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                                          color: isActive ? AppColors.primary : _ink,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Message Bubble (with markdown + product cards) ──────────────────────────

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({required this.message});
  final SupportMessage message;

  @override
  Widget build(BuildContext context) {
    if (message.role == 'user') {
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

    // AI or admin message: parse product tags + markdown
    final parsed = _parseMessage(message.text);
    final isAdmin = message.role == 'admin';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isAdmin ? AppColors.primary.withValues(alpha: 0.08) : Colors.white,
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
          fontFamily: 'Poppins',
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
        height: 220,
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
