import 'package:flutter/material.dart';
import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart'
    show AppstoreSession;
import 'package:sdkwork_appstore_flutter_mobile_shell/sdkwork_appstore_flutter_mobile_shell.dart';

import 'bootstrap/iam_runtime.dart';

/// Root AuthGate. Authority: `IAM_LOGIN_INTEGRATION_SPEC.md`.
///
/// Subscribes to the single IAM runtime so the guarded subtree (tab shells
/// rendering inline auth panels, pushed guarded routes) rebuilds as soon as
/// the session changes — login/logout never leaves a stale guard decision
/// on screen.
class AuthGate extends StatefulWidget {
  const AuthGate({required this.child, super.key});

  final Widget child;

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  @override
  void initState() {
    super.initState();
    getIamRuntime().addSessionListener(_onSessionChanged);
  }

  @override
  void dispose() {
    getIamRuntime().removeSessionListener(_onSessionChanged);
    super.dispose();
  }

  void _onSessionChanged(AppstoreSession session) {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppstoreAuthGate(child: widget.child);
  }
}
