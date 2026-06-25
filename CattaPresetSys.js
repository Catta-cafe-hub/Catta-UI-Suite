(function () {
    console.log("🚀 Catta Preset System: Online![V3.8 - Compatible with V.Ultimate]");

    const previousEngine = localStorage.getItem('catta_active_engine');
    localStorage.setItem('catta_active_engine', 'NONE');

    const API_URL = "https://st-cattacafe.casa/dante/api/get-module";
    const cachedPrompts = {};
    let lastScannedData = "";
    let isSyncing = false;


    const ENGINES = {
        "CATTAADMIN": {
            name: "😼 CATTA Admin",
            desc: "สำหรับเทสเจลเบรก",
            fileKey: "engine_sol_v99",
            promptId: "catta_core",
            addonKey: "SOL_V99",
            allowedTiers: ['ADMIN']
        },
        "SOL_V1": {
            name: "🔞 SOL ENGINE [18+]",
            desc: "พรีเซตปลดล็อคเนื้อหา 18+ ปลดลิมิตทุกการกระทำ เน้นภาษาที่ชัดเจน เถรตรงและโจ่งแจ้ง",
            fileKey: "engine_sol_v1",
            promptId: "catta_core",
            addonKey: "SOL_V1",
            allowedTiers: ['VIP', 'VVIP', 'ADMIN']
        },
        "BLACKFLAG": {
            name: "🐦‍⬛ SOL ENGINE [BLACKFLAG]",
            desc: "พรีเซตสำหรับเปิดประสบการณ์เปลี่ยนทุกอย่างให้เป็น 'ธงดำ'",
            fileKey: "engine_sol_v7",
            promptId: "catta_core",
            addonKey: "SOL_V7",
            allowedTiers: ['VIP', 'VVIP', 'ADMIN']
        },
        "DEEPPLAY": {
            name: "⛓️ SOL ENGINE [DEEPPLAY]",
            desc: "การบรรยายเชิงลึก ที่จมดิ่งในอารมณ์และในทุกการกระทำอย่างลึกซึ้ง พร้อมเสริมมิติให้กับ NPC",
            fileKey: "engine_sol_v10",
            promptId: "catta_core",
            addonKey: "SOL_V10",
            allowedTiers: ['VIP', 'VVIP', 'ADMIN']
        },
        "DARKROMANCE": {
            name: "🖤 SOL ENGINE [DARK ROMANCE]",
            desc: "การบรรยายเชิงลึก ที่จมดิ่งในอารมณ์และในทุกการกระทำอย่างลึกซึ้ง โดยเน้นไปที่ความดาร์กโรแมน",
            fileKey: "engine_sol_v9",
            promptId: "catta_core",
            addonKey: "SOL_V9",
            allowedTiers: ['VIP', 'VVIP', 'ADMIN']
        },
        "NSFW_ROMANCE": {
            name: "💙 SOL ENGINE [ROMANCE]",
            desc: "พรีเซตปลดล็อคเนื้อหา 18+ ปลดลิมิตการบรรยายฉากที่ลึกซึ้ง ด้วยภาษาสละสลวย",
            fileKey: "engine_sol_v2",
            promptId: "catta_core",
            addonKey: "SOL_V2",
            allowedTiers: ['VIP', 'VVIP', 'ADMIN']
        },
        "SLOWBURN": {
            name: "🦋 SOL ENGINE [SLOWBURN]",
            desc: "พรีเซตหลักที่แนะนำ โฟกัสเนื้อเรื่องและตัวละคร ตัวละครไม่มุ่งเกินไป และมีมิติมากขึ้น",
            fileKey: "engine_sol_v6",
            promptId: "catta_core",
            addonKey: "SOL_V6",
            allowedTiers: ['VIP', 'VVIP', 'ADMIN']
        },
        "NOVEL": {
            name: "📖 SOL ENGINE [NOVEL]",
            desc: "พรีเซตสำหรับการบรรยายแบบ Novel! เก็บทุกรายละเอียด มีมิติและมุมมองกว้าง",
            fileKey: "engine_sol_v13",
            promptId: "catta_core",
            addonKey: "SOL_V13",
            allowedTiers: ['VIP', 'VVIP', 'ADMIN']
        },
        "EPIC": {
            name: "👑 SOL ENGINE [EPIC]",
            desc: "พรีเซตที่เพราะสำหรับการบรรยายโลกอย่างยิ่งใหญ่ เปี่ยมไปด้วยพลังและมุมมองที่กว้างขึ้น",
            fileKey: "engine_sol_v12",
            promptId: "catta_core",
            addonKey: "SOL_V12",
            allowedTiers: ['VIP', 'VVIP', 'ADMIN']
        },
        "FOCUS_STORY": {
            name: "📝 SOL ENGINE [STORY]",
            desc: "พรีเซตหลักที่แนะนำ โฟกัสเนื้อเรื่องและตัวละคร ตัวละครไม่มุ่งเกินไป",
            fileKey: "engine_sol_v4",
            promptId: "catta_core",
            addonKey: "SOL_V4",
            allowedTiers: ['VIP', 'VVIP', 'ADMIN']
        },
        "PROXY": {
            name: "🦄 SOL ENGINE [PROXY]",
            desc: "พรีเซตหลักที่แนะนำ โฟกัสเนื้อเรื่องและตัวละคร ตัวละครไม่มุ่งเกินไป สำหรับผู้ใช้งาน Proxy เท่านั้น",
            fileKey: "engine_sol_v5",
            promptId: "catta_core",
            addonKey: "SOL_V5",
            allowedTiers: ['VIP', 'VVIP', 'ADMIN']
        },
        "NON_STYLE": {
            name: "🥩 SOL ENGINE [NON STYLE]",
            desc: "พรีเซตที่ไม่มีสไตล์การบรรยายเป็นของตัวเอง เหมาะกับการปรับแต่งเองได้ หรือปล่อยให้อิงตามธีมของตัวละคร",
            fileKey: "engine_sol_v11",
            promptId: "catta_core",
            addonKey: "SOL_V11",
            allowedTiers: ['VIP', 'VVIP', 'ADMIN']
        },
        "ORIGINAL": {
            name: "🌐 SOL ENGINE [ORIGINAL]",
            desc: "พรีเซตที่เบาที่สุด เหมาะกับโมเดลรุ่นเล็ก ประหยัดโทเค้นขั้นสุด แต่ยังคงประสิทธิภาพเท่าพรีเซตอื่น ๆ",
            fileKey: "engine_sol_v8",
            promptId: "catta_core",
            addonKey: "SOL_V8",
            allowedTiers: ['VIP', 'VVIP', 'ADMIN']
        },
        "PROXY_V1": {
            name: "🐣 SOL ENGINE",
            desc: "พรีเซตมาตรฐานสำหรับการใช้งานทั่วไป เน้นการเล่าเรื่องที่ลื่นไหล ภาษาที่สวยงาม และรักษาบุคลิกตัวละคร",
            fileKey: "engine_sol_v3",
            promptId: "catta_core",
            addonKey: "SOL_V3",
            allowedTiers: ['STANDARD', 'VIP', 'VVIP', 'ADMIN', 'CHEF']
        }
    };


    function applyCattaShield() {
        if (window.fetch && window.fetch.isCattaPresetShield) return;

        const originalSTFetch = window.fetch;

        window.fetch = async function (input, init) {
            let isChatReq = false;
            let urlStr = (typeof input === 'string') ? input : (input.url || '');

            if (urlStr.includes('chat/completions') || urlStr.includes('generate') || urlStr.includes('models/') || urlStr.includes('messages')) {
                isChatReq = true;
            }

            if (isChatReq && init && init.method === 'POST' && init.body) {
                try {
                    let body = JSON.parse(init.body);
                    let activeEngineKey = localStorage.getItem('catta_active_engine') || "NONE";

                    const processOutgoingText = async (text) => {
                        if (typeof text !== 'string') return text;
                        let newText = text;

                        newText = newText.replace(/\n\n<!--CattaHub System: Recorded-->/g, '')
                            .replace(/<!--CattaHub System: Recorded-->/g, '')
                            .replace(/\n<!-- CATTA_SID:.*? -->/g, '')
                            .replace(/<!-- CATTA_SID:.*? -->/g, '');

                        let engineData = ENGINES[activeEngineKey];
                        let targetAddonDb = engineData ? engineData.addonKey : activeEngineKey; // ดึงชื่อกล่อง Addon ที่เชื่อมไว้

                        if (activeEngineKey !== "NONE" && window.CattaAddonDB && window.CattaAddonDB[targetAddonDb]) {
                            const addons = window.CattaAddonDB[targetAddonDb];

                            for (const addon of addons) {
                                let cleanNewText = newText.replace(/\uFE0F/g, '');
                                let cleanTag = addon.dummyTag.replace(/\uFE0F/g, '');

                                if (cleanNewText.includes(cleanTag)) {
                                    let realPrompt = cachedPrompts[addon.fileKey];
                                    if (!realPrompt) {
                                        realPrompt = await fetchPromptText(addon.fileKey);
                                    }

                                    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                    const tagPattern = escapeRegExp(addon.dummyTag).replace(/\\ufe0f/gi, '\\uFE0F?');
                                    const replaceRegex = new RegExp(tagPattern, 'g');

                                    if (realPrompt) {
                                        newText = newText.replace(replaceRegex, "\n" + realPrompt + "\n");
                                    } else {
                                        newText = newText.replace(replaceRegex, "");
                                    }
                                }
                            }
                        }
                        return newText;
                    };

                    if (body.messages && Array.isArray(body.messages)) {
                        for (let i = 0; i < body.messages.length; i++) {
                            let msg = body.messages[i];
                            if (typeof msg.content === 'string') {
                                msg.content = await processOutgoingText(msg.content);
                            } else if (Array.isArray(msg.content)) {
                                for (let j = 0; j < msg.content.length; j++) {
                                    if (msg.content[j].type === 'text') {
                                        msg.content[j].text = await processOutgoingText(msg.content[j].text);
                                    }
                                }
                            }
                        }
                    } else if (typeof body.prompt === 'string') {
                        body.prompt = await processOutgoingText(body.prompt);
                    } else if (body.contents && Array.isArray(body.contents)) {
                        for (let i = 0; i < body.contents.length; i++) {
                            let content = body.contents[i];
                            if (content.parts && Array.isArray(content.parts)) {
                                for (let j = 0; j < content.parts.length; j++) {
                                    if (typeof content.parts[j].text === 'string') {
                                        content.parts[j].text = await processOutgoingText(content.parts[j].text);
                                    }
                                }
                            }
                        }
                        if (body.system_instruction && body.system_instruction.parts) {
                            for (let j = 0; j < body.system_instruction.parts.length; j++) {
                                if (typeof body.system_instruction.parts[j].text === 'string') {
                                    body.system_instruction.parts[j].text = await processOutgoingText(body.system_instruction.parts[j].text);
                                }
                            }
                        }
                    }

                    init.body = JSON.stringify(body);
                } catch (e) { console.error("Catta Shield (Outgoing) Error:", e); }
            }

            const response = await originalSTFetch(input, init);

            if (isChatReq) {
                const contentType = response.headers?.get("content-type");

                if (contentType && contentType.includes("application/json") && !contentType.includes("text/event-stream")) {
                    try {
                        const clone = response.clone();
                        const data = await clone.json();
                        let modified = false;

                        const deduplicateSpam = (text) => {
                            if (!text) return text;
                            const tag1 = "<!--CattaHub System: Recorded-->";
                            const count1 = (text.match(new RegExp(tag1, "g")) || []).length;
                            const sidMatches = [...text.matchAll(/<!-- CATTA_SID:(.*?) -->/g)];

                            if (count1 > 1 || sidMatches.length > 1) {
                                const finalSid = sidMatches.length > 0 ? sidMatches[sidMatches.length - 1][1] : null;
                                let clean = text
                                    .replace(/\n\n<!--CattaHub System: Recorded-->/g, '')
                                    .replace(/<!--CattaHub System: Recorded-->/g, '')
                                    .replace(/\n<!-- CATTA_SID:.*? -->/g, '')
                                    .replace(/<!-- CATTA_SID:.*? -->/g, '')
                                    .trim();
                                if (finalSid) clean += `\n\n${tag1}\n<!-- CATTA_SID:${finalSid} -->`;
                                return clean;
                            }
                            return text;
                        };

                        if (data.choices?.[0]?.message) {
                            const oldText = data.choices[0].message.content || "";
                            const newText = deduplicateSpam(oldText);
                            if (oldText !== newText) {
                                data.choices[0].message.content = newText;
                                modified = true;
                            }
                        } else if (data.results?.[0]) {
                            const oldText = data.results[0].text || "";
                            const newText = deduplicateSpam(oldText);
                            if (oldText !== newText) {
                                data.results[0].text = newText;
                                modified = true;
                            }
                        } else if (data.candidates?.[0]?.content?.parts?.[0]) {
                            const oldText = data.candidates[0].content.parts[0].text || "";
                            const newText = deduplicateSpam(oldText);
                            if (oldText !== newText) {
                                data.candidates[0].content.parts[0].text = newText;
                                modified = true;
                            }
                        }

                        if (modified) {
                            return new Response(JSON.stringify(data), {
                                status: response.status,
                                statusText: response.statusText,
                                headers: response.headers
                            });
                        }
                    } catch (e) { console.error("Catta Shield Error:", e); }
                }
            }
            return response;
        };

        window.fetch.isCattaPresetShield = true;
        console.log("🛡️ Catta Preset Shield & Async Replacer: Active (Linked with Core)");
    }

    async function fetchPromptText(key) {
        if (!key) return "";
        if (cachedPrompts[key]) return cachedPrompts[key];
        try {
            const uid = localStorage.getItem('catta_uid');
            const token = localStorage.getItem('catta_auth_token');
            if (!uid || !token) return "";
            const res = await fetch(`${API_URL}?name=${key}`, { headers: { 'x-uid': uid, 'x-token': token } });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            // ✅ Server ส่ง JSON { code, signature } กลับมาเสมอ (ทั้ง JS และ txt prompt)
            // ต้อง parse JSON ก่อน แล้วดึงแค่ .code field
            let content = "";
            try {
                const json = await res.json();
                content = json.code || "";
            } catch (parseErr) {
                // Fallback: ถ้า server เก่าส่ง plain text มา ก็รับไปตรงๆ
                content = await res.text();
            }

            if (content && content.trim() !== "") {
                cachedPrompts[key] = content.trim();
                return cachedPrompts[key];
            } else { return ""; }
        } catch (e) { return ""; }
    }

    function injectUI() {
        const $ = window.jQuery;
        if (!$) return;
        if ($('#catta_preset_ui_box').length > 0) return;
        const $target = $('#extensions_settings');
        if ($target.length === 0) return;

        let userTier = window.CattaUserTier || "STANDARD";
        let activeEngine = localStorage.getItem('catta_active_engine') || "NONE";

        if (activeEngine !== "NONE" && ENGINES[activeEngine]) {
            const uTiers = userTier.split(',');
            const isAllowed = uTiers.some(t => ENGINES[activeEngine].allowedTiers.includes(t));
            if (!isAllowed) {
                activeEngine = "NONE";
                localStorage.setItem('catta_active_engine', 'NONE');
                if (window.CattaPromptInject) window.CattaPromptInject("catta_core", "", false);
            }
        }

        let html = `
        <div id="catta_preset_ui_box" class="inline-drawer" style="margin-top: 10px;">
            <div class="inline-drawer-header catta-preset-header" style="user-select: none; border-left: 5px solid #FF007F; background: rgba(255, 0, 127, 0.1); cursor: pointer; display: flex; justify-content: space-between; padding:8px;">
                <b>🧠 Catta AI Core (พรีเซตเจลเบรล)</b>
                <div class="icon fa-solid fa-circle-chevron-down"></div>
            </div>
            <div class="inline-drawer-content" style="display:none; padding:15px; border: 1px solid #FF007F; border-top: none;">
                
                <div style="margin-bottom:10px; padding: 5px; background: rgba(0,0,0,0.2); border-radius: 5px; font-size: 0.85em; color: #AAA;">
                    👤 สถานะบัญชีของคุณ: <strong style="color: #00f0ff;">${userTier}</strong>
                </div>

                <label style="font-weight: bold; color: #FF007F; display:block; margin-bottom:5px;">
                    <i class="fa-solid fa-microchip"></i> เลือกสมองหลัก (Core Engine)
                </label>
                <select id="catta_engine_selector" class="text_pole" style="width: 100%; cursor: pointer;">
                    <option value="NONE" ${activeEngine === "NONE" ? 'selected' : ''}>-- ไม่เลือกพรีเซต --</option>
        `;

        Object.keys(ENGINES).forEach(key => {
            const uTiers = userTier.split(',');
            const isAllowed = uTiers.some(t => ENGINES[key].allowedTiers.includes(t));
            if (isAllowed) {
                let isSelected = (activeEngine === key) ? 'selected' : '';
                html += `<option value="${key}" ${isSelected}>${ENGINES[key].name}</option>`;
            }
        });

        html += `
                </select>

                <div id="catta_engine_desc" style="margin-top:12px; padding: 10px; font-size: 0.85em; color: #ddd; background: rgba(0,0,0,0.3); border-left: 3px solid #00f0ff; border-radius: 4px; line-height: 1.4;">
                    ${(activeEngine !== "NONE" && ENGINES[activeEngine]) ? ENGINES[activeEngine].desc : "💡 <b>คำแนะนำ:</b> โปรดเลือกพรีเซตสมองหลักที่ต้องการใช้งาน เพื่อเปิดระบบ Catta AI Core นะฮะ"}
                </div>

            </div>
        </div>`;

        $target.prepend(html);
        $(document).off('click', '.catta-preset-header').on('click', '.catta-preset-header', function () { $(this).next().slideToggle(); });

        $(document).off('change', '#catta_engine_selector').on('change', '#catta_engine_selector', function () {
            const val = $(this).val();
            localStorage.setItem('catta_active_engine', val);

            const descBox = $('#catta_engine_desc');
            if (val === "NONE") {
                descBox.html("💡 <b>คำแนะนำ:</b> โปรดเลือกพรีเซตสมองหลักที่ต้องการใช้งาน เพื่อเปิดระบบ Catta AI Core นะฮะ");
                descBox.css("border-left-color", "#00f0ff");
            } else if (ENGINES[val]) {
                descBox.html("✨ " + ENGINES[val].desc);
                if (val === "SOL_V1") descBox.css("border-left-color", "#4CAF50");
                else if (val === "NSFW_V1") descBox.css("border-left-color", "#F44336");
                else if (val === "PROXY_V1") descBox.css("border-left-color", "#9C27B0");
            }

            if (window.toastr) {
                const msg = val === "NONE" ? "ปิดการใช้งานพรีเซตแล้ว" : `บันทึกและสลับสมองเป็น: ${ENGINES[val].name}`;
                window.toastr.success(msg);
            }
            forceInjectPrompt();
        });
    }

    function getActivePromptData() {
        let extractedText = "";
        if (window.power_user && Array.isArray(window.power_user.prompts)) {
            let charId = undefined;
            if (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) charId = SillyTavern.getContext().characterId;
            let activeOrder = null;
            if (Array.isArray(window.power_user.prompt_order)) {
                activeOrder = window.power_user.prompt_order.find(o => o.character_id === charId);
                if (!activeOrder) activeOrder = window.power_user.prompt_order.find(o => !o.character_id) || window.power_user.prompt_order[0];
            }
            window.power_user.prompts.forEach(prompt => {
                let isEnabled = prompt.enabled !== false;
                if (activeOrder && Array.isArray(activeOrder.order)) {
                    const orderItem = activeOrder.order.find(o => o.identifier === prompt.identifier);
                    if (orderItem !== undefined) isEnabled = orderItem.enabled;
                }
                if (isEnabled && prompt.content) extractedText += prompt.content + " ";
            });
        }

        document.querySelectorAll('textarea').forEach(el => {
            const block = el.closest('.sortable-item, .prompt-block, .list-group-item, .item');
            if (block) {
                const checkbox = block.querySelector('input[type="checkbox"]');
                if (checkbox && !checkbox.checked) return;
            }
            extractedText += (el.value || el.innerText || "") + " ";
        });
        return extractedText;
    }

    function forceInjectPrompt() {
        lastScannedData = "";
        if (!isSyncing) syncPrompts();
    }

    async function syncPrompts() {
        if (!window.CattaPromptInject || isSyncing) return;
        isSyncing = true;

        try {
            let activeEngineKey = localStorage.getItem('catta_active_engine') || "NONE";
            const selector = document.getElementById('catta_engine_selector');
            if (selector && selector.value !== activeEngineKey) selector.value = activeEngineKey;

            let activeData = getActivePromptData();

            const currentTotalState = activeEngineKey + activeData;
            if (currentTotalState === lastScannedData) { isSyncing = false; return; }
            lastScannedData = currentTotalState;

            if (activeEngineKey === "NONE") {
                window.CattaPromptInject("catta_core", "", false);
            } else {
                let engineData = ENGINES[activeEngineKey];
                if (engineData) {
                    let corePrompt = await fetchPromptText(engineData.fileKey);

                    if (corePrompt && corePrompt.trim() !== "") {
                        window.CattaPromptInject(engineData.promptId, corePrompt, true);
                    } else {

                        window.CattaPromptInject(engineData.promptId, "", false);
                        localStorage.setItem('catta_active_engine', 'NONE');
                        activeEngineKey = "NONE";
                        if (selector) selector.value = 'NONE';

                        if (window.toastr) {
                            window.toastr.warning("❌😿 การเชื่อมต่อพรีเซตล้มเหลวฮะ!! นายท่านโปรดเข้าไปตั้งค่าพรีเซตใหม่อีกครั้งนะครับฮะ", "Catta System");
                        }
                    }
                }
            }

            let addonsToCheck = [];
            let engineData = ENGINES[activeEngineKey];
            let targetAddonDb = engineData ? engineData.addonKey : activeEngineKey;

            if (activeEngineKey !== "NONE" && window.CattaAddonDB && window.CattaAddonDB[targetAddonDb]) {
                addonsToCheck = window.CattaAddonDB[targetAddonDb];
            } else if (window.CattaAddonDB) {
                Object.keys(window.CattaAddonDB).forEach(key => addonsToCheck = addonsToCheck.concat(window.CattaAddonDB[key]));
            }

            for (const addon of addonsToCheck) {

                if (activeEngineKey !== "NONE" && activeData.replace(/\uFE0F/g, '').includes(addon.dummyTag.replace(/\uFE0F/g, ''))) {
                    let addonPrompt = await fetchPromptText(addon.fileKey);
                    if (addonPrompt) window.CattaPromptInject(addon.promptId, addonPrompt, true);
                } else {
                    window.CattaPromptInject(addon.promptId, "", false);
                }
            }

        } finally { isSyncing = false; }
    }

    document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && e.target.id === 'send_textarea') forceInjectPrompt(); });
    document.addEventListener('click', (e) => { if (e.target.closest('#send_but')) forceInjectPrompt(); });

    let initAttempts = 0;
    const bootInterval = setInterval(() => {
        if ((window.CattaPromptInject && document.getElementById('extensions_settings')) || initAttempts > 40) {
            clearInterval(bootInterval);

            injectUI();
            applyCattaShield();
            forceInjectPrompt();

            setTimeout(() => {
                if (window.toastr) {
                    if (previousEngine && previousEngine !== "NONE") {
                        window.toastr.warning(
                            "🔄 <b>พรีเซตถูกรีเซ็ต</b><br>ระบบตั้งเป็น 'ไม่เลือกพรีเซต' นะฮะ <br><b>นายท่านกรุณาเลือกพรีเซตใหม่อีกครั้ง</b>",
                            "Catta System", { timeOut: 8000, escapeHtml: false }
                        );
                    } else {
                        window.toastr.info(
                            "🟢😺 Catta Preset พร้อมทำงาน<br>สถานะปัจจุบัน: <b>ยังไม่เลือกพรีเซตฮะ</b>",
                            "Catta System", { timeOut: 4000, escapeHtml: false }
                        );
                    }
                }
            }, 1000);

            setInterval(() => {
                if (window.fetch && !window.fetch.isCattaPresetShield) {
                    applyCattaShield();
                }
            }, 1000);

            setInterval(syncPrompts, 5000);
        }
        initAttempts++;
    }, 500);

})();
