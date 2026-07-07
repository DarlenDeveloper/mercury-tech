import 'dart:async';

import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

import '../data/catalog_scope.dart';
import '../data/sample_products.dart';
import '../models/product.dart';
import '../theme/app_colors.dart';
import '../widgets/mercury_filter_chip.dart';
import '../widgets/product_card.dart';
import '../widgets/ai_search_button.dart';
import 'product_detail_screen.dart';

/// Image + circle color for each Home filter chip.
({String image, Color color}) _chipStyle(String label) {
  switch (label) {
    case 'Laptops':
      return (
        image: 'assets/images/computers-removebg-preview.png',
        color: const Color(0xFF1F3E97),
      );
    case 'Printers':
      return (
        image: 'assets/images/printers___power-removebg-preview.png',
        color: const Color(0xFFD9620E),
      );
    case 'Monitors':
      return (
        image: 'assets/images/Dell E2020H.jpeg',
        color: const Color(0xFF0E7490),
      );
    case 'Desktops':
      return (
        image: 'assets/images/Dell OptiPlex 7020 MT (desktop + monitor).jpeg',
        color: const Color(0xFF1E293B),
      );
    case 'Accessories':
      return (
        image: 'assets/images/accessories-removebg-preview.png',
        color: const Color(0xFF9F1239),
      );
    default:
      return (image: 'assets/images/logo.png', color: AppColors.primary);
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _selectedCategory = kCategories.first;

  @override
  Widget build(BuildContext context) {
    final all = CatalogScope.of(context).products;
    final products = _selectedCategory == kCategories.first
        ? all
        : all.where((p) => p.category == _selectedCategory).toList();
    final topPadding = MediaQuery.of(context).padding.top;

    return Stack(
      children: [
        // Fixed green banner behind everything
        Container(
          width: double.infinity,
          height: topPadding + 80,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFF1A4D4D),
                Color(0xFF163F3F),
              ],
            ),
          ),
          alignment: Alignment.center,
          padding: EdgeInsets.only(top: topPadding - 4, bottom: 24),
          child: GestureDetector(
            onTap: () {
              // TODO: navigate to deals
            },
            child: const _AnimatedDealsBanner(),
          ),
        ),
        // Scrollable content
        CustomScrollView(
          slivers: [
            // Spacer so carousel starts below the green banner
            SliverToBoxAdapter(
              child: SizedBox(height: topPadding + 48),
            ),
            // Full-bleed carousel
            SliverToBoxAdapter(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.15),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: const _PromoCarousel(),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                child: const SizedBox(height: 16),
              ),
            ),
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                child: const _TopTechSection(),
              ),
            ),
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                child: const SizedBox(height: 18),
              ),
            ),
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                child: _CategoryChips(
                  onSelected: (c) => setState(() => _selectedCategory = c),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                child: const _SectionHeader(title: 'Top rated'),
              ),
            ),
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                child: _ProductRail(products: products),
              ),
            ),
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                child: const SizedBox(height: 10),
              ),
            ),
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                child: const _SectionHeader(title: "What's new"),
              ),
            ),
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                child: _ProductRail(products: products.reversed.toList()),
              ),
            ),
            SliverToBoxAdapter(
              child: Container(
                color: Colors.white,
                child: const SizedBox(height: 120),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _UserRow extends StatelessWidget {
  const _UserRow();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: const Color(0xFFE5E7EB),
            child: Icon(
              IconsaxPlusLinear.user,
              size: 22,
              color: const Color(0xFF1F2937),
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hello,',
                  style: TextStyle(fontSize: 13, color: AppColors.inactive),
                ),
                Text(
                  'Welcome back',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1F2937),
                  ),
                ),
              ],
            ),
          ),
          // USD currency indicator
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  '🇺🇸',
                  style: TextStyle(fontSize: 16),
                ),
                SizedBox(width: 4),
                Text(
                  'USD',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1F2937),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 4),
          _CircleIconButton(
            icon: IconsaxPlusLinear.notification,
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _CircleIconButton extends StatelessWidget {
  const _CircleIconButton({required this.icon, this.onTap});

  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Icon(icon, size: 26, color: const Color(0xFF1F2937)),
      ),
    );
  }
}

