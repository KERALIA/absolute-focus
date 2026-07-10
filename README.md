# Absolute Focus (Anti-Frontend & Backend Edition)

A premium, dual-layer userscript engineered to enforce persistent tab visibility flags and active window focus execution contexts globally. Unlike standard focus utilities, **Absolute Focus** actively intercepts both client-side DOM layout tracking and outgoing backend network telemetry streams to guarantee complete environmental containment.

---

## 🎯 Intended Use Cases & Professional Applications

This utility was developed to address critical limitations in modern web architectures, serving three primary professional use cases:

* **Data Privacy & Telemetry Mitigation:** Many modern platforms aggressively track micro-interactions—such as exact tab switching frequencies, window resizing, and mouse-leave metrics—to build invasive behavioral profiling vectors. This script restores user data autonomy by sanitizing these tracking payloads before they leave the browser.
* **Developer Testing & Frontend Diagnostics:** When debugging complex asynchronous applications, web workers, canvas animations, or polling loops, switching to the browser developer tools often pauses execution due to the Page Visibility API. This tool allows engineers to simulate a permanently active viewport to test state-machine stability under continuous load.
* **Accessibility & Focus Continuity:** For neurodivergent individuals or professionals balancing multi-monitor workflows, native web restrictions that freeze, pause, or throw disruptive modal blocks when switching windows can severely fracture focus. This script enforces layout stability across all workspaces.

---

## 💾 Installation Instructions

> ⚠️ **CRITICAL REQUIREMENT:** You **MUST** ensure Tampermonkey is installed and properly configured in Google Chrome, Chromium-based browsers (such as Brave, Edge, Opera), or Mozilla Firefox using Steps 1 and 2 *before* clicking the installation link in Step 3. If you bypass the extension setup, the browser will download the script as a raw text file instead of injecting it directly.

### Step 1: Install Tampermonkey First
Make sure you have a compatible userscript manager installed on your browser:
* Download and install the [Tampermonkey Browser Extension](https://www.tampermonkey.net/).

### Step 2: Configure Extension Permissions (Required)
To allow the browser to hand the raw script file over to Tampermonkey directly:
1. Open your browser menu, navigate to your extensions panel, and select **Manage Extensions**.
2. Locate the **Tampermonkey** card and open up its **Details** tab.
3. Scroll down through the details menu and locate the toggle option to **Enable "Allow user scripts"** (on some browsers, this setting is labeled as *"Allow access to file URLs"*). Turn this option **ON**.

### Step 3: Inject the Userscript
Now that your permissions are prepared to receive the script:
* Click **[HERE](https://raw.githubusercontent.com/KERALIA/absolute-focus/main/absolute-focus.user.js)** to instantly inject the script directly into Tampermonkey.
* A Tampermonkey dashboard tab will automatically pop open. Click the green **Install** button to finalize it.

---

## ⚡ The Mitigation Architecture

Modern automated evaluation suites and analytics platforms utilize two main methods to detect when a user switches tabs, minimizes a window, or exits the browser viewport:

### 1. The Local Event Loop (Frontend)
Websites bind capturing event listeners to structural layout components to trigger immediate UI warnings, lockouts, or local modal freezes whenever `blur`, `mouseleave`, or `visibilitychange` flags occur. 

### 2. Asynchronous Polling Loops (Backend Tracking Bypass)
To counter basic userscripts that drop event listeners, modern tracking scripts run background execution routines (`setInterval`) that constantly poll properties like `document.visibilityState` or window coordinates. These metrics are compiled into an array string and quietly dispatched to remote data centers using synchronous hooks like `navigator.sendBeacon` (frequently executed right as you leave a tab), `window.fetch`, or standard `XMLHttpRequest` (XHR) APIs.

**Absolute Focus neutralizes both strategies completely.**

---

## 🛠️ Key Architectural Features

* **Visibility API Lockout:** Exploits JavaScript object property descriptors to hardcode `document.visibilityState` as an immutable `"visible"` value, alongside setting `document.hidden = false`.
* **Focus State Spoofing:** Suppresses the native `window.onblur` property entirely, forcing window evaluation states to continuously return a positive value via `document.hasFocus()`.
* **Telemetry Payload Sanitization:** Hooks into network transit channels. If an outgoing string matrix contains telemetry indicators (`"blur"`, `"hidden"`, or `"visibilitychange"`), the payload is dynamically parsed and modified to clean state indicators (`"focus"` or `"visible"`) before it touches remote server endpoints.
* **Server-Side Request Mocking:** Intercepts endpoints featuring keywords like `/telemetry`, `/proctor`, or `/monitoring` and maps them directly to fake a successful delivery status (`HTTP 200 OK`) right inside your browser console, dropping the network packet entirely.
* **Aggressive CSS Structural Cloak:** Injects a recurring styling layout rule targeted directly at generic naming syntax (e.g., classes/IDs matching `warning`, `modal`, `proctor`, or `alert`) to render custom UI warning cards completely hidden, transparent, and non-clickable.

---

## 🧠 Technical Breakdown

### Outgoing Data Stream Filtering
By intercepting standard API call environments, the script enforces strict rules on raw payload transit:

```javascript
// Example logic of the background network filter
const sanitizeTelemetryPayload = (data) => {
    if (typeof data === 'string' && (data.includes('blur') || data.includes('hidden'))) {
        return data.replace(/"blur"/g, '"focus"').replace(/"hidden"/g, '"visible"');
    }
    return data;
};
