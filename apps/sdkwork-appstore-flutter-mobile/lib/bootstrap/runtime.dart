import 'package:flutter/material.dart';

import 'package:sdkwork_iam_app_sdk/sdkwork_iam_app_sdk.dart';

import 'package:sdkwork_appstore_sdk/sdkwork_appstore_sdk.dart';
import 'package:sdkwork_appstore_flutter_mobile_apps/sdkwork_appstore_flutter_mobile_apps.dart';
import 'package:sdkwork_appstore_flutter_mobile_app_detail/sdkwork_appstore_flutter_mobile_app_detail.dart';
import 'package:sdkwork_appstore_flutter_mobile_ai_hub/sdkwork_appstore_flutter_mobile_ai_hub.dart';
import 'package:sdkwork_appstore_flutter_mobile_category/sdkwork_appstore_flutter_mobile_category.dart';
import 'package:sdkwork_appstore_flutter_mobile_charts/sdkwork_appstore_flutter_mobile_charts.dart';
import 'package:sdkwork_appstore_flutter_mobile_collection/sdkwork_appstore_flutter_mobile_collection.dart';
import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';
import 'package:sdkwork_appstore_flutter_mobile_discover/sdkwork_appstore_flutter_mobile_discover.dart';
import 'package:sdkwork_appstore_flutter_mobile_events/sdkwork_appstore_flutter_mobile_events.dart';
import 'package:sdkwork_appstore_flutter_mobile_games/sdkwork_appstore_flutter_mobile_games.dart';
import 'package:sdkwork_appstore_flutter_mobile_library/sdkwork_appstore_flutter_mobile_library.dart';
import 'package:sdkwork_appstore_flutter_mobile_publisher/sdkwork_appstore_flutter_mobile_publisher.dart';
import 'package:sdkwork_appstore_flutter_mobile_search/sdkwork_appstore_flutter_mobile_search.dart';
import 'package:sdkwork_appstore_flutter_mobile_settings/sdkwork_appstore_flutter_mobile_settings.dart';
import 'package:sdkwork_appstore_flutter_mobile_shell/sdkwork_appstore_flutter_mobile_shell.dart';
import 'package:sdkwork_appstore_flutter_mobile_updates/sdkwork_appstore_flutter_mobile_updates.dart';
import 'package:sdkwork_appstore_flutter_mobile_user_store/sdkwork_appstore_flutter_mobile_user_store.dart';
import 'package:sdkwork_appstore_flutter_mobile_wishlist/sdkwork_appstore_flutter_mobile_wishlist.dart';

import 'host_adapters.dart';
import 'iam_runtime.dart';
import 'routes.dart';
import 'sdk_clients.dart';

