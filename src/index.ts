function throwTypeError() {
    throw new TypeError('The given URL is not a string. Please verify your string|array.');
}

const endings = ['/', ':', '?', '#'];
const starters = ['.', '/', '@'];

function getDomainFromUrl(url) {
    if (typeof url !== 'string') {
        throwTypeError();
    }

    let domainInc = 0;
    let offsetDomain = 0;
    let offsetStartSlice = 0;
    let offsetPath = 0;
    let len = url.length;
    let i = 0;

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
    } else if (Array.isArray(urls)) {
        const extractedUrls = [];
        let len;

        for (let i = 0, len = urls.length; i < len; i++) {
            extractedUrls.push(<never>getDomainFromUrl(urls[i]));
        }

        return extractedUrls;
    } else {
        throwTypeError();
    }
};


/**
 * Custom Cookie Storage to store cookie across subdomains (used for oidc)
 */
class CookieStorage {
    getCurrentCookieDomain() {
        return (location.hostname === "localhost" || location.hostname === "127.0.0.1")
            ? 'localhost'
            : `.${extractDomain(window.location.href)}`;
    }

    getItem(key: string) {
        const safeKey = encodeURIComponent(key);
        const value = document.cookie
            .split(';')
            .map(x => x.trim())
            .find((item) => item.startsWith(`${safeKey}=`));
        if (value) {
            return decodeURIComponent(value.split(`${safeKey}=`)[1]);
        }
    }
    setItem(key: string, value: string) {
        const safeKey = encodeURIComponent(key);
        document.cookie = `${safeKey}=${encodeURIComponent(value)};domain=${this.getCurrentCookieDomain()};path=/`; // to be accessed from all subdomains
    }
    removeItem(key: string) {
        const safeKey = encodeURIComponent(key);
        document.cookie = `${safeKey}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/; domain=${this.getCurrentCookieDomain()}`; // to be deleted from all subdomains
    }
}

export default new CookieStorage();