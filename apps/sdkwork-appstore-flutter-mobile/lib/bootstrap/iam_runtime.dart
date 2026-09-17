import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

/// Appbase IAM runtime wiring for the Flutter root.
///
/// Authority: `APP_SDK_INTEGRATION_SPEC.md` and
/// `IAM_LOGIN_INTEGRATION_SPEC.md`. The root owns exactly one token manager
/// and one IAM runtime; feature packages receive session state by injection.
AppstoreIamRuntime? _runtime;

AppstoreIamRuntime createIamRuntime() {
  _runtime ??= AppstoreIamRuntime();
  return _runtime!;
}

AppstoreIamRuntime getIamRuntime() => _runtime ?? createIamRuntime();
