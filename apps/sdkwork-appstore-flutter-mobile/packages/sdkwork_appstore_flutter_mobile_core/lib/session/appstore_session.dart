/// Session token projection shared by capability packages.
class AppstoreSession {
  const AppstoreSession({this.accessToken, this.authToken, this.refreshToken});

  final String? accessToken;
  final String? authToken;
  final String? refreshToken;

  bool get isAuthenticated =>
      (authToken?.isNotEmpty ?? false) || (accessToken?.isNotEmpty ?? false);
}