class _SearchField extends StatelessWidget {
  const _SearchField();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 50,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: const Color(0xFFEDF1F7),
                borderRadius: BorderRadius.circular(30),
              ),
              child: Row(
                children: const [
                  Icon(IconsaxPlusLinear.search_normal,
                      size: 20, color: AppColors.inactive),
                  SizedBox(width: 12),
                  Text(
                    'Search products & brands',
                    style: TextStyle(fontSize: 14, color: AppColors.inactive),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 4),
          const AiSearchButton(size: 50),
        ],
      ),
    );
  }
}

class _PromoCarousel extends StatefulWidget {
  const _PromoCarousel();

  @override
  State<_PromoCarousel> createState() => _PromoCarouselState();
}

class _PromoSlide {
  const _PromoSlide({
    required this.title,
    required this.subtitle,
    required this.image,
  });

  final String title;
  final String subtitle;
  final String image;
}

class _PromoCarouselState extends State<_PromoCarousel> {
  final _controller = PageController();
  Timer? _timer;
  int _page = 0;

  static const _slides = [
    _PromoSlide(
      title: 'Gaming & PC',
      subtitle: 'Build your dream setup.',
      image: 'assets/carousel images/GAMING PC.jpeg',
    ),
    _PromoSlide(
      title: 'Phones, TV & Audio',
      subtitle: 'The latest tech, in stock.',
      image: 'assets/carousel images/phones.jpeg',
    ),
    _PromoSlide(
      title: 'Top Accessories',
      subtitle: 'Complete your setup.',
      image: 'assets/carousel images/accessories landscape.jpeg',
    ),
  ];

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (!mounted || !_controller.hasClients) return;
      final next = (_page + 1) % _slides.length;
      _controller.animateToPage(
        next,
        duration: const Duration(milliseconds: 450),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    return SizedBox(
      height: 340,
      child: Stack(
        children: [
          PageView.builder(
            controller: _controller,
            itemCount: _slides.length,
            onPageChanged: (i) => setState(() => _page = i),
            itemBuilder: (context, i) => _PromoCard(slide: _slides[i]),
          ),
          // Page dots
          Positioned(
            left: 0,
            right: 0,
            bottom: 18,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                for (var i = 0; i < _slides.length; i++)
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: i == _page ? 18 : 7,
                    height: 7,
                    decoration: BoxDecoration(
                      color: i == _page
                          ? Colors.white
                          : Colors.white.withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PromoCard extends StatelessWidget {
  const _PromoCard({required this.slide});

  final _PromoSlide slide;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        Image.asset(slide.image, fit: BoxFit.cover),
        // Dark scrim for text legibility
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0x33000000),
                Color(0x00000000),
                Color(0xAA000000),
              ],
              stops: [0.0, 0.4, 1.0],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 0, 24, 44),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                slide.title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  height: 1.1,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                slide.subtitle,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 14,
                  color: Color(0xFFE5E7EB),
                ),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.4)),
                ),
                child: const Text(
                  'Shop now',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// "Shop Now" pill with a circular arrow badge at its trailing edge.
class _ShopNowPill extends StatelessWidget {
  const _ShopNowPill();

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.primary,
      borderRadius: BorderRadius.circular(30),
      child: InkWell(
        borderRadius: BorderRadius.circular(30),
        onTap: () {},
        child: const Padding(
          padding: EdgeInsets.fromLTRB(18, 6, 6, 6),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Shop Now',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(width: 10),
              CircleAvatar(
                radius: 15,
                backgroundColor: AppColors.accent,
                child: Icon(
                  Icons.arrow_downward_rounded,
                  size: 18,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Clips a card into a rounded rectangle with a smooth concave notch carved
/// out of the bottom-center — the page indicator dots nest inside the dip.
class _NotchedCardClipper extends CustomClipper<Path> {
  const _NotchedCardClipper({
    required this.radius,
    required this.notchWidth,
    required this.notchDepth,
  });

  final double radius;
  final double notchWidth;
  final double notchDepth;

  @override
  Path getClip(Size size) {
    final w = size.width;
    final h = size.height;
    final r = radius;
    final cx = w / 2;
    final half = notchWidth / 2;
    final left = cx - half;
    final right = cx + half;
    // Smoothing factor: large k => horizontal tangents at both the bottom
    // edge and the bottom of the dip, giving a soft cosine-like scoop with
    // no pinching at the shoulders.
    final k = half * 0.62;

    final path = Path()
      ..moveTo(0, r)
      ..quadraticBezierTo(0, 0, r, 0) // top-left
      ..lineTo(w - r, 0)
      ..quadraticBezierTo(w, 0, w, r) // top-right
      ..lineTo(w, h - r)
      ..quadraticBezierTo(w, h, w - r, h) // bottom-right
      ..lineTo(right, h)
      // right half of the dip (horizontal tangents at both ends)
      ..cubicTo(right - k, h, cx + k, h - notchDepth, cx, h - notchDepth)
      // left half of the dip
      ..cubicTo(cx - k, h - notchDepth, left + k, h, left, h)
      ..lineTo(r, h)
      ..quadraticBezierTo(0, h, 0, h - r) // bottom-left
      ..close();

    return path;
  }

  @override
  bool shouldReclip(_NotchedCardClipper oldClipper) {
    return oldClipper.radius != radius ||
        oldClipper.notchWidth != notchWidth ||
        oldClipper.notchDepth != notchDepth;
  }
}

class _CategoryChips extends StatelessWidget {
  const _CategoryChips({required this.onSelected});

  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: kCategories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, i) {
          final category = kCategories[i];
          final style = _chipStyle(category);
          return MercuryFilterChip(
            label: category,
            image: style.image,
            accent: style.color,
            onTap: () => onSelected(category),
          );
        },
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 22, 20, 12),
      child: Row(
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            width: 26,
            height: 26,
            decoration: const BoxDecoration(
              color: Color(0xFFEDF1F7),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.chevron_right, size: 18, color: Color(0xFF1F2937)),
          ),
        ],
      ),
    );
  }
}

class _ProductRail extends StatelessWidget {
  const _ProductRail({required this.products});