/// Flutter mobile composition root.
///
/// Owns the one SDK client set, the capability services composed from it, and
/// the canonical route -> screen assembly; capability packages stay client-free
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` sections 1, 5, and 8).
class AppstoreMobileRuntime {
  AppstoreMobileRuntime({
    required this.sdkClients,
    required this.openClient,
    required this.iamClient,
    required this.skillsClient,
    required this.mcpClient,
    required this.routes,
  })  : discoverService = DiscoverService(clients: sdkClients),
        appsService = AppsService(clients: sdkClients),
        gamesService = GamesService(clients: sdkClients),
        chartsService = ChartsService(clients: sdkClients),
        searchService = SearchService(clients: sdkClients),
        categoryService = CategoryService(clients: sdkClients),
        collectionService = CollectionService(clients: sdkClients),
        eventsService = EventsService(clients: sdkClients),
        aiHubService = AiHubService(
          clients: sdkClients,
          skillsClient: skillsClient,
          mcpClient: mcpClient,
        ),
        appDetailService = AppDetailService(clients: sdkClients),
        libraryService = LibraryService(clients: sdkClients),
        updatesService = UpdatesService(clients: sdkClients),
        wishlistService = WishlistService(clients: sdkClients),
        userStoreService = UserStoreService(clients: sdkClients, openClient: openClient),
        publisherService = PublisherService(clients: sdkClients),
        settingsService = SettingsService(iamRuntime: getIamRuntime()) {
    getIamRuntime().bindTokenSink((AppstoreSession session) {
      sdkClients.propagateSessionTokens(
        authToken: session.authToken,
        accessToken: session.accessToken,
      );
    });
    sdkClients.propagateSessionTokens(
      authToken: getIamRuntime().session.authToken,
      accessToken: getIamRuntime().session.accessToken,
    );
    propagateDependencyTokens(getIamRuntime().session);
    getIamRuntime().addSessionListener((AppstoreSession session) {
      propagateDependencyTokens(session);
    });
  }

  final AppstoreAppSdkClients sdkClients;
  final SdkworkAppstoreOpenClient openClient;
  final SdkworkIamAppClient iamClient;
  final SdkworkAppClient skillsClient;
  final SdkworkMcpAppClient mcpClient;
  final List<SdkworkUiRouteContribution> routes;

  /// Pushes the single-owner session tokens into the dependency SDK clients.
  void propagateDependencyTokens(AppstoreSession session) {
    skillsClient.setAuthToken(session.authToken ?? '');
    skillsClient.setAccessToken(session.accessToken ?? '');
    mcpClient.setAuthToken(session.authToken ?? '');
    mcpClient.setAccessToken(session.accessToken ?? '');
  }

  final DiscoverService discoverService;
  final AppsService appsService;
  final GamesService gamesService;
  final ChartsService chartsService;
  final SearchService searchService;
  final CategoryService categoryService;
  final CollectionService collectionService;
  final EventsService eventsService;
  final AiHubService aiHubService;
  final AppDetailService appDetailService;
  final LibraryService libraryService;
  final UpdatesService updatesService;
  final WishlistService wishlistService;
  final UserStoreService userStoreService;
  final PublisherService publisherService;
  final SettingsService settingsService;

  /// Bottom tab roots (canonical paths; mirrors the H5 tab set).
  List<AppstoreTabSpec> createTabs() => const <AppstoreTabSpec>[
        AppstoreTabSpec(
          routeId: 'app.store.discover.index',
          path: '/',
          label: '发现',
          icon: Icons.explore_outlined,
        ),
        AppstoreTabSpec(
          routeId: 'app.store.apps.index',
          path: '/apps',
          label: '应用',
          icon: Icons.apps,
        ),
        AppstoreTabSpec(
          routeId: 'app.store.games.index',
          path: '/games',
          label: '游戏',
          icon: Icons.sports_esports_outlined,
        ),
        AppstoreTabSpec(
          routeId: 'app.store.search.index',
          path: '/search',
          label: '搜索',
          icon: Icons.search,
        ),
        AppstoreTabSpec(
          routeId: 'app.store.library.index',
          path: '/library',
          label: '库',
          icon: Icons.download_outlined,
        ),
      ];

  /// Canonical route id -> screen builder, composed from capability screens.
  Map<String, AppstoreRouteScreenBuilder> createScreenBuilders() {
    return <String, AppstoreRouteScreenBuilder>{
      'app.store.discover.index': (BuildContext context, AppstoreRouteMatch match) =>
          DiscoverScreen(service: discoverService),
      'app.store.apps.index': (BuildContext context, AppstoreRouteMatch match) =>
          AppsScreen(service: appsService),
      'app.store.games.index': (BuildContext context, AppstoreRouteMatch match) =>
          GamesScreen(service: gamesService),
      'app.store.charts.index': (BuildContext context, AppstoreRouteMatch match) =>
          ChartsScreen(service: chartsService),
      'app.store.category.detail': (BuildContext context, AppstoreRouteMatch match) =>
          CategoryScreen(
            service: categoryService,
            categoryId: match.params['id'] ?? '',
          ),
      'app.store.collection.detail': (BuildContext context, AppstoreRouteMatch match) =>
          CollectionScreen(
            service: collectionService,
            collectionId: match.params['id'] ?? '',
          ),
      'app.store.ai-hub.index': (BuildContext context, AppstoreRouteMatch match) =>
          AiHubScreen(service: aiHubService, screen: match.route.screen),
      'app.store.ai-hub.experts': (BuildContext context, AppstoreRouteMatch match) =>
          AiHubScreen(service: aiHubService, screen: match.route.screen),
      'app.store.ai-hub.plugins': (BuildContext context, AppstoreRouteMatch match) =>
          AiHubScreen(service: aiHubService, screen: match.route.screen),
      'app.store.ai-hub.skills': (BuildContext context, AppstoreRouteMatch match) =>
          AiHubScreen(service: aiHubService, screen: match.route.screen),
      'app.store.ai-hub.mcp': (BuildContext context, AppstoreRouteMatch match) =>
          AiHubScreen(service: aiHubService, screen: match.route.screen),
      'app.store.ai-hub.templates': (BuildContext context, AppstoreRouteMatch match) =>
          AiHubScreen(service: aiHubService, screen: match.route.screen),
      'app.store.ai-hub.template-detail': (
        BuildContext context,
        AppstoreRouteMatch match,
      ) =>
          AiHubScreen(
            service: aiHubService,
            screen: match.route.screen,
            templateId: match.params['id'] ?? '',
          ),
      'app.store.ai-hub.template-detail-alias': (
        BuildContext context,
        AppstoreRouteMatch match,
      ) =>
          AiHubScreen(
            service: aiHubService,
            screen: match.route.screen,
            templateId: match.params['id'] ?? '',
          ),
      'app.store.search.index': (BuildContext context, AppstoreRouteMatch match) =>
          SearchScreen(service: searchService),
      'app.store.app-detail.detail': (BuildContext context, AppstoreRouteMatch match) =>
          AppDetailScreen(
            service: appDetailService,
            listingId: match.params['id'] ?? '',
          ),
      'app.store.events.detail': (BuildContext context, AppstoreRouteMatch match) =>
          EventScreen(
            service: eventsService,
            eventId: match.params['id'] ?? '',
          ),
      'app.store.library.index': (BuildContext context, AppstoreRouteMatch match) =>
          LibraryScreen(service: libraryService),
      'app.store.updates.index': (BuildContext context, AppstoreRouteMatch match) =>
          UpdatesScreen(service: updatesService),
      'app.store.wishlist.index': (BuildContext context, AppstoreRouteMatch match) =>
          WishlistScreen(service: wishlistService),
      'app.store.user-store.index': (BuildContext context, AppstoreRouteMatch match) =>
          UserStoreScreen(service: userStoreService),
      'app.store.user-store.public': (BuildContext context, AppstoreRouteMatch match) =>
          UserStoreScreen(
            service: userStoreService,
            shareToken: match.params['shareToken'] ?? '',
          ),
      'console.store.publisher.overview': (
        BuildContext context,
        AppstoreRouteMatch match,
      ) =>
          PublisherScreen(service: publisherService, screen: 'overview'),
      'console.store.publisher.app-create': (
        BuildContext context,
        AppstoreRouteMatch match,
      ) =>
          PublisherScreen(
            service: publisherService,
            screen: 'app-create',
            // Store application type preset from the creation hub
            // (`?type=app|website|promo`); defaults to APP.
            appType: switch (match.params['type']) {
              'website' => 'WEBSITE',
              'promo' => 'PROMO',
              _ => 'APP',
            },
          ),
      'console.store.publisher.app-manage': (
        BuildContext context,
        AppstoreRouteMatch match,
      ) =>
          PublisherScreen(
            service: publisherService,
            screen: 'app-manage',
            listingId: match.params['id'] ?? '',
          ),
      'console.system.settings.index': (
        BuildContext context,
        AppstoreRouteMatch match,
      ) =>
          SettingsScreen(service: settingsService),
    };
  }

  /// Route auth guard backed by the core IAM session projection.
  bool isRouteAuthorized(SdkworkUiRouteContribution route) {
    return getIamRuntime().session.isAuthenticated;
  }

  /// Login via the IAM dart client (password grant), then propagate tokens
  /// to the appstore SDK client through the session bridge.
  Future<void> loginWithPassword(String account, String password) async {
    final response = await iamClient.auth.sessionsCreate(
      AppbaseSessionCreateCommand(
        username: account.contains('@') ? null : account,
        email: account.contains('@') ? account : null,
        password: password,
      ),
    );
    final data = response?.data;
    if (data is Map) {
      final session = AppstoreSession(
        authToken: data['authToken']?.toString(),
        accessToken: data['accessToken']?.toString(),
        refreshToken: data['refreshToken']?.toString(),
      );
      getIamRuntime().setSession(session);
      sdkClients.propagateSessionTokens(
        authToken: session.authToken,
        accessToken: session.accessToken,
      );
    }
  }

  /// Logout through the IAM client, then clear the local session.
  Future<void> logout() async {
    await iamClient.auth.sessionsCurrentDelete().catchError((Object error) {});
    getIamRuntime().clearSession();
    sdkClients.propagateSessionTokens();
  }
}

Future<AppstoreMobileRuntime> bootstrap() async {
  createIamRuntime();
  registerHostAdapters();
  final sdkClients = createSdkClients();
  final openClient = createOpenSdkClient(sdkClients.transportBaseUrl);
  final iamClient = createAppstoreFlutterIamClient(
    baseUrl: sdkClients.transportBaseUrl,
  );
  final session = getIamRuntime().session;
  final skillsClient = createAppstoreFlutterSkillsClient(
    baseUrl: sdkClients.transportBaseUrl,
    authToken: session.authToken,
    accessToken: session.accessToken,
  );
  final mcpClient = createAppstoreFlutterMcpClient(
    baseUrl: sdkClients.transportBaseUrl,
    authToken: session.authToken,
    accessToken: session.accessToken,
  );
  final routes = createRoutes();
  return AppstoreMobileRuntime(
    sdkClients: sdkClients,
    openClient: openClient,
    iamClient: iamClient,
    skillsClient: skillsClient,
    mcpClient: mcpClient,
    routes: routes,
  );
}
