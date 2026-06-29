import 'dart:async';

import 'package:flutter/material.dart';
import 'package:iconsax_plus/iconsax_plus.dart';

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

  List<Product> get _visibleProducts {
    if (_selectedCategory == kCategories.first) return kSampleProducts;
    return kSampleProducts
        .where((p) => p.category == _selectedCategory)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final products = _visibleProducts;

    return Stack(
      children: [
        // Soft blue gradient that fades into the page background behind the
        // header, search field and quick actions.
        const _HomeGradientBackdrop(),
        SafeArea(
          top: false,
          bottom: false,
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: SizedBox(height: MediaQuery.of(context).padding.top),
              ),
              const SliverToBoxAdapter(child: _HomeHeader()),
              const SliverToBoxAdapter(child: _SearchField()),
              const SliverToBoxAdapter(child: SizedBox(height: 20)),
              const SliverToBoxAdapter(child: _PromoCarousel()),
              const SliverToBoxAdapter(child: SizedBox(height: 22)),
              const SliverToBoxAdapter(child: _QuickActions()),
          const SliverToBoxAdapter(child: SizedBox(height: 18)),
          SliverToBoxAdapter(
            child: _CategoryChips(
              onSelected: (c) => setState(() => _selectedCategory = c),
            ),
          ),
          const SliverToBoxAdapter(
            child: _SectionHeader(title: 'Top rated'),
          ),
          SliverToBoxAdapter(
            child: _ProductRail(products: products),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 10)),
          const SliverToBoxAdapter(
            child: _SectionHeader(title: "What's new"),
          ),
          SliverToBoxAdapter(
            child: _ProductRail(products: products.reversed.toList()),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 120)),
            ],
          ),
        ),
      ],
    );
  }
}

class _HomeHeader extends StatelessWidget {
  const _HomeHeader();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
      child: Row(
        children: [
          Image.asset(
            'assets/images/logo.png',
            width: 48,
            height: 48,
            fit: BoxFit.contain,
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
    return Padding(
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
    return Column(
      children: [
        SizedBox(
          height: 185,
          child: PageView.builder(
            controller: _controller,
            itemCount: _slides.length,
            onPageChanged: (i) => setState(() => _page = i),
            itemBuilder: (context, i) => _PromoCard(slide: _slides[i]),
          ),
        ),
        const SizedBox(height: 12),
        Row(
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
                      ? AppColors.primary
                      : AppColors.inactive.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
          ],
        ),
      ],
    );
  }
}

class _PromoCard extends StatelessWidget {
  const _PromoCard({required this.slide});

  final _PromoSlide slide;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(slide.image, fit: BoxFit.cover),
          // Dark scrim on the left for text legibility.
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                colors: [Color(0xCC000000), Color(0x33000000), Colors.transparent],
                stops: [0.0, 0.55, 1.0],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  slide.title,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    height: 1.1,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  slide.subtitle,
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFFE5E7EB),
                  ),
                ),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 9,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Shop Now'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
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
              fontSize: 19,
              fontWeight: FontWeight.w800,
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
      height: 256,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: products.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (context, i) => SizedBox(
          width: 160,
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
              Color(0xFFCFE4FB), // soft sky blue
              Color(0xFFE3EEFB),
              Color(0xFFF5F7FB), // page background
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
