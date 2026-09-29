/// Domain models owned by the settings capability.
class SettingsRouteEntry {
  const SettingsRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class SettingsPageResult<TItem> {
  const SettingsPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}

/// Signed-in state rendered by the settings account card.
class SettingsAccount {
  const SettingsAccount({required this.signedIn});

  /// Whether the local IAM session holds tokens (no profile fields exist on
  /// the core session projection until the appbase Dart wrapper lands).
  final bool signedIn;
}
