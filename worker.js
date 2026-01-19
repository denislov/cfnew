import { connect } from 'cloudflare:sockets';
let at = '351c9981-04b6-4103-aa4b-864aa9c91469';
let fallbackAddress = '';
let socks5Config = '';
let customPreferredIPs = [];
let customPreferredDomains = [];
let enableSocksDowngrade = false;
let disableNonTLS = false;
let disablePreferred = false;

let enableRegionMatching = true;
let currentWorkerRegion = '';
let manualWorkerRegion = '';
let piu = '';
let cp = '';

let ev = true;
let et = false;
let ex = false;
let tp = '';
// 启用ECH功能（true启用，false禁用）
let enableECH = false;

let scu = 'https://url.v1.mk/sub';

// GitHub托管的HTML页面URL配置
// 用户可以修改为自己的GitHub仓库地址
const GITHUB_HTML_BASE = 'https://raw.githubusercontent.com/denislov/cfnew/main';
const TERMINAL_HTML_URL = `${GITHUB_HTML_BASE}/terminal.html`;
const SUBSCRIPTION_HTML_URL = `${GITHUB_HTML_BASE}/subscription.html`;
// HTML缓存TTL（秒）
const HTML_CACHE_TTL = 3600;

let epd = false;   // 优选域名默认关闭
let epi = true;
let egi = true;

let kvStore = null;
let kvConfig = {};

let backupIPs = [
    { domain: 'ProxyIP.US.CMLiussss.net', region: 'US', regionCode: 'US', port: 443 },
    { domain: 'ProxyIP.SG.CMLiussss.net', region: 'SG', regionCode: 'SG', port: 443 },
    { domain: 'ProxyIP.JP.CMLiussss.net', region: 'JP', regionCode: 'JP', port: 443 },
    { domain: 'ProxyIP.KR.CMLiussss.net', region: 'KR', regionCode: 'KR', port: 443 },
    { domain: 'ProxyIP.DE.CMLiussss.net', region: 'DE', regionCode: 'DE', port: 443 },
    { domain: 'ProxyIP.SE.CMLiussss.net', region: 'SE', regionCode: 'SE', port: 443 },
    { domain: 'ProxyIP.NL.CMLiussss.net', region: 'NL', regionCode: 'NL', port: 443 },
    { domain: 'ProxyIP.FI.CMLiussss.net', region: 'FI', regionCode: 'FI', port: 443 },
    { domain: 'ProxyIP.GB.CMLiussss.net', region: 'GB', regionCode: 'GB', port: 443 },
    { domain: 'ProxyIP.Oracle.cmliussss.net', region: 'Oracle', regionCode: 'Oracle', port: 443 },
    { domain: 'ProxyIP.DigitalOcean.CMLiussss.net', region: 'DigitalOcean', regionCode: 'DigitalOcean', port: 443 },
    { domain: 'ProxyIP.Vultr.CMLiussss.net', region: 'Vultr', regionCode: 'Vultr', port: 443 },
    { domain: 'ProxyIP.Multacom.CMLiussss.net', region: 'Multacom', regionCode: 'Multacom', port: 443 }
];

const directDomains = [
    { name: "cloudflare.182682.xyz", domain: "cloudflare.182682.xyz" }, { name: "speed.marisalnc.com", domain: "speed.marisalnc.com" },
    { domain: "freeyx.cloudflare88.eu.org" }, { domain: "bestcf.top" }, { domain: "cdn.2020111.xyz" }, { domain: "cfip.cfcdn.vip" },
    { domain: "cf.0sm.com" }, { domain: "cf.090227.xyz" }, { domain: "cf.zhetengsha.eu.org" }, { domain: "cloudflare.9jy.cc" },
    { domain: "cf.zerone-cdn.pp.ua" }, { domain: "cfip.1323123.xyz" }, { domain: "cnamefuckxxs.yuchen.icu" }, { domain: "cloudflare-ip.mofashi.ltd" },
    { domain: "115155.xyz" }, { domain: "cname.xirancdn.us" }, { domain: "f3058171cad.002404.xyz" }, { domain: "8.889288.xyz" },
    { domain: "cdn.tzpro.xyz" }, { domain: "cf.877771.xyz" }, { domain: "xn--b6gac.eu.org" }
];

const E_INVALID_DATA = atob('aW52YWxpZCBkYXRh');
const E_INVALID_USER = atob('aW52YWxpZCB1c2Vy');
const E_UNSUPPORTED_CMD = atob('Y29tbWFuZCBpcyBub3Qgc3VwcG9ydGVk');
const E_UDP_DNS_ONLY = atob('VURQIHByb3h5IG9ubHkgZW5hYmxlIGZvciBETlMgd2hpY2ggaXMgcG9ydCA1Mw==');
const E_INVALID_ADDR_TYPE = atob('aW52YWxpZCBhZGRyZXNzVHlwZQ==');
const E_EMPTY_ADDR = atob('YWRkcmVzc1ZhbHVlIGlzIGVtcHR5');
const E_WS_NOT_OPEN = atob('d2ViU29ja2V0LmVhZHlTdGF0ZSBpcyBub3Qgb3Blbg==');
const E_INVALID_ID_STR = atob('U3RyaW5naWZpZWQgaWRlbnRpZmllciBpcyBpbnZhbGlk');
const E_INVALID_SOCKS_ADDR = atob('SW52YWxpZCBTT0NLUyBhZGRyZXNzIGZvcm1hdA==');
const E_SOCKS_NO_METHOD = atob('bm8gYWNjZXB0YWJsZSBtZXRob2Rz');
const E_SOCKS_AUTH_NEEDED = atob('c29ja3Mgc2VydmVyIG5lZWRzIGF1dGg=');
const E_SOCKS_AUTH_FAIL = atob('ZmFpbCB0byBhdXRoIHNvY2tzIHNlcnZlcg==');
const E_SOCKS_CONN_FAIL = atob('ZmFpbCB0byBvcGVuIHNvY2tzIGNvbm5lY3Rpb24=');

let parsedSocks5Config = {};
let isSocksEnabled = false;

const ADDRESS_TYPE_IPV4 = 1;
const ADDRESS_TYPE_URL = 2;
const ADDRESS_TYPE_IPV6 = 3;

function isValidFormat(str) {
    const userRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return userRegex.test(str);
}

function isValidIP(ip) {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4Regex.test(ip)) return true;

    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv6Regex.test(ip)) return true;

    const ipv6ShortRegex = /^::1$|^::$|^(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;
    if (ipv6ShortRegex.test(ip)) return true;

    return false;
}

async function initKVStore(env) {

    if (env.C) {
        try {
            kvStore = env.C;
            await loadKVConfig();
        } catch (error) {
            kvStore = null;
        }
    } else {
    }
}

async function loadKVConfig() {

    if (!kvStore) {
        return;
    }

    try {
        const configData = await kvStore.get('c');

        if (configData) {
            kvConfig = JSON.parse(configData);
        } else {
        }
    } catch (error) {
        kvConfig = {};
    }
}

async function saveKVConfig() {
    if (!kvStore) {
        return;
    }

    try {
        const configString = JSON.stringify(kvConfig);
        await kvStore.put('c', configString);
    } catch (error) {
        throw error;
    }
}

function getConfigValue(key, defaultValue = '') {

    if (kvConfig[key] !== undefined) {
        return kvConfig[key];
    }
    return defaultValue;
}

async function setConfigValue(key, value) {
    kvConfig[key] = value;
    await saveKVConfig();
}

async function detectWorkerRegion(request) {
    try {
        const cfCountry = request.cf?.country;

        if (cfCountry) {
            const countryToRegion = {
                'US': 'US', 'SG': 'SG', 'JP': 'JP', 'KR': 'KR',
                'DE': 'DE', 'SE': 'SE', 'NL': 'NL', 'FI': 'FI', 'GB': 'GB',
                'CN': 'SG', 'TW': 'JP', 'AU': 'SG', 'CA': 'US',
                'FR': 'DE', 'IT': 'DE', 'ES': 'DE', 'CH': 'DE',
                'AT': 'DE', 'BE': 'NL', 'DK': 'SE', 'NO': 'SE', 'IE': 'GB'
            };

            if (countryToRegion[cfCountry]) {
                return countryToRegion[cfCountry];
            }
        }

        return 'SG';

    } catch (error) {
        return 'SG';
    }
}

async function getBestBackupIP(workerRegion = '') {

    if (backupIPs.length === 0) {
        return null;
    }

    const availableIPs = backupIPs.map(ip => ({ ...ip, available: true }));

    if (enableRegionMatching && workerRegion) {
        const sortedIPs = getSmartRegionSelection(workerRegion, availableIPs);
        if (sortedIPs.length > 0) {
            const selectedIP = sortedIPs[0];
            return selectedIP;
        }
    }

    const selectedIP = availableIPs[0];
    return selectedIP;
}

function getNearbyRegions(region) {
    const nearbyMap = {
        'US': ['SG', 'JP', 'KR'],
        'SG': ['JP', 'KR', 'US'],
        'JP': ['SG', 'KR', 'US'],
        'KR': ['JP', 'SG', 'US'],
        'DE': ['NL', 'GB', 'SE', 'FI'],
        'SE': ['DE', 'NL', 'FI', 'GB'],
        'NL': ['DE', 'GB', 'SE', 'FI'],
        'FI': ['SE', 'DE', 'NL', 'GB'],
        'GB': ['DE', 'NL', 'SE', 'FI']
    };

    return nearbyMap[region] || [];
}

function getAllRegionsByPriority(region) {
    const nearbyRegions = getNearbyRegions(region);
    const allRegions = ['US', 'SG', 'JP', 'KR', 'DE', 'SE', 'NL', 'FI', 'GB'];

    return [region, ...nearbyRegions, ...allRegions.filter(r => r !== region && !nearbyRegions.includes(r))];
}

function getSmartRegionSelection(workerRegion, availableIPs) {

    if (!enableRegionMatching || !workerRegion) {
        return availableIPs;
    }

    const priorityRegions = getAllRegionsByPriority(workerRegion);

    const sortedIPs = [];

    for (const region of priorityRegions) {
        const regionIPs = availableIPs.filter(ip => ip.regionCode === region);
        sortedIPs.push(...regionIPs);
    }

    return sortedIPs;
}

function parseAddressAndPort(input) {
    if (input.includes('[') && input.includes(']')) {
        const match = input.match(/^\[([^\]]+)\](?::(\d+))?$/);
        if (match) {
            return {
                address: match[1],
                port: match[2] ? parseInt(match[2], 10) : null
            };
        }
    }

    const lastColonIndex = input.lastIndexOf(':');
    if (lastColonIndex > 0) {
        const address = input.substring(0, lastColonIndex);
        const portStr = input.substring(lastColonIndex + 1);
        const port = parseInt(portStr, 10);

        if (!isNaN(port) && port > 0 && port <= 65535) {
            return { address, port };
        }
    }

    return { address: input, port: null };
}

// ===== HTML页面获取辅助函数 =====

// 从GitHub获取HTML页面，失败时返回JSON错误
async function fetchHtmlFromGitHub(htmlUrl, options = {}) {
    try {
        const response = await fetch(htmlUrl, {
            headers: { 'User-Agent': 'Cloudflare-Worker/1.0' },
            cf: { cacheTtl: HTML_CACHE_TTL, cacheEverything: true }
        });

        if (response.ok) {
            let html = await response.text();
            // 如果需要注入配置
            if (options.injectConfig) {
                for (const [key, value] of Object.entries(options.injectConfig)) {
                    html = html.replace(new RegExp(`let ${key} = [^;]+;`), `let ${key} = ${JSON.stringify(value)};`);
                }
            }
            return new Response(html, {
                status: 200,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': `public, max-age=${HTML_CACHE_TTL}`
                }
            });
        }
        throw new Error(`GitHub返回状态码: ${response.status}`);
    } catch (e) {
        return new Response(JSON.stringify({
            error: 'HTML页面加载失败',
            message: e.message,
            hint: '请检查GitHub仓库配置是否正确',
            githubUrl: htmlUrl
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
        });
    }
}

// 处理订阅中心页面请求
async function handleSubscriptionPage(request, user) {
    return await fetchHtmlFromGitHub(SUBSCRIPTION_HTML_URL, {
        injectConfig: {
            useCustomPath: !!(cp && cp.trim()),
            workerUser: user
        }
    });
}

// 验证路径是否有效（UUID或自定义路径）
function validatePath(pathIdentifier) {
    if (cp && cp.trim()) {
        const cleanCustomPath = cp.trim().startsWith('/') ? cp.trim().substring(1) : cp.trim();
        return pathIdentifier === cleanCustomPath;
    } else {
        return isValidFormat(pathIdentifier) && pathIdentifier === at;
    }
}

