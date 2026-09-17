import 'package:flutter/material.dart';

/// Standard screen state kinds shared by every capability screen.
enum AppstoreScreenStateKind { loading, empty, error, ready }

class AppstoreScreenState extends StatelessWidget {
  const AppstoreScreenState({
    required this.kind,
    required this.message,
    super.key,
  });

  final AppstoreScreenStateKind kind;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text(message, textAlign: TextAlign.center),
      ),
    );
  }
}
