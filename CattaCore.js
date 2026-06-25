(function () {
    console.log("🚀 Catta Core (Engine): Booting up... [Full Context Lock & Smart Trigger Mode]");

    const MODULE_BASE_URL = "https://st-cattacafe.casa/dante/api/get-module";
    const SAVE_API = "https://st-cattacafe.casa/dante/api/save";

    window.CattaUI = window.CattaUI || {
        modules: [],
        config: window.CattaUserConfig || {},

        cache: {
            lastImage: null,
            chatElement: null,
            currentProcessingMsg: null,
            prompts: {}
        },

        utils: {

            escapeHtml: function (text) {
                if (!text) return text;
                return text
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            },

            loadPurifier: function () {
                if (!window.DOMPurify && !document.getElementById('catta-dompurify')) {
                    const script = document.createElement('script');
                    script.id = 'catta-dompurify';
                    // 🔗 SRI Hash สำหรับ DOMPurify 3.0.6 (Subresource Integrity)
                    // เบราว์เซอร์จะปฏิเสธการโหลดทันทีถ้าไฟล์บน CDN ถูกแอบแก้ไข
                    script.src = "https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js";
                    script.integrity = "sha384-mCD3F2B6R7SXKFY0KXiVZjXbHZ0P4bQRw1mEkpgMaTW8RzGCIQ8FXBCLb7zMdC7";
                    script.crossOrigin = "anonymous";
                    document.head.appendChild(script);
                }
            },

            purifyHtml: function (htmlString) {
                if (!htmlString) return htmlString;

                if (window.DOMPurify) {
                    return window.DOMPurify.sanitize(htmlString, {
                        ADD_TAGS: ['iframe', 'audio', 'video', 'source', 'style'],
                        ADD_ATTR: [
                            // ✅ onended สำหรับ <audio>/<video> เท่านั้น
                            // ❌ ลบ onclick, onkeypress ออกแล้ว — ใช้ CattaClick Dispatcher แทน
                            'onended',
                            // data-* ที่ใช้งานจริงในระบบ (whitelist ชัดเจน)
                            'data-msg', 'data-content', 'data-playing',
                            'data-active-season', 'data-active-type', 'data-active-json',
                            'data-name', 'data-pfp', 'data-type', 'data-upl',
                            'data-th', 'data-en', 'data-zh', 'data-id', 'target',
                            // CattaClick Dispatcher attributes
                            'data-action', 'data-src', 'data-url',
                            'data-call-type', 'data-mode',
                            'data-target', 'data-class',
                            'data-modal-type', 'data-json',
                            'data-fn', 'data-arg',
                            'data-prompt', 'data-idx',
                        ],
                        ALLOW_DATA_ATTR: true,
                        ALLOW_UNKNOWN_PROTOCOLS: true,
                        RETURN_TRUSTED_TYPE: false
                    });
                }

                // Fallback (If DOMPurify hasn't loaded yet) - Aggressive Security Layer
                return htmlString
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<(object|embed|iframe)\b[^>]*>(?:.*?<\/\1>)?/gi, '')
                    .replace(/\bon[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
                    .replace(/(href|src)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, (match, attr, val) => {
                        if (/javascript:/i.test(val)) return `${attr}=""`;
                        return match;
                    });
            },

            findLastUserImage: function () {
                let currentNode = window.CattaUI.cache.currentProcessingMsg;

                if (!currentNode) {
                    const chat = document.getElementById('chat');
                    if (!chat) return 'https://files.catbox.moe/nhmly4.jpg';
                    currentNode = chat.lastElementChild;
                }

                let limit = 20;

                while (currentNode && limit > 0) {
                    currentNode = currentNode.previousElementSibling;
                    limit--;

                    if (!currentNode) break;

                    const mediaList = currentNode.querySelectorAll(
                        '.mes_media_container img, .mes_media_container video, ' +
                        '.mes_img_container img, .mes_img_container video, ' +
                        '.img_swipes img, .img_swipes video, ' +
                        '.mes_block img, .mes_block video, ' +
                        '.mes_text img:not(.emoji):not(.icon):not([class*="avatar"]), ' +
                        '.mes_text video, ' +
                        '.mes_file_wrapper img, ' +
                        '.mes_file_wrapper video'
                    );

                    if (mediaList.length > 0) {
                        for (let i = mediaList.length - 1; i >= 0; i--) {
                            const lastMedia = mediaList[i];
                            let url = lastMedia.currentSrc || lastMedia.src;

                            if (url && !url.includes('files.catbox.moe/nhmly4.jpg') && !url.includes('ui-avatars.com')) {
                                console.log("✅ Catta Engine: Locked Media ->", url);
                                return url;
                            }
                        }
                    }
                }
                return null;
            },

            sendMessage: function (msg) {
                if (!msg) return;
                const ta = document.getElementById('send_textarea');
                const btn = document.getElementById('send_but');
                if (ta && btn) {
                    ta.value = msg;
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                    setTimeout(() => {
                        btn.click();
                    }, 50);
                } else {
                    console.warn("CattaCore: ไม่พบช่องพิมพ์ข้อความของ SillyTavern");
                }
            }
        },

        preloadPrompt: async function (promptKey) {
            if (this.cache.prompts[promptKey]) return;

            console.log(`🤫 Preloading Secret Prompt: ${promptKey}...`);
            try {
                const res = await fetch(`${MODULE_BASE_URL}?name=${promptKey}`, {
                    headers: {
                        'x-uid': localStorage.getItem('catta_uid'),
                        'x-token': localStorage.getItem('catta_auth_token')
                    }
                });
                if (res.ok) {
                    const raw = await res.text();
                    let content = raw;
                    try {
                        const json = JSON.parse(raw);
                        content = json.code || raw;
                    } catch { /* plain text fallback */ }
                    this.cache.prompts[promptKey] = content.trim();

                    this.scanAndInjectPrompts("");
                }
            } catch (e) { console.error(`❌ Failed to preload ${promptKey}`, e); }
        },

        scanAndInjectPrompts: function (textToScan) {
            if (!window.CattaPromptInject) return;
            const text = (textToScan || "").toLowerCase();

            // Sticky counter storage (จำค่าไว้ใน CattaUI object เอง)
            this._stickyCounters = this._stickyCounters || {};

            this.modules.forEach(mod => {
                const isEnabled = this.config[mod.id] === true;
                const promptKey = mod.promptKey;
                const stPromptId = `catta_prompt_${mod.id}`;

                if (!isEnabled || !promptKey) {
                    window.CattaPromptInject(stPromptId, "", false);
                    delete this._stickyCounters[mod.id];
                    return;
                }

                const promptText = this.cache.prompts[promptKey];
                if (promptText) {

                    // ถ้าไม่มี keywords → ฉีดตลอด (โมดูลปกติ)
                    if (!mod.keywords || mod.keywords.length === 0) {
                        window.CattaPromptInject(stPromptId, promptText, true);
                        return;
                    }

                    const found = mod.keywords.some(kw => text.includes(kw.toLowerCase()));
                    if (found) {
                        // เจอ keyword: ฉีด Prompt และรีเซ็ต sticky counter เป็น 4
                        this._stickyCounters[mod.id] = 4;
                        window.CattaPromptInject(stPromptId, promptText, true);
                    } else {
                        const sticky = this._stickyCounters[mod.id] || 0;
                        if (sticky > 0) {
                            // ยังเกาะอยู่: ลดนับลง 1 และคง Prompt ไว้
                            this._stickyCounters[mod.id] = sticky - 1;
                            window.CattaPromptInject(stPromptId, promptText, true);
                        } else {
                            // หมดเวลา: ถอด Prompt ออก
                            window.CattaPromptInject(stPromptId, "", false);
                        }
                    }
                } else {
                    // 🔄 Auto-retry: module เปิดอยู่แต่ prompt ยังไม่ได้ถูก cache
                    // (เกิดเมื่อ fetch ครั้งแรกล้มเหลว เช่น เน็ตหลุด)
                    // ดึงใหม่อัตโนมัติทุกครั้งที่ user กด Send
                    this.preloadPrompt(promptKey);
                }
            });
        },

        registerModule: function (moduleData) {
            console.log(`📦 Registering Module: ${moduleData.name}`);

            if (moduleData.rules && Array.isArray(moduleData.rules)) {
                moduleData.rules.forEach(rule => {
                    if (typeof rule.findRegex === 'string') {
                        try {
                            rule._compiledRegex = new RegExp(rule.findRegex, 'gmi');
                        } catch (e) {
                            console.error(`❌ Regex Compile Error[${moduleData.id}]:`, e);
                            rule._compiledRegex = null;
                        }
                    }
                });
            }

            this.modules.push(moduleData);

            if (moduleData.css) {
                const styleId = `catta-style-${moduleData.id}`;
                if (!document.getElementById(styleId)) {
                    const style = document.createElement('style');
                    style.id = styleId;
                    style.type = 'text/css';
                    style.appendChild(document.createTextNode(moduleData.css));
                    document.head.appendChild(style);
                }
            }

            if (!this.config.hasOwnProperty(moduleData.id)) {
                this.config[moduleData.id] = (moduleData.defaultState !== undefined) ? moduleData.defaultState : false;
            }

            if (moduleData.promptKey && this.config[moduleData.id] === true) {
                this.preloadPrompt(moduleData.promptKey);
            }

            this.refreshMenu();
            this.process();
        },

        updateConfig: async function (moduleId, state) {
            this.config[moduleId] = state;
            if (window.CattaUserConfig) window.CattaUserConfig = this.config;

            try {
                await fetch(SAVE_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: localStorage.getItem('catta_uid'),
                        token: localStorage.getItem('catta_auth_token'),
                        config: this.config
                    })
                });
                console.log(`💾 Saved Config [${moduleId}]: ${state}`);
            } catch (e) { console.error("Save failed:", e); }
        },

        refreshMenu: function () { },
        process: function () { scanAndProcess(); }
    };

    window.CattaUI.utils.loadPurifier();

    // =======================================================
    // 🔐 ECDSA SECURITY LAYER
    // Public Key สำหรับ verify signature ก่อนรันโค้ด module ทุกตัว
    // Private Key อยู่บนเครื่อง Developer เท่านั้น ต่อให้แก้ไขโค้ดบน VPS ไม่ทำอะไรได้
    // =======================================================
    const CATTA_PUBLIC_KEY_JWK = {
        kty: "EC",
        crv: "P-256",
        x: "9WHNJPx0kcZuhTr1eRf2Z2qZsbUy5AeMuq2rI7hUX4g",
        y: "NFqs2nTmmrGotgUwl1YygvyhsYNF4lLCN5tplmMZhFA"
    };

    let _cattaPublicKey = null;

    async function getCattaPublicKey() {
        if (_cattaPublicKey) return _cattaPublicKey;
        try {
            _cattaPublicKey = await crypto.subtle.importKey(
                "jwk",
                CATTA_PUBLIC_KEY_JWK,
                { name: "ECDSA", namedCurve: "P-256" },
                true,
                ["verify"]
            );
        } catch (e) {
            console.error("❌ [Catta Security] Failed to import public key:", e);
        }
        return _cattaPublicKey;
    }

    async function verifyCattaModule(code, signatureBase64) {
        if (!signatureBase64) {
            console.error("🚨 SECURITY ALERT: Module has no signature! Execution blocked.");
            return false;
        }
        try {
            const publicKey = await getCattaPublicKey();
            if (!publicKey) return false;

            const encoder = new TextEncoder();
            // Normalize CRLF → LF ก่อนตรวจเสมอ (sign_module.js ก็ทำแบบนี้ก่อนเซ็น)
            const codeBuffer = encoder.encode(code.replace(/\r\n/g, '\n'));
            // แปลง base64 เป็น Uint8Array
            const sigBuffer = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));

            const isValid = await crypto.subtle.verify(
                { name: "ECDSA", hash: { name: "SHA-256" } },
                publicKey,
                sigBuffer,
                codeBuffer
            );
            return isValid;
        } catch (e) {
            console.error("❌ [Catta Security] Signature verification error:", e);
            return false;
        }
    }

    async function loadModule(moduleKey) {
        console.log(`📡 Fetching Module (Secure): ${moduleKey}...`);
        try {
            const res = await fetch(`${MODULE_BASE_URL}?name=${moduleKey}`, {
                headers: {
                    'x-uid': localStorage.getItem('catta_uid'),
                    'x-token': localStorage.getItem('catta_auth_token')
                }
            });

            if (!res.ok) {
                console.error(`❌ [${moduleKey}] Server error: ${res.status}`);
                return;
            }

            // รับ JSON { code, signature } แทน plain text
            const data = await res.json();
            const { code, signature } = data;

            if (!code) {
                console.error(`❌ [${moduleKey}] No code in response!`);
                return;
            }

            // ✅ Verify ECDSA Signature ก่อนรันทุกครั้ง!
            const isValid = await verifyCattaModule(code, signature);
            if (!isValid) {
                console.error(`🚨 SECURITY ALERT [${moduleKey}]: Signature invalid or missing! Execution BLOCKED.`);
                return; // หยุดทันที ไม่รันโค้ดใดๆ ทั้งสิ้น
            }

            console.log(`✅ [${moduleKey}] Signature verified. Executing...`);
            const el = document.createElement('script');
            el.textContent = code;
            document.head.appendChild(el);

        } catch (e) {
            console.error(`❌ Failed to load module ${moduleKey}`, e);
        }
    }

    function executeScript(content, rule) {
        const regex = rule._compiledRegex;
        if (!regex || !regex.test(content)) return content;
        regex.lastIndex = 0;

        return content.replace(regex, (...args) => {
            if (rule.preProcess) {
                const groups = args.slice(1, args.length - 2);
                const modifiedGroups = rule.preProcess(groups);
                for (let i = 0; i < modifiedGroups.length; i++) {
                    args[i + 1] = modifiedGroups[i];
                }
            }
            let res = rule.replaceString;
            if (typeof res === 'function') {
                return res(args[0], ...args.slice(1, args.length - 2));
            }
            for (let i = 1; i < args.length - 2; i++) {
                res = res.replace(new RegExp(`\\$${i}`, 'g'), args[i] || '');
            }
            return res;
        });
    }
    function scanAndProcess() {
        const chat = document.getElementById('chat');
        if (!chat) return;

        if (document.querySelector('.mes_text.streaming')) return;

        window.requestAnimationFrame(() => {
            const newMessages = chat.querySelectorAll('.mes_text:not([data-catta-processed])');
            if (newMessages.length === 0) return;

            newMessages.forEach(msg => {
                window.CattaUI.cache.currentProcessingMsg = msg.closest('.mes');

                let preBlocks = [];
                let rawHtml = msg.innerHTML.replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, match => {
                    preBlocks.push(match);
                    return `[[CATTA_PRE_BLOCK_${preBlocks.length - 1}]]`;
                });

                let txt = rawHtml.replace(/<br\s*\/?>/gi, '[[_BR_]]')
                    .replace(/(\r\n|\n|\r)/gm, "")
                    .replace(/\[\[_BR_\]\]/g, '\n');

                txt = txt.replace(/\[\[CATTA_PRE_BLOCK_(\d+)\]\]/g, (m, i) => preBlocks[i]);

                let changed = false;

                window.CattaUI.modules.forEach(mod => {
                    if (window.CattaUI.config[mod.id] === true) {
                        mod.rules.forEach(r => {
                            const temp = executeScript(txt, r);
                            if (temp !== txt) { txt = temp; changed = true; }
                        });
                    }
                });

                if (changed) {
                    let finalPreBlocks = [];
                    txt = txt.replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, match => {
                        finalPreBlocks.push(match);
                        return `[[CATTA_FINAL_PRE_${finalPreBlocks.length - 1}]]`;
                    });

                    txt = txt.replace(/(<\/div>)\s*\n+/g, '$1').replace(/\n/g, '<br>');

                    txt = txt.replace(/\[\[CATTA_FINAL_PRE_(\d+)\]\]/g, (m, i) => finalPreBlocks[i]);

                    msg.innerHTML = window.CattaUI.utils.purifyHtml(txt);
                }
                msg.setAttribute('data-catta-processed', 'true');

                window.CattaUI.cache.currentProcessingMsg = null;
            });
        });
    }

    function injectSidebar() {
        const $ = window.jQuery;
        if (!$) return;

        const $target = $('#extensions_settings');
        if ($target.length === 0) return;

        $('#catta_ui_suite_menu').remove();

        let menuHtml = `
        <div id="catta_ui_suite_menu" class="inline-drawer">
            <div class="inline-drawer-header catta-header" style="user-select: none; border-left: 5px solid #00f0ff; cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding:5px;">
                <b>💠 Catta UI Suite (Online)</b>
                <div class="icon fa-solid fa-circle-chevron-down"></div>
            </div>
            <div class="inline-drawer-content" style="display:none; padding:10px;">
        `;

        window.CattaUI.modules.forEach(mod => {
            if (mod.hidden) return; // 🌟 ซ่อนโมดูลที่มี hidden: true (เช่น AI Assistant ใน UI Builder)

            const isChecked = window.CattaUI.config[mod.id] === true;
            const displayOn = isChecked ? '' : 'display:none';
            const displayOff = !isChecked ? '' : 'display:none';

            menuHtml += `
                <div style="margin-bottom: 5px; padding: 5px; border: 1px solid var(--SmartThemeBorderColor); border-radius: 10px; display:flex; align-items:center; justify-content:space-between;">
                    <div style="flex:1; padding-right:10px;">
                        <strong>${mod.name}</strong><br>
                        <small style="opacity:0.7">${mod.desc}</small>
                    </div>
                    <div>
                        <label class="checkbox flex-container margin-r5" style="cursor: pointer; margin:0;">
                            <input type="checkbox" class="catta-checkbox" data-id="${mod.id}" ${isChecked ? 'checked' : ''} style="display:none;">
                            <span class="catta-toggle-on fa-solid fa-toggle-on" style="${displayOn}; color: var(--SmartThemeQuoteColor); font-size:1.2em;"></span>
                            <span class="catta-toggle-off fa-solid fa-toggle-off" style="${displayOff}; opacity: 0.5; font-size:1.2em;"></span>
                        </label>
                    </div>
                </div>
            `;
        });

        menuHtml += `
            <div style="margin-top:10px; text-align:center; padding-top:10px; border-top:1px solid #333;">
                 <button id="catta_logout" class="menu_button_icon" style="color:red;">🚪 Logout</button>
            </div>
        </div></div>`;

        $target.prepend(menuHtml);

        $('.catta-header').off('click').on('click', function () { $(this).next().slideToggle(); });

        $('.catta-toggle-on, .catta-toggle-off').off('click').on('click', function (e) {
            e.preventDefault(); e.stopPropagation();
            const checkbox = $(this).siblings('input');
            checkbox.prop('checked', !checkbox.prop('checked')).trigger('change');
        });

        $('.catta-checkbox').off('change').on('change', function () {
            const id = $(this).data('id');
            const state = $(this).is(':checked');
            if (state) {
                $(this).siblings('.catta-toggle-off').hide();
                $(this).siblings('.catta-toggle-on').show();
            } else {
                $(this).siblings('.catta-toggle-on').hide();
                $(this).siblings('.catta-toggle-off').show();
            }
            window.CattaUI.updateConfig(id, state);

            const targetModule = window.CattaUI.modules.find(m => m.id === id);
            if (state && targetModule && targetModule.promptKey) {
                window.CattaUI.preloadPrompt(targetModule.promptKey);
            } else if (!state && targetModule) {
                if (window.CattaPromptInject) window.CattaPromptInject(`catta_prompt_${id}`, "", false);
                // 🧹 ล้าง cache ออกด้วย ป้องกัน scanAndInjectPrompts เจอ prompt เก่าแล้ว inject ซ้ำ
                if (targetModule.promptKey && window.CattaUI.cache.prompts[targetModule.promptKey]) {
                    delete window.CattaUI.cache.prompts[targetModule.promptKey];
                }
            }

            document.querySelectorAll('.mes_text').forEach(m => m.removeAttribute('data-catta-processed'));
            scanAndProcess();
        });

        $('#catta_logout').off('click').on('click', function () {
            if (confirm("Disconnect Catta UI?")) {
                localStorage.removeItem('catta_uid');
                localStorage.removeItem('catta_auth_token');
                location.reload();
            }
        });
    }

    window.CattaUI.refreshMenu = injectSidebar;

    let debounceTimer;
    const observer = new MutationObserver((mutations) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            scanAndProcess();
        }, 200);
    });

    const chat = document.getElementById('chat');
    if (chat) {
        observer.observe(chat, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        scanAndProcess();
    }
    window.cattaSend = function (msg) {
        if (window.CattaUI && window.CattaUI.utils.sendMessage) {
            window.CattaUI.utils.sendMessage(msg);
        }
    };

    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.catta-msg-btn');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            const msg = btn.getAttribute('data-msg');
            if (msg) window.cattaSend(msg);
            return;
        }

        // --- CattaClick Dispatcher (Security Layer) ---
        const clickable = e.target.closest('.catta-clickable');
        if (clickable && clickable.dataset.action) {
            e.preventDefault();
            e.stopPropagation();

            const action = clickable.dataset.action;
            const src = clickable.dataset.src;
            const name = clickable.dataset.name;
            const pfp = clickable.dataset.pfp;
            const callType = clickable.dataset.callType;
            const url = clickable.dataset.url;

            const ALLOWED_ACTIONS = {
                'expand-image': () => {
                    // รองรับทั้ง CattaGram lightbox และ AcademyActions.expandImage
                    if (src) {
                        if (window.expandIGImage) window.expandIGImage(src);
                        else if (window.AcademyActions && window.AcademyActions.expandImage) window.AcademyActions.expandImage(src);
                    }
                },
                'open-highlight': () => window.openIGHighlight && url && window.openIGHighlight(url),
                'start-call': () => window.startIGCall && name && pfp && window.startIGCall(clickable, callType || 'voice', name, pfp),
                'accept-call': () => window.acceptIGCall && callType && window.acceptIGCall(callType),
                'end-call': () => window.endIGCall && window.endIGCall(true, clickable.dataset.mode, callType),
                'toggle-reader': () => {
                    const r = document.getElementById('ig-call-reader');
                    if (r) r.classList.toggle('active');
                },
                'toggle-reply-box': () => {
                    const box = document.getElementById('ig-call-reply-box');
                    const input = document.getElementById('ig-call-input');
                    if (box) box.classList.toggle('active');
                    if (input) input.focus();
                },
                'close-reader': () => {
                    const r = document.getElementById('ig-call-reader');
                    if (r) r.classList.remove('active');
                },
                'remove-closest': () => {
                    const target = clickable.dataset.target;
                    if (target) {
                        const closest = clickable.closest(target);
                        if (closest) closest.remove();
                    }
                },
                'toggle-class-closest': () => {
                    const target = clickable.dataset.target;
                    const cls = clickable.dataset.class;
                    if (target && cls) {
                        const closest = clickable.closest(target);
                        if (closest) closest.classList.toggle(cls);
                    }
                },
                // --- HaremActions (universal_hud) ---
                'copy-from-btn': () => window.HaremActions && window.HaremActions.copyFromBtn(clickable),
                'harem-close-modal': () => window.HaremActions && window.HaremActions.closeModal(),
                'harem-open-modal': () => {
                    const type = clickable.dataset.modal || clickable.dataset.modalType;
                    // อ่าน json จากปุ่มเอง หรือ traverse ขึ้นหา .harem-data-holder
                    const json = clickable.dataset.json ||
                        (clickable.closest('.harem-data-holder') || {}).dataset?.json;
                    if (type && json && window.HaremActions) window.HaremActions.openModal(type, json);
                },
                'harem-toggle-body': () => {
                    const uid = clickable.dataset.uid;
                    if (uid && window.HaremActions && window.HaremActions.toggleBody) {
                        window.HaremActions.toggleBody(uid);
                    }
                },
                'harem-toggle-lang': () => {
                    if (window.HaremActions && window.HaremActions.toggleLang) {
                        window.HaremActions.toggleLang();
                    }
                },
                'harem-toggle-particles': () => {
                    if (window.HaremActions && window.HaremActions.toggleParticles) {
                        window.HaremActions.toggleParticles(clickable);
                    }
                },
                'harem-toggle-ambient': () => {
                    if (window.HaremActions && window.HaremActions.toggleAmbient) {
                        window.HaremActions.toggleAmbient(clickable);
                    }
                },
                'harem-toggle-music': () => window.cattaToggleMusic && window.cattaToggleMusic(clickable),
                // --- AcademyActions (rpghud) ---
                'change-npc-avatar': () => {
                    const npcName = clickable.dataset.npc;
                    if (window.AcademyActions && window.AcademyActions.changeNpcAvatar && npcName) {
                        window.AcademyActions.changeNpcAvatar(e, npcName);
                    }
                },
                'change-player-avatar': () => {
                    if (window.AcademyActions && window.AcademyActions.changePlayerAvatar) {
                        window.AcademyActions.changePlayerAvatar(e);
                    }
                },
                'academy-toggle-body': () => {
                    const uid = clickable.dataset.uid;
                    if (uid && window.AcademyActions && window.AcademyActions.toggleBody) {
                        window.AcademyActions.toggleBody(uid);
                    }
                },
                'academy-open-modal': () => {
                    const modalType = clickable.dataset.modalType;
                    const json = clickable.dataset.json;
                    if (modalType && json && window.AcademyActions && window.AcademyActions.openModal) {
                        window.AcademyActions.openModal(e, modalType, json);
                    }
                },
                'academy-action': () => {
                    const fn = clickable.dataset.fn;
                    const arg = clickable.dataset.arg;
                    const ALLOWED_FNS = ['expandImage', 'closeModal', 'copyPrompt', 'upgradeStat',
                        'fillChatbox', 'petLogicAction', 'combatTurn', 'useCombatSkill',
                        'useCombatItem', 'endCombat', 'forceCloseCombat', 'closeCelebration',
                        'toggleMagicEffect', 'openPetUI', 'openStatusUI', 'openSkillUI',
                        'openYearbook', 'openModal'];
                    if (fn && ALLOWED_FNS.includes(fn) && window.AcademyActions && window.AcademyActions[fn]) {
                        window.AcademyActions[fn](e, arg);
                    }
                },
                // --- Other ---
                'copy-prompt': () => {
                    const text = clickable.dataset.content || clickable.dataset.prompt;
                    if (window.AcademyActions && window.AcademyActions.copyPrompt) {
                        window.AcademyActions.copyPrompt(e, text);
                    }
                },
                'toggle-hud-theme': () => window.toggleHudTheme && window.toggleHudTheme(e),
                'catta-music': () => window.cattaToggleMusic && window.cattaToggleMusic(clickable),
                // --- Image Expand ---
                'expand-image': () => {
                    const src = clickable.dataset.src || (clickable.querySelector('img') ? clickable.querySelector('img').src : null);
                    if (src && window.AcademyActions && window.AcademyActions.expandImage) {
                        window.AcademyActions.expandImage(src);
                    }
                },
                // --- IB HUD toggle (ios-card) ---
                'toggle-ios-card': () => {
                    const card = clickable.closest('.ios-card') || clickable;
                    card.classList.toggle('expanded');
                },
                // --- Joko HUD toggle ---
                'toggle-joko-hud': () => {
                    if (window.toggleJokoHUD) window.toggleJokoHUD(clickable);
                },
                // --- 2NPC HUD toggle ---
                'toggle-2npc-card': () => {
                    const card = clickable.closest('.hud2npc-card');
                    if (card) card.classList.toggle('expanded');
                },
                // --- Remove element by selector ---
                'remove-closest': () => {
                    const target = clickable.dataset.target;
                    if (target) {
                        const el = target.startsWith('#') ? document.getElementById(target.slice(1)) : clickable.closest(target);
                        if (el) el.remove();
                    }
                },
            };

            if (ALLOWED_ACTIONS[action]) {
                ALLOWED_ACTIONS[action]();
            } else {
                console.warn('[CattaClick] Unknown action blocked:', action);
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && e.target.id === 'send_textarea') {
            if (window.CattaUI && window.CattaUI.scanAndInjectPrompts) {
                window.CattaUI.scanAndInjectPrompts(e.target.value);
            }
        }
    });

    document.addEventListener('click', (e) => {
        const sendBtn = e.target.closest('#send_but');
        if (sendBtn) {
            const ta = document.getElementById('send_textarea');
            if (ta && window.CattaUI && window.CattaUI.scanAndInjectPrompts) {
                window.CattaUI.scanAndInjectPrompts(ta.value);
            }
        }
    });

    loadModule('addon_sol_v1');
    loadModule('addon_sol_v2');
    loadModule('addon_sol_v3');
    loadModule('addon_sol_v4');
    loadModule('addon_sol_v5');
    loadModule('addon_sol_v6');
    loadModule('addon_sol_v7');
    loadModule('addon_sol_v8');
    loadModule('addon_sol_v9');
    loadModule('addon_sol_v10');
    loadModule('addon_sol_v11');
    loadModule('addon_sol_v12');
    loadModule('addon_sol_v13');

    loadModule('addon_catta_99');

    loadModule('addon_vvip');

    loadModule('Solv1');

    loadModule('CattaGram');
    loadModule('IB_hud');
    loadModule('many_npc');
    loadModule('joko_hybrid');
    loadModule('basic-music');
    loadModule('universal_hud');
    loadModule('arpghud');
    loadModule('ChatNovel');
    loadModule('icnis_hud');

    // --- ของ HUD อนาคต ---
    loadModule('Pager');
    loadModule('Streamer');
    loadModule('Shamanism');
    loadModule('hudphakrop');
    loadModule('abchud');
    loadModule('abcd');
    loadModule('livehud');
    loadModule('OmegaverseHUD');

    // --- ของ custom ui ---
    loadModule('hudhubx');
})();
