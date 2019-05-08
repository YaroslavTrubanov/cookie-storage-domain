"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function throwTypeError() {
    throw new TypeError('The given URL is not a string. Please verify your string|array.');
}
var endings = ['/', ':', '?', '#'];
var starters = ['.', '/', '@'];
function getDomainFromUrl(url) {
    if (typeof url !== 'string') {
        throwTypeError();
    }
    var domainInc = 0;
    var offsetDomain = 0;
    var offsetStartSlice = 0;
    var offsetPath = 0;
    var len = url.length;
    var i = 0;
    // Find end offset of domain
    while (len-- && ++i) {
        if (domainInc && endings.indexOf(url[i]) > -1) {
            break;
        }
        if (url[i] !== '.') {
            continue;
        }
        ++domainInc;
        offsetDomain = i;
    }
    offsetPath = i;
    i = offsetDomain;
    // Find offset before domain name.
    while (i--) {
        // Look for sub domain, protocol or basic auth
        if (starters.indexOf(url[i]) === -1) {
            continue;
        }
        offsetStartSlice = i + 1;
        break;
    }
    // offsetStartSlice should always be larger than protocol
    if (offsetStartSlice < 2) {
        return '';
    }
    // Tried several approaches slicing a string. Can't get it any faster than this.
    return url.slice(offsetStartSlice, offsetPath);
}
function extractDomain(urls) {
    if (typeof urls === 'string') {
        return getDomainFromUrl(urls);
    }
    else if (Array.isArray(urls)) {
        var extractedUrls = [];
        var len = void 0;
        for (var i = 0, len_1 = urls.length; i < len_1; i++) {
            extractedUrls.push(getDomainFromUrl(urls[i]));
        }
        return extractedUrls;
    }
    else {
        throwTypeError();
    }
}
;
/**
 * Custom Cookie Storage to store cookie across subdomains (used for oidc)
 */
var CookieStorage = /** @class */ (function () {
    function CookieStorage() {
    }
    CookieStorage.prototype.getCurrentCookieDomain = function () {
        return (location.hostname === "localhost" || location.hostname === "127.0.0.1")
            ? 'localhost'
            : "." + extractDomain(window.location.href);
    };
    CookieStorage.prototype.getItem = function (key) {
        var safeKey = encodeURIComponent(key);
        var value = document.cookie
            .split(';')
            .map(function (x) { return x.trim(); })
            .find(function (item) { return item.startsWith(safeKey + "="); });
        if (value) {
            return decodeURIComponent(value.split(safeKey + "=")[1]);
        }
    };
    CookieStorage.prototype.setItem = function (key, value) {
        var safeKey = encodeURIComponent(key);
        document.cookie = safeKey + "=" + encodeURIComponent(value) + ";domain=" + this.getCurrentCookieDomain() + ";path=/"; // to be accessed from all subdomains
    };
    CookieStorage.prototype.removeItem = function (key) {
        var safeKey = encodeURIComponent(key);
        document.cookie = safeKey + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/; domain=" + this.getCurrentCookieDomain(); // to be deleted from all subdomains
    };
    return CookieStorage;
}());
exports.default = new CookieStorage();
