// ==UserScript==
// @name          Workspace Focus Continuity Utility
// @namespace     https://github.com/KERALIA
// @author        Rocky
// @version       2.0.0
// @description   Maintains standard document visibility states and basic focus contexts globally to prevent background task pausing.
// @include       *
// @run-at        document-start
// @grant         unsafeWindow
// ==/UserScript==

// 1. RESET BASIC WINDOW FOCUS PROPERTIES
unsafeWindow.onblur = null;
unsafeWindow.blurred = false;

if (unsafeWindow.document) {
    unsafeWindow.document.hasFocus = () => true;
}
if (unsafeWindow.window) {
    unsafeWindow.window.onFocus = () => true;
}

// 2. STABILIZE PAGE VISIBILITY STATES
// Standardizes core visibility properties without strict-mode overrides
[
    "hidden",
    "mozHidden",
    "msHidden",
    "webkitHidden"
].forEach(prop_name => {
    try {
        Object.defineProperty(document, prop_name, { value: false, configurable: true, writable: true });
    } catch (e) {
        console.log("Property preservation skipped:", prop_name);
    }
});

try {
    Object.defineProperty(document, "visibilityState", { get: () => "visible", configurable: true });
    Object.defineProperty(document, "webkitVisibilityState", { get: () => "visible", configurable: true });
} catch (e) {
    console.log("Visibility state preservation skipped");
}

unsafeWindow.document.onvisibilitychange = undefined;

// 3. PASSIVE EVENT HANDLING
// Handles basic peripheral exit events without halting critical layout cycles
const targetEvents = [
    "visibilitychange",
    "webkitvisibilitychange",
    "mozvisibilitychange",
    "msvisibilitychange",
    "blur",
    "mouseleave",
    "mouseout"
];

const passiveEventHandler = (event) => {
    // Allows standard form controls to retain focus naturally
    const formInputs = [HTMLInputElement, HTMLTextAreaElement, HTMLSelectElement];
    if (formInputs.some(type => event.target instanceof type)) {
        return;
    }

    // Prevents standard background tab suspension triggers
    if (event.type === 'visibilitychange' || event.type === 'blur') {
        event.stopPropagation();
    }
};

targetEvents.forEach(event_name => {
    window.addEventListener(event_name, passiveEventHandler, true);
    document.addEventListener(event_name, passiveEventHandler, true);
});
