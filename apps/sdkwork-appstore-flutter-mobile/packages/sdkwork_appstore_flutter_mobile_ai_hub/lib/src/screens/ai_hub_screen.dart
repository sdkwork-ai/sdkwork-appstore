import 'package:flutter/material.dart';

/// Ai Hub screen.
///
/// Screens stay in capability packages; the root keeps only bootstrap,
/// providers, route assembly, and shell registration
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
class AiHubScreen extends StatelessWidget {
  const AiHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Ai Hub')),
    );
  }
}
