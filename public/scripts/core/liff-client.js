export class LiffClient {
  constructor({ liffId, autoLogin = true } = {}) {
    this.liffId = liffId || null;
    this.autoLogin = autoLogin;
    this.initialized = false;
  }

  async init() {
    if (!this.liffId) {
      throw new Error("LIFF ID is not provided");
    }
    if (this.initialized) return;
    await liff.init({ liffId: this.liffId });
    this.initialized = true;
    if (this.autoLogin && !liff.isLoggedIn()) {
      liff.login();
      throw new Error("redirecting_to_login");
    }
  }

  async ensureLogin() {
    await this.init();
    if (!liff.isLoggedIn()) {
      liff.login();
      throw new Error("redirecting_to_login");
    }
  }

  getIdToken() {
    const token = liff.getIDToken();
    if (!token) {
      throw new Error("missing_id_token");
    }
    return token;
  }

  async getProfile() {
    try {
      return await liff.getProfile();
    } catch (error) {
      console.warn("Failed to load profile", error);
      return null;
    }
  }

  logout() {
    if (liff.isLoggedIn()) {
      liff.logout();
    }
  }
}
