import 'package:flutter/material.dart';

/// Supported currencies matching the web storefront.
enum CurrencyCode { ugx, usd, eur, gbp, kes, rwf }

class CurrencyInfo {
  const CurrencyInfo({
    required this.code,
    required this.symbol,
    required this.label,
    required this.rate,
  });

  final CurrencyCode code;
  final String symbol;
  final String label;

  /// How many UGX = 1 unit of this currency.
  /// UGX has rate 1 (identity).
  final double rate;
}

const currencies = <CurrencyCode, CurrencyInfo>{
  CurrencyCode.ugx: CurrencyInfo(code: CurrencyCode.ugx, symbol: 'USh', label: 'UGX — Ugandan Shilling', rate: 1),
  CurrencyCode.usd: CurrencyInfo(code: CurrencyCode.usd, symbol: '\$', label: 'USD — US Dollar', rate: 3780),
  CurrencyCode.eur: CurrencyInfo(code: CurrencyCode.eur, symbol: '€', label: 'EUR — Euro', rate: 4100),
  CurrencyCode.gbp: CurrencyInfo(code: CurrencyCode.gbp, symbol: '£', label: 'GBP — British Pound', rate: 4750),
  CurrencyCode.kes: CurrencyInfo(code: CurrencyCode.kes, symbol: 'KSh', label: 'KES — Kenyan Shilling', rate: 29),
  CurrencyCode.rwf: CurrencyInfo(code: CurrencyCode.rwf, symbol: 'RWF', label: 'RWF — Rwandese Franc', rate: 2.8),
};

/// InheritedWidget-based currency state for the app.
class CurrencyScope extends InheritedWidget {
  const CurrencyScope({
    super.key,
    required this.currency,
    required this.setCurrency,
    required super.child,
  });

  final CurrencyCode currency;
  final ValueChanged<CurrencyCode> setCurrency;

  CurrencyInfo get info => currencies[currency]!;

  /// Format a UGX amount into the selected currency.
  String format(int ugx) {
    final i = info;
    if (i.rate == 1) {
      // Round to nearest 1,000 for UGX
      final rounded = ((ugx / 1000).round()) * 1000;
      return 'USh ${_groupDigits(rounded)}';
    }
    final converted = (ugx / i.rate).round();
    return '${i.symbol}${_groupDigits(converted)}';
  }

  /// Compact format (478K, 1.2M) for product cards.
  String formatCompact(int ugx) {
    final i = info;
    if (i.rate == 1) {
      if (ugx >= 1000000) {
        final m = ugx / 1000000;
        return 'USh ${m == m.roundToDouble() ? m.toStringAsFixed(0) : m.toStringAsFixed(1)}M';
      }
      if (ugx >= 1000) {
        return 'USh ${(ugx / 1000).round()}K';
      }
      return 'USh ${_groupDigits(ugx)}';
    }
    final converted = (ugx / i.rate).round();
    return '${i.symbol}${_groupDigits(converted)}';
  }

  static CurrencyScope of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<CurrencyScope>()!;
  }

  @override
  bool updateShouldNotify(CurrencyScope oldWidget) => oldWidget.currency != currency;
}

String _groupDigits(int n) {
  final s = n.abs().toString();
  final buf = StringBuffer();
  for (int i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) buf.write(',');
    buf.write(s[i]);
  }
  return n < 0 ? '-${buf.toString()}' : buf.toString();
}

/// Stateful wrapper that provides CurrencyScope to the widget tree.
class CurrencyProvider extends StatefulWidget {
  const CurrencyProvider({super.key, required this.child});
  final Widget child;

  @override
  State<CurrencyProvider> createState() => _CurrencyProviderState();
}

class _CurrencyProviderState extends State<CurrencyProvider> {
  CurrencyCode _currency = CurrencyCode.ugx;

  @override
  Widget build(BuildContext context) {
    return CurrencyScope(
      currency: _currency,
      setCurrency: (c) => setState(() => _currency = c),
      child: widget.child,
    );
  }
}
