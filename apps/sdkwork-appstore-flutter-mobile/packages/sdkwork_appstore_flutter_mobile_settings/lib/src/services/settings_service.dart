import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../models/settings_models.dart';

/// Settings service.
///
/// Reads the appbase IAM runtime session owned by core; no SDK construction
/// and no raw transport here. IAM login/session behavior follows
/// `IAM_LOGIN_INTEGRATION_SPEC.md` once the appbase Dart wrapper lands.
class SettingsService {
  const SettingsService({required this.iamRuntime});

  final AppstoreIamRuntime iamRuntime;

  String get capability => 'settings';

  /// Signed-in state, or null-shaped anonymous account.
  SettingsAccount loadAccount() {
    return SettingsAccount(signedIn: iamRuntime.session.isAuthenticated);
  }

  /// Clears the local session (logout boundary; platform secure storage and
  /// token-manager clearing land with the appbase Dart wrapper).
  void signOut() {
    iamRuntime.clearSession();
  }
}
