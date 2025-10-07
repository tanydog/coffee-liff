// public/liff-helper.js
// LIFF の初期化とログイン制御を共通化
(function (global) {
  const env = global.ENV || {};
  let initializedLiffId = null;
  let initPromise = null;

  function getSdk() {
    if (!global.liff) {
      throw new Error('LIFF SDK が読み込まれていません');
    }
    return global.liff;
  }

  async function initOnce(liffId) {
    const sdk = getSdk();
    if (initPromise && initializedLiffId === liffId) {
      return initPromise;
    }

    initializedLiffId = liffId;
    initPromise = (async () => {
      try {
        await sdk.init({ liffId, withLoginOnExternalBrowser: true });
        if (sdk.ready && typeof sdk.ready.then === 'function') {
          await sdk.ready;
        }
        return sdk;
      } catch (error) {
        initializedLiffId = null;
        initPromise = null;
        throw error;
      }
    })();

    return initPromise;
  }

  /**
   * LIFF の初期化とログイン状態の確認を行う共通関数。
   * @param {Object} options
   * @param {string} options.liffId 対象の LIFF ID。
   * @param {boolean} [options.autoLogin=true] 未ログイン時に自動でログイン処理を走らせるかどうか。
   * @param {string} [options.redirectUri] ログイン後に戻ってくるためのリダイレクト先。
   * @returns {Promise<{redirected: boolean, loggedIn: boolean, idToken: string|null}>}
   */
  async function ensureLogin(options = {}) {
    const { liffId, autoLogin = true, redirectUri } = options;
    const resolvedId = liffId || env?.LIFF_ID || env?.LIFF?.DEFAULT;
    if (!resolvedId) {
      throw new Error('LIFF ID が設定されていません');
    }

    const sdk = await initOnce(resolvedId);
    const loggedIn = sdk.isLoggedIn();

    if (autoLogin && !loggedIn) {
      const redirect = redirectUri || (global.location ? global.location.href : undefined);
      if (redirect) {
        sdk.login({ redirectUri: redirect });
      } else {
        sdk.login();
      }
      return { redirected: true, loggedIn: false, idToken: null };
    }

    const idToken = loggedIn ? sdk.getIDToken() : null;
    return { redirected: false, loggedIn, idToken };
  }

  global.LiffHelper = { ensureLogin };
})(window);
