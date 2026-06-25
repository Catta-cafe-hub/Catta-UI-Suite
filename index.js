import { setExtensionPrompt, extension_prompt_types } from "../../../../script.js";

window.CattaPromptInject = function (promptId, text, state) {
    try {
        if (typeof setExtensionPrompt === "function") {
            if (state && text) {
                setExtensionPrompt(promptId, text, extension_prompt_types.IN_PROMPT, 1);
            } else {
                setExtensionPrompt(promptId, "");
            }
        }
    } catch (e) {
        console.error("[Catta UI] Prompt Injection Error:", e);
    }
};

// =======================================================
// 🔐 ECDSA PUBLIC KEY สำหรับตรวจสอบ Core Engine ก่อนโหลด
// ต้องตรงกับค่าใน CattaCore.js ทุกประการ
// =======================================================
const _CATTA_PUB_JWK = {
    kty: "EC",
    crv: "P-256",
    x: "9WHNJPx0kcZuhTr1eRf2Z2qZsbUy5AeMuq2rI7hUX4g",
    y: "NFqs2nTmmrGotgUwl1YygvyhsYNF4lLCN5tplmMZhFA"
};

let _corePublicKey = null;

async function _getCorePublicKey() {
    if (_corePublicKey) return _corePublicKey;
    try {
        _corePublicKey = await crypto.subtle.importKey(
            "jwk", _CATTA_PUB_JWK,
            { name: "ECDSA", namedCurve: "P-256" },
            true, ["verify"]
        );
    } catch (e) {
        console.error("[Catta UI] Failed to import public key:", e);
    }
    return _corePublicKey;
}

async function _verifyCoreSignature(code, signatureBase64) {
    if (!signatureBase64) {
        console.error("🚨 [Catta UI] Core Engine has NO signature! Execution blocked.");
        return false;
    }
    try {
        const publicKey = await _getCorePublicKey();
        if (!publicKey) return false;

        const encoder = new TextEncoder();
        // Normalize CRLF → LF ก่อนตรวจเสมอ (sign_module.js ก็ทำแบบนี้ก่อนเซ็น)
        const codeBuffer = encoder.encode(code.replace(/\r\n/g, '\n'));
        const sigBuffer = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));

        return await crypto.subtle.verify(
            { name: "ECDSA", hash: { name: "SHA-256" } },
            publicKey, sigBuffer, codeBuffer
        );
    } catch (e) {
        console.error("[Catta UI] Core signature verification error:", e);
        return false;
    }
}

