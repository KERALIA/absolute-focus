// ==UserScript==
// @name          Absolute Focus
// @namespace     https://github.com/KERALIA
// @author        Rocky
// @version       3.0.2
// @description   Maintains persistent document visibility and active window focus context. Blocks tab-switch telemetry, proctoring signals, and visibility polling loops.
// @include       *
// @run-at        document-start
// @grant         unsafeWindow
// ==/UserScript==

unsafeWindow.onblur = null;
unsafeWindow.blurred = false;

unsafeWindow.document.hasFocus = () => true;
unsafeWindow.window.onFocus = () => true;

// kill dom property names
[
    "hidden",
    "mozHidden",
    "msHidden",
    "webkitHidden"
].forEach(prop_name => {
    Object.defineProperty(document, prop_name, {value: false});
})

Object.defineProperty(document, "visibilityState", {get: () => "visible"});
Object.defineProperty(document, "webkitVisibilityState", {get: () => "visible"});

unsafeWindow.document.onvisibilitychange = undefined;

// element constructors to allow blur events on
const blurWhitelist = [
    HTMLInputElement,
    HTMLAnchorElement,
    HTMLSpanElement,
    HTMLParagraphElement,
]

var event_handler = (event) => {
    // if the event is blur, and the target is a whitelisted type, allow it
    if (event.type === 'blur' &&
        ((blurWhitelist.some(type => event.target instanceof type) ||
            event.target.classList?.contains('ql-editor')))) { // quill js fix
        return;
    }
    // block all mouseleave and mouseout events — prevents any mouse-exit tracking
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
}

// kill event listeners
[
    "visibilitychange",
    "webkitvisibilitychange",
    "blur",
    "hasFocus",
    "mouseleave",
    "mouseout",
    "mozvisibilitychange",
    "msvisibilitychange"
].forEach(event_name => {
    window.addEventListener(event_name, event_handler, true);
    document.addEventListener(event_name, event_handler, true);
})

// ── Block postMessage violation alerts ────────────────────────────────────────
// Proctoring iframes send tab-switch / violation signals via window.postMessage.
// We intercept in the capture phase (runs before any site listener) and silently
// drop messages that contain known violation keywords.
const VIOLATION_KEYWORDS = [
    'blur', 'hidden', 'visibilitychange',
    'tabswitch', 'tab_switch', 'tab-switch',
    'focuslost', 'focus_lost', 'focuschange',
    'violation', 'proctor', 'proctoring',
    'inactive', 'monitoring', 'warning',
    'windowblur', 'window_blur'
];

window.addEventListener('message', function (event) {
    try {
        const raw = (typeof event.data === 'string')
            ? event.data
            : JSON.stringify(event.data);

        if (VIOLATION_KEYWORDS.some(k => raw.toLowerCase().includes(k))) {
            event.stopImmediatePropagation();
            event.stopPropagation();
        }
    } catch (e) { /* ignore non-serialisable messages */ }
}, true); // capture: true — fires before the site's own listeners
