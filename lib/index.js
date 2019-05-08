"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extract_domain_1 = require("extract-domain");
/**
 * Custom Cookie Storage to store cookie across subdomains (used for oidc)
 */
class CookieStorage {
    getCurrentCookieDomain() {
        return (location.hostname === "localhost" || location.hostname === "127.0.0.1")
            ? 'localhost'
            : `.${extract_domain_1.default(window.location.href)}`;
    }
    getItem(key) {
        const safeKey = encodeURIComponent(key);
        const value = document.cookie
            .split(';')
            .map(x => x.trim())
            .find((item) => item.startsWith(`${safeKey}=`));
        if (value) {
            return decodeURIComponent(value.split(`${safeKey}=`)[1]);
        }
    }
    setItem(key, value) {
        const safeKey = encodeURIComponent(key);
        document.cookie = `${safeKey}=${encodeURIComponent(value)};domain=${this.getCurrentCookieDomain()};path=/`; // to be accessed from all subdomains
    }
    removeItem(key) {
        const safeKey = encodeURIComponent(key);
        document.cookie = `${safeKey}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/; domain=${this.getCurrentCookieDomain()}`; // to be deleted from all subdomains
    }
}
exports.default = new CookieStorage();