(function () {


    const BASE_URL = "https://st-cattacafe.casa/dante";
    const API_LOGIN = `${BASE_URL}/api/login`;
    const API_GET_CORE = `${BASE_URL}/api/get-module?name=core`;

    const KEY_UID = "catta_uid";
    const KEY_TOKEN = "catta_auth_token";

    let userCreds = { uid: "", token: "" };


    function injectLoginMenu() {
        const $ = window.jQuery;
        const $target = $('#extensions_settings');


        if ($target.length === 0 || $('#catta_login_ui').length > 0) return;

        const isLoggedIn = (userCreds.uid && userCreds.token);
        const displayStyle = isLoggedIn ? 'display:none;' : '';


        const html = `
        <div id="catta_login_ui" class="inline-drawer" style="${displayStyle}">
            <div class="uisuite-drawer-header inline-drawer-header" style="user-select: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                <b>🔐 Catta UI Login</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content" style="padding:10px; display:none;">
                <div class="text_pole" style="margin-bottom:5px;">
                    <small>User ID:</small>
                    <input type="text" id="catta-uid" class="text_pole" style="width:100%" value="${userCreds.uid || ''}">
                </div>
                <div class="text_pole" style="margin-bottom:10px;">
                    <small>Token:</small>
                    <input type="password" id="catta-token" class="text_pole" style="width:100%" value="${userCreds.token || ''}">
                </div>
                <div id="catta-connect-btn" class="menu_button">🔗 Connect</div>
            </div>
        </div>
        `;
        $target.prepend(html);
    }


    function attachGlobalEvents() {
        const $ = window.jQuery;


        $(document).off('click', '.uisuite-drawer-header')
            .on('click', '.uisuite-drawer-header', function (e) {
                e.preventDefault(); e.stopPropagation();
                const icon = $(this).find('.inline-drawer-icon');
                const content = $(this).next('.inline-drawer-content');
                content.slideToggle(200, function () {
                    icon.toggleClass('down up');
                });
            });


        $(document).off('click', '#catta-connect-btn')
            .on('click', '#catta-connect-btn', async function (e) {
                e.preventDefault();
                const uid = $('#catta-uid').val().trim();
                const token = $('#catta-token').val().trim();

                if (!uid || !token) { alert("กรุณากรอกข้อมูลให้ครบ"); return; }
                if (window.toastr) window.toastr.info('Verifying...', 'Catta UI');

                try {

                    const check = await fetch(API_LOGIN, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uid, token })
                    });
                    const res = await check.json();

                    if (res.success) {

                        localStorage.setItem(KEY_UID, uid);
                        localStorage.setItem(KEY_TOKEN, token);
                        if (res.user_tier) window.CattaUserTier = res.user_tier; // เก็บยศไว้ในหน่วยความจำแทน localStorage

                        if (window.toastr) window.toastr.success('Login Success! Reloading...', 'Catta UI');

                        setTimeout(() => {
                            location.reload();
                        }, 1000);

                    } else {
                        alert("Login Failed: " + (res.message || "Unknown Error"));
                    }
                } catch (e) {
                    console.error(e);
                    alert("Connection Error: ไม่สามารถติดต่อ Server ได้");
                }
            });
    }

    async function autoLoadCore() {
        const savedUid = localStorage.getItem(KEY_UID);
        const savedToken = localStorage.getItem(KEY_TOKEN);


        if (!savedUid || !savedToken) return;

        userCreds = { uid: savedUid, token: savedToken };
        console.log("[Catta UI] Auto-Login found. Syncing Config...");

        try {

            const loginReq = await fetch(API_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userCreds)
            });
            const loginRes = await loginReq.json();

            if (!loginRes.success) {
                console.warn("[Catta UI] Token Expired");
                localStorage.removeItem(KEY_UID);
                localStorage.removeItem(KEY_TOKEN);
                return;
            }


            if (loginRes.user_tier) window.CattaUserTier = loginRes.user_tier;



            window.CattaUserConfig = loginRes.config || {};


            const response = await fetch(API_GET_CORE, {
                method: 'GET',
                headers: { 'x-uid': savedUid, 'x-token': savedToken }
            });

            if (response.ok) {
                // 🔐 รับ JSON { code, signature } แทน plain text
                const data = await response.json();
                const { code, signature } = data;

                if (!code) {
                    console.error("[Catta UI] Core Engine: No code in response!");
                    return;
                }

                // ✅ Verify ECDSA Signature ก่อนรันทุกครั้ง!
                const isValid = await _verifyCoreSignature(code, signature);
                if (!isValid) {
                    console.error("🚨 SECURITY ALERT: Core Engine signature check FAILED! System halted.");
                    if (window.toastr) window.toastr.error('⚠️ Security Alert: System integrity check failed!', 'Catta Security');
                    return; // หยุดทันที ไม่รัน core engine
                }

                const scriptEl = document.createElement('script');
                scriptEl.textContent = code;
                document.head.appendChild(scriptEl);

                if (window.toastr) window.toastr.success('System Synced & Online', 'Catta System');

                const $ = window.jQuery;
                if ($) $('#catta_login_ui').hide();

            }
        } catch (e) { console.error("[Catta UI] Load Error:", e); }
    }

    function init() {

        const interval = setInterval(() => {
            if (window.jQuery && $('#extensions_settings').length) {
                clearInterval(interval);
                injectLoginMenu();
                attachGlobalEvents();
                autoLoadCore();
            }
        }, 500);
    }

    if (window.jQuery) window.jQuery(document).ready(init);
    else document.addEventListener('DOMContentLoaded', init);

})();
