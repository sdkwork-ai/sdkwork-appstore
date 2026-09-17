/** Session token projection shared by capability packages. */
export class AppstoreSession {
  accessToken?: string;
  authToken?: string;
  refreshToken?: string;

  isAuthenticated(): boolean {
    return (this.authToken?.length ?? 0) > 0 || (this.accessToken?.length ?? 0) > 0;
  }
}
