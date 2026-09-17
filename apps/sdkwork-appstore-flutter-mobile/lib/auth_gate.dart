import 'package:flutter/material.dart';
import 'package:sdkwork_appstore_flutter_mobile_shell/sdkwork_appstore_flutter_mobile_shell.dart';

/// Root AuthGate. Authority: `IAM_LOGIN_INTEGRATION_SPEC.md`.
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return const AppstoreAuthGate(child: AppstoreRouteStack());
  }
}
