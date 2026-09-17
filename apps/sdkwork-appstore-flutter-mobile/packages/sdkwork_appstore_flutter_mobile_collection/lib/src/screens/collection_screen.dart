import 'package:flutter/material.dart';

/// Collection screen.
///
/// Screens stay in capability packages; the root keeps only bootstrap,
/// providers, route assembly, and shell registration
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
class CollectionScreen extends StatelessWidget {
  const CollectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Collection')),
    );
  }
}
