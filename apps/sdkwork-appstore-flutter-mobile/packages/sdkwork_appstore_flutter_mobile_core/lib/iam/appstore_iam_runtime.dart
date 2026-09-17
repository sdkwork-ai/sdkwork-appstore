import '../session/appstore_session.dart';

/// Appbase IAM runtime boundary for the Flutter root.
///
/// Authority: `APP_SDK_INTEGRATION_SPEC.md` and
/// `IAM_LOGIN_INTEGRATION_SPEC.md`. Exactly one instance exists per root; the
/// concrete appbase runtime is supplied by the root bootstrap once the appbase
/// Dart SDK target is available for Flutter.
class AppstoreIamRuntime {
  AppstoreSession _session = const AppstoreSession();

  AppstoreSession get session => _session;

  void setSession(AppstoreSession session) {
    _session = session;
  }

  void clearSession() {
    _session = const AppstoreSession();
  }
}