// 返回JSON错误响应
function jsonError(message, status = 400, extra = {}) {
    return new Response(JSON.stringify({ error: message, ...extra }), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}

// 返回JSON成功响应
function jsonSuccess(data) {
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}


// ===== 路径验证辅助函数 =====

// 验证API路径是否有效
function validateAPIPath(url, apiEndpoint) {
    if (!url.pathname.includes(apiEndpoint)) return { valid: false };

    const pathParts = url.pathname.split('/').filter(p => p);
    const apiIndex = pathParts.indexOf('api');
    if (apiIndex <= 0) return { valid: false };

    const pathSegments = pathParts.slice(0, apiIndex);
    const pathIdentifier = pathSegments.join('/');

    let isValid = false;
    if (cp && cp.trim()) {
        const cleanCustomPath = cp.trim().startsWith('/') ? cp.trim().substring(1) : cp.trim();
        isValid = (pathIdentifier === cleanCustomPath);
    } else {
        isValid = (isValidFormat(pathIdentifier) && pathIdentifier === at);
    }

    return { valid: isValid, pathIdentifier };
}

// 返回路径验证失败的JSON响应
function pathValidationError() {
    return new Response(JSON.stringify({ error: '路径验证失败' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
    });
}

// ===== 配置初始化模块 =====

async function initWorkerConfig(env, request) {
    await initKVStore(env);

    at = (env.u || env.U || at).toLowerCase();
    const subPath = (env.d || env.D || at).toLowerCase();

    // 地区检测配置
    const ci = getConfigValue('p', env.p || env.P);
    const manualRegion = getConfigValue('wk', env.wk || env.WK);

    if (manualRegion && manualRegion.trim()) {
        manualWorkerRegion = manualRegion.trim().toUpperCase();
        currentWorkerRegion = manualWorkerRegion;
    } else if (ci && ci.trim()) {
        currentWorkerRegion = 'CUSTOM';
    } else {
        currentWorkerRegion = await detectWorkerRegion(request);
    }

    // 地区匹配控制
    const regionMatchingControl = env.rm || env.RM;
    if (regionMatchingControl && regionMatchingControl.toLowerCase() === 'no') {
        enableRegionMatching = false;
    }

    // Fallback地址
    const envFallback = getConfigValue('p', env.p || env.P);
    if (envFallback) {
        fallbackAddress = envFallback.trim();
    }

    // SOCKS5配置
    socks5Config = getConfigValue('s', env.s || env.S) || socks5Config;
    if (socks5Config) {
        try {
            parsedSocks5Config = parseSocksConfig(socks5Config);
            isSocksEnabled = true;
        } catch (err) {
            isSocksEnabled = false;
        }
    }

    // 自定义优选IP解析
    const customPreferred = getConfigValue('yx', env.yx || env.YX);
    if (customPreferred) {
        parseCustomPreferredIPs(customPreferred);
    }

    // 控制开关配置
    initControlFlags(env);

    // URL和路径配置
    piu = getConfigValue('yxURL', env.yxURL || env.YXURL) || 'https://raw.githubusercontent.com/qwer-search/bestip/refs/heads/main/kejilandbestip.txt';
    cp = getConfigValue('d', env.d || env.D) || '';

    // 检查是否使用非默认URL
    const defaultURL = 'https://raw.githubusercontent.com/qwer-search/bestip/refs/heads/main/kejilandbestip.txt';
    if (piu !== defaultURL) {
        directDomains.length = 0;
        customPreferredIPs = [];
        customPreferredDomains = [];
    }

    return subPath;
}

// 解析自定义优选IP列表
function parseCustomPreferredIPs(customPreferred) {
    try {
        const preferredList = customPreferred.split(',').map(item => item.trim()).filter(item => item);
        customPreferredIPs = [];
        customPreferredDomains = [];

        preferredList.forEach(item => {
            let nodeName = '';
            let addressPart = item;

            if (item.includes('#')) {
                const parts = item.split('#');
                addressPart = parts[0].trim();
                nodeName = parts[1].trim();
            }

            const { address, port } = parseAddressAndPort(addressPart);

            if (!nodeName) {
                nodeName = '自定义优选-' + address + (port ? ':' + port : '');
            }

            if (isValidIP(address)) {
                customPreferredIPs.push({ ip: address, port: port, isp: nodeName });
            } else {
                customPreferredDomains.push({ domain: address, port: port, name: nodeName });
            }
        });
    } catch (err) {
        customPreferredIPs = [];
        customPreferredDomains = [];
    }
}

// 初始化控制开关
function initControlFlags(env) {
    // 降级控制
    const downgradeControl = getConfigValue('qj', env.qj || env.QJ);
    if (downgradeControl && downgradeControl.toLowerCase() === 'no') {
        enableSocksDowngrade = true;
    }

    // TLS控制
    const dkbyControl = getConfigValue('dkby', env.dkby || env.DKBY);
    if (dkbyControl && dkbyControl.toLowerCase() === 'yes') {
        disableNonTLS = true;
    }

    // 优选控制
    const yxbyControl = env.yxby || env.YXBY;
    if (yxbyControl && yxbyControl.toLowerCase() === 'yes') {
        disablePreferred = true;
    }

    // 协议控制
    const vlessControl = getConfigValue('ev', env.ev);
    if (vlessControl !== undefined && vlessControl !== '') {
        ev = vlessControl === 'yes' || vlessControl === true || vlessControl === 'true';
    }

    const tjControl = getConfigValue('et', env.et);
    if (tjControl !== undefined && tjControl !== '') {
        et = tjControl === 'yes' || tjControl === true || tjControl === 'true';
    }

    tp = getConfigValue('tp', env.tp) || '';

    const xhttpControl = getConfigValue('ex', env.ex);
    if (xhttpControl !== undefined && xhttpControl !== '') {
        ex = xhttpControl === 'yes' || xhttpControl === true || xhttpControl === 'true';
    }

    // 订阅转换地址
    scu = getConfigValue('scu', env.scu) || 'https://url.v1.mk/sub';

    // 内置优选控制
    const preferredDomainsControl = getConfigValue('epd', env.epd || 'no');
    if (preferredDomainsControl !== undefined && preferredDomainsControl !== '') {
        epd = preferredDomainsControl !== 'no' && preferredDomainsControl !== false && preferredDomainsControl !== 'false';
    }

    const preferredIPsControl = getConfigValue('epi', env.epi);
    if (preferredIPsControl !== undefined && preferredIPsControl !== '') {
        epi = preferredIPsControl !== 'no' && preferredIPsControl !== false && preferredIPsControl !== 'false';
    }

    const githubIPsControl = getConfigValue('egi', env.egi);
    if (githubIPsControl !== undefined && githubIPsControl !== '') {
        egi = githubIPsControl !== 'no' && githubIPsControl !== false && githubIPsControl !== 'false';
    }

    // ECH控制
    const echControl = getConfigValue('ech', env.ech);
    if (echControl !== undefined && echControl !== '') {
        enableECH = echControl === 'yes' || echControl === true || echControl === 'true';
    }

    // ECH需要TLS
    if (enableECH) {
        disableNonTLS = true;
    }

    // 默认启用VLESS
    if (!ev && !et && !ex) {
        ev = true;
    }
}

// ===== API路由处理模块 =====

async function handleAPIRoutes(request, url, env) {
    // /api/status - 系统状态
    const statusResult = validateAPIPath(url, '/api/status');
    if (statusResult.valid) {
        const detectedRegion = await detectWorkerRegion(request);
        const echEnabled = getConfigValue('ech', env.ech) === 'yes';
        const customIP = getConfigValue('p', env.p || env.P);
        const manualRegion = getConfigValue('wk', env.wk || env.WK);

        return new Response(JSON.stringify({
            region: manualRegion && manualRegion.trim() ? manualRegion.trim().toUpperCase() :
                customIP && customIP.trim() ? 'CUSTOM' : detectedRegion,
            detectionMethod: manualRegion && manualRegion.trim() ? 'manual' :
                customIP && customIP.trim() ? 'custom_ip' : 'cloudflare',
            echEnabled: echEnabled,
            customIP: customIP || null,
            timestamp: new Date().toISOString()
        }), { headers: { 'Content-Type': 'application/json' } });
    } else if (url.pathname.includes('/api/status')) {
        return pathValidationError();
    }

    // /api/ips - 优选IP管理
    const ipsResult = validateAPIPath(url, '/api/ips');
    if (ipsResult.valid) {
        return await handlePreferredIPsAPI(request);
    } else if (url.pathname.includes('/api/ips')) {
        return pathValidationError();
    }

    // /api/config - 配置管理
    const configResult = validateAPIPath(url, '/api/config');
    if (configResult.valid) {
        return await handleConfigAPI(request);
    } else if (url.pathname.includes('/api/config')) {
        return pathValidationError();
    }

    // /api/domains - 优选域名管理
    const domainsResult = validateAPIPath(url, '/api/domains');
    if (domainsResult.valid) {
        return await handleDomainsAPI(request);
    } else if (url.pathname.includes('/api/domains')) {
        return pathValidationError();
    }

    return null; // 不是API路由
}

// ===== 页面路由处理模块 =====

async function handlePageRoutes(request, url, env, subPath) {
    // 处理 /region 端点
    if (url.pathname.endsWith('/region')) {
        return await handleRegionEndpoint(request, url, env);
    }

    // 处理 /test-api 端点
    if (url.pathname.endsWith('/test-api')) {
        return await handleTestAPIEndpoint(request, url);
    }

    // 处理根路径
    if (url.pathname === '/') {
        return await handleHomepage(request, env);
    }

    // 处理自定义路径模式
    if (cp && cp.trim()) {
        return await handleCustomPathMode(request, url);
    }

    // 处理UUID路径模式
    return await handleUUIDPathMode(request, url, subPath);
}

// 处理 /region 端点
async function handleRegionEndpoint(request, url, env) {
    const pathParts = url.pathname.split('/').filter(p => p);
    if (pathParts.length !== 2 || pathParts[1] !== 'region') return null;

    const pathIdentifier = pathParts[0];
    let isValid = false;

    if (cp && cp.trim()) {
        const cleanCustomPath = cp.trim().startsWith('/') ? cp.trim().substring(1) : cp.trim();
        isValid = (pathIdentifier === cleanCustomPath);
    } else {
        isValid = (isValidFormat(pathIdentifier) && pathIdentifier === at);
    }

    if (!isValid) {
        return new Response(JSON.stringify({ error: '访问被拒绝', message: '路径验证失败' }), {
            status: 403, headers: { 'Content-Type': 'application/json' }
        });
    }

    const ci = getConfigValue('p', env.p || env.P);
    const manualRegion = getConfigValue('wk', env.wk || env.WK);

    if (manualRegion && manualRegion.trim()) {
        return new Response(JSON.stringify({
            region: manualRegion.trim().toUpperCase(),
            detectionMethod: '手动指定地区',
            manualRegion: manualRegion.trim().toUpperCase(),
            timestamp: new Date().toISOString()
        }), { headers: { 'Content-Type': 'application/json' } });
    } else if (ci && ci.trim()) {
        return new Response(JSON.stringify({
            region: 'CUSTOM',
            detectionMethod: '自定义ProxyIP模式',
            ci: ci,
            timestamp: new Date().toISOString()
        }), { headers: { 'Content-Type': 'application/json' } });
    } else {
        const detectedRegion = await detectWorkerRegion(request);
        return new Response(JSON.stringify({
            region: detectedRegion,
            detectionMethod: 'API检测',
            timestamp: new Date().toISOString()
        }), { headers: { 'Content-Type': 'application/json' } });
    }
}

// 处理 /test-api 端点
async function handleTestAPIEndpoint(request, url) {
    const pathParts = url.pathname.split('/').filter(p => p);
    if (pathParts.length !== 2 || pathParts[1] !== 'test-api') return null;

    const pathIdentifier = pathParts[0];
    let isValid = false;

    if (cp && cp.trim()) {
        const cleanCustomPath = cp.trim().startsWith('/') ? cp.trim().substring(1) : cp.trim();
        isValid = (pathIdentifier === cleanCustomPath);
    } else {
        isValid = (isValidFormat(pathIdentifier) && pathIdentifier === at);
    }

    if (!isValid) {
        return new Response(JSON.stringify({ error: '访问被拒绝', message: '路径验证失败' }), {
            status: 403, headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const testRegion = await detectWorkerRegion(request);
        return new Response(JSON.stringify({
            detectedRegion: testRegion,
            message: 'API测试完成',
            timestamp: new Date().toISOString()
        }), { headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({
            error: error.message,
            message: 'API测试失败'
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

// 处理首页
async function handleHomepage(request, env) {
    // 检查自定义首页URL
    const customHomepage = getConfigValue('homepage', env.homepage || env.HOMEPAGE);
    if (customHomepage && customHomepage.trim()) {
        try {
            const homepageResponse = await fetch(customHomepage.trim(), {
                method: 'GET',
                headers: {
                    'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0',
                    'Accept': request.headers.get('Accept') || '*/*',
                    'Accept-Language': request.headers.get('Accept-Language') || 'en-US,en;q=0.9',
                },
                redirect: 'follow'
            });

            if (homepageResponse.ok) {
                const contentType = homepageResponse.headers.get('Content-Type') || 'text/html; charset=utf-8';
                const content = await homepageResponse.text();
                return new Response(content, {
                    status: homepageResponse.status,
                    headers: { 'Content-Type': contentType, 'Cache-Control': 'no-cache, no-store, must-revalidate' }
                });
            }
        } catch (error) {
            console.error('获取自定义首页失败:', error);
        }
    }

    // 从GitHub获取终端页面
    return await fetchHtmlFromGitHub(TERMINAL_HTML_URL, {
        injectConfig: { useCustomPath: !!(cp && cp.trim()) }
    });
}

// 自定义路径模式处理
async function handleCustomPathMode(request, url) {
    const cleanCustomPath = cp.trim().startsWith('/') ? cp.trim() : '/' + cp.trim();
    const normalizedCustomPath = cleanCustomPath.endsWith('/') && cleanCustomPath.length > 1
        ? cleanCustomPath.slice(0, -1) : cleanCustomPath;
    const normalizedPath = url.pathname.endsWith('/') && url.pathname.length > 1
        ? url.pathname.slice(0, -1) : url.pathname;

    // 匹配自定义路径 -> 订阅中心
    if (normalizedPath === normalizedCustomPath) {
        return await handleSubscriptionPage(request, at);
    }

    // 匹配自定义路径/sub -> 订阅请求
    if (normalizedPath === normalizedCustomPath + '/sub') {
        return await handleSubscriptionRequest(request, at, new URL(request.url));
    }

    // 检查是否有人尝试使用UUID访问
    if (url.pathname.length > 1 && url.pathname !== '/') {
        const user = url.pathname.replace(/\/$/, '').replace('/sub', '').substring(1);
        if (isValidFormat(user)) {
            return new Response(JSON.stringify({
                error: '访问被拒绝',
                message: '当前 Worker 已启用自定义路径模式，UUID 访问已禁用'
            }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }
    }

    return null;
}

// UUID路径模式处理
async function handleUUIDPathMode(request, url, subPath) {
    // 处理 /{uuid} 路径
    if (url.pathname.length > 1 && url.pathname !== '/' && !url.pathname.includes('/sub')) {
        const user = url.pathname.replace(/\/$/, '').substring(1);
        if (isValidFormat(user)) {
            if (user === at) {
                return await handleSubscriptionPage(request, user);
            } else {
                return new Response(JSON.stringify({ error: 'UUID错误 请注意变量名称是u不是uuid' }), {
                    status: 403, headers: { 'Content-Type': 'application/json' }
                });
            }
        }
    }

    // 处理 /{uuid}/sub 路径
    if (url.pathname.includes('/sub')) {
        const pathParts = url.pathname.split('/');
        if (pathParts.length === 2 && pathParts[1] === 'sub') {
            const user = pathParts[0].substring(1);
            if (isValidFormat(user)) {
                if (user === at) {
                    return await handleSubscriptionRequest(request, user, url);
                } else {
                    return new Response(JSON.stringify({ error: 'UUID错误' }), {
                        status: 403, headers: { 'Content-Type': 'application/json' }
                    });
                }
            }
        }
    }

    // 处理子路径订阅
    if (url.pathname.toLowerCase().includes(`/${subPath}`)) {
        return await handleSubscriptionRequest(request, at);
    }

    return null;
}

// ===== 主入口点 =====

export default {
    async fetch(request, env, ctx) {
        try {
            // 1. 初始化配置
            const subPath = await initWorkerConfig(env, request);
            const url = new URL(request.url);

            // 2. 处理API路由
            const apiResponse = await handleAPIRoutes(request, url, env);
            if (apiResponse) return apiResponse;

            // 3. 处理xhttp POST请求
            if (request.method === 'POST' && ex) {
                const r = await handleXhttpPost(request);
                if (r) {
                    ctx.waitUntil(r.closed);
                    return new Response(r.readable, {
                        headers: {
                            'X-Accel-Buffering': 'no',
                            'Cache-Control': 'no-store',
                            Connection: 'keep-alive',
                            'User-Agent': 'Go-http-client/2.0',
                            'Content-Type': 'application/grpc',
                        },
                    });
                }
                return new Response('Internal Server Error', { status: 500 });
            }

            // 4. 处理WebSocket请求
            if (request.headers.get('Upgrade') === atob('d2Vic29ja2V0')) {
                return await handleWsRequest(request);
            }

            // 5. 处理GET页面请求
            if (request.method === 'GET') {
                const pageResponse = await handlePageRoutes(request, url, env, subPath);
                if (pageResponse) return pageResponse;
            }

            // 6. 404
            return new Response(JSON.stringify({ error: 'Not Found' }), {
                status: 404, headers: { 'Content-Type': 'application/json' }
            });

        } catch (err) {
            return new Response(err.toString(), { status: 500 });
        }
    },
};


function generateQuantumultConfig(links) {
    return btoa(links.join('\n'));
}

// 解析 VLESS/Trojan 链接并生成 Clash 节点配置
function parseLinkToClashNode(link) {
    try {
        // 解析 VLESS 链接
        if (link.startsWith('vless://')) {
            const url = new URL(link);
            const name = decodeURIComponent(url.hash.substring(1));
            const uuid = url.username;
            const server = url.hostname;
            const port = parseInt(url.port) || 443;
            const params = new URLSearchParams(url.search);

            const tls = params.get('security') === 'tls' || params.get('tls') === 'true';
            const network = params.get('type') || 'ws';
            const path = params.get('path') || '/?ed=2048';
            const host = params.get('host') || server;
            const servername = params.get('sni') || host;
            const alpn = params.get('alpn') || 'h3,h2,http/1.1';
            const fingerprint = params.get('fp') || params.get('client-fingerprint') || 'chrome';
            const ech = params.get('ech');

            const node = {
                name: name,
                type: 'vless',
                server: server,
                port: port,
                uuid: uuid,
                tls: tls,
                network: network,
                'client-fingerprint': fingerprint
            };

            if (tls) {
                node.servername = servername;
                node.alpn = alpn.split(',').map(a => a.trim());
                node['skip-cert-verify'] = false;
            }

            if (network === 'ws') {
                node['ws-opts'] = {
                    path: path,
                    headers: {
                        Host: host
                    }
                };
            }

            if (ech) {
                node['ech-opts'] = {
                    enable: true
                };
            }

            return node;
        }

        // 解析 Trojan 链接
        if (link.startsWith('trojan://')) {
            const url = new URL(link);
            const name = decodeURIComponent(url.hash.substring(1));
            const password = url.username;
            const server = url.hostname;
            const port = parseInt(url.port) || 443;
            const params = new URLSearchParams(url.search);

            const network = params.get('type') || 'ws';
            const path = params.get('path') || '/?ed=2048';
            const host = params.get('host') || server;
            const sni = params.get('sni') || host;
            const alpn = params.get('alpn') || 'h3,h2,http/1.1';
            const ech = params.get('ech');

            const node = {
                name: name,
                type: 'trojan',
                server: server,
                port: port,
                password: password,
                network: network,
                sni: sni,
                alpn: alpn.split(',').map(a => a.trim()),
                'skip-cert-verify': false
            };

            if (network === 'ws') {
                node['ws-opts'] = {
                    path: path,
                    headers: {
                        Host: host
                    }
                };
            }

            if (ech) {
                node['ech-opts'] = {
                    enable: true
                };
            }

            return node;
        }
    } catch (e) {
        return null;
    }
    return null;
}

// 生成 Clash 配置
async function generateClashConfig(links, request, user) {
    // 如果 ECH 未开启，使用订阅转换服务
    if (!enableECH) {
        // 返回一个重定向 URL，让前端使用订阅转换服务
        // 或者直接调用订阅转换服务
        const subscriptionUrl = new URL(request.url);
        subscriptionUrl.pathname = subscriptionUrl.pathname.replace(/\/sub$/, '') + '/sub';
        subscriptionUrl.searchParams.set('target', 'base64');
        const encodedUrl = encodeURIComponent(subscriptionUrl.toString());
        const converterUrl = `${scu}?target=clash&url=${encodedUrl}&insert=false&emoji=true&list=false&xudp=false&udp=false&tfo=false&expand=true&scv=false&fdn=false&new_name=true`;

        try {
            const response = await fetch(converterUrl);
            if (response.ok) {
                return await response.text();
            }
        } catch (e) {
            // 如果订阅转换失败，fallback 到本地生成
        }
    }

    // ECH 开启时，使用本地模板生成
    const templateUrl = 'https://raw.githubusercontent.com/byJoey/test/refs/heads/main/%E6%A8%A1%E6%9D%BF.yaml';

    try {
        // 获取模板
        const templateResponse = await fetch(templateUrl);
        if (!templateResponse.ok) {
            throw new Error('无法获取模板文件');
        }
        let template = await templateResponse.text();

        // 解析链接生成节点配置
        const nodes = [];
        for (const link of links) {
            const node = parseLinkToClashNode(link);
            if (node) {
                nodes.push(node);
            }
        }

        if (nodes.length === 0) {
            throw new Error('没有有效的节点');
        }

        // 确保节点名称唯一，处理重复名称
        const usedNames = new Set();
        nodes.forEach((node, index) => {
            let uniqueName = node.name;
            // 如果名称已使用，添加服务器地址和端口来区分
            if (usedNames.has(uniqueName)) {
                uniqueName = `${node.name}-${node.server}:${node.port}`;
                // 如果添加了服务器和端口后还是重复，添加索引
                let counter = 1;
                while (usedNames.has(uniqueName)) {
                    uniqueName = `${node.name}-${node.server}:${node.port}-${counter}`;
                    counter++;
                }
            }
            usedNames.add(uniqueName);
            node.uniqueName = uniqueName;
        });

        // 将节点转换为 YAML 格式（单行格式，匹配模板）
        const nodesYaml = nodes.map(node => {
            const props = [];

            // 基本属性，使用唯一名称（匹配模板格式，不加引号）
            props.push(`name: ${node.uniqueName}`);
            props.push(`server: ${node.server}`);
            props.push(`port: ${node.port}`);
            props.push(`type: ${node.type}`);

            if (node.type === 'vless') {
                props.push(`uuid: ${node.uuid}`);
                if (node.tls) {
                    props.push(`tls: true`);
                    // alpn 格式：URL编码的逗号分隔值，如 h3%2Ch2%2Chttp%2F1.1
                    const alpnStr = node.alpn.map(a => encodeURIComponent(a)).join('%2C');
                    props.push(`alpn: [${alpnStr}]`);
                    props.push(`tfo: false`);
                    props.push(`skip-cert-verify: false`);
                    props.push(`servername: ${node.servername}`);
                    props.push(`client-fingerprint: ${node['client-fingerprint']}`);
                }
                if (node.network === 'ws') {
                    props.push(`network: ws`);
                    const path = node['ws-opts'].path;
                    const host = node['ws-opts'].headers.Host;
                    // ws-opts 格式：{path: "...", headers: {Host: "..."}}
                    props.push(`ws-opts: {path: "${path}", headers: {Host: ${host}}}`);
                }
                if (node['ech-opts']) {
                    props.push(`ech-opts: {enable: true}`);
                }
            } else if (node.type === 'trojan') {
                props.push(`password: ${node.password}`);
                props.push(`sni: ${node.sni}`);
                // alpn 格式：URL编码的逗号分隔值
                const alpnStr = node.alpn.map(a => encodeURIComponent(a)).join('%2C');
                props.push(`alpn: [${alpnStr}]`);
                props.push(`skip-cert-verify: false`);
                if (node.network === 'ws') {
                    props.push(`network: ws`);
                    const path = node['ws-opts'].path;
                    const host = node['ws-opts'].headers.Host;
                    props.push(`ws-opts: {path: "${path}", headers: {Host: ${host}}}`);
                }
                if (node['ech-opts']) {
                    props.push(`ech-opts: {enable: true}`);
                }
            }

            // 生成单行格式：  - {prop1: value1, prop2: value2, ...}
            return `  - {${props.join(', ')}}`;
        }).join('\n');

        // 替换模板中的 proxies 部分
        // 查找 proxies: 后面的内容，直到下一个顶级键
        const proxiesRegex = /^proxies:\s*$/m;
        const match = template.match(proxiesRegex);

        if (match) {
            const startIndex = match.index + match[0].length;
            // 查找下一个顶级键（以字母开头，后面跟冒号，前面可能有空格）
            const nextKeyRegex = /^\s*[a-zA-Z][a-zA-Z0-9_-]*:\s*$/m;
            const nextMatch = template.substring(startIndex).match(nextKeyRegex);

            let endIndex;
            if (nextMatch) {
                endIndex = startIndex + nextMatch.index;
            } else {
                endIndex = template.length;
            }

            // 替换 proxies 部分
            template = template.substring(0, startIndex) + '\n' + nodesYaml + '\n' + template.substring(endIndex);
        } else {
            // 如果没有找到 proxies，在适当位置插入
            const insertRegex = /^proxies:\s*$/m;
            if (!template.match(insertRegex)) {
                // 在 dns 部分之后插入
                const dnsRegex = /^dns:\s*$/m;
                const dnsMatch = template.match(dnsRegex);
                if (dnsMatch) {
                    const insertIndex = template.indexOf('\n', dnsMatch.index + dnsMatch[0].length);
                    const dnsEndRegex = /^[a-zA-Z]/m;
                    const dnsEndMatch = template.substring(insertIndex + 1).match(dnsEndRegex);
                    let dnsEndIndex;
                    if (dnsEndMatch) {
                        dnsEndIndex = insertIndex + 1 + dnsEndMatch.index;
                    } else {
                        dnsEndIndex = template.length;
                    }
                    template = template.substring(0, dnsEndIndex) + '\nproxies:\n' + nodesYaml + '\n' + template.substring(dnsEndIndex);
                }
            }
        }

        return template;
    } catch (error) {
        // 如果本地生成失败，fallback 到订阅转换服务
        if (request) {
            const subscriptionUrl = new URL(request.url);
            subscriptionUrl.pathname = subscriptionUrl.pathname.replace(/\/sub$/, '') + '/sub';
            subscriptionUrl.searchParams.set('target', 'base64');
            const encodedUrl = encodeURIComponent(subscriptionUrl.toString());
            const converterUrl = `${scu}?target=clash&url=${encodedUrl}&insert=false&emoji=true&list=false&xudp=false&udp=false&tfo=false&expand=true&scv=false&fdn=false&new_name=true`;

            const response = await fetch(converterUrl);
            if (response.ok) {
                return await response.text();
            }
        }

        throw error;
    }
}

// 全局变量存储ECH调试信息
let echDebugInfo = '';

async function fetchECHConfig(domain) {
    if (!enableECH) {
        echDebugInfo = 'ECH功能已禁用';
        return null;
    }

    echDebugInfo = '';
    const debugSteps = [];

    try {
        // 优先使用 Google DNS 查询 cloudflare-ech.com 的 ECH 配置
        debugSteps.push('尝试使用 Google DNS 查询 cloudflare-ech.com...');
        const echDomainUrl = `https://v.recipes/dns/dns.google/dns-query?name=cloudflare-ech.com&type=65`;
        const echResponse = await fetch(echDomainUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });

        debugSteps.push(`Google DNS 响应状态: ${echResponse.status}`);

        if (echResponse.ok) {
            const echData = await echResponse.json();
            debugSteps.push(`Google DNS 返回数据: ${JSON.stringify(echData).substring(0, 200)}...`);

            if (echData.Answer && echData.Answer.length > 0) {
                debugSteps.push(`找到 ${echData.Answer.length} 条答案记录`);
                for (const answer of echData.Answer) {
                    if (answer.data) {
                        debugSteps.push(`解析答案数据: ${typeof answer.data}, 长度: ${String(answer.data).length}`);
                        // Google DNS 返回的数据格式可能不同，需要解析
                        const dataStr = typeof answer.data === 'string' ? answer.data : JSON.stringify(answer.data);
                        const echMatch = dataStr.match(/ech=([^\s"']+)/);
                        if (echMatch && echMatch[1]) {
                            echDebugInfo = debugSteps.join('\\n') + '\\n✅ 成功从 Google DNS 获取 ECH 配置';
                            return echMatch[1];
                        }
                        // 如果没有找到，尝试直接使用 data（可能是 base64 编码的）
                        if (answer.data && !dataStr.includes('ech=')) {
                            try {
                                const decoded = atob(answer.data);
                                debugSteps.push(`尝试 base64 解码，解码后长度: ${decoded.length}`);
                                const decodedMatch = decoded.match(/ech=([^\s"']+)/);
                                if (decodedMatch && decodedMatch[1]) {
                                    echDebugInfo = debugSteps.join('\\n') + '\\n✅ 成功从 Google DNS (base64解码) 获取 ECH 配置';
                                    return decodedMatch[1];
                                }
                            } catch (e) {
                                debugSteps.push(`base64 解码失败: ${e.message}`);
                            }
                        }
                    }
                }
            } else {
                debugSteps.push('Google DNS 未返回答案记录');
            }
        } else {
            debugSteps.push(`Google DNS 请求失败: ${echResponse.status}`);
        }

        // 如果 cloudflare-ech.com 查询失败，尝试使用 Google DNS 查询目标域名的 HTTPS 记录
        debugSteps.push(`尝试使用 Google DNS 查询目标域名 ${domain}...`);
        const dohUrl = `https://v.recipes/dns/dns.google/dns-query?name=${encodeURIComponent(domain)}&type=65`;
        const response = await fetch(dohUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });

        debugSteps.push(`Google DNS (目标域名) 响应状态: ${response.status}`);

        if (response.ok) {
            const data = await response.json();
            debugSteps.push(`Google DNS (目标域名) 返回数据: ${JSON.stringify(data).substring(0, 200)}...`);

            if (data.Answer && data.Answer.length > 0) {
                debugSteps.push(`找到 ${data.Answer.length} 条答案记录`);
                for (const answer of data.Answer) {
                    if (answer.data) {
                        const dataStr = typeof answer.data === 'string' ? answer.data : JSON.stringify(answer.data);
                        const echMatch = dataStr.match(/ech=([^\s"']+)/);
                        if (echMatch && echMatch[1]) {
                            echDebugInfo = debugSteps.join('\\n') + '\\n✅ 成功从 Google DNS (目标域名) 获取 ECH 配置';
                            return echMatch[1];
                        }
                        // 尝试 base64 解码
                        try {
                            const decoded = atob(answer.data);
                            const decodedMatch = decoded.match(/ech=([^\s"']+)/);
                            if (decodedMatch && decodedMatch[1]) {
                                echDebugInfo = debugSteps.join('\\n') + '\\n✅ 成功从 Google DNS (目标域名, base64解码) 获取 ECH 配置';
                                return decodedMatch[1];
                            }
                        } catch (e) {
                            debugSteps.push(`base64 解码失败: ${e.message}`);
                        }
                    }
                }
            } else {
                debugSteps.push('Google DNS (目标域名) 未返回答案记录');
            }
        } else {
            debugSteps.push(`Google DNS (目标域名) 请求失败: ${response.status}`);
        }

        // 如果 Google DNS 失败，尝试使用 Cloudflare DNS 作为备选
        debugSteps.push('尝试使用 Cloudflare DNS 作为备选...');
        const cfEchUrl = `https://cloudflare-dns.com/dns-query?name=cloudflare-ech.com&type=65`;
        const cfResponse = await fetch(cfEchUrl, {
            headers: {
                'Accept': 'application/dns-json'
            }
        });

        debugSteps.push(`Cloudflare DNS 响应状态: ${cfResponse.status}`);

        if (cfResponse.ok) {
            const cfData = await cfResponse.json();
            debugSteps.push(`Cloudflare DNS 返回数据: ${JSON.stringify(cfData).substring(0, 200)}...`);

            if (cfData.Answer && cfData.Answer.length > 0) {
                debugSteps.push(`找到 ${cfData.Answer.length} 条答案记录`);
                for (const answer of cfData.Answer) {
                    if (answer.data) {
                        const echMatch = answer.data.match(/ech=([^\s"']+)/);
                        if (echMatch && echMatch[1]) {
                            echDebugInfo = debugSteps.join('\\n') + '\\n✅ 成功从 Cloudflare DNS 获取 ECH 配置';
                            return echMatch[1];
                        }
                    }
                }
            } else {
                debugSteps.push('Cloudflare DNS 未返回答案记录');
            }
        } else {
            debugSteps.push(`Cloudflare DNS 请求失败: ${cfResponse.status}`);
        }

        echDebugInfo = debugSteps.join('\\n') + '\\n❌ 所有DNS查询均失败，未获取到ECH配置';
        return null;
    } catch (error) {
        echDebugInfo = debugSteps.join('\\n') + '\\n❌ 获取ECH配置时发生错误: ' + error.message;
        return null;
    }
}

async function handleSubscriptionRequest(request, user, url = null) {
    if (!url) url = new URL(request.url);

    const finalLinks = [];
    const workerDomain = url.hostname;
    const target = url.searchParams.get('target') || 'base64';

    // 如果启用了ECH，直接使用固定值
    let echConfig = null;
    if (enableECH) {
        echConfig = `cloudflare-ech.com+https://dns.alidns.com/dns-query`;
    }

    async function addNodesFromList(list) {
        if (ev) {
            finalLinks.push(...generateLinksFromSource(list, user, workerDomain, echConfig));
        }
        if (et) {
            finalLinks.push(...await generateTrojanLinksFromSource(list, user, workerDomain, echConfig));
        }
        if (ex) {
            finalLinks.push(...generateXhttpLinksFromSource(list, user, workerDomain, echConfig));
        }
    }

    if (currentWorkerRegion === 'CUSTOM') {
        const nativeList = [{ ip: workerDomain, isp: '原生地址' }];
        await addNodesFromList(nativeList);
    } else {
        try {
            const nativeList = [{ ip: workerDomain, isp: '原生地址' }];
            await addNodesFromList(nativeList);
        } catch (error) {
            if (!currentWorkerRegion) {
                currentWorkerRegion = await detectWorkerRegion(request);
            }

            const bestBackupIP = await getBestBackupIP(currentWorkerRegion);
            if (bestBackupIP) {
                fallbackAddress = bestBackupIP.domain + ':' + bestBackupIP.port;
                const backupList = [{ ip: bestBackupIP.domain, isp: 'ProxyIP-' + currentWorkerRegion }];
                await addNodesFromList(backupList);
            } else {
                const nativeList = [{ ip: workerDomain, isp: '原生地址' }];
                await addNodesFromList(nativeList);
            }
        }
    }

    const hasCustomPreferred = customPreferredIPs.length > 0 || customPreferredDomains.length > 0;

    if (disablePreferred) {
    } else if (hasCustomPreferred) {

        if (customPreferredIPs.length > 0 && epi) {
            await addNodesFromList(customPreferredIPs);
        }

        if (customPreferredDomains.length > 0 && epd) {
            const customDomainList = customPreferredDomains.map(d => ({ ip: d.domain, isp: d.name || d.domain }));
            await addNodesFromList(customDomainList);
        }
    } else {

        if (epd) {
            const domainList = directDomains.map(d => ({ ip: d.domain, isp: d.name || d.domain }));
            await addNodesFromList(domainList);
        }

        if (epi) {
            const defaultURL = 'https://raw.githubusercontent.com/qwer-search/bestip/refs/heads/main/kejilandbestip.txt';
            if (piu === defaultURL) {
                try {
                    const dynamicIPList = await fetchDynamicIPs();
                    if (dynamicIPList.length > 0) {
                        await addNodesFromList(dynamicIPList);
                    }
                } catch (error) {
                    if (!currentWorkerRegion) {
                        currentWorkerRegion = await detectWorkerRegion(request);
                    }

                    const bestBackupIP = await getBestBackupIP(currentWorkerRegion);
                    if (bestBackupIP) {
                        fallbackAddress = bestBackupIP.domain + ':' + bestBackupIP.port;

                        const backupList = [{ ip: bestBackupIP.domain, isp: 'ProxyIP-' + currentWorkerRegion }];
                        await addNodesFromList(backupList);
                    }
                }
            }
        }

        if (egi) {
            try {
                const newIPList = await fetchAndParseNewIPs();
                if (newIPList.length > 0) {
                    if (ev) {
                        finalLinks.push(...generateLinksFromNewIPs(newIPList, user, workerDomain, echConfig));
                    }
                    if (et) {
                        finalLinks.push(...await generateTrojanLinksFromNewIPs(newIPList, user, workerDomain, echConfig));
                    }
                }
            } catch (error) {
                if (!currentWorkerRegion) {
                    currentWorkerRegion = await detectWorkerRegion(request);
                }

                const bestBackupIP = await getBestBackupIP(currentWorkerRegion);
                if (bestBackupIP) {
                    fallbackAddress = bestBackupIP.domain + ':' + bestBackupIP.port;

                    const backupList = [{ ip: bestBackupIP.domain, isp: 'ProxyIP-' + currentWorkerRegion }];
                    await addNodesFromList(backupList);
                }
            }
        }
    }

    if (finalLinks.length === 0) {
        const errorRemark = "所有节点获取失败";
        const proto = atob('dmxlc3M=');
        const errorLink = `${proto}://00000000-0000-0000-0000-000000000000@127.0.0.1:80?encryption=none&security=none&type=ws&host=error.com&path=%2F#${encodeURIComponent(errorRemark)}`;
        finalLinks.push(errorLink);
    }

    let subscriptionContent;
    let contentType = 'text/plain; charset=utf-8';

    switch (target.toLowerCase()) {
        case atob('Y2xhc2g='):
        case atob('Y2xhc2hy'):
            subscriptionContent = await generateClashConfig(finalLinks, request, user);
            contentType = 'text/yaml; charset=utf-8';
            break;
        case atob('c3VyZ2U='):
        case atob('c3VyZ2Uy'):
        case atob('c3VyZ2Uz'):
        case atob('c3VyZ2U0'):
            subscriptionContent = generateSurgeConfig(finalLinks);
            break;
        case atob('cXVhbnR1bXVsdA=='):
        case atob('cXVhbng='):
        case 'quanx':
            subscriptionContent = generateQuantumultConfig(finalLinks);
            break;
        case atob('c3M='):
        case atob('c3Ny'):
            subscriptionContent = generateSSConfig(finalLinks);
            break;
        case atob('djJyYXk='):
            subscriptionContent = generateV2RayConfig(finalLinks);
            break;
        case atob('bG9vbg=='):
            subscriptionContent = generateLoonConfig(finalLinks);
            break;
        default:
            subscriptionContent = btoa(finalLinks.join('\n'));
    }

    const responseHeaders = {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    };

    // 添加ECH状态到响应头
    if (enableECH) {
        responseHeaders['X-ECH-Status'] = 'ENABLED';
        if (echConfig) {
            responseHeaders['X-ECH-Config-Length'] = String(echConfig.length);
        }
    }

    return new Response(subscriptionContent, {
        headers: responseHeaders,
    });
}

function generateLinksFromSource(list, user, workerDomain, echConfig = null) {

    const CF_HTTP_PORTS = [80, 8080, 8880, 2052, 2082, 2086, 2095];
    const CF_HTTPS_PORTS = [443, 2053, 2083, 2087, 2096, 8443];

    const defaultHttpsPorts = [443];
    const defaultHttpPorts = disableNonTLS ? [] : [80];
    const links = [];
    const wsPath = '/?ed=2048';
    const proto = atob('dmxlc3M=');

    list.forEach(item => {
        let nodeNameBase = item.isp.replace(/\s/g, '_');
        if (item.colo && item.colo.trim()) {
            nodeNameBase = `${nodeNameBase}-${item.colo.trim()}`;
        }
        const safeIP = item.ip.includes(':') ? `[${item.ip}]` : item.ip;

        let portsToGenerate = [];

        if (item.port) {

            const port = item.port;

            if (CF_HTTPS_PORTS.includes(port)) {

                portsToGenerate.push({ port: port, tls: true });
            } else if (CF_HTTP_PORTS.includes(port)) {

                if (!disableNonTLS) {
                    portsToGenerate.push({ port: port, tls: false });
                }
            } else {

                portsToGenerate.push({ port: port, tls: true });
            }
        } else {

            defaultHttpsPorts.forEach(port => {
                portsToGenerate.push({ port: port, tls: true });
            });
            defaultHttpPorts.forEach(port => {
                portsToGenerate.push({ port: port, tls: false });
            });
        }

        portsToGenerate.forEach(({ port, tls }) => {
            if (tls) {

                const wsNodeName = `${nodeNameBase}-${port}-WS-TLS`;
                const wsParams = new URLSearchParams({
                    encryption: 'none',
                    security: 'tls',
                    sni: workerDomain,
                    fp: enableECH ? 'chrome' : 'randomized',
                    type: 'ws',
                    host: workerDomain,
                    path: wsPath
                });

                // 如果启用了ECH，添加ech参数（ECH需要伪装成Chrome浏览器）
                if (enableECH) {
                    wsParams.set('alpn', 'h3,h2,http/1.1');
                    wsParams.set('ech', `cloudflare-ech.com+https://dns.alidns.com/dns-query`);
                }

                links.push(`${proto}://${user}@${safeIP}:${port}?${wsParams.toString()}#${encodeURIComponent(wsNodeName)}`);
            } else {

                const wsNodeName = `${nodeNameBase}-${port}-WS`;
                const wsParams = new URLSearchParams({
                    encryption: 'none',
                    security: 'none',
                    type: 'ws',
                    host: workerDomain,
                    path: wsPath
                });
                links.push(`${proto}://${user}@${safeIP}:${port}?${wsParams.toString()}#${encodeURIComponent(wsNodeName)}`);
            }
        });
    });
    return links;
}

async function generateTrojanLinksFromSource(list, user, workerDomain, echConfig = null) {

    const CF_HTTP_PORTS = [80, 8080, 8880, 2052, 2082, 2086, 2095];
    const CF_HTTPS_PORTS = [443, 2053, 2083, 2087, 2096, 8443];

    const defaultHttpsPorts = [443];
    const defaultHttpPorts = disableNonTLS ? [] : [80];
    const links = [];
    const wsPath = '/?ed=2048';

    const password = tp || user;

    list.forEach(item => {
        let nodeNameBase = item.isp.replace(/\s/g, '_');
        if (item.colo && item.colo.trim()) {
            nodeNameBase = `${nodeNameBase}-${item.colo.trim()}`;
        }
        const safeIP = item.ip.includes(':') ? `[${item.ip}]` : item.ip;

        let portsToGenerate = [];

        if (item.port) {
            const port = item.port;

            if (CF_HTTPS_PORTS.includes(port)) {
                portsToGenerate.push({ port: port, tls: true });
            } else if (CF_HTTP_PORTS.includes(port)) {
                if (!disableNonTLS) {
                    portsToGenerate.push({ port: port, tls: false });
                }
            } else {
                portsToGenerate.push({ port: port, tls: true });
            }
        } else {
            defaultHttpsPorts.forEach(port => {
                portsToGenerate.push({ port: port, tls: true });
            });
            defaultHttpPorts.forEach(port => {
                portsToGenerate.push({ port: port, tls: false });
            });
        }

        portsToGenerate.forEach(({ port, tls }) => {
            if (tls) {

                const wsNodeName = `${nodeNameBase}-${port}-${atob('VHJvamFu')}-WS-TLS`;
                const wsParams = new URLSearchParams({
                    security: 'tls',
                    sni: workerDomain,
                    fp: 'chrome',
                    type: 'ws',
                    host: workerDomain,
                    path: wsPath
                });

                // 如果启用了ECH，添加ech参数（ECH需要伪装成Chrome浏览器）
                if (enableECH) {
                    wsParams.set('alpn', 'h3,h2,http/1.1');
                    wsParams.set('ech', `cloudflare-ech.com+https://dns.alidns.com/dns-query`);
                }

                links.push(`${atob('dHJvamFuOi8v')}${password}@${safeIP}:${port}?${wsParams.toString()}#${encodeURIComponent(wsNodeName)}`);
            } else {

                const wsNodeName = `${nodeNameBase}-${port}-${atob('VHJvamFu')}-WS`;
                const wsParams = new URLSearchParams({
                    security: 'none',
                    type: 'ws',
                    host: workerDomain,
                    path: wsPath
                });
                links.push(`${atob('dHJvamFuOi8v')}${password}@${safeIP}:${port}?${wsParams.toString()}#${encodeURIComponent(wsNodeName)}`);
            }
        });
    });
    return links;
}

async function fetchDynamicIPs() {
    const v4Url1 = "https://www.wetest.vip/page/cloudflare/address_v4.html";
    const v6Url1 = "https://www.wetest.vip/page/cloudflare/address_v6.html";
    let results = [];

    // 读取筛选配置（默认全部启用）
    const ipv4Enabled = getConfigValue('ipv4', '') === '' || getConfigValue('ipv4', 'yes') !== 'no';
    const ipv6Enabled = getConfigValue('ipv6', '') === '' || getConfigValue('ipv6', 'yes') !== 'no';
    const ispMobile = getConfigValue('ispMobile', '') === '' || getConfigValue('ispMobile', 'yes') !== 'no';
    const ispUnicom = getConfigValue('ispUnicom', '') === '' || getConfigValue('ispUnicom', 'yes') !== 'no';
    const ispTelecom = getConfigValue('ispTelecom', '') === '' || getConfigValue('ispTelecom', 'yes') !== 'no';

    try {
        const fetchPromises = [];
        if (ipv4Enabled) {
            fetchPromises.push(fetchAndParseWetest(v4Url1));
        } else {
            fetchPromises.push(Promise.resolve([]));
        }
        if (ipv6Enabled) {
            fetchPromises.push(fetchAndParseWetest(v6Url1));
        } else {
            fetchPromises.push(Promise.resolve([]));
        }

        const [ipv4List, ipv6List] = await Promise.all(fetchPromises);
        results = [...ipv4List, ...ipv6List];

        // 按运营商筛选
        if (results.length > 0) {
            results = results.filter(item => {
                const isp = item.isp || '';
                if (isp.includes('移动') && !ispMobile) return false;
                if (isp.includes('联通') && !ispUnicom) return false;
                if (isp.includes('电信') && !ispTelecom) return false;
                return true;
            });
        }

        if (results.length > 0) {
            return results;
        }
    } catch (e) {
    }

    return [];
}

async function fetchAndParseWetest(url) {
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!response.ok) {
            return [];
        }
        const html = await response.text();
        const results = [];
        const rowRegex = /<tr[\s\S]*?<\/tr>/g;
        const cellRegex = /<td data-label="线路名称">(.+?)<\/td>[\s\S]*?<td data-label="优选地址">([\d.:a-fA-F]+)<\/td>[\s\S]*?<td data-label="数据中心">(.+?)<\/td>/;

        let match;
        while ((match = rowRegex.exec(html)) !== null) {
            const rowHtml = match[0];
            const cellMatch = rowHtml.match(cellRegex);
            if (cellMatch && cellMatch[1] && cellMatch[2]) {
                const colo = cellMatch[3] ? cellMatch[3].trim().replace(/<.*?>/g, '') : '';
                results.push({
                    isp: cellMatch[1].trim().replace(/<.*?>/g, ''),
                    ip: cellMatch[2].trim(),
                    colo: colo
                });
            }
        }

        if (results.length === 0) {
        }

        return results;
    } catch (error) {
        return [];
    }
}

async function handleWsRequest(request) {
    // 检测并设置当前Worker地区，确保WebSocket请求能正确进行就近匹配
    if (!currentWorkerRegion || currentWorkerRegion === '') {
        if (manualWorkerRegion && manualWorkerRegion.trim()) {
            currentWorkerRegion = manualWorkerRegion.trim().toUpperCase();
        } else {
            currentWorkerRegion = await detectWorkerRegion(request);
        }
    }

    const wsPair = new WebSocketPair();
    const [clientSock, serverSock] = Object.values(wsPair);
    serverSock.accept();

    let remoteConnWrapper = { socket: null };
    let isDnsQuery = false;
    let protocolType = null;

    const earlyData = request.headers.get(atob('c2VjLXdlYnNvY2tldC1wcm90b2NvbA==')) || '';
    const readable = makeReadableStream(serverSock, earlyData);

    readable.pipeTo(new WritableStream({
        async write(chunk) {
            if (isDnsQuery) return await forwardUDP(chunk, serverSock, null);
            if (remoteConnWrapper.socket) {
                const writer = remoteConnWrapper.socket.writable.getWriter();
                await writer.write(chunk);
                writer.releaseLock();
                return;
            }

            if (!protocolType) {

                if (ev && chunk.byteLength >= 24) {
                    const vlessResult = parseWsPacketHeader(chunk, at);
                    if (!vlessResult.hasError) {
                        protocolType = 'vless';
                        const { addressType, port, hostname, rawIndex, version, isUDP } = vlessResult;
                        if (isUDP) {
                            if (port === 53) isDnsQuery = true;
                            else throw new Error(E_UDP_DNS_ONLY);
                        }
                        const respHeader = new Uint8Array([version[0], 0]);
                        const rawData = chunk.slice(rawIndex);
                        if (isDnsQuery) return forwardUDP(rawData, serverSock, respHeader);
                        await forwardTCP(addressType, hostname, port, rawData, serverSock, respHeader, remoteConnWrapper);
                        return;
                    }
                }

                if (et && chunk.byteLength >= 56) {
                    const tjResult = await parseTrojanHeader(chunk, at);
                    if (!tjResult.hasError) {
                        protocolType = atob('dHJvamFu');
                        const { addressType, port, hostname, rawClientData } = tjResult;
                        await forwardTCP(addressType, hostname, port, rawClientData, serverSock, null, remoteConnWrapper);
                        return;
                    }
                }

                throw new Error('Invalid protocol or authentication failed');
            }
        },
    })).catch((err) => { });

    return new Response(null, { status: 101, webSocket: clientSock });
}

async function forwardTCP(addrType, host, portNum, rawData, ws, respHeader, remoteConnWrapper) {
    async function connectAndSend(address, port, useSocks = false) {
        const remoteSock = useSocks ?
            await establishSocksConnection(addrType, address, port) :
            connect({ hostname: address, port: port });
        const writer = remoteSock.writable.getWriter();
        await writer.write(rawData);
        writer.releaseLock();
        return remoteSock;
    }

    async function retryConnection() {
        if (enableSocksDowngrade && isSocksEnabled) {
            try {
                const socksSocket = await connectAndSend(host, portNum, true);
                remoteConnWrapper.socket = socksSocket;
                socksSocket.closed.catch(() => { }).finally(() => closeSocketQuietly(ws));
                connectStreams(socksSocket, ws, respHeader, null);
                return;
            } catch (socksErr) {
                let backupHost, backupPort;
                if (fallbackAddress && fallbackAddress.trim()) {
                    const parsed = parseAddressAndPort(fallbackAddress);
                    backupHost = parsed.address;
                    backupPort = parsed.port || portNum;
                } else {
                    const bestBackupIP = await getBestBackupIP(currentWorkerRegion);
                    backupHost = bestBackupIP ? bestBackupIP.domain : host;
                    backupPort = bestBackupIP ? bestBackupIP.port : portNum;
                }

                try {
                    const fallbackSocket = await connectAndSend(backupHost, backupPort, false);
                    remoteConnWrapper.socket = fallbackSocket;
                    fallbackSocket.closed.catch(() => { }).finally(() => closeSocketQuietly(ws));
                    connectStreams(fallbackSocket, ws, respHeader, null);
                } catch (fallbackErr) {
                    closeSocketQuietly(ws);
                }
            }
        } else {
            let backupHost, backupPort;
            if (fallbackAddress && fallbackAddress.trim()) {
                const parsed = parseAddressAndPort(fallbackAddress);
                backupHost = parsed.address;
                backupPort = parsed.port || portNum;
            } else {
                const bestBackupIP = await getBestBackupIP(currentWorkerRegion);
                backupHost = bestBackupIP ? bestBackupIP.domain : host;
                backupPort = bestBackupIP ? bestBackupIP.port : portNum;
            }

            try {
                const fallbackSocket = await connectAndSend(backupHost, backupPort, isSocksEnabled);
                remoteConnWrapper.socket = fallbackSocket;
                fallbackSocket.closed.catch(() => { }).finally(() => closeSocketQuietly(ws));
                connectStreams(fallbackSocket, ws, respHeader, null);
            } catch (fallbackErr) {
                closeSocketQuietly(ws);
            }
        }
    }

    try {
        const initialSocket = await connectAndSend(host, portNum, enableSocksDowngrade ? false : isSocksEnabled);
        remoteConnWrapper.socket = initialSocket;
        connectStreams(initialSocket, ws, respHeader, retryConnection);
    } catch (err) {
        retryConnection();
    }
}

function parseWsPacketHeader(chunk, token) {
    if (chunk.byteLength < 24) return { hasError: true, message: E_INVALID_DATA };
    const version = new Uint8Array(chunk.slice(0, 1));
    if (formatIdentifier(new Uint8Array(chunk.slice(1, 17))) !== token) return { hasError: true, message: E_INVALID_USER };
    const optLen = new Uint8Array(chunk.slice(17, 18))[0];
    const cmd = new Uint8Array(chunk.slice(18 + optLen, 19 + optLen))[0];
    let isUDP = false;
    if (cmd === 1) { } else if (cmd === 2) { isUDP = true; } else { return { hasError: true, message: E_UNSUPPORTED_CMD }; }
    const portIdx = 19 + optLen;
    const port = new DataView(chunk.slice(portIdx, portIdx + 2)).getUint16(0);
    let addrIdx = portIdx + 2, addrLen = 0, addrValIdx = addrIdx + 1, hostname = '';
    const addressType = new Uint8Array(chunk.slice(addrIdx, addrValIdx))[0];
    switch (addressType) {
        case ADDRESS_TYPE_IPV4: addrLen = 4; hostname = new Uint8Array(chunk.slice(addrValIdx, addrValIdx + addrLen)).join('.'); break;
        case ADDRESS_TYPE_URL: addrLen = new Uint8Array(chunk.slice(addrValIdx, addrValIdx + 1))[0]; addrValIdx += 1; hostname = new TextDecoder().decode(chunk.slice(addrValIdx, addrValIdx + addrLen)); break;
        case ADDRESS_TYPE_IPV6: addrLen = 16; const ipv6 = []; const ipv6View = new DataView(chunk.slice(addrValIdx, addrValIdx + addrLen)); for (let i = 0; i < 8; i++) ipv6.push(ipv6View.getUint16(i * 2).toString(16)); hostname = ipv6.join(':'); break;
        default: return { hasError: true, message: `${E_INVALID_ADDR_TYPE}: ${addressType}` };
    }
    if (!hostname) return { hasError: true, message: `${E_EMPTY_ADDR}: ${addressType}` };
    return { hasError: false, addressType, port, hostname, isUDP, rawIndex: addrValIdx + addrLen, version };
}

function makeReadableStream(socket, earlyDataHeader) {
    let cancelled = false;
    return new ReadableStream({
        start(controller) {
            socket.addEventListener('message', (event) => { if (!cancelled) controller.enqueue(event.data); });
            socket.addEventListener('close', () => { if (!cancelled) { closeSocketQuietly(socket); controller.close(); } });
            socket.addEventListener('error', (err) => controller.error(err));
            const { earlyData, error } = base64ToArray(earlyDataHeader);
            if (error) controller.error(error); else if (earlyData) controller.enqueue(earlyData);
        },
        cancel() { cancelled = true; closeSocketQuietly(socket); }
    });
}

async function connectStreams(remoteSocket, webSocket, headerData, retryFunc) {
    let header = headerData, hasData = false;
    await remoteSocket.readable.pipeTo(
        new WritableStream({
            async write(chunk, controller) {
                hasData = true;
                if (webSocket.readyState !== 1) controller.error(E_WS_NOT_OPEN);
                if (header) { webSocket.send(await new Blob([header, chunk]).arrayBuffer()); header = null; }
                else { webSocket.send(chunk); }
            },
            abort(reason) { },
        })
    ).catch((error) => { closeSocketQuietly(webSocket); });
    if (!hasData && retryFunc) retryFunc();
}

async function forwardUDP(udpChunk, webSocket, respHeader) {
    try {
        const tcpSocket = connect({ hostname: '8.8.4.4', port: 53 });
        let header = respHeader;
        const writer = tcpSocket.writable.getWriter();
        await writer.write(udpChunk);
        writer.releaseLock();
        await tcpSocket.readable.pipeTo(new WritableStream({
            async write(chunk) {
                if (webSocket.readyState === 1) {
                    if (header) { webSocket.send(await new Blob([header, chunk]).arrayBuffer()); header = null; }
                    else { webSocket.send(chunk); }
                }
            },
        }));
    } catch (error) { }
}

async function establishSocksConnection(addrType, address, port) {
    const { username, password, hostname, socksPort } = parsedSocks5Config;
    const socket = connect({ hostname, port: socksPort });
    const writer = socket.writable.getWriter();
    await writer.write(new Uint8Array(username ? [5, 2, 0, 2] : [5, 1, 0]));
    const reader = socket.readable.getReader();
    let res = (await reader.read()).value;
    if (res[0] !== 5 || res[1] === 255) throw new Error(E_SOCKS_NO_METHOD);
    if (res[1] === 2) {
        if (!username || !password) throw new Error(E_SOCKS_AUTH_NEEDED);
        const encoder = new TextEncoder();
        const authRequest = new Uint8Array([1, username.length, ...encoder.encode(username), password.length, ...encoder.encode(password)]);
        await writer.write(authRequest);
        res = (await reader.read()).value;
        if (res[0] !== 1 || res[1] !== 0) throw new Error(E_SOCKS_AUTH_FAIL);
    }
    const encoder = new TextEncoder(); let DSTADDR;
    switch (addrType) {
        case ADDRESS_TYPE_IPV4: DSTADDR = new Uint8Array([1, ...address.split('.').map(Number)]); break;
        case ADDRESS_TYPE_URL: DSTADDR = new Uint8Array([3, address.length, ...encoder.encode(address)]); break;
        case ADDRESS_TYPE_IPV6: DSTADDR = new Uint8Array([4, ...address.split(':').flatMap(x => [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2), 16)])]); break;
        default: throw new Error(E_INVALID_ADDR_TYPE);
    }
    await writer.write(new Uint8Array([5, 1, 0, ...DSTADDR, port >> 8, port & 255]));
    res = (await reader.read()).value;
    if (res[1] !== 0) throw new Error(E_SOCKS_CONN_FAIL);
    writer.releaseLock(); reader.releaseLock();
    return socket;
}

function parseSocksConfig(address) {
    let [latter, former] = address.split("@").reverse();
    let username, password, hostname, socksPort;

    if (former) {
        const formers = former.split(":");
        if (formers.length !== 2) throw new Error(E_INVALID_SOCKS_ADDR);
        [username, password] = formers;
    }

    const latters = latter.split(":");
    socksPort = Number(latters.pop());
    if (isNaN(socksPort)) throw new Error(E_INVALID_SOCKS_ADDR);

    hostname = latters.join(":");
    if (hostname.includes(":") && !/^\[.*\]$/.test(hostname)) throw new Error(E_INVALID_SOCKS_ADDR);

    return { username, password, hostname, socksPort };
}


async function parseTrojanHeader(buffer, ut) {

    const passwordToHash = tp || ut;
    const sha224Password = await sha224Hash(passwordToHash);

    if (buffer.byteLength < 56) {
        return {
            hasError: true,
            message: "invalid " + atob('dHJvamFu') + " data - too short"
        };
    }
    let crLfIndex = 56;
    if (new Uint8Array(buffer.slice(56, 57))[0] !== 0x0d || new Uint8Array(buffer.slice(57, 58))[0] !== 0x0a) {
        return {
            hasError: true,
            message: "invalid " + atob('dHJvamFu') + " header format (missing CR LF)"
        };
    }
    const password = new TextDecoder().decode(buffer.slice(0, crLfIndex));
    if (password !== sha224Password) {
        return {
            hasError: true,
            message: "invalid " + atob('dHJvamFu') + " password"
        };
    }

    const socks5DataBuffer = buffer.slice(crLfIndex + 2);
    if (socks5DataBuffer.byteLength < 6) {
        return {
            hasError: true,
            message: atob('aW52YWxpZCBTT0NLUzUgcmVxdWVzdCBkYXRh')
        };
    }

    const view = new DataView(socks5DataBuffer);
    const cmd = view.getUint8(0);
    if (cmd !== 1) {
        return {
            hasError: true,
            message: "unsupported command, only TCP (CONNECT) is allowed"
        };
    }

    const atype = view.getUint8(1);
    let addressLength = 0;
    let addressIndex = 2;
    let address = "";
    switch (atype) {
        case 1:
            addressLength = 4;
            address = new Uint8Array(
                socks5DataBuffer.slice(addressIndex, addressIndex + addressLength)
            ).join(".");
            break;
        case 3:
            addressLength = new Uint8Array(
                socks5DataBuffer.slice(addressIndex, addressIndex + 1)
            )[0];
            addressIndex += 1;
            address = new TextDecoder().decode(
                socks5DataBuffer.slice(addressIndex, addressIndex + addressLength)
            );
            break;
        case 4:
            addressLength = 16;
            const dataView = new DataView(socks5DataBuffer.slice(addressIndex, addressIndex + addressLength));
            const ipv6 = [];
            for (let i = 0; i < 8; i++) {
                ipv6.push(dataView.getUint16(i * 2).toString(16));
            }
            address = ipv6.join(":");
            break;
        default:
            return {
                hasError: true,
                message: `invalid addressType is ${atype}`
            };
    }

    if (!address) {
        return {
            hasError: true,
            message: `address is empty, addressType is ${atype}`
        };
    }

    const portIndex = addressIndex + addressLength;
    const portBuffer = socks5DataBuffer.slice(portIndex, portIndex + 2);
    const portRemote = new DataView(portBuffer).getUint16(0);

    return {
        hasError: false,
        addressRemote: address,
        addressType: atype,
        port: portRemote,
        hostname: address,
        rawClientData: socks5DataBuffer.slice(portIndex + 4)
    };
}

async function sha224Hash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    let H = [
        0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
        0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
    ];

    const msgLen = data.length;
    const bitLen = msgLen * 8;
    const paddedLen = Math.ceil((msgLen + 9) / 64) * 64;
    const padded = new Uint8Array(paddedLen);
    padded.set(data);
    padded[msgLen] = 0x80;

    const view = new DataView(padded.buffer);
    view.setUint32(paddedLen - 4, bitLen, false);

    for (let chunk = 0; chunk < paddedLen; chunk += 64) {
        const W = new Uint32Array(64);

        for (let i = 0; i < 16; i++) {
            W[i] = view.getUint32(chunk + i * 4, false);
        }

        for (let i = 16; i < 64; i++) {
            const s0 = rightRotate(W[i - 15], 7) ^ rightRotate(W[i - 15], 18) ^ (W[i - 15] >>> 3);
            const s1 = rightRotate(W[i - 2], 17) ^ rightRotate(W[i - 2], 19) ^ (W[i - 2] >>> 10);
            W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
        }

        let [a, b, c, d, e, f, g, h] = H;

        for (let i = 0; i < 64; i++) {
            const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
            const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) >>> 0;

            h = g;
            g = f;
            f = e;
            e = (d + temp1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) >>> 0;
        }

        H[0] = (H[0] + a) >>> 0;
        H[1] = (H[1] + b) >>> 0;
        H[2] = (H[2] + c) >>> 0;
        H[3] = (H[3] + d) >>> 0;
        H[4] = (H[4] + e) >>> 0;
        H[5] = (H[5] + f) >>> 0;
        H[6] = (H[6] + g) >>> 0;
        H[7] = (H[7] + h) >>> 0;
    }

    const result = [];
    for (let i = 0; i < 7; i++) {
        result.push(
            ((H[i] >>> 24) & 0xff).toString(16).padStart(2, '0'),
            ((H[i] >>> 16) & 0xff).toString(16).padStart(2, '0'),
            ((H[i] >>> 8) & 0xff).toString(16).padStart(2, '0'),
            (H[i] & 0xff).toString(16).padStart(2, '0')
        );
    }

    return result.join('');
}

function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
}

let ACTIVE_CONNECTIONS = 0;
const XHTTP_BUFFER_SIZE = 128 * 1024;
const CONNECT_TIMEOUT_MS = 5000;
const IDLE_TIMEOUT_MS = 45000;
const MAX_RETRIES = 2;
const MAX_CONCURRENT = 32;

function xhttp_sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

function validate_uuid_xhttp(id, uuid) {
    for (let index = 0; index < 16; index++) {
        if (id[index] !== uuid[index]) {
            return false;
        }
    }
    return true;
}

class XhttpCounter {
    #total

    constructor() {
        this.#total = 0;
    }

    get() {
        return this.#total;
    }

    add(size) {
        this.#total += size;
    }
}

function concat_typed_arrays(first, ...args) {
    let len = first.length;
    for (let a of args) {
        len += a.length;
    }
    const r = new first.constructor(len);
    r.set(first, 0);
    len = first.length;
    for (let a of args) {
        r.set(a, len);
        len += a.length;
    }
    return r;
}

function parse_uuid_xhttp(uuid) {
    uuid = uuid.replaceAll('-', '');
    const r = [];
    for (let index = 0; index < 16; index++) {
        const v = parseInt(uuid.substr(index * 2, 2), 16);
        r.push(v);
    }
    return r;
}

function get_xhttp_buffer(size) {
    return new Uint8Array(new ArrayBuffer(size || XHTTP_BUFFER_SIZE));
}

async function read_xhttp_header(readable, uuid_str) {
    const reader = readable.getReader({ mode: 'byob' });

    try {
        let r = await reader.readAtLeast(1 + 16 + 1, get_xhttp_buffer());
        let rlen = 0;
        let idx = 0;
        let cache = r.value;
        rlen += r.value.length;

        const version = cache[0];
        const id = cache.slice(1, 1 + 16);
        const uuid = parse_uuid_xhttp(uuid_str);
        if (!validate_uuid_xhttp(id, uuid)) {
            return `invalid UUID`;
        }
        const pb_len = cache[1 + 16];
        const addr_plus1 = 1 + 16 + 1 + pb_len + 1 + 2 + 1;

        if (addr_plus1 + 1 > rlen) {
            if (r.done) {
                return `header too short`;
            }
            idx = addr_plus1 + 1 - rlen;
            r = await reader.readAtLeast(idx, get_xhttp_buffer());
            rlen += r.value.length;
            cache = concat_typed_arrays(cache, r.value);
        }

        const cmd = cache[1 + 16 + 1 + pb_len];
        if (cmd !== 1) {
            return `unsupported command: ${cmd}`;
        }
        const port = (cache[addr_plus1 - 1 - 2] << 8) + cache[addr_plus1 - 1 - 1];
        const atype = cache[addr_plus1 - 1];
        let header_len = -1;
        if (atype === ADDRESS_TYPE_IPV4) {
            header_len = addr_plus1 + 4;
        } else if (atype === ADDRESS_TYPE_IPV6) {
            header_len = addr_plus1 + 16;
        } else if (atype === ADDRESS_TYPE_URL) {
            header_len = addr_plus1 + 1 + cache[addr_plus1];
        }

        if (header_len < 0) {
            return 'read address type failed';
        }

        idx = header_len - rlen;
        if (idx > 0) {
            if (r.done) {
                return `read address failed`;
            }
            r = await reader.readAtLeast(idx, get_xhttp_buffer());
            rlen += r.value.length;
            cache = concat_typed_arrays(cache, r.value);
        }

        let hostname = '';
        idx = addr_plus1;
        switch (atype) {
            case ADDRESS_TYPE_IPV4:
                hostname = cache.slice(idx, idx + 4).join('.');
                break;
            case ADDRESS_TYPE_URL:
                hostname = new TextDecoder().decode(
                    cache.slice(idx + 1, idx + 1 + cache[idx]),
                );
                break;
            case ADDRESS_TYPE_IPV6:
                hostname = cache
                    .slice(idx, idx + 16)
                    .reduce(
                        (s, b2, i2, a) =>
                            i2 % 2
                                ? s.concat(((a[i2 - 1] << 8) + b2).toString(16))
                                : s,
                        [],
                    )
                    .join(':');
                break;
        }

        if (hostname.length < 1) {
            return 'failed to parse hostname';
        }

        const data = cache.slice(header_len);
        return {
            hostname,
            port,
            data,
            resp: new Uint8Array([version, 0]),
            reader,
            done: r.done,
        };
    } catch (error) {
        try { reader.releaseLock(); } catch (_) { }
        throw error;
    }
}

async function upload_to_remote_xhttp(counter, writer, httpx) {
    async function inner_upload(d) {
        if (!d || d.length === 0) {
            return;
        }
        counter.add(d.length);
        try {
            await writer.write(d);
        } catch (error) {
            throw error;
        }
    }

    try {
        await inner_upload(httpx.data);
        let chunkCount = 0;
        while (!httpx.done) {
            const r = await httpx.reader.read(get_xhttp_buffer());
            if (r.done) break;
            await inner_upload(r.value);
            httpx.done = r.done;
            chunkCount++;
            if (chunkCount % 10 === 0) {
                await xhttp_sleep(0);
            }
            if (!r.value || r.value.length === 0) {
                await xhttp_sleep(2);
            }
        }
    } catch (error) {
        throw error;
    }
}

function create_xhttp_uploader(httpx, writable) {
    const counter = new XhttpCounter();
    const writer = writable.getWriter();

    const done = (async () => {
        try {
            await upload_to_remote_xhttp(counter, writer, httpx);
        } catch (error) {
            throw error;
        } finally {
            try {
                await writer.close();
            } catch (error) {

            }
        }
    })();

    return {
        counter,
        done,
        abort: () => {
            try { writer.abort(); } catch (_) { }
        }
    };
}

function create_xhttp_downloader(resp, remote_readable) {
    const counter = new XhttpCounter();
    let stream;

    const done = new Promise((resolve, reject) => {
        stream = new TransformStream(
            {
                start(controller) {
                    counter.add(resp.length);
                    controller.enqueue(resp);
                },
                transform(chunk, controller) {
                    counter.add(chunk.length);
                    controller.enqueue(chunk);
                },
                cancel(reason) {
                    reject(`download cancelled: ${reason}`);
                },
            },
            null,
            new ByteLengthQueuingStrategy({ highWaterMark: XHTTP_BUFFER_SIZE }),
        );

        let lastActivity = Date.now();
        const idleTimer = setInterval(() => {
            if (Date.now() - lastActivity > IDLE_TIMEOUT_MS) {
                try {
                    stream.writable.abort?.('idle timeout');
                } catch (_) { }
                clearInterval(idleTimer);
                reject('idle timeout');
            }
        }, 5000);

        const reader = remote_readable.getReader();
        const writer = stream.writable.getWriter();

        ; (async () => {
            try {
                let chunkCount = 0;
                while (true) {
                    const r = await reader.read();
                    if (r.done) {
                        break;
                    }
                    lastActivity = Date.now();
                    await writer.write(r.value);
                    chunkCount++;
                    if (chunkCount % 5 === 0) {
                        await xhttp_sleep(0);
                    }
                }
                await writer.close();
                resolve();
            } catch (err) {
                reject(err);
            } finally {
                try {
                    reader.releaseLock();
                } catch (_) { }
                try {
                    writer.releaseLock();
                } catch (_) { }
                clearInterval(idleTimer);
            }
        })();
    });

    return {
        readable: stream.readable,
        counter,
        done,
        abort: () => {
            try { stream.readable.cancel(); } catch (_) { }
            try { stream.writable.abort(); } catch (_) { }
        }
    };
}

async function connect_to_remote_xhttp(httpx, ...remotes) {
    let attempt = 0;
    let lastErr;

    const connectionList = [httpx.hostname, ...remotes.filter(r => r && r !== httpx.hostname)];

    for (const hostname of connectionList) {
        if (!hostname) continue;

        attempt = 0;
        while (attempt < MAX_RETRIES) {
            attempt++;
            try {
                const remote = connect({ hostname, port: httpx.port });
                const timeoutPromise = xhttp_sleep(CONNECT_TIMEOUT_MS).then(() => {
                    throw new Error(atob('Y29ubmVjdCB0aW1lb3V0'));
                });

                await Promise.race([remote.opened, timeoutPromise]);

                const uploader = create_xhttp_uploader(httpx, remote.writable);
                const downloader = create_xhttp_downloader(httpx.resp, remote.readable);

                return {
                    downloader,
                    uploader,
                    close: () => {
                        try { remote.close(); } catch (_) { }
                    }
                };
            } catch (err) {
                lastErr = err;
                if (attempt < MAX_RETRIES) {
                    await xhttp_sleep(500 * attempt);
                }
            }
        }
    }

    return null;
}

async function handle_xhttp_client(body, uuid) {
    if (ACTIVE_CONNECTIONS >= MAX_CONCURRENT) {
        return new Response('Too many connections', { status: 429 });
    }

    ACTIVE_CONNECTIONS++;

    let cleaned = false;
    const cleanup = () => {
        if (!cleaned) {
            ACTIVE_CONNECTIONS = Math.max(0, ACTIVE_CONNECTIONS - 1);
            cleaned = true;
        }
    };

    try {
        const httpx = await read_xhttp_header(body, uuid);
        if (typeof httpx !== 'object' || !httpx) {
            return null;
        }

        const remoteConnection = await connect_to_remote_xhttp(httpx, fallbackAddress, '13.230.34.30');
        if (remoteConnection === null) {
            return null;
        }

        const connectionClosed = Promise.race([
            (async () => {
                try {
                    await remoteConnection.downloader.done;
                } catch (err) {

                }
            })(),
            (async () => {
                try {
                    await remoteConnection.uploader.done;
                } catch (err) {

                }
            })(),
            xhttp_sleep(IDLE_TIMEOUT_MS).then(() => {

            })
        ]).finally(() => {
            try { remoteConnection.close(); } catch (_) { }
            try { remoteConnection.downloader.abort(); } catch (_) { }
            try { remoteConnection.uploader.abort(); } catch (_) { }

            cleanup();
        });

        return {
            readable: remoteConnection.downloader.readable,
            closed: connectionClosed
        };
    } catch (error) {
        cleanup();
        return null;
    }
}

async function handleXhttpPost(request) {
    try {
        return await handle_xhttp_client(request.body, at);
    } catch (err) {
        return null;
    }
}

function base64ToArray(b64Str) {
    if (!b64Str) return { error: null };
    try { b64Str = b64Str.replace(/-/g, '+').replace(/_/g, '/'); return { earlyData: Uint8Array.from(atob(b64Str), (c) => c.charCodeAt(0)).buffer, error: null }; }
    catch (error) { return { error }; }
}

function closeSocketQuietly(socket) { try { if (socket.readyState === 1 || socket.readyState === 2) socket.close(); } catch (error) { } }

const hexTable = Array.from({ length: 256 }, (v, i) => (i + 256).toString(16).slice(1));
function formatIdentifier(arr, offset = 0) {
    const id = (hexTable[arr[offset]] + hexTable[arr[offset + 1]] + hexTable[arr[offset + 2]] + hexTable[arr[offset + 3]] + "-" + hexTable[arr[offset + 4]] + hexTable[arr[offset + 5]] + "-" + hexTable[arr[offset + 6]] + hexTable[arr[offset + 7]] + "-" + hexTable[arr[offset + 8]] + hexTable[arr[offset + 9]] + "-" + hexTable[arr[offset + 10]] + hexTable[arr[offset + 11]] + hexTable[arr[offset + 12]] + hexTable[arr[offset + 13]] + hexTable[arr[offset + 14]] + hexTable[arr[offset + 15]]).toLowerCase();
    if (!isValidFormat(id)) throw new TypeError(E_INVALID_ID_STR);
    return id;
}

async function fetchAndParseNewIPs() {
    const url = piu || "https://raw.githubusercontent.com/qwer-search/bestip/refs/heads/main/kejilandbestip.txt";
    try {
        const urls = url.includes(',') ? url.split(',').map(u => u.trim()).filter(u => u) : [url];
        const apiResults = await fetchPreferredAPI(urls, '443', 5000);

        if (apiResults.length > 0) {
            const results = [];
            const regex = /^(\[[\da-fA-F:]+\]|[\d.]+|[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)(?::(\d+))?(?:#(.+))?$/;

            for (const item of apiResults) {
                const match = item.match(regex);
                if (match) {
                    results.push({
                        ip: match[1],
                        port: parseInt(match[2] || '443', 10),
                        name: match[3]?.trim() || match[1]
                    });
                }
            }
            return results;
        }

        const response = await fetch(url);
        if (!response.ok) return [];
        const text = await response.text();
        const results = [];
        const lines = text.trim().replace(/\r/g, "").split('\n');
        const simpleRegex = /^([^:]+):(\d+)#(.*)$/;

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            const match = trimmedLine.match(simpleRegex);
            if (match) {
                results.push({
                    ip: match[1],
                    port: parseInt(match[2], 10),
                    name: match[3].trim() || match[1]
                });
            }
        }
        return results;
    } catch (error) {
        return [];
    }
}

function generateLinksFromNewIPs(list, user, workerDomain, echConfig = null) {

    const CF_HTTP_PORTS = [80, 8080, 8880, 2052, 2082, 2086, 2095];
    const CF_HTTPS_PORTS = [443, 2053, 2083, 2087, 2096, 8443];

    const links = [];
    const wsPath = '/?ed=2048';
    const proto = atob('dmxlc3M=');

    list.forEach(item => {
        const nodeName = item.name.replace(/\s/g, '_');
        const port = item.port;

        if (CF_HTTPS_PORTS.includes(port)) {

            const wsNodeName = `${nodeName}-${port}-WS-TLS`;
            let link = `${proto}://${user}@${item.ip}:${port}?encryption=none&security=tls&sni=${workerDomain}&fp=${enableECH ? 'chrome' : 'randomized'}&type=ws&host=${workerDomain}&path=${wsPath}`;

            // 如果启用了ECH，添加ech参数（ECH需要伪装成Chrome浏览器）
            if (enableECH) {
                link += `&alpn=h3%2Ch2%2Chttp%2F1.1&ech=${encodeURIComponent('cloudflare-ech.com+https://dns.alidns.com/dns-query')}`;
            }

            link += `#${encodeURIComponent(wsNodeName)}`;
            links.push(link);
        } else if (CF_HTTP_PORTS.includes(port)) {

            if (!disableNonTLS) {
                const wsNodeName = `${nodeName}-${port}-WS`;
                const link = `${proto}://${user}@${item.ip}:${port}?encryption=none&security=none&type=ws&host=${workerDomain}&path=${wsPath}#${encodeURIComponent(wsNodeName)}`;
                links.push(link);
            }
        } else {

            const wsNodeName = `${nodeName}-${port}-WS-TLS`;
            let link = `${proto}://${user}@${item.ip}:${port}?encryption=none&security=tls&sni=${workerDomain}&fp=${enableECH ? 'chrome' : 'randomized'}&type=ws&host=${workerDomain}&path=${wsPath}`;

            // 如果启用了ECH，添加ech参数（ECH需要伪装成Chrome浏览器）
            if (enableECH) {
                link += `&alpn=h3%2Ch2%2Chttp%2F1.1&ech=${encodeURIComponent('cloudflare-ech.com+https://dns.alidns.com/dns-query')}`;
            }

            link += `#${encodeURIComponent(wsNodeName)}`;
            links.push(link);
        }
    });
    return links;
}

function generateXhttpLinksFromSource(list, user, workerDomain, echConfig = null) {
    const links = [];
    const nodePath = user.substring(0, 8);

    list.forEach(item => {
        let nodeNameBase = item.isp.replace(/\s/g, '_');
        if (item.colo && item.colo.trim()) {
            nodeNameBase = `${nodeNameBase}-${item.colo.trim()}`;
        }
        const safeIP = item.ip.includes(':') ? `[${item.ip}]` : item.ip;
        const port = item.port || 443;

        const wsNodeName = `${nodeNameBase}-${port}-xhttp`;
        const params = new URLSearchParams({
            encryption: 'none',
            security: 'tls',
            sni: workerDomain,
            fp: 'chrome',
            type: 'xhttp',
            host: workerDomain,
            path: `/${nodePath}`,
            mode: 'stream-one'
        });

        // 如果启用了ECH，添加ech参数（ECH需要伪装成Chrome浏览器）
        if (enableECH) {
            params.set('alpn', 'h3,h2,http/1.1');
            params.set('ech', `cloudflare-ech.com+https://dns.alidns.com/dns-query`);
        }

        links.push(`vless://${user}@${safeIP}:${port}?${params.toString()}#${encodeURIComponent(wsNodeName)}`);
    });

    return links;
}

async function generateTrojanLinksFromNewIPs(list, user, workerDomain, echConfig = null) {

    const CF_HTTP_PORTS = [80, 8080, 8880, 2052, 2082, 2086, 2095];
    const CF_HTTPS_PORTS = [443, 2053, 2083, 2087, 2096, 8443];

    const links = [];
    const wsPath = '/?ed=2048';

    const password = tp || user;

    list.forEach(item => {
        const nodeName = item.name.replace(/\s/g, '_');
        const port = item.port;

        if (CF_HTTPS_PORTS.includes(port)) {

            const wsNodeName = `${nodeName}-${port}-${atob('VHJvamFu')}-WS-TLS`;
            let link = `${atob('dHJvamFuOi8v')}${password}@${item.ip}:${port}?security=tls&sni=${workerDomain}&fp=chrome&type=ws&host=${workerDomain}&path=${wsPath}`;

            // 如果启用了ECH，添加ech参数（ECH需要伪装成Chrome浏览器）
            if (enableECH) {
                link += `&alpn=h3%2Ch2%2Chttp%2F1.1&ech=${encodeURIComponent('cloudflare-ech.com+https://dns.alidns.com/dns-query')}`;
            }

            link += `#${encodeURIComponent(wsNodeName)}`;
            links.push(link);
        } else if (CF_HTTP_PORTS.includes(port)) {

            if (!disableNonTLS) {
                const wsNodeName = `${nodeName}-${port}-${atob('VHJvamFu')}-WS`;
                const link = `${atob('dHJvamFuOi8v')}${password}@${item.ip}:${port}?security=none&type=ws&host=${workerDomain}&path=${wsPath}#${encodeURIComponent(wsNodeName)}`;
                links.push(link);
            }
        } else {

            const wsNodeName = `${nodeName}-${port}-${atob('VHJvamFu')}-WS-TLS`;
            let link = `${atob('dHJvamFuOi8v')}${password}@${item.ip}:${port}?security=tls&sni=${workerDomain}&fp=chrome&type=ws&host=${workerDomain}&path=${wsPath}`;

            // 如果启用了ECH，添加ech参数（ECH需要伪装成Chrome浏览器）
            if (enableECH) {
                link += `&alpn=h3%2Ch2%2Chttp%2F1.1&ech=${encodeURIComponent('cloudflare-ech.com+https://dns.alidns.com/dns-query')}`;
            }

            link += `#${encodeURIComponent(wsNodeName)}`;
            links.push(link);
        }
    });
    return links;
}

async function handleConfigAPI(request) {
    if (request.method === 'GET') {

        if (!kvStore) {
            return new Response(JSON.stringify({
                error: 'KV存储未配置',
                kvEnabled: false
            }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({
            ...kvConfig,
            kvEnabled: true
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } else if (request.method === 'POST') {

        if (!kvStore) {
            return new Response(JSON.stringify({
                success: false,
                message: 'KV存储未配置，无法保存配置'
            }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        try {
            const newConfig = await request.json();

            for (const [key, value] of Object.entries(newConfig)) {
                if (value === '' || value === null || value === undefined) {
                    delete kvConfig[key];
                } else {
                    kvConfig[key] = value;
                }
            }

            await saveKVConfig();

            updateConfigVariables();

            if (newConfig.yx !== undefined) {
                updateCustomPreferredFromYx();
            }

            const newPreferredIPsURL = getConfigValue('yxURL', '') || 'https://raw.githubusercontent.com/qwer-search/bestip/refs/heads/main/kejilandbestip.txt';
            const defaultURL = 'https://raw.githubusercontent.com/qwer-search/bestip/refs/heads/main/kejilandbestip.txt';
            if (newPreferredIPsURL !== defaultURL) {
                directDomains.length = 0;
                customPreferredIPs = [];
                customPreferredDomains = [];
            } else {
                backupIPs = [
                    { domain: 'ProxyIP.US.CMLiussss.net', region: 'US', regionCode: 'US', port: 443 },
                    { domain: 'ProxyIP.SG.CMLiussss.net', region: 'SG', regionCode: 'SG', port: 443 },
                    { domain: 'ProxyIP.JP.CMLiussss.net', region: 'JP', regionCode: 'JP', port: 443 },
                    { domain: 'ProxyIP.KR.CMLiussss.net', region: 'KR', regionCode: 'KR', port: 443 },
                    { domain: 'ProxyIP.DE.CMLiussss.net', region: 'DE', regionCode: 'DE', port: 443 },
                    { domain: 'ProxyIP.SE.CMLiussss.net', region: 'SE', regionCode: 'SE', port: 443 },
                    { domain: 'ProxyIP.NL.CMLiussss.net', region: 'NL', regionCode: 'NL', port: 443 },
                    { domain: 'ProxyIP.FI.CMLiussss.net', region: 'FI', regionCode: 'FI', port: 443 },
                    { domain: 'ProxyIP.GB.CMLiussss.net', region: 'GB', regionCode: 'GB', port: 443 },
                    { domain: 'ProxyIP.Oracle.cmliussss.net', region: 'Oracle', regionCode: 'Oracle', port: 443 },
                    { domain: 'ProxyIP.DigitalOcean.CMLiussss.net', region: 'DigitalOcean', regionCode: 'DigitalOcean', port: 443 },
                    { domain: 'ProxyIP.Vultr.CMLiussss.net', region: 'Vultr', regionCode: 'Vultr', port: 443 },
                    { domain: 'ProxyIP.Multacom.CMLiussss.net', region: 'Multacom', regionCode: 'Multacom', port: 443 }
                ];
                directDomains.length = 0;
                directDomains.push(
                    { name: "cloudflare.182682.xyz", domain: "cloudflare.182682.xyz" },
                    { name: "speed.marisalnc.com", domain: "speed.marisalnc.com" },
                    { domain: "freeyx.cloudflare88.eu.org" },
                    { domain: "bestcf.top" },
                    { domain: "cdn.2020111.xyz" },
                    { domain: "cfip.cfcdn.vip" },
                    { domain: "cf.0sm.com" },
                    { domain: "cf.090227.xyz" },
                    { domain: "cf.zhetengsha.eu.org" },
                    { domain: "cloudflare.9jy.cc" },
                    { domain: "cf.zerone-cdn.pp.ua" },
                    { domain: "cfip.1323123.xyz" },
                    { domain: "cnamefuckxxs.yuchen.icu" },
                    { domain: "cloudflare-ip.mofashi.ltd" },
                    { domain: "115155.xyz" },
                    { domain: "cname.xirancdn.us" },
                    { domain: "f3058171cad.002404.xyz" },
                    { domain: "8.889288.xyz" },
                    { domain: "cdn.tzpro.xyz" },
                    { domain: "cf.877771.xyz" },
                    { domain: "xn--b6gac.eu.org" }
                );
            }

            return new Response(JSON.stringify({
                success: true,
                message: '配置已保存',
                config: kvConfig
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {

            return new Response(JSON.stringify({
                success: false,
                message: '保存配置失败: ' + error.message
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
    });
}

// ===== 优选域名管理 API =====

async function handleDomainsAPI(request) {
    if (!kvStore) {
        return new Response(JSON.stringify({
            success: false,
            error: 'KV存储未配置',
            message: '需要配置KV存储才能使用此功能'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const ae = getConfigValue('ae', '') === 'yes';
    if (!ae) {
        return new Response(JSON.stringify({
            success: false,
            error: 'API功能未启用',
            message: '出于安全考虑，域名管理API功能默认关闭。请在配置管理页面开启"允许API管理"选项后使用。'
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        if (request.method === 'GET') {
            // 获取所有域名（内置 + 自定义）
            const domainsJson = await kvStore.get('domains');
            let storedDomains = domainsJson ? JSON.parse(domainsJson) : null;

            // 如果 KV 中没有数据，使用默认的 directDomains
            if (!storedDomains) {
                storedDomains = {
                    builtinDomains: directDomains.map(d => ({
                        domain: d.domain,
                        name: d.name || d.domain,
                        enabled: true
                    })),
                    customDomains: []
                };
            }

            return new Response(JSON.stringify({
                success: true,
                builtin: storedDomains.builtinDomains || [],
                custom: storedDomains.customDomains || [],
                total: (storedDomains.builtinDomains?.length || 0) + (storedDomains.customDomains?.length || 0)
            }), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else if (request.method === 'POST') {
            // 添加域名
            const body = await request.json();

            if (!body.domain) {
                return new Response(JSON.stringify({
                    success: false,
                    error: '域名是必需的'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // 验证域名格式
            if (!isValidDomain(body.domain) && !isValidIP(body.domain)) {
                return new Response(JSON.stringify({
                    success: false,
                    error: '无效的域名或IP格式'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // 获取现有数据
            const domainsJson = await kvStore.get('domains');
            let storedDomains = domainsJson ? JSON.parse(domainsJson) : {
                builtinDomains: directDomains.map(d => ({
                    domain: d.domain,
                    name: d.name || d.domain,
                    enabled: true
                })),
                customDomains: []
            };

            // 检查是否已存在
            const allDomains = [...(storedDomains.builtinDomains || []), ...(storedDomains.customDomains || [])];
            const exists = allDomains.some(d => d.domain === body.domain);
            if (exists) {
                return new Response(JSON.stringify({
                    success: false,
                    error: '该域名已存在'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // 添加新域名
            const newDomain = {
                domain: body.domain,
                name: body.name || body.domain,
                port: body.port || 443,
                addedAt: new Date().toISOString()
            };

            storedDomains.customDomains = storedDomains.customDomains || [];
            storedDomains.customDomains.push(newDomain);

            // 保存到 KV
            await kvStore.put('domains', JSON.stringify(storedDomains));

            return new Response(JSON.stringify({
                success: true,
                message: '域名添加成功',
                data: newDomain
            }), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else if (request.method === 'DELETE') {
            // 删除域名
            const body = await request.json();

            // 清空所有自定义域名
            if (body.all === true) {
                const domainsJson = await kvStore.get('domains');
                let storedDomains = domainsJson ? JSON.parse(domainsJson) : { builtinDomains: [], customDomains: [] };

                const deletedCount = storedDomains.customDomains?.length || 0;
                storedDomains.customDomains = [];

                await kvStore.put('domains', JSON.stringify(storedDomains));

                return new Response(JSON.stringify({
                    success: true,
                    message: `已清空所有自定义域名，共删除 ${deletedCount} 个`,
                    deletedCount: deletedCount
                }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            if (!body.domain) {
                return new Response(JSON.stringify({
                    success: false,
                    error: '域名是必需的'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // 获取现有数据
            const domainsJson = await kvStore.get('domains');
            let storedDomains = domainsJson ? JSON.parse(domainsJson) : { builtinDomains: [], customDomains: [] };

            // 查找并删除域名
            const customIndex = storedDomains.customDomains?.findIndex(d => d.domain === body.domain);
            const builtinIndex = storedDomains.builtinDomains?.findIndex(d => d.domain === body.domain);

            if (customIndex >= 0) {
                storedDomains.customDomains.splice(customIndex, 1);
            } else if (builtinIndex >= 0 && body.type === 'builtin') {
                // 对于内置域名，设置 enabled = false 而不是删除
                storedDomains.builtinDomains[builtinIndex].enabled = false;
            } else {
                return new Response(JSON.stringify({
                    success: false,
                    error: '域名不存在'
                }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            await kvStore.put('domains', JSON.stringify(storedDomains));

            return new Response(JSON.stringify({
                success: true,
                message: '域名删除成功'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else if (request.method === 'PUT') {
            // 更新域名（可用于启用/禁用内置域名）
            const body = await request.json();

            if (!body.domain) {
                return new Response(JSON.stringify({
                    success: false,
                    error: '域名是必需的'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const domainsJson = await kvStore.get('domains');
            let storedDomains = domainsJson ? JSON.parse(domainsJson) : {
                builtinDomains: directDomains.map(d => ({
                    domain: d.domain,
                    name: d.name || d.domain,
                    enabled: true
                })),
                customDomains: []
            };

            // 查找域名
            let found = false;
            for (let d of storedDomains.builtinDomains || []) {
                if (d.domain === body.domain) {
                    if (body.enabled !== undefined) d.enabled = body.enabled;
                    if (body.name !== undefined) d.name = body.name;
                    found = true;
                    break;
                }
            }

            if (!found) {
                for (let d of storedDomains.customDomains || []) {
                    if (d.domain === body.domain) {
                        if (body.name !== undefined) d.name = body.name;
                        if (body.port !== undefined) d.port = body.port;
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                return new Response(JSON.stringify({
                    success: false,
                    error: '域名不存在'
                }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            await kvStore.put('domains', JSON.stringify(storedDomains));

            return new Response(JSON.stringify({
                success: true,
                message: '域名更新成功'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({
            success: false,
            error: '操作失败',
            message: err.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handlePreferredIPsAPI(request) {

    if (!kvStore) {
        return new Response(JSON.stringify({
            success: false,
            error: 'KV存储未配置',
            message: '需要配置KV存储才能使用此功能'
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const ae = getConfigValue('ae', '') === 'yes';
    if (!ae) {
        return new Response(JSON.stringify({
            success: false,
            error: 'API功能未启用',
            message: '出于安全考虑，优选IP API功能默认关闭。请在配置管理页面开启"允许API管理"选项后使用。'
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        if (request.method === 'GET') {

            const yxValue = getConfigValue('yx', '');
            const pi = parseYxToArray(yxValue);

            return new Response(JSON.stringify({
                success: true,
                count: pi.length,
                data: pi
            }), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else if (request.method === 'POST') {

            const body = await request.json();

            const ipsToAdd = Array.isArray(body) ? body : [body];

            if (ipsToAdd.length === 0) {
                return new Response(JSON.stringify({
                    success: false,
                    error: '请求数据为空',
                    message: '请提供IP数据'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const yxValue = getConfigValue('yx', '');
            let pi = parseYxToArray(yxValue);

            const addedIPs = [];
            const skippedIPs = [];
            const errors = [];

            for (const item of ipsToAdd) {

                if (!item.ip) {
                    errors.push({ ip: '未知', reason: 'IP地址是必需的' });
                    continue;
                }

                const port = item.port || 443;
                const name = item.name || `API优选-${item.ip}:${port}`;

                if (!isValidIP(item.ip) && !isValidDomain(item.ip)) {
                    errors.push({ ip: item.ip, reason: '无效的IP或域名格式' });
                    continue;
                }

                const exists = pi.some(existItem =>
                    existItem.ip === item.ip && existItem.port === port
                );

                if (exists) {
                    skippedIPs.push({ ip: item.ip, port: port, reason: '已存在' });
                    continue;
                }

                const newIP = {
                    ip: item.ip,
                    port: port,
                    name: name,
                    addedAt: new Date().toISOString()
                };

                pi.push(newIP);
                addedIPs.push(newIP);
            }

            if (addedIPs.length > 0) {
                const newYxValue = arrayToYx(pi);
                await setConfigValue('yx', newYxValue);
                updateCustomPreferredFromYx();
            }

            return new Response(JSON.stringify({
                success: addedIPs.length > 0,
                message: `成功添加 ${addedIPs.length} 个IP`,
                added: addedIPs.length,
                skipped: skippedIPs.length,
                errors: errors.length,
                data: {
                    addedIPs: addedIPs,
                    skippedIPs: skippedIPs.length > 0 ? skippedIPs : undefined,
                    errors: errors.length > 0 ? errors : undefined
                }
            }), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else if (request.method === 'DELETE') {

            const body = await request.json();

            if (body.all === true) {

                const yxValue = getConfigValue('yx', '');
                const pi = parseYxToArray(yxValue);
                const deletedCount = pi.length;

                await setConfigValue('yx', '');
                updateCustomPreferredFromYx();

                return new Response(JSON.stringify({
                    success: true,
                    message: `已清空所有优选IP，共删除 ${deletedCount} 个`,
                    deletedCount: deletedCount
                }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            if (!body.ip) {
                return new Response(JSON.stringify({
                    success: false,
                    error: 'IP地址是必需的',
                    message: '请提供要删除的ip字段，或使用 {"all": true} 清空所有'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const port = body.port || 443;

            const yxValue = getConfigValue('yx', '');
            let pi = parseYxToArray(yxValue);
            const initialLength = pi.length;

            const filteredIPs = pi.filter(item =>
                !(item.ip === body.ip && item.port === port)
            );

            if (filteredIPs.length === initialLength) {
                return new Response(JSON.stringify({
                    success: false,
                    error: '优选IP不存在',
                    message: `${body.ip}:${port} 未找到`
                }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const newYxValue = arrayToYx(filteredIPs);
            await setConfigValue('yx', newYxValue);
            updateCustomPreferredFromYx();

            return new Response(JSON.stringify({
                success: true,
                message: '优选IP已删除',
                deleted: { ip: body.ip, port: port }
            }), {
                headers: { 'Content-Type': 'application/json' }
            });

        } else {
            return new Response(JSON.stringify({
                success: false,
                error: '不支持的请求方法',
                message: '支持的方法: GET, POST, DELETE'
            }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: '处理请求失败',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function updateConfigVariables() {
    const manualRegion = getConfigValue('wk', '');
    if (manualRegion && manualRegion.trim()) {
        manualWorkerRegion = manualRegion.trim().toUpperCase();
        currentWorkerRegion = manualWorkerRegion;
    } else {
        const ci = getConfigValue('p', '');
        if (ci && ci.trim()) {
            currentWorkerRegion = 'CUSTOM';
        } else {
            manualWorkerRegion = '';
        }
    }

    const regionMatchingControl = getConfigValue('rm', '');
    if (regionMatchingControl && regionMatchingControl.toLowerCase() === 'no') {
        enableRegionMatching = false;
    } else {
        enableRegionMatching = true;
    }

    const vlessControl = getConfigValue('ev', '');
    if (vlessControl !== undefined && vlessControl !== '') {
        ev = vlessControl === 'yes' || vlessControl === true || vlessControl === 'true';
    }

    const tjControl = getConfigValue('et', '');
    if (tjControl !== undefined && tjControl !== '') {
        et = tjControl === 'yes' || tjControl === true || tjControl === 'true';
    }

    tp = getConfigValue('tp', '') || '';

    const xhttpControl = getConfigValue('ex', '');
    if (xhttpControl !== undefined && xhttpControl !== '') {
        ex = xhttpControl === 'yes' || xhttpControl === true || xhttpControl === 'true';
    }

    if (!ev && !et && !ex) {
        ev = true;
    }

    scu = getConfigValue('scu', '') || 'https://url.v1.mk/sub';

    const preferredDomainsControl = getConfigValue('epd', 'no');
    if (preferredDomainsControl !== undefined && preferredDomainsControl !== '') {
        epd = preferredDomainsControl !== 'no' && preferredDomainsControl !== false && preferredDomainsControl !== 'false';
    }

    const preferredIPsControl = getConfigValue('epi', '');
    if (preferredIPsControl !== undefined && preferredIPsControl !== '') {
        epi = preferredIPsControl !== 'no' && preferredIPsControl !== false && preferredIPsControl !== 'false';
    }

    const githubIPsControl = getConfigValue('egi', '');
    if (githubIPsControl !== undefined && githubIPsControl !== '') {
        egi = githubIPsControl !== 'no' && githubIPsControl !== false && githubIPsControl !== 'false';
    }

    const echControl = getConfigValue('ech', '');
    if (echControl !== undefined && echControl !== '') {
        enableECH = echControl === 'yes' || echControl === true || echControl === 'true';
    }

    // 如果启用了ECH，自动启用仅TLS模式（避免80端口干扰）
    // ECH需要TLS才能工作，所以必须禁用非TLS节点
    if (enableECH) {
        disableNonTLS = true;
    }

    // 检查dkby配置（如果手动设置了dkby=yes，也会启用仅TLS）
    const dkbyControl = getConfigValue('dkby', '');
    if (dkbyControl && dkbyControl.toLowerCase() === 'yes') {
        disableNonTLS = true;
    }

    cp = getConfigValue('d', '') || '';

    piu = getConfigValue('yxURL', '') || 'https://raw.githubusercontent.com/qwer-search/bestip/refs/heads/main/kejilandbestip.txt';

    const envFallback = getConfigValue('p', '');
    if (envFallback) {
        fallbackAddress = envFallback.trim();
    } else {
        fallbackAddress = '';
    }

    socks5Config = getConfigValue('s', '') || '';
    if (socks5Config) {
        try {
            parsedSocks5Config = parseSocksConfig(socks5Config);
            isSocksEnabled = true;
        } catch (err) {
            isSocksEnabled = false;
        }
    } else {
        isSocksEnabled = false;
    }

    const yxbyControl = getConfigValue('yxby', '');
    if (yxbyControl && yxbyControl.toLowerCase() === 'yes') {
        disablePreferred = true;
    } else {
        disablePreferred = false;
    }

    const defaultURL = 'https://raw.githubusercontent.com/qwer-search/bestip/refs/heads/main/kejilandbestip.txt';
    if (piu !== defaultURL) {
        directDomains.length = 0;
        customPreferredIPs = [];
        customPreferredDomains = [];
    }
}

function updateCustomPreferredFromYx() {
    const yxValue = getConfigValue('yx', '');
    if (yxValue) {
        try {
            const preferredList = yxValue.split(',').map(item => item.trim()).filter(item => item);
            customPreferredIPs = [];
            customPreferredDomains = [];

            preferredList.forEach(item => {
                let nodeName = '';
                let addressPart = item;

                if (item.includes('#')) {
                    const parts = item.split('#');
                    addressPart = parts[0].trim();
                    nodeName = parts[1].trim();
                }

                const { address, port } = parseAddressAndPort(addressPart);

                if (!nodeName) {
                    nodeName = '自定义优选-' + address + (port ? ':' + port : '');
                }

                if (isValidIP(address)) {
                    customPreferredIPs.push({
                        ip: address,
                        port: port,
                        isp: nodeName
                    });
                } else {
                    customPreferredDomains.push({
                        domain: address,
                        port: port,
                        name: nodeName
                    });
                }
            });
        } catch (err) {
            customPreferredIPs = [];
            customPreferredDomains = [];
        }
    } else {
        customPreferredIPs = [];
        customPreferredDomains = [];
    }
}

function parseYxToArray(yxValue) {
    if (!yxValue || !yxValue.trim()) return [];

    const items = yxValue.split(',').map(item => item.trim()).filter(item => item);
    const result = [];

    for (const item of items) {

        let nodeName = '';
        let addressPart = item;

        if (item.includes('#')) {
            const parts = item.split('#');
            addressPart = parts[0].trim();
            nodeName = parts[1].trim();
        }

        const { address, port } = parseAddressAndPort(addressPart);

        if (!nodeName) {
            nodeName = address + (port ? ':' + port : '');
        }

        result.push({
            ip: address,
            port: port || 443,
            name: nodeName,
            addedAt: new Date().toISOString()
        });
    }

    return result;
}

function arrayToYx(array) {
    if (!array || array.length === 0) return '';

    return array.map(item => {
        const port = item.port || 443;
        return `${item.ip}:${port}#${item.name}`;
    }).join(',');
}

function isValidDomain(domain) {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
}

async function fetchPreferredAPI(urls, defaultPort = '443', timeout = 3000) {
    if (!urls?.length) return [];
    const results = new Set();
    await Promise.allSettled(urls.map(async (url) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            let text = '';
            try {
                const buffer = await response.arrayBuffer();
                const contentType = (response.headers.get('content-type') || '').toLowerCase();
                const charset = contentType.match(/charset=([^\s;]+)/i)?.[1]?.toLowerCase() || '';

                let decoders = ['utf-8', 'gb2312'];
                if (charset.includes('gb') || charset.includes('gbk') || charset.includes('gb2312')) {
                    decoders = ['gb2312', 'utf-8'];
                }

                let decodeSuccess = false;
                for (const decoder of decoders) {
                    try {
                        const decoded = new TextDecoder(decoder).decode(buffer);
                        if (decoded && decoded.length > 0 && !decoded.includes('\ufffd')) {
                            text = decoded;
                            decodeSuccess = true;
                            break;
                        } else if (decoded && decoded.length > 0) {
                            continue;
                        }
                    } catch (e) {
                        continue;
                    }
                }

                if (!decodeSuccess) {
                    text = await response.text();
                }

                if (!text || text.trim().length === 0) {
                    return;
                }
            } catch (e) {
                return;
            }
            const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l);
            const isCSV = lines.length > 1 && lines[0].includes(',');
            const IPV6_PATTERN = /^[^\[\]]*:[^\[\]]*:[^\[\]]/;
            if (!isCSV) {
                lines.forEach(line => {
                    const hashIndex = line.indexOf('#');
                    const [hostPart, remark] = hashIndex > -1 ? [line.substring(0, hashIndex), line.substring(hashIndex)] : [line, ''];
                    let hasPort = false;
                    if (hostPart.startsWith('[')) {
                        hasPort = /\]:(\d+)$/.test(hostPart);
                    } else {
                        const colonIndex = hostPart.lastIndexOf(':');
                        hasPort = colonIndex > -1 && /^\d+$/.test(hostPart.substring(colonIndex + 1));
                    }
                    const port = new URL(url).searchParams.get('port') || defaultPort;
                    results.add(hasPort ? line : `${hostPart}:${port}${remark}`);
                });
            } else {
                const headers = lines[0].split(',').map(h => h.trim());
                const dataLines = lines.slice(1);
                if (headers.includes('IP地址') && headers.includes('端口') && headers.includes('数据中心')) {
                    const ipIdx = headers.indexOf('IP地址'), portIdx = headers.indexOf('端口');
                    const remarkIdx = headers.indexOf('国家') > -1 ? headers.indexOf('国家') :
                        headers.indexOf('城市') > -1 ? headers.indexOf('城市') : headers.indexOf('数据中心');
                    const tlsIdx = headers.indexOf('TLS');
                    dataLines.forEach(line => {
                        const cols = line.split(',').map(c => c.trim());
                        if (tlsIdx !== -1 && cols[tlsIdx]?.toLowerCase() !== 'true') return;
                        const wrappedIP = IPV6_PATTERN.test(cols[ipIdx]) ? `[${cols[ipIdx]}]` : cols[ipIdx];
                        results.add(`${wrappedIP}:${cols[portIdx]}#${cols[remarkIdx]}`);
                    });
                } else if (headers.some(h => h.includes('IP')) && headers.some(h => h.includes('延迟')) && headers.some(h => h.includes('下载速度'))) {
                    const ipIdx = headers.findIndex(h => h.includes('IP'));
                    const delayIdx = headers.findIndex(h => h.includes('延迟'));
                    const speedIdx = headers.findIndex(h => h.includes('下载速度'));
                    const port = new URL(url).searchParams.get('port') || defaultPort;
                    dataLines.forEach(line => {
                        const cols = line.split(',').map(c => c.trim());
                        const wrappedIP = IPV6_PATTERN.test(cols[ipIdx]) ? `[${cols[ipIdx]}]` : cols[ipIdx];
                        results.add(`${wrappedIP}:${port}#CF优选 ${cols[delayIdx]}ms ${cols[speedIdx]}MB/s`);
                    });
                }
            }
        } catch (e) { }
    }));
    return Array.from(results);
}
