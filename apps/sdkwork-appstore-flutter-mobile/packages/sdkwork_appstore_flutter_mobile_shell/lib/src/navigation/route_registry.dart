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

/// Login callback for `auth: required` routes.
typedef AppstoreRouteLoginHandler = Future<void> Function(
  String account,
  String password,
);

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
    this.loginHandler,
  });

  final Map<String, AppstoreRouteScreenBuilder> screenBuilders;
  final List<AppstoreTabSpec> tabs;
  final AppstoreRouteAuthGuard? authGuard;

  /// Async login handler injected by the root; the auth-required screen calls
  /// this to authenticate and the caller refreshes the navigator.
  final AppstoreRouteLoginHandler? loginHandler;

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
        builder: (BuildContext context) => _AppstoreAuthRequiredScreen(loginHandler: loginHandler),
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

class _AppstoreAuthRequiredScreen extends StatefulWidget {
  const _AppstoreAuthRequiredScreen({this.loginHandler});

  final AppstoreRouteLoginHandler? loginHandler;

  @override
  State<_AppstoreAuthRequiredScreen> createState() =>
      _AppstoreAuthRequiredScreenState();
}

class _AppstoreAuthRequiredScreenState
    extends State<_AppstoreAuthRequiredScreen> {
  final _accountController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _submitting = false;
  String _error = '';

  @override
  void dispose() {
    _accountController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final account = _accountController.text.trim();
    final password = _passwordController.text;
    if (account.isEmpty || password.isEmpty || _submitting) return;
    setState(() => _submitting = true);
    try {
      await widget.loginHandler?.call(account, password);
    } catch (error) {
      if (mounted) {
        setState(() =>
            _error = '登录失败，请检查账号密码后重试');
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('登录')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('登录',
                  style: Theme.of(context).textTheme.headlineSmall,
                  textAlign: TextAlign.center),
              const SizedBox(height: 8),
              Text('使用 SDKWork 账户登录，同步库、收藏与应用更新。',
                  style: Theme.of(context).textTheme.bodySmall,
                  textAlign: TextAlign.center),
              const SizedBox(height: 24),
              TextField(
                controller: _accountController,
                decoration: InputDecoration(
                  hintText: '账号 / 邮箱 / 手机号',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              if (_error.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(_error,
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.error,
                          fontSize: 12)),
                ),
              const SizedBox(height: 12),
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  hintText: '密码',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _submitting ? null : _submit,
                child: Text(_submitting ? '登录中…' : '登录'),
              ),
            ],
          ),
        ),
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
