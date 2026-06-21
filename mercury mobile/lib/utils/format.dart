// Formatting helpers for Mercury Mobile.

/// Formats an amount in Ugandan Shillings, e.g. `1323000` -> `USh 1,323,000`.
String formatUgx(int amount) {
  final digits = amount.abs().toString();
  final buffer = StringBuffer();
  for (var i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 == 0) {
      buffer.write(',');
    }
    buffer.write(digits[i]);
  }
  final sign = amount < 0 ? '-' : '';
  return 'USh $sign$buffer';
}
