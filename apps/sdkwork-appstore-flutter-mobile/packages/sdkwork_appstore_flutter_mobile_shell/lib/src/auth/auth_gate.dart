import 'package:flutter/material.dart';

/// AuthGate integration.
///
/// Authority: `IAM_LOGIN_INTEGRATION_SPEC.md`. The gate decides whether a
/// route may render and never constructs its own SDK client.
class AppstoreAuthGate extends StatelessWidget {
  const AppstoreAuthGate({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) => child;
}
