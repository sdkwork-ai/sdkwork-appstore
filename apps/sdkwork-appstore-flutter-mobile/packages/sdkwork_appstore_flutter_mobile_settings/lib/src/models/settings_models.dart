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