  final List<Product> products;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 218,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: products.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, i) => SizedBox(
          width: 136,
          child: ProductCard(
            product: products[i],
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => ProductDetailScreen(product: products[i]),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// A soft blue gradient backdrop that sits behind the header, search field
/// and quick actions, fading into the page background color.
class _HomeGradientBackdrop extends StatelessWidget {
  const _HomeGradientBackdrop();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      height: 340,
      width: double.infinity,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFFFDE8C8), // soft warm orange
              Color(0xFFFEF3E2),
              Color(0xFFFAFAFA), // page background
            ],
            stops: [0.0, 0.55, 1.0],
          ),
        ),
      ),
    );
  }
}

/// Definition for a single quick-action shortcut tile.
class _QuickAction {
  const _QuickAction({
    required this.label,
    required this.image,
  });

  final String label;

  /// 3D icon asset shown on the tile.
  final String image;
}

/// Horizontal row of shortcut tiles shown under the search field.
class _QuickActions extends StatelessWidget {
  const _QuickActions();

  static const _actions = <_QuickAction>[
    _QuickAction(label: 'Deals', image: 'assets/images/qa-deals.png'),
    _QuickAction(label: 'Flash', image: 'assets/images/qa-flash.png'),
    _QuickAction(label: 'Rewards', image: 'assets/images/qa-rewards.png'),
    _QuickAction(label: 'Coupons', image: 'assets/images/qa-coupons.png'),
    _QuickAction(label: 'Support', image: 'assets/images/qa-support.png'),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          for (final action in _actions)
            Expanded(child: _QuickActionTile(action: action, onTap: () {})),
        ],
      ),
    );
  }
}

class _QuickActionTile extends StatelessWidget {
  const _QuickActionTile({required this.action, required this.onTap});

  final _QuickAction action;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 52,
            height: 52,
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.55),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 12,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Image.asset(action.image, fit: BoxFit.contain),
          ),
          const SizedBox(height: 7),
          Text(
            action.label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1F2937),
            ),
          ),
        ],
      ),
    );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// "Explore our Top Tech" — horizontally scrollable category cards
// ─────────────────────────────────────────────────────────────────────────────

class _TopTechItem {
  const _TopTechItem({
    required this.tag,
    required this.headline,
    required this.image,
  });

