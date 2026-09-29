import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';
import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

/// Screen factory for one canonical route id.
///
/// The root bootstrap composes this map from capability packages; the shell
/// only dispatches
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` sections 1 and 5).
typedef AppstoreRouteScreenBuilder = Widget Function(
  BuildContext context,
  AppstoreRouteMatch match,
);

/// Authentication check for `auth: required` routes.
typedef AppstoreRouteAuthGuard = bool Function(SdkworkUiRouteContribution route);

/// Bottom tab specification owned by the root composition.
class AppstoreTabSpec {
  const AppstoreTabSpec({
    required this.routeId,
    required this.path,
    required this.label,
    required this.icon,
  });

  final String routeId;
  final String path;
  final String label;
  final IconData icon;
}

/// Canonical-route resolver for the application navigator.
///
/// Handed to `MaterialApp.onGenerateRoute` so one navigator owns every route:
/// tab paths render [AppstoreTabShell] (persistent bottom navigation), other
/// canonical routes push plain pages, unknown paths render the not-found
/// panel, and cold-start deep links resolve through the same table
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7: deep links resolve
/// to route ids first).
class AppstoreRouteStack {
  const AppstoreRouteStack({
    required this.screenBuilders,
    required this.tabs,
    this.authGuard,
  });

  final Map<String, AppstoreRouteScreenBuilder> screenBuilders;
  final List<AppstoreTabSpec> tabs;
  final AppstoreRouteAuthGuard? authGuard;

  Map<String, int> get _tabPaths => <String, int>{
        for (var index = 0; index < tabs.length; index++) tabs[index].path: index,
      };

  /// `MaterialApp.onGenerateRoute` implementation.
  Route<void>? onGenerateRoute(RouteSettings settings) {
    final name = settings.name ?? '/';
    final match = resolveAppstoreRoute(name);
    if (match == null) {
      return MaterialPageRoute<void>(
        settings: settings,
        builder: (BuildContext context) => const _AppstoreNotFoundScreen(),
      );
    }
    final guard = authGuard;
    if (match.route.auth == 'required' && guard != null && !guard(match.route)) {
      return MaterialPageRoute<void>(
        settings: settings,
        builder: (BuildContext context) => const _AppstoreAuthRequiredScreen(),
      );
    }
    final builder = screenBuilders[match.route.id];
    if (builder == null) {
      return MaterialPageRoute<void>(
        settings: settings,
        builder: (BuildContext context) => _AppstoreMissingScreen(routeId: match.route.id),
      );
    }
    final tabIndex = _tabPaths[name];
    if (tabIndex != null) {
      return MaterialPageRoute<void>(
        settings: settings,
        builder: (BuildContext context) => AppstoreTabShell(
          tabs: tabs,
          initialIndex: tabIndex,
          buildTabScreen: (BuildContext context, int index) => _buildTabScreen(context, index),
        ),
      );
    }
    return MaterialPageRoute<void>(
      settings: settings,
      builder: (BuildContext context) => builder(context, match),
    );
  }

  /// Builds the screen of one tab root; `auth: required` tabs render the
  /// auth panel for anonymous sessions, and unknown tab ids render the missing
  /// panel so a miscomposed root surfaces instead of a blank tab.
  Widget _buildTabScreen(BuildContext context, int index) {
    final spec = tabs[index];
    final builder = screenBuilders[spec.routeId];
    final guard = authGuard;
    final route = listAppstoreRouteIdentities().firstWhere(
      (route) => route.id == spec.routeId,
    );
    if (route.auth == 'required' && guard != null && !guard(route)) {
      return const _AppstoreAuthRequiredScreen();
    }
    if (builder == null) {
      return _AppstoreMissingScreen(routeId: spec.routeId);
    }
    return builder(
      context,
      AppstoreRouteMatch(route: route, params: const <String, String>{}),
    );
  }
}

/// Persistent bottom navigation container for the tab roots.
class AppstoreTabShell extends StatefulWidget {
  const AppstoreTabShell({
    required this.tabs,
    required this.buildTabScreen,
    this.initialIndex = 0,
    super.key,
  });

  final List<AppstoreTabSpec> tabs;
  final int initialIndex;
  final Widget Function(BuildContext context, int index) buildTabScreen;

  @override
  State<AppstoreTabShell> createState() => _AppstoreTabShellState();
}

class _AppstoreTabShellState extends State<AppstoreTabShell> {
  late int _currentIndex = widget.initialIndex.clamp(0, widget.tabs.length - 1);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: <Widget>[
          for (var index = 0; index < widget.tabs.length; index++)
            widget.buildTabScreen(context, index),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (int index) => setState(() => _currentIndex = index),
        destinations: <Widget>[
          for (final tab in widget.tabs)
            NavigationDestination(icon: Icon(tab.icon), label: tab.label),
        ],
      ),
    );
  }
}

class _AppstoreNotFoundScreen extends StatelessWidget {
  const _AppstoreNotFoundScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('页面未找到')),
      body: const AppstoreScreenState(
        kind: AppstoreScreenStateKind.empty,
        message: '该页面不存在或已下线',
      ),
    );
  }
}

class _AppstoreAuthRequiredScreen extends StatelessWidget {
  const _AppstoreAuthRequiredScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('需要登录')),
      body: const AppstoreScreenState(
        kind: AppstoreScreenStateKind.empty,
        message: '登录后即可访问该页面',
      ),
    );
  }
}

class _AppstoreMissingScreen extends StatelessWidget {
  const _AppstoreMissingScreen({required this.routeId});

  final String routeId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('功能未装配')),
      body: AppstoreScreenState(
        kind: AppstoreScreenStateKind.error,
        message: '路由 $routeId 尚未装配对应的 capability screen。',
      ),
    );
  }
}
