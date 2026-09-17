import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import 'host_adapters.dart';
import 'iam_runtime.dart';
import 'routes.dart';
import 'sdk_clients.dart';

/// Flutter mobile composition root.
class AppstoreMobileRuntime {
  const AppstoreMobileRuntime({
    required this.sdkClients,
    required this.routes,
  });

  final AppstoreAppSdkClients sdkClients;
  final List<SdkworkUiRouteContribution> routes;
}

Future<AppstoreMobileRuntime> bootstrap() async {
  createIamRuntime();
  registerHostAdapters();
  final sdkClients = createSdkClients();
  final routes = createRoutes();
  return AppstoreMobileRuntime(sdkClients: sdkClients, routes: routes);
}
