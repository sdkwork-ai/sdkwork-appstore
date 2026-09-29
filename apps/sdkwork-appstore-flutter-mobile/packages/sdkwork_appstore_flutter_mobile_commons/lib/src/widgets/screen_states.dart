import 'package:flutter/material.dart';

/// Standard screen state kinds shared by every capability screen.
enum AppstoreScreenStateKind { loading, empty, error, ready }

/// Standard loading / empty / error renderer for capability screens.
///
/// The error state never injects demo data — it mirrors the PC root's
/// explicit-unconfigured-port pattern where a failed load renders a retryable
/// error panel instead of placeholder content.
class AppstoreScreenState extends StatelessWidget {
  const AppstoreScreenState({
    required this.kind,
    required this.message,
    this.onRetry,
    super.key,
  });

  final AppstoreScreenStateKind kind;
  final String message;

  /// Retry callback rendered for the error state when provided.
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            if (kind == AppstoreScreenStateKind.loading) ...<Widget>[
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
            ],
            if (kind == AppstoreScreenStateKind.error) ...<Widget>[
              Icon(
                Icons.error_outline,
                size: 40,
                color: Theme.of(context).colorScheme.error,
              ),
              const SizedBox(height: 12),
            ],
            if (kind == AppstoreScreenStateKind.empty) ...<Widget>[
              Icon(
                Icons.inbox_outlined,
                size: 40,
                color: Theme.of(context).colorScheme.outline,
              ),
              const SizedBox(height: 12),
            ],
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            if (kind == AppstoreScreenStateKind.error && onRetry != null) ...<Widget>[
              const SizedBox(height: 12),
              FilledButton.tonal(
                onPressed: onRetry,
                child: const Text('重试'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Default copy for the shared screen states.
class AppstoreScreenStateMessages {
  const AppstoreScreenStateMessages._();

  static const String loading = '加载中…';
  static const String empty = '暂无内容';
  static const String error = '加载失败，请稍后重试';
}
