const rawEnv = window.ENV || {};

function fallbackLiffId(primary, legacy) {
  return primary || rawEnv?.LIFF_ID || legacy || "";
}

export const appConfig = Object.freeze({
  apiBase: rawEnv?.API_BASE || "",
  liff: {
    log: fallbackLiffId(rawEnv?.LIFF?.LOG),
    diagnosis: fallbackLiffId(rawEnv?.LIFF?.DIAG),
    login: fallbackLiffId(rawEnv?.LIFF?.LOGIN),
    profile: fallbackLiffId(rawEnv?.LIFF?.PROFILE),
  },
});

export function assertConfig(keys) {
  const missing = keys.filter((key) => {
    const value = key.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), appConfig);
    return !value;
  });
  if (missing.length) {
    throw new Error(`Missing configuration values: ${missing.join(", ")}`);
  }
}
