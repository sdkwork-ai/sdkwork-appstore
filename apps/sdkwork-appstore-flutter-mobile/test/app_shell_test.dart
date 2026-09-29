import 'package:flutter_test/flutter_test.dart';

import 'package:sdkwork_appstore_flutter_mobile/app.dart';
import 'package:sdkwork_appstore_flutter_mobile/bootstrap/iam_runtime.dart';
import 'package:sdkwork_appstore_flutter_mobile/bootstrap/runtime.dart';

/// Shell smoke tests for the composed route stack
/// (`FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md` section 11: UI states —
/// loading / error / empty / auth — render without demo data injection).
void main() {
  testWidgets('renders the bottom tab shell and discover error state', (
    WidgetTester tester,
  ) async {
    final runtime = await bootstrap();
    await tester.pumpWidget(AppstoreApp(runtime: runtime));
    await tester.pumpAndSettle();

    // Tab roots.
    expect(find.text('发现'), findsWidgets);
    expect(find.text('应用'), findsWidgets);
    expect(find.text('游戏'), findsWidgets);
    expect(find.text('搜索'), findsWidgets);
    expect(find.text('库'), findsWidgets);

    // The store feed rides the generated Dart SDK transport; without a
    // reachable gateway the per-rail degradation renders the empty-store
    // state, and no demo content is ever injected.
    expect(find.text('店铺还没有上架内容，先去应用列表看看吧'), findsOneWidget);
  });

  testWidgets('cold-start deep links resolve canonical detail routes', (
    WidgetTester tester,
  ) async {
    final runtime = await bootstrap();
    await tester.pumpWidget(AppstoreApp(runtime: runtime, initialRoute: '/app/1234567890123456789'));
    await tester.pumpAndSettle();

    // The detail screen renders; the transport-gated data area shows the
    // standard error state with retry.
    expect(find.text('应用详情'), findsOneWidget);
    expect(find.text('加载失败，请稍后重试'), findsOneWidget);
    expect(find.text('发现'), findsNothing);
  });

  testWidgets('auth-required routes render the auth panel when anonymous', (
    WidgetTester tester,
  ) async {
    final runtime = await bootstrap();
    getIamRuntime().clearSession();
    await tester.pumpWidget(AppstoreApp(runtime: runtime, initialRoute: '/library'));
    await tester.pumpAndSettle();

    expect(find.text('登录后即可访问该页面'), findsOneWidget);
  });

  testWidgets('unknown routes render the not-found panel', (
    WidgetTester tester,
  ) async {
    final runtime = await bootstrap();
    await tester.pumpWidget(
      AppstoreApp(runtime: runtime, initialRoute: '/definitely-not-a-route'),
    );
    await tester.pumpAndSettle();

    expect(find.text('页面未找到'), findsOneWidget);
  });
}
