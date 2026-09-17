import 'package:flutter/material.dart';

import 'auth_gate.dart';
import 'bootstrap/runtime.dart';

/// App Store Flutter mobile root widget.
class AppstoreApp extends StatelessWidget {
  const AppstoreApp({required this.runtime, super.key});

  final AppstoreMobileRuntime runtime;

  @override
  Widget build(BuildContext context) {
    return AppstoreRuntimeScope(
      runtime: runtime,
      child: MaterialApp(
        title: 'SDKWork App Store Mobile',
        theme: ThemeData(colorSchemeSeed: const Color(0xFF0F766E)),
        home: const AuthGate(),
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
