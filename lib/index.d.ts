/**
 * Custom Cookie Storage to store cookie across subdomains (used for oidc)
 */
declare class CookieStorage {
    getCurrentCookieDomain(): string;
    getItem(key: string): string | undefined;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
declare const _default: CookieStorage;
export default _default;
