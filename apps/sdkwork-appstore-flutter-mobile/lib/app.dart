import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_shell/sdkwork_appstore_flutter_mobile_shell.dart';

import 'auth_gate.dart';
import 'bootstrap/runtime.dart';

/// App Store Flutter mobile root widget.
///
/// One navigator owns every route: `MaterialApp.onGenerateRoute` delegates to
/// the runtime's canonical-route resolver, so tabs, pushed pages, cold-start
/// deep links, and unknown paths all resolve through the shared route table.
/// `AuthGate` stays above the app and the route guard maps `auth: required`
/// routes onto the core IAM session
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7).
class AppstoreApp extends StatelessWidget {
  const AppstoreApp({required this.runtime, this.initialRoute = '/', super.key});

  final AppstoreMobileRuntime runtime;
  final String initialRoute;

  @override
  Widget build(BuildContext context) {
    final routeStack = AppstoreRouteStack(
      screenBuilders: runtime.createScreenBuilders(),
      tabs: runtime.createTabs(),
      authGuard: runtime.isRouteAuthorized,
      loginHandler: runtime.loginWithPassword,
    );
    return AppstoreRuntimeScope(
      runtime: runtime,
      child: MaterialApp(
        title: 'SDKWork App Store Mobile',
        // Brand blue seed (UI_DESIGN_SPEC §2.1 --accent #0071E3) so every
        // Material color role derives from the shared design token.
        theme: ThemeData(colorSchemeSeed: const Color(0xFF0071E3)),
        initialRoute: initialRoute,
        onGenerateRoute: routeStack.onGenerateRoute,
        builder: (BuildContext context, Widget? child) =>
            AuthGate(child: child ?? const SizedBox.shrink()),
      ),
    );
  }
}

/// Inherited runtime scope; mirrors the H5 runtime provider boundary.
class AppstoreRuntimeScope extends InheritedWidget {
  const AppstoreRuntimeScope({
    required this.runtime,
    required super.child,
    super.key,
  });

  final AppstoreMobileRuntime runtime;

  static AppstoreMobileRuntime of(BuildContext context) {
    final scope =
        context.dependOnInheritedWidgetOfExactType<AppstoreRuntimeScope>();
    if (scope == null) {
      throw StateError('AppstoreRuntimeScope is not available.');
    }
    return scope.runtime;
  }

  @override
  bool updateShouldNotify(AppstoreRuntimeScope oldWidget) {
    return !identical(runtime, oldWidget.runtime);
  }
}
