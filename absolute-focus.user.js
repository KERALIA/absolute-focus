// ==UserScript==
// @name          Absolute Focus (Anti-Frontend & Backend Edition)
// @namespace     https://github.com/KERALIA
// @author        Rocky
// @version       1.8.0
// @description   Maintains active focus states globally, filters network telemetry payloads sent to the backend, and vaporizes local frontend warning elements.
// @include       *
// @run-at        document-start
// @grant         unsafeWindow
// ==/UserScript==

// 1. SILENCE BROWSER DIALOG POPUPS
unsafeWindow.alert = function() { console.log("Frontend alert suppressed."); return true; };
unsafeWindow.confirm = function() { console.log("Frontend confirm suppressed."); return true; };
unsafeWindow.prompt = function() { console.log("Frontend prompt suppressed."); return null; };

unsafeWindow.onblur = null;
unsafeWindow.blurred = false;

unsafeWindow.document.hasFocus = () => true;
unsafeWindow.window.onFocus = () => true;

// Safeguard DOM properties to ensure continuous positive state reporting
[
    "hidden",
    "mozHidden",
    "msHidden",
    "webkitHidden"
].forEach(prop_name => {
    Object.defineProperty(document, prop_name, {value: false, writable: false});
});

Object.defineProperty(document, "visibilityState", {get: () => "visible"});
Object.defineProperty(document, "webkitVisibilityState", {get: () => "visible"});

unsafeWindow.document.onvisibilitychange = undefined;

// Element constructors to allow focus/blur actions on (safeguards interaction inside forms)
const blurWhitelist = [
    HTMLInputElement,
    HTMLTextAreaElement,
    HTMLAnchorElement,
    HTMLSpanElement,
    HTMLParagraphElement,
];

var event_handler = (event) => {
    if (event.type === 'blur' &&
        (blurWhitelist.some(type => event.target instanceof type) || event.target.classList?.contains('ql-editor'))) {
        return;
    }

    if (['mouseleave', 'mouseout'].includes(event.type)) {
        if (blurWhitelist.some(type => event.target instanceof type)) {
            return;
        }
    }

    // Intercept, halt, and destroy the event tracking payload completely
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
};

// Capturing event listeners early - NOW INCLUDES RESIZE AND FULLSCREEN LOOPS
[
    "visibilitychange",
    "webkitvisibilitychange",
    "blur",
    "hasFocus",
    "mouseleave",
    "mouseout",
    "mozvisibilitychange",
    "msvisibilitychange",
    "pagehide",
    "resize",
    "fullscreenchange",
    "webkitfullscreenchange",
    "mozfullscreenchange",
    "msfullscreenchange"
].forEach(event_name => {
    window.addEventListener(event_name, event_handler, true);
    document.addEventListener(event_name, event_handler, true);
});

// 2. BACKEND API TELEMETRY INTERCEPTION & SANITIZATION
const sanitizeTelemetryPayload = (data) => {
    if (typeof data === 'string') {
        if (data.includes('blur') || data.includes('hidden') || data.includes('visibility') || data.includes('resize')) {
            console.log("[Absolute Focus] Neutralized backend tracking payload structure.");
            return data
                .replace(/"blur"/g, '"focus"')
                .replace(/"hidden"/g, '"visible"')
                .replace(/"resize"/g, '"noop"')
                .replace(/"visibilitychange"/g, '"focus"');
        }
    }
    return data;
};

// Intercept navigator.sendBeacon
if (navigator.sendBeacon) {
    const originalSendBeacon = navigator.sendBeacon;
    navigator.sendBeacon = function(url, data) {
        const cleanData = sanitizeTelemetryPayload(data);
        if (url.includes('telemetry') || url.includes('proctor') || url.includes('monitoring')) {
            return true;
        }
        return originalSendBeacon.call(this, url, cleanData);
    };
}

// Intercept Fetch requests
const originalFetch = window.fetch;
window.fetch = async function(input, init) {
    if (init && init.body) {
        init.body = sanitizeTelemetryPayload(init.body);
    }
    const url = typeof input === 'string' ? input : (input?.url || '');
    if (url.includes('telemetry') || url.includes('proctor') || url.includes('monitoring')) {
        return new Response(JSON.stringify({ status: "success", message: "Telemetry clear." }), { status: 200 });
    }
    return originalFetch.apply(this, arguments);
};

// Intercept classic XMLHttpRequests (XHR)
const originalXHRSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function(body) {
    const cleanBody = sanitizeTelemetryPayload(body);
    return originalXHRSend.call(this, cleanBody);
};

// 3. SUPPRESS CUSTOM UI MODALS/WARNINGS VIA CSS INJECTION
// Expanded to target float containers containing keyword "error", "toast", or "notification"
const injectAntiWarningStyles = () => {
    if (document.documentElement) {
        const style = document.createElement('style');
        style.innerHTML = `
            [class*="warning"], [id*="warning"], 
            [class*="alert"], [id*="alert"], 
            [class*="modal"], [id*="modal"],
            [class*="dialog"], [id*="dialog"],
            [class*="proctor"], [id*="proctor"],
            [class*="error"], [id*="error"],
            [class*="toast"], [id*="toast"],
            [class*="notification"], [id*="notification"],
            [class*="popup"], [id*="popup"],
            .proctoring-notification, #proctoring-notification {
                display: none !important;
                visibility: hidden !important;
                pointer-events: none !important;
                opacity: 0 !important;
                clip-path: circle(0) !important;
                transition: none !important;
            }
        `;
        document.documentElement.appendChild(style);
    } else {
        setTimeout(injectAntiWarningStyles, 5);
    }
};
injectAntiWarningStyles();