  final String tag;
  final String headline;
  final String image;
}

class _TopTechSection extends StatelessWidget {
  const _TopTechSection();

  static const _items = <_TopTechItem>[
    _TopTechItem(
      tag: 'SHOP LAPTOPS',
      headline: 'Serious Power.\nCertified Savings.',
      image: 'assets/images/macbooks-removebg.png',
    ),
    _TopTechItem(
      tag: 'SHOP PRINTERS',
      headline: 'Work Ready.\nAlways.',
      image: 'assets/images/printers-removebg.png',
    ),
    _TopTechItem(
      tag: 'SHOP PHONES',
      headline: 'Your Next Phone\nStarts Here.',
      image: 'assets/images/phones-removebg.png',
    ),
    _TopTechItem(
      tag: 'SHOP NETWORKING',
      headline: 'Stay Connected.\nStay Secure.',
      image: 'assets/images/networking-removebg.png',
    ),
    _TopTechItem(
      tag: 'SHOP ACCESSORIES',
      headline: 'Complete Your\nSetup.',
      image: 'assets/images/accessories-removebg-preview.png',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const Text(
          'TRUSTED BY MANY, LOVED BY ALL.',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            letterSpacing: 1.2,
            color: AppColors.inactive,
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'Explore our Top Tech.',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: Color(0xFF1F2937),
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 340,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            itemCount: _items.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (context, i) => _TopTechCard(item: _items[i]),
          ),
        ),
      ],
    );
  }
}

class _TopTechCard extends StatelessWidget {
  const _TopTechCard({required this.item});

  final _TopTechItem item;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 260,
      decoration: BoxDecoration(
        color: const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          const SizedBox(height: 20),
          // Gradient tag pill
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              color: const Color(0xFF1A4D4D),
            ),
            child: Text(
              item.tag,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Headline
          Text(
            item.headline,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              height: 1.2,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 12),
          // Product image with green gradient at bottom
          Expanded(
            child: ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(bottom: Radius.circular(20)),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Soft orange gradient behind the image
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Color(0x00FFFFFF),
                          Color(0xFFFDE8C8),
                        ],
                        stops: [0.3, 1.0],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(0),
                    child: Image.asset(
                      item.image,
                      fit: BoxFit.contain,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// Animated deals banner — cycles through promo messages
// ─────────────────────────────────────────────────────────────────────────────

class _AnimatedDealsBanner extends StatefulWidget {
  const _AnimatedDealsBanner();

  @override
  State<_AnimatedDealsBanner> createState() => _AnimatedDealsBannerState();
}

class _AnimatedDealsBannerState extends State<_AnimatedDealsBanner>
    with SingleTickerProviderStateMixin {
  static const _messages = [
    ('Hot Mercury Deals', 'Premium offers every day'),
    ('New Weekly Arrivals', 'Fresh stock just dropped'),
    ('Free Delivery', 'Within Kampala Central'),
  ];

  int _index = 0;
  late final AnimationController _controller;
  late Animation<double> _fadeIn;
  late Animation<double> _fadeOut;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeIn = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );
    _fadeOut = Tween<double>(begin: 1.0, end: 0.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
    _controller.forward();
    _timer = Timer.periodic(const Duration(seconds: 3), (_) => _next());
  }

  void _next() {
    _controller.reverse().then((_) {
      if (!mounted) return;
      setState(() => _index = (_index + 1) % _messages.length);
      _controller.forward();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final msg = _messages[_index];
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: FadeTransition(
        opacity: _fadeIn,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              msg.$1,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              msg.$2,
              style: const TextStyle(
                fontSize: 13,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// Floating search bar that sits on top of the carousel
// ─────────────────────────────────────────────────────────────────────────────

class _FloatingSearchBar extends StatelessWidget {
  const _FloatingSearchBar();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 46,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.92),
              borderRadius: BorderRadius.circular(28),
            ),
            child: Row(
              children: [
                const Expanded(
                  child: Text(
                    'Search for brands or products',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.inactive,
                    ),
                  ),
                ),
                Icon(
                  IconsaxPlusLinear.search_normal,
                  size: 20,
                  color: AppColors.inactive,
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 10),
        const AiSearchButton(size: 46),
      ],
    );
  }
}
