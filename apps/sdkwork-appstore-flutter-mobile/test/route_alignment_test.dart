import 'package:flutter_test/flutter_test.dart';
import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

/// Cross-architecture route alignment guard
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` sections 7 and 11): the
/// Flutter route table must stay aligned with the PC router and the H5 route
/// table for every shared workflow.
void main() {
  group('canonical route table', () {
    final routes = listAppstoreRouteIdentities();

    test('exposes the canonical route table', () {
      expect(routes.length, greaterThanOrEqualTo(26));
    });

    test('formats route ids as <surface>.<domain>.<capability>.<screen>', () {
      final pattern = RegExp(r'^(app|console|admin)\.[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$');
      for (final route in routes) {
        expect(pattern.hasMatch(route.id), isTrue, reason: route.id);
      }
    });

    test('declares aligned paths and title keys', () {
      final alignedPaths = <String, String>{
        'app.store.discover.index': '/',
        'app.store.apps.index': '/apps',
        'app.store.games.index': '/games',
        'app.store.charts.index': '/charts',
        'app.store.category.detail': '/category/:id',
        'app.store.collection.detail': '/collection/:id',
        'app.store.ai-hub.index': '/ai-hub',
        'app.store.ai-hub.experts': '/experts',
        'app.store.ai-hub.plugins': '/plugins',
        'app.store.ai-hub.skills': '/skills',
        'app.store.ai-hub.mcp': '/mcp',
        'app.store.ai-hub.templates': '/templates',
        'app.store.ai-hub.template-detail': '/template/:id',
        'app.store.ai-hub.template-detail-alias': '/templates/:id',
        'app.store.search.index': '/search',
        'app.store.app-detail.detail': '/app/:id',
        'app.store.events.detail': '/events/:id',
        'app.store.library.index': '/library',
        'app.store.updates.index': '/updates',
        'app.store.wishlist.index': '/wishlist',
        'app.store.user-store.index': '/user-store',
        'app.store.user-store.public': '/store/:shareToken',
        'console.store.publisher.overview': '/publisher',
        'console.store.publisher.app-create': '/publisher/apps/new',
        'console.store.publisher.app-manage': '/publisher/apps/:id',
        'console.system.settings.index': '/console/settings',
      };
      final routePaths = <String, String>{
        for (final route in routes) route.id: route.path,
      };
      expect(routePaths.keys, containsAll(alignedPaths.keys));
      alignedPaths.forEach((String id, String path) {
        expect(routePaths[id], equals(path), reason: id);
      });
      for (final route in routes) {
        expect(
          route.titleKey,
          startsWith('appstore.'),
          reason: route.id,
        );
        expect(route.titleKey, endsWith('.title'), reason: route.id);
      }
    });

    test('keeps transport details out of route metadata', () {
      final transportPattern = RegExp(r'v3/api|http');
      for (final route in routes) {
        expect(
          transportPattern.hasMatch(route.path),
          isFalse,
          reason: route.id,
        );
      }
    });

    test('declares parameters for parameterized paths', () {
      final parameterPattern = RegExp(r':([A-Za-z0-9]+)');
      for (final route in routes) {
        final used = parameterPattern
            .allMatches(route.path)
            .map((Match match) => match.group(1)!)
            .toList();
        final declared = route.paramNames;
        expect(declared, equals(used), reason: route.id);
      }
    });
  });

  group('route matcher', () {
    test('resolves root and static paths', () {
      final match = resolveAppstoreRoute('/');
      expect(match, isNotNull);
      expect(match!.route.id, equals('app.store.discover.index'));
      expect(match.params, isEmpty);

      final charts = resolveAppstoreRoute('/charts');
      expect(charts!.route.id, equals('app.store.charts.index'));
    });

    test('extracts path parameters', () {
      final detail = resolveAppstoreRoute('/app/1234567890123456789');
      expect(detail!.route.id, equals('app.store.app-detail.detail'));
      expect(detail.params['id'], equals('1234567890123456789'));

      final share = resolveAppstoreRoute('/store/abc-token');
      expect(share!.route.id, equals('app.store.user-store.public'));
      expect(share.params['shareToken'], equals('abc-token'));
    });

    test('ignores query and fragment', () {
      final search = resolveAppstoreRoute('/search?q=pdf#top');
      expect(search!.route.id, equals('app.store.search.index'));
    });

    test('returns null for unknown paths', () {
      expect(resolveAppstoreRoute('/definitely-not-a-route'), isNull);
    });
  });
}
