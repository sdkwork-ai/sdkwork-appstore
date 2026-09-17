import 'package:flutter/material.dart';

/// Games screen.
///
/// Screens stay in capability packages; the root keeps only bootstrap,
/// providers, route assembly, and shell registration
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
class GamesScreen extends StatelessWidget {
  const GamesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Games')),
    );
  }
}
