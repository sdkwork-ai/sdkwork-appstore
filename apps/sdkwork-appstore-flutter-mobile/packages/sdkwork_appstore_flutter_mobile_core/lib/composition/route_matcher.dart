import '../sdkwork_appstore_flutter_mobile_core.dart';

/// Resolved canonical route: contribution plus extracted path parameters.
class AppstoreRouteMatch {
  const AppstoreRouteMatch({required this.route, required this.params});

  final SdkworkUiRouteContribution route;

  /// Path parameters keyed by declared name (`:id` -> `params['id']`).
  final Map<String, String> params;
}

/// Match a physical path against the canonical route table.
///
/// Paths are compared segment-wise; `:param` segments capture exactly one
/// segment. Returns null when no canonical route matches, so the shell can
/// render its not-found state
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7: deep links resolve
/// to route ids first).
AppstoreRouteMatch? resolveAppstoreRoute(String path) {
  final candidate = _normalize(path);
  for (final route in listAppstoreRouteIdentities()) {
    if (_normalize(route.path) == candidate) {
      final params = _matchPattern(_normalize(route.path), candidate);
      return AppstoreRouteMatch(route: route, params: params ?? const <String, String>{});
    }
  }
  for (final route in listAppstoreRouteIdentities()) {
    final match = _matchPattern(_normalize(route.path), candidate);
    if (match != null) {
      return AppstoreRouteMatch(route: route, params: match);
    }
  }
  return null;
}

String _normalize(String path) {
  final trimmed = path.trim();
  final withoutQuery = trimmed.split('?').first.split('#').first;
  final segments = withoutQuery
      .split('/')
      .where((segment) => segment.isNotEmpty)
      .toList(growable: false);
  return segments.join('/');
}

Map<String, String>? _matchPattern(String pattern, String candidate) {
  final patternSegments = pattern.isEmpty
      ? const <String>[]
      : pattern.split('/');
  final candidateSegments =
      candidate.isEmpty ? const <String>[] : candidate.split('/');
  if (patternSegments.length != candidateSegments.length) {
    return null;
  }
  final params = <String, String>{};
  for (var index = 0; index < patternSegments.length; index++) {
    final patternSegment = patternSegments[index];
    final candidateSegment = candidateSegments[index];
    if (patternSegment.startsWith(':')) {
      if (candidateSegment.isEmpty) {
        return null;
      }
      params[patternSegment.substring(1)] = Uri.decodeComponent(candidateSegment);
      continue;
    }
    if (patternSegment != candidateSegment) {
      return null;
    }
  }
  return params;
}
