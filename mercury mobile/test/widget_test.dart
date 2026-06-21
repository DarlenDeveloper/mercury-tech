// Basic smoke test for Mercury Mobile.

import 'package:flutter_test/flutter_test.dart';

import 'package:mercury_tech/main.dart';

void main() {
  testWidgets('App boots with bottom navigation', (WidgetTester tester) async {
    await tester.pumpWidget(const MercuryApp());

    // The five bottom navigation labels should be present.
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Shop'), findsOneWidget);
    expect(find.text('Rewards'), findsOneWidget);
    expect(find.text('Cart'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);
  });
}
