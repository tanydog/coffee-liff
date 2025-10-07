import { appConfig, assertConfig } from '../core/env.js';
import { LiffClient } from '../core/liff-client.js';
import { ApiClient } from '../core/api-client.js';

function resolveLiffId(liffKey) {
  if (!liffKey) return null;
  return appConfig.liff[liffKey];
}

export async function bootstrapSecurePage({ liffKey, requireApi = true, autoFetchProfile = true } = {}) {
  const requiredKeys = [];
  if (liffKey) requiredKeys.push(`liff.${liffKey}`);
  if (requireApi) requiredKeys.push('apiBase');
  assertConfig(requiredKeys);

  const liffId = resolveLiffId(liffKey);
  const liffClient = new LiffClient({ liffId });
  await liffClient.ensureLogin();

  const apiClient = requireApi
    ? new ApiClient({ baseUrl: appConfig.apiBase, tokenProvider: () => liffClient.getIdToken() })
    : null;

  const profile = autoFetchProfile ? await liffClient.getProfile() : null;

  return { liffClient, apiClient, profile };
}

export async function bootstrapPublicPage({ liffKey, autoFetchProfile = false } = {}) {
  const requiredKeys = [];
  if (liffKey) requiredKeys.push(`liff.${liffKey}`);
  assertConfig(requiredKeys);

  const liffId = resolveLiffId(liffKey);
  const liffClient = liffId ? new LiffClient({ liffId, autoLogin: false }) : null;
  if (liffClient) {
    await liffClient.init();
  }

  const profile = autoFetchProfile && liffClient ? await liffClient.getProfile() : null;

  return { liffClient, profile };
}
