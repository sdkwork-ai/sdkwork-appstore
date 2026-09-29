import '../session/appstore_session.dart';

/// Appbase IAM runtime boundary for the Flutter root.
///
/// Authority: `APP_SDK_INTEGRATION_SPEC.md` and
/// `IAM_LOGIN_INTEGRATION_SPEC.md`. Exactly one instance exists per root; the
/// concrete appbase runtime is supplied by the root bootstrap once the appbase
/// Dart SDK target is available for Flutter. Session updates propagate to a
/// single token sink so the generated SDK clients stay in sync with the one
/// token owner.
class AppstoreIamRuntime {
  AppstoreIamRuntime();

  AppstoreSession _session = const AppstoreSession();

  void Function(AppstoreSession session)? _tokenSink;

  AppstoreSession get session => _session;

  /// Registers the single token sink (called once by the root bootstrap).
  void bindTokenSink(void Function(AppstoreSession session) sink) {
    _tokenSink = sink;
  }

  void setSession(AppstoreSession session) {
    _session = session;
    _tokenSink?.call(session);
  }

  void clearSession() {
    _session = const AppstoreSession();
    _tokenSink?.call(_session);
  }
}
