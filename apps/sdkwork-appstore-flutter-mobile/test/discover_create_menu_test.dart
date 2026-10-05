import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_appstore_flutter_mobile_discover/sdkwork_appstore_flutter_mobile_discover.dart';
import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

void main() {
  // The creation hub lives on the discover app bar and must render even when
  // the feed transport is unbound (the body shows the error state, the navbar
  // actions stay interactive).
  Future<void> pumpDiscoverScreen(WidgetTester tester) async {
    const clients = AppstoreAppSdkClients(
      appApiBaseUrl: 'http://127.0.0.1:8090/app/v3/api',
      transportBaseUrl: 'http://127.0.0.1:8090',
    );
    await tester.pumpWidget(
      MaterialApp(
        home: DiscoverScreen(service: DiscoverService(clients: clients)),
      ),
    );
    await tester.pumpAndSettle();
  }

  testWidgets('creation hub plus menu opens with the three presets', (
    WidgetTester tester,
  ) async {
    await pumpDiscoverScreen(tester);

    final plusButton = find.byTooltip('新建');
    expect(plusButton, findsOneWidget);
    await tester.tap(plusButton);
    await tester.pumpAndSettle();

    expect(find.text('新建应用'), findsOneWidget);
    expect(find.text('新建官网'), findsOneWidget);
    expect(find.text('新建宣传应用'), findsOneWidget);
    expect(find.text('发布一个全新的应用'), findsOneWidget);
    expect(find.text('搭建并发布官方网站'), findsOneWidget);
    expect(find.text('创建宣传页应用'), findsOneWidget);
  });
}
