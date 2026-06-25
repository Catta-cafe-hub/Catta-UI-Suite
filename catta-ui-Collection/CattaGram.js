(function () {
    function registerIG() {
        if (!window.CattaUI) {
            setTimeout(registerIG, 500);
            return;
        }

        console.log("📱 Cattagram Suite: Initializing...");

        // =========================================================================
        // 1. CONNECTION CONFIG
        // =========================================================================

        const IG_VPS_URL = "https://st-cattacafe.casa/cattagram";

        // ฟังก์ชันหนีบข้อมูลเพื่อทำความสะอาดเล็กน้อยก่อนส่ง หรือเพื่อป้องกัน XSS จากผู้ใช้ตอนใส่ input
        const esc = (text) => {
            if (!text) return "";
            let clean = text.toString()
                .replace(/<\/?q>/gi, "")
                .replace(/&lt;\/?q&gt;/gi, "")
                .replace(/<think>[\s\S]*?<\/think>/gi, "")
                .trim();
            if (window.CattaUI && window.CattaUI.utils && window.CattaUI.utils.escapeHtml) {
                return window.CattaUI.utils.escapeHtml(clean);
            }
            return clean.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        };

        // =========================================================================
        // 2. ASYNC PROCESSOR (The "Thin" Brain)
        // =========================================================================
        async function processMessageText(text, uid, token) {

            const igTagRegex = /:::\s*\[CG_(POST|CARD|DM|GROUP|PROFILE|STORY|CALL)\][\s\S]*?:::/gi;
            if (!igTagRegex.test(text)) return text;

            try {
                const cleanUrl = IG_VPS_URL.replace(/\/+$/, '');


                const response = await fetch(`${cleanUrl}/api/parse_ig`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-uid': uid || 'guest',
                        'x-token': token || 'none'
                    },
                    body: JSON.stringify({ raw_text: text })
                });

                if (response.status === 401) {
                    return text.replace(igTagRegex, '<div style="color:#ff4444; border:1px solid #ff4444; padding:10px; border-radius:8px; margin:10px 0; background:rgba(255,0,0,0.1);">[Catta IG Error: Invalid or Expired Token. Please disconnect and re-login via the Catta UI Menu.]</div>');
                }

                if (!response.ok) throw new Error(`API returned ${response.status}`);

                const data = await response.json();


                if (data.success && data.html) {
                    return data.html;
                }


                return text;
            } catch (error) {
                console.error("CattaGram Extension Error:", error);
                return text.replace(igTagRegex, '<div style="color:#ff9900; border:1px dashed #ff9900; padding:10px; border-radius:8px; margin:10px 0;">[Catta IG API Error: เซิร์ฟเวอร์ IG ออฟไลน์ โปรดตรวจสอบ VPS]</div>');
            }
        }

        // =========================================================================
        // 3. UI INTERACTIONS (Sound, Lightbox, Buttons)
        // =========================================================================
        const SOUNDS = {
            incoming: "https://files.catbox.moe/q2iwzo.mp3",
            outgoing: "https://files.catbox.moe/q2iwzo.mp3",
            hangup: "https://files.catbox.moe/3gnbca.mp3"
        };
        window._igRingtone = null;

        function playSound(type) {
            if (type === 'incoming' || type === 'outgoing') {
                if (window._igRingtone) return;
                window._igRingtone = new Audio(type === 'incoming' ? SOUNDS.incoming : SOUNDS.outgoing);
                window._igRingtone.loop = true;
                window._igRingtone.volume = 0.5;
                window._igRingtone.play().catch(e => console.log("Audio Play Error:", e));
            } else if (type === 'hangup') {
                const s = new Audio(SOUNDS.hangup);
                s.volume = 0.5;
                s.play().catch(e => console.log("Audio Error:", e));
            }
        }

        function stopSound() {
            if (window._igRingtone) {
                window._igRingtone.pause();
                window._igRingtone.currentTime = 0;
                window._igRingtone = null;
            }
        }

        // --- Lightbox ---
        window.expandIGImage = function (src) {
            if (document.getElementById('catta-lightbox')) return;
            const box = document.createElement('div');
            box.id = 'catta-lightbox';
            box.style.cssText = `
                position: fixed !important; top: 0; left: 0; right: 0; bottom: 0;
                width: 100vw; height: 100vh; z-index: 999999;
                background: rgba(0, 0, 0, 0.95); backdrop-filter: blur(5px);
                display: flex; align-items: center; justify-content: center;
                cursor: zoom-out; animation: cattaFadeIn 0.2s;
            `;
            const img = document.createElement('img');
            img.src = src;
            img.style.cssText = `
                max-width: 95vw; max-height: 95vh; 
                object-fit: contain; border-radius: 4px;
                box-shadow: 0 0 20px rgba(0,0,0,0.5);
                transform: scale(0.9); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            `;
            setTimeout(() => img.style.transform = 'scale(1)', 10);
            box.onclick = () => {
                img.style.transform = 'scale(0.8)';
                box.style.opacity = '0';
                setTimeout(() => box.remove(), 200);
            };
            box.appendChild(img);
            document.body.appendChild(box);
        };

        // --- Highlights ---
        window.openIGHighlight = function (url) {
            let overlay = document.getElementById('ig-highlight-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'ig-highlight-overlay';
                overlay.className = 'ig-highlight-overlay';
                overlay.onclick = function () { this.style.display = 'none'; };
                overlay.innerHTML = '<div class="ig-highlight-content"><img id="ig-highlight-img" src=""></div>';
                document.body.appendChild(overlay);
            }
            const img = document.getElementById('ig-highlight-img');
            img.src = url;
            overlay.style.display = 'flex';
        };

        // --- Like Buttons ---
        if (window._igLikeHandler) document.removeEventListener('click', window._igLikeHandler);
        window._igLikeHandler = function (e) {
            const likeBtn = e.target.closest('.ig-like-wrapper');
            if (likeBtn) {
                e.preventDefault(); e.stopPropagation();
                likeBtn.classList.toggle('is-liked');
                return;
            }
            const storyLike = e.target.closest('.ig-story-like-btn');
            if (storyLike) {
                e.preventDefault(); e.stopImmediatePropagation();
                storyLike.classList.toggle('active');
                if (storyLike.classList.contains('active')) {
                    storyLike.style.transform = "scale(1.3)";
                    setTimeout(() => storyLike.style.transform = "scale(1)", 200);
                }
            }
        };
        document.addEventListener('click', window._igLikeHandler);

        // --- Send Messages ---
        function triggerSTMessage(msg) {
            if (!msg) return;
            if (window.CattaUI && window.CattaUI.utils && window.CattaUI.utils.sendMessage) {
                window.CattaUI.utils.sendMessage(msg);
                return;
            }
            const ta = document.getElementById('send_textarea');
            const btn = document.getElementById('send_but');
            if (ta && btn) {
                ta.value = msg;
                ta.dispatchEvent(new Event('input', { bubbles: true }));
                setTimeout(() => { btn.click(); }, 100);
            }
        }

        if (window._igSendClick) document.removeEventListener('click', window._igSendClick);
        if (window._igEnterKey) document.removeEventListener('keypress', window._igEnterKey);

        window._igSendClick = function (e) {
            const sendBtn = e.target.closest('.ig-dm-send-btn');
            if (sendBtn) {
                e.preventDefault(); e.stopPropagation();
                const wrapper = sendBtn.closest('.ig-dm-footer');
                const input = wrapper.querySelector('.ig-dm-input');
                if (input && input.value.trim() !== "") {
                    const isGroup = wrapper.closest('.ig-dm-box') && wrapper.closest('.ig-dm-box').innerHTML.includes('Group');
                    const prefix = isGroup ? "(Chat Group): " : "(DM): ";
                    triggerSTMessage(prefix + input.value.trim());
                    input.value = "";
                }
                return;
            }
            const storySend = e.target.closest('.ig-story-send-icon');
            if (storySend) {
                e.preventDefault(); e.stopImmediatePropagation();
                const wrapper = storySend.closest('.ig-story-footer');
                const input = wrapper.querySelector('.ig-story-input');
                if (input && input.value.trim() !== "") {
                    triggerSTMessage(`Replied to story: ${input.value.trim()}`);
                    input.value = "";
                }
            }
        };

        window._igEnterKey = function (e) {
            if (e.target.classList.contains('ig-dm-input') && e.key === 'Enter') {
                e.preventDefault();
                const msg = e.target.value.trim();
                if (msg !== "") {
                    const isGroup = e.target.closest('.ig-dm-box') && e.target.closest('.ig-dm-box').innerHTML.includes('Group');
                    const prefix = isGroup ? "(Chat Group): " : "(DM): ";
                    triggerSTMessage(prefix + msg);
                    e.target.value = "";
                }
            }
            if (e.target.classList.contains('ig-story-input') && e.key === 'Enter') {
                e.preventDefault(); e.stopImmediatePropagation();
                const msg = e.target.value.trim();
                if (msg !== "") {
                    triggerSTMessage(`Replied to story: ${msg}`);
                    e.target.value = "";
                }
            }
        };

        document.addEventListener('click', window._igSendClick);
        document.addEventListener('keypress', window._igEnterKey);

        // =========================================================================
        // 3.5 SMART TRIGGER SYSTEM (เหมือน CattaPresetSys)
        // อ่าน 4 ข้อความล่าสุด + hook: Enter, Send, Regen, Swipe-right
        // =========================================================================

        /**
         * อ่านข้อความจาก N ข้อความล่าสุดในแชท (ทั้ง user และ AI)
         * เพื่อตรวจ keyword และ inject prompt ได้แม้ user ไม่ได้พิมพ์ keyword ใน input
         */
        function getLastNChatText(n) {
            const chat = document.getElementById('chat');
            if (!chat) return '';
            const msgs = chat.querySelectorAll('.mes');
            const start = Math.max(0, msgs.length - n);
            let text = '';
            for (let i = start; i < msgs.length; i++) {
                const el = msgs[i].querySelector('.mes_text');
                if (el) text += ' ' + (el.innerText || el.textContent || '');
            }
            return text;
        }

        /**
         * บังคับ re-evaluate keyword trigger สำหรับ module "insta"
         * รวมข้อความที่กำลังพิมพ์ + 4 ข้อความล่าสุดในแชท
         */
        function forceInjectIG() {
            if (!window.CattaUI || !window.CattaUI.scanAndInjectPrompts) return;
            const currentInput = (document.getElementById('send_textarea') || {}).value || '';
            const chatHistory = getLastNChatText(4);
            window.CattaUI.scanAndInjectPrompts(currentInput + ' ' + chatHistory);
        }

        // Hook 1: กด Enter ใน send_textarea
        if (window._igPromptEnterKey) document.removeEventListener('keydown', window._igPromptEnterKey);
        window._igPromptEnterKey = function (e) {
            if (e.key === 'Enter' && !e.shiftKey && e.target.id === 'send_textarea') {
                forceInjectIG();
            }
        };
        document.addEventListener('keydown', window._igPromptEnterKey);

        // Hook 2: กดปุ่ม Send (#send_but)
        if (window._igPromptSendClick) document.removeEventListener('click', window._igPromptSendClick);
        window._igPromptSendClick = function (e) {
            if (e.target.closest('#send_but')) {
                forceInjectIG();
            }
        };
        document.addEventListener('click', window._igPromptSendClick);

        // Hook 3: กด Regenerate / Swipe Right (ปุ่ม Re-generate ข้อความ AI)
        // SillyTavern ใช้ class .swipe_right, #option_regenerate, .fa-rotate-right
        if (window._igPromptRegenClick) document.removeEventListener('click', window._igPromptRegenClick);
        window._igPromptRegenClick = function (e) {
            const regenBtn = e.target.closest(
                '.swipe_right, #option_regenerate, .mes_edit_done, ' +
                '[data-i18n="Regenerate"], .fa-arrows-rotate, .fa-rotate-right'
            );
            if (regenBtn) {
                // delay เล็กน้อยให้ DOM/state update ก่อน
                setTimeout(forceInjectIG, 50);
            }
        };
        document.addEventListener('click', window._igPromptRegenClick);

        // Hook 4: MutationObserver จับ swipe ขวาในแชท
        // เมื่อ .swipe_right ถูกกด ST จะเปลี่ยน data-msgid หรือเพิ่ม/ลบ .mes — จับตรงนั้น
        (function setupSwipeObserver() {
            const chat = document.getElementById('chat');
            if (!chat) {
                // ถ้า chat ยังไม่พร้อม ให้ retry
                setTimeout(setupSwipeObserver, 500);
                return;
            }
            if (window._igSwipeObserver) window._igSwipeObserver.disconnect();
            window._igSwipeObserver = new MutationObserver((mutations) => {
                for (const mut of mutations) {
                    // จับการเปลี่ยน attribute 'data-swipe-id' หรือ class บน .mes
                    if (mut.type === 'attributes' && (mut.attributeName === 'data-swipe-id' || mut.attributeName === 'data-mesid')) {
                        forceInjectIG();
                        break;
                    }
                }
            });
            window._igSwipeObserver.observe(chat, {
                subtree: true,
                attributes: true,
                attributeFilter: ['data-swipe-id', 'data-mesid', 'swipeid']
            });
        })();

        // --- Theme Engine ---
        function autoDetectTheme() {
            const bodyBg = window.getComputedStyle(document.body).backgroundColor;
            const rgb = bodyBg.match(/\d+/g);
            let isDark = true;
            if (rgb && rgb.length >= 3) {
                const brightness = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000);
                isDark = brightness < 128;
            }
            const r = document.documentElement;
            if (isDark) {
                r.style.setProperty('--catta-ig-bg', '#000000');
                r.style.setProperty('--catta-ig-text', '#f5f5f5');
                r.style.setProperty('--catta-ig-subtext', '#a8a8a8');
                r.style.setProperty('--catta-ig-border', '#262626');
                r.style.setProperty('--catta-ig-hover', '#1a1a1a');
                r.style.setProperty('--catta-ig-dm-sent', '#000000');
                r.style.setProperty('--catta-ig-dm-rec', '#262626');
                r.style.setProperty('--catta-ig-icon', '#dbdbdb');
            } else {
                r.style.setProperty('--catta-ig-bg', '#ffffff');
                r.style.setProperty('--catta-ig-text', '#262626');
                r.style.setProperty('--catta-ig-subtext', '#8e8e8e');
                r.style.setProperty('--catta-ig-border', '#dbdbdb');
                r.style.setProperty('--catta-ig-hover', '#fafafa');
                r.style.setProperty('--catta-ig-dm-sent', '#ffffff');
                r.style.setProperty('--catta-ig-dm-rec', '#efefef');
                r.style.setProperty('--catta-ig-icon', '#8e8e8e');
            }
        }
        setInterval(autoDetectTheme, 2000);
        autoDetectTheme();

        // =========================================================================
        // 4. CALL ENGINE (UI)
        // =========================================================================
        window._igCallInterval = null;
        window._igChatObserver = null;

        function getLastMessageContent() {
            const chat = document.getElementById('chat');
            if (!chat) return "No content.";
            const msgs = chat.querySelectorAll('.mes_text');
            if (msgs.length === 0) return "No content.";

            const lastMsg = msgs[msgs.length - 1];
            let content = lastMsg.innerHTML;

            content = content.replace(/<think>[\s\S]*?<\/think>/gi, "");
            content = content.replace(/&lt;think&gt;[\s\S]*?&lt;\/think&gt;/gi, "");
            content = content.replace(/<div class="ig-call-incoming-tag"[\s\S]*?<\/div>/gi, "");
            content = content.replace(/:::\s*\[.*?\][\s\S]*?:::/g, "");
            content = content.replace(/<br\s*\/?>/gi, '\n');
            content = content.replace(/&nbsp;/g, ' ');
            content = content.replace(/“+/g, '');
            content = content.replace(/”+/g, '');

            return content.trim();
        }

        window.launchIGCallUI = function (mode, data) {
            if (mode === 'incoming') playSound('incoming');
            if (mode === 'outgoing') playSound('outgoing');

            const existingOverlay = document.getElementById('ig-call-overlay');
            if (existingOverlay) {
                const readerContent = document.getElementById('ig-call-read-content');
                if (readerContent) readerContent.innerHTML = getLastMessageContent();
                return;
            }

            const { name, pfp, type, upl } = data;

            const overlay = document.createElement('div');
            overlay.id = 'ig-call-overlay';
            overlay.className = `ig-call-overlay ${mode}`;

            let mediaBg = `<img src="${pfp}" class="ig-call-bg" id="ig-call-bg-img">`;
            if (type === 'video' && upl && upl.match(/\.(mp4|webm|mov)(\?|$)/i)) {
                mediaBg = `<video src="${upl}" class="ig-call-bg" id="ig-call-bg-video" loop muted playsinline style="display:none;"></video>
                       <img src="${pfp}" class="ig-call-bg" id="ig-call-bg-placeholder">`;
            } else if (upl) {
                mediaBg = `<img src="${upl}" class="ig-call-bg" id="ig-call-bg-img" style="opacity:0.3; filter:blur(30px);">`;
            }

            let initialContent = getLastMessageContent();

            overlay.innerHTML = `
            ${mediaBg}
            <div id="ig-call-reader" class="ig-call-reader">
                <div class="ig-reader-head">
                    <span>📖 Script / Dialogue</span>
                    <div class="catta-clickable" data-action="close-reader" style="cursor:pointer;">✕</div>
                </div>
                <div id="ig-call-read-content" class="ig-reader-body">${initialContent}</div>
            </div>
            <div class="ig-call-info">
                <div class="ig-call-pfp-wrapper">
                    <div class="ig-call-pulse"></div>
                    <img src="${pfp}" class="ig-call-pfp">
                </div>
                <div class="ig-call-name">${name}</div>
                <div class="ig-call-status" id="ig-call-status-text">${mode === 'incoming' ? 'Incoming ' + type + ' call...' : 'Calling...'}</div>
                <div class="ig-call-timer" id="ig-call-timer">00:00</div>
            </div>
            <div id="ig-call-reply-box" class="ig-call-reply-box">
                <input type="text" id="ig-call-input" placeholder="Type to speak..." autocomplete="off">
                <button id="ig-call-send-btn">➤</button>
            </div>
            <div class="ig-call-actions">
                <div class="ig-call-btn-small catta-clickable" data-action="toggle-reader">📖</div>
                <div class="ig-call-btn accept catta-clickable" data-action="accept-call" data-call-type="${type}"><i class="fa-solid fa-phone"></i></div>
                <div class="ig-call-btn decline catta-clickable" data-action="end-call" data-mode="${mode}" data-call-type="${type}"><i class="fa-solid fa-phone" style="transform: rotate(135deg);"></i></div>
                <div class="ig-call-btn-small catta-clickable" data-action="toggle-reply-box">💬</div>
            </div>
        `;
            document.body.appendChild(overlay);

            setTimeout(() => {
                const sendBtn = document.getElementById('ig-call-send-btn');
                const input = document.getElementById('ig-call-input');

                const sendFunc = () => {
                    const txt = input.value.trim();
                    if (txt) {
                        triggerSTMessage(txt);
                        const reader = document.getElementById('ig-call-read-content');
                        if (reader) reader.innerHTML = `<span style="opacity:0.7; font-size:0.9em;">(🔊{{user}}):</span> ${esc(txt)}`;
                        input.value = "";
                        document.getElementById('ig-call-reply-box').classList.remove('active');
                    }
                };

                if (sendBtn) sendBtn.onclick = sendFunc;
                if (input) input.onkeypress = (e) => { if (e.key === 'Enter') sendFunc(); };
            }, 100);

            const initialMsgCount = document.querySelectorAll('.mes').length;

            if (window._igChatObserver) window._igChatObserver.disconnect();
            const chatEl = document.getElementById('chat');

            if (chatEl) {
                window._igChatObserver = new MutationObserver(() => {
                    const overlay = document.getElementById('ig-call-overlay');
                    if (!overlay) {
                        if (window._igChatObserver) window._igChatObserver.disconnect();
                        return;
                    }

                    const lastMsgContent = getLastMessageContent();
                    const reader = document.getElementById('ig-call-read-content');

                    if (reader && lastMsgContent && lastMsgContent !== "No content." && !lastMsgContent.includes('ig-call-incoming-tag')) {
                        reader.innerHTML = lastMsgContent;
                    }

                    if (document.querySelector('.mes_text.streaming')) return;

                    if (overlay.classList.contains('outgoing') && !overlay.classList.contains('connected')) {
                        const allMes = document.querySelectorAll('.mes');
                        const currentMsgCount = allMes.length;
                        const lastMes = allMes[allMes.length - 1];

                        const isMyPrompt = lastMsgContent.includes('Calling Video Call') || lastMsgContent.includes('Calling Voice Call');

                        if (lastMes && !lastMes.classList.contains('is_user') && !isMyPrompt && currentMsgCount > initialMsgCount) {
                            stopSound();
                            const hangUpKeywords = ['declined call', 'reject call', 'busy signal', 'missed call', 'สายไม่ว่าง', 'ปฏิเสธสาย'];
                            const isHangUp = hangUpKeywords.some(kw => lastMsgContent.toLowerCase().includes(kw));

                            if (isHangUp) {
                                console.log("Cattagram: Bot declined the call.");
                                setTimeout(() => window.endIGCall(true, 'outgoing', overlay.getAttribute('data-call-type') || 'voice'), 500);
                            } else {
                                console.log("Cattagram: Bot answered. Connecting...");
                                window.acceptIGCall(overlay.getAttribute('data-call-type') || 'voice');
                            }
                        }
                    }
                });

                window._igChatObserver.observe(chatEl, {
                    childList: true, subtree: true, attributes: true, attributeFilter: ['class']
                });
            }

            if (mode === 'outgoing') {
                if (overlay) overlay.setAttribute('data-call-type', type);
            }
        };

        window.acceptIGCall = function (type) {
            stopSound();
            const overlay = document.getElementById('ig-call-overlay');
            if (!overlay) return;

            overlay.classList.add('connected');
            const statusText = document.getElementById('ig-call-status-text');
            if (statusText) statusText.innerText = "Connected";

            const videoEl = document.getElementById('ig-call-bg-video');
            const imgEl = document.getElementById('ig-call-bg-img');
            const placeholder = document.getElementById('ig-call-bg-placeholder');

            if (videoEl) {
                if (placeholder) placeholder.style.display = 'none';
                videoEl.style.display = 'block';
                videoEl.play();
            } else if (imgEl) {
                imgEl.style.opacity = '1';
                imgEl.style.filter = 'blur(0)';
                imgEl.style.objectFit = 'cover';
                imgEl.style.background = '#000';
            }

            let sec = 0;
            const timerEl = document.getElementById('ig-call-timer');
            if (window._igCallInterval) clearInterval(window._igCallInterval);
            window._igCallInterval = setInterval(() => {
                sec++;
                let m = Math.floor(sec / 60).toString().padStart(2, '0');
                let s = (sec % 60).toString().padStart(2, '0');
                if (timerEl) timerEl.innerText = `${m}:${s}`;
            }, 1000);
        };

        window.endIGCall = function (manual, mode, type) {
            stopSound();
            playSound('hangup');

            const overlay = document.getElementById('ig-call-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
            }
            if (window._igCallTimer) clearTimeout(window._igCallTimer);
            if (window._igCallInterval) clearInterval(window._igCallInterval);
            if (window._igChatObserver) window._igChatObserver.disconnect();

            const fillInputOnly = (msg) => {
                const ta = document.getElementById('send_textarea');
                if (ta) {
                    // ถ้ามีข้อความเก่าอยู่ ให้ต่อท้าย หรือถ้าว่างให้ใส่เลย
                    ta.value = ta.value ? ta.value + '\\n' + msg : msg;
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                }
            };

            if (mode === 'outgoing') {
                if (!manual) fillInputOnly(`*(${type === 'video' ? '📹' : '📞'} Started a call but got no answer...)*`);
                else fillInputOnly(`*(📞 Call ended by {{user}})*`);
            } else if (mode === 'incoming') {
                if (manual) fillInputOnly(`*(📞 Call ended/declined)*`);
            }
        };

        window.startIGCall = function (el, type, userName, userPfp) {
            if (window.launchIGCallUI) {
                window.launchIGCallUI('outgoing', { name: userName, pfp: userPfp, type: type, upl: null });
            }
            const callIcon = type === 'video' ? '📹' : '📞';
            const callText = type === 'video' ? 'Video Call' : 'Voice Call';
            triggerSTMessage(`*(${callIcon} Calling ${callText} to ${userName}...)*`);
        };

        // =========================================================================
        // 5. CSS STYLES
        // =========================================================================
        const IG_CSS = `
            .ig-container { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--catta-ig-bg); border: 1px solid var(--catta-ig-border); border-radius: 8px; max-width: 400px; margin: 15px auto; color: var(--catta-ig-text); box-shadow: 0 1px 3px rgba(0,0,0,0.05); font-size: 14px; line-height: 1.4; }
            .ig-head { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 0.5px solid var(--catta-ig-border); }
            .ig-pfp { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid var(--catta-ig-border); margin-right: 10px; -webkit-mask-image: url('https://file.garden/aZx9zS2e7UEiSmfr/catta02.png'); -webkit-mask-size: cover; -webkit-mask-position: center; mask-image: url('https://file.garden/aZx9zS2e7UEiSmfr/catta02.png'); mask-size: cover; mask-position: center; border-radius: 0; border: none; }
            .ig-username { font-weight: 600; font-size: 13.5px; color: var(--catta-ig-text); text-decoration: none; }
            .ig-act { padding: 8px 12px 6px; display: flex; gap: 14px; align-items: center; }
            .ig-act svg { width: 24px; height: 24px; stroke-width: 1.8; color: var(--catta-ig-text); }
            .ig-like-wrapper { display: inline-flex; cursor: pointer; align-items: center; user-select: none; position: relative; z-index: 10; }
            .ig-like-wrapper svg { transition: 0.2s; fill: none; stroke: var(--catta-ig-text); pointer-events: none; }
            .ig-like-wrapper.is-liked svg { fill: #ed4956; stroke: #ed4956; animation: igBounce 0.4s; }
            @keyframes igBounce { 0%{transform:scale(1);} 50%{transform:scale(1.2);} 100%{transform:scale(1);} }
            .ig-text-area { padding: 0 12px; margin-bottom: 6px; }
            .ig-likes { font-weight: 600; font-size: 13.5px; margin-bottom: 6px; display: block; }
            .ig-caption { font-size: 13.5px; margin-bottom: 4px; display: block; overflow-wrap: break-word; white-space: normal; }
            .ig-view-all { color: var(--catta-ig-subtext); font-size: 13px; margin-bottom: 4px; cursor: pointer; }
            .ig-scroll { max-height: 100px; overflow-y: auto; padding-right: 5px; scrollbar-width: thin; scrollbar-color: var(--catta-ig-border) transparent; white-space: normal; } 
            .ig-com-row { font-size: 13px; margin-bottom: 2px; line-height: 1.35; display: block; } 
            .ig-time { font-size: 10px; color: var(--catta-ig-subtext); text-transform: uppercase; margin-top: 6px; display: block; letter-spacing: 0.5px;}

            .ig-dm-box { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--catta-ig-bg); border: 1px solid var(--catta-ig-border); border-radius: 12px; max-width: 380px; margin: 15px auto; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); color: var(--catta-ig-text); }
            .ig-dm-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; border-bottom: 0.5px solid var(--catta-ig-border); background: var(--catta-ig-bg); }
            .ig-dm-head-left { display: flex; align-items: center; gap: 10px; }
            .ig-dm-body { padding: 15px; display: flex; flex-direction: column; gap: 10px; background: var(--catta-ig-bg); max-height: 400px; min-height: 300px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--catta-ig-border) transparent; scroll-behavior: smooth; }
            .ig-dm-bubble-wrapper { display: flex; flex-direction: column; max-width: 75%; opacity: 0; transform: translateY(15px); animation: igBubbleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            .ig-dm-bubble { padding: 10px 14px; border-radius: 20px; font-size: 14px; line-height: 1.4; word-wrap: break-word; }
            .wrapper-left { align-self: flex-start; }
            .wrapper-right { align-self: flex-end; }
            .ig-dm-left { background: var(--catta-ig-dm-rec); color: var(--catta-ig-text); border: 1px solid var(--catta-ig-border); border-bottom-left-radius: 4px; }
            .ig-dm-right { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color: #fff; border-bottom-right-radius: 4px; }
            .ig-dm-sender-name { font-size: 11px; color: var(--catta-ig-subtext); margin-bottom: 2px; margin-left: 10px; font-weight: 500; }
            .ig-dm-media { width: 100%; border-radius: 12px; margin-top: 5px; display: block; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            @keyframes igBubbleIn { to { opacity: 1; transform: translateY(0); } }

            .ig-dm-footer { display: flex; align-items: center; padding: 10px 12px; background: var(--catta-ig-bg); border-top: 1px solid var(--catta-ig-border); }
            .ig-dm-input-wrapper { flex: 1; background: var(--catta-ig-hover); border: 1px solid var(--catta-ig-border); border-radius: 22px; padding: 8px 15px; display: flex; align-items: center; margin-right: 10px; }
            .ig-dm-input { border: none; background: transparent; outline: none; width: 100%; font-size: 14px; color: var(--catta-ig-text); }
            .ig-dm-icon {width: 24px; height: 24px; margin-right: 12px; color: var(--catta-ig-icon) !important; fill: var(--catta-ig-icon) !important; cursor: pointer;transition: color 0.2s, fill 0.2s;}
            .ig-dm-icon path {fill: var(--catta-ig-icon) !important;}
            .ig-dm-send-btn svg {color: #0095f6;fill: #0095f6;}
            .ig-dm-send-btn { cursor: pointer; color: #0095f6; display: flex; align-items: center; transition: transform 0.1s; }
            .ig-dm-send-btn:active { transform: scale(0.9); }

            .ig-profile-head { padding: 10px 15px; display: flex; align-items: center; gap: 20px; }
            .ig-profile-pfp-container { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
            .ig-profile-pfp { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 1px solid var(--catta-ig-border); padding: 2px; -webkit-mask-image: url('https://file.garden/aZx9zS2e7UEiSmfr/catta02.png'); -webkit-mask-size: cover; -webkit-mask-position: center; mask-image: url('https://file.garden/aZx9zS2e7UEiSmfr/catta02.png'); mask-size: cover; mask-position: center; border-radius: 0; border: none; padding: 0;}
            .ig-stats-row { display: flex; flex: 1; justify-content: space-around; text-align: center; }
            .ig-stat-num { display: block; font-weight: 700; font-size: 18px; color: var(--catta-ig-text); }
            .ig-stat-label { display: block; font-size: 12px; color: var(--catta-ig-text); }
            .ig-bio-box { padding: 0 15px 15px; font-size: 14px; color: var(--catta-ig-text); line-height: 1.4; }
            .ig-bio-name { font-weight: 600; display: block; }
            .ig-bio-link { color: #00376b; text-decoration: none; font-weight: 600; }
            .ig-action-btns { padding: 0 15px 10px; display: flex; gap: 8px; }
            .ig-btn { flex: 1; background: var(--catta-ig-hover); border: 1px solid var(--catta-ig-border); border-radius: 8px; padding: 7px; text-align: center; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--catta-ig-text); }
            .ig-btn-blue { background: #0095f6; color: #fff; border: none; }
            .ig-highlights { display: flex; gap: 15px; padding: 0 15px 10px; overflow-x: auto; scrollbar-width: none; }
            .ig-highlight-item { display: flex; flex-direction: column; align-items: center; gap: 5px; flex-shrink: 0; cursor: pointer; }
            .ig-highlight-circle { width: 56px; height: 56px; border-radius: 50%; border: 1px solid var(--catta-ig-border); padding: 2px; }
            .ig-highlight-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; background: var(--catta-ig-border); }
            .ig-highlight-text { font-size: 11px; color: var(--catta-ig-text); }
            .ig-tabs { display: flex; border-top: 1px solid var(--catta-ig-border); border-bottom: 1px solid var(--catta-ig-border); }
            .ig-tab { flex: 1; text-align: center; padding: 10px; cursor: pointer; color: var(--catta-ig-subtext); }
            .ig-tab.active { color: var(--catta-ig-text); border-bottom: 1px solid var(--catta-ig-text); margin-bottom: -1px; }
            .ig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
            .ig-grid-img { width: 100%; aspect-ratio: 1/1; object-fit: cover; cursor: pointer; background: var(--catta-ig-border); }
        
            .ig-highlight-overlay { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 999999; background: rgba(0,0,0,0.92); display: none; align-items: center; justify-content: center; backdrop-filter: blur(8px); margin: 0 !important; padding: 0 !important; animation: igFadeIn 0.2s ease-out; }
            .ig-highlight-content { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; pointer-events: none; }
            .ig-highlight-content img { pointer-events: auto; max-width: 95vw !important; max-height: 80vh !important; object-fit: contain; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); transform: scale(0.9); animation: igPopIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            @keyframes igFadeIn { from{opacity:0;} to{opacity:1;} }
            @keyframes igPopIn { to { transform: scale(1); } }

            .ig-story-box { position: relative; width: 100%; max-width: 320px; aspect-ratio: 9/16; margin: 15px auto; border-radius: 12px; overflow: hidden; background: #000; box-shadow: 0 5px 15px rgba(0,0,0,0.2); font-family: -apple-system, sans-serif; user-select: none; }
            .ig-story-media { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 1; }
            .ig-story-header { position: absolute; top: 0; left: 0; width: 100%; padding: 15px 12px; z-index: 100; color: #fff; box-sizing: border-box; background: linear-gradient(to bottom, rgba(0,0,0,0.4), transparent); pointer-events: none; }
            .ig-story-header * { pointer-events: auto; }
            .ig-story-bars { display: flex; gap: 4px; margin-bottom: 10px; }
            .ig-story-bar { flex: 1; height: 2px; background: rgba(255,255,255,0.4); border-radius: 2px; }
            .ig-story-bar.active { background: #fff; }
            .ig-story-user { display: flex; align-items: center; gap: 10px; }
            .ig-story-pfp { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.5); -webkit-mask-image: url('https://file.garden/aZx9zS2e7UEiSmfr/catta02.png'); -webkit-mask-size: cover; -webkit-mask-position: center; mask-image: url('https://file.garden/aZx9zS2e7UEiSmfr/catta02.png'); mask-size: cover; mask-position: center; border-radius: 0; border: none;}
            .ig-story-info { font-size: 13px; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
            .ig-story-time { opacity: 0.7; font-weight: 400; margin-left: 5px; }
            .ig-story-click-zone { position: absolute; top: 70px; bottom: 80px; left: 0; right: 0; z-index: 50; cursor: pointer; }
            .ig-story-text-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; text-align: center; color: #fff; font-weight: 600; font-size: 18px; text-shadow: 0 2px 4px rgba(0,0,0,0.7); z-index: 5; line-height: 1.4; pointer-events: none; transition: opacity 0.3s ease; }
            .ig-ctx-layer { opacity: 0; transition: opacity 0.3s ease; text-align: center; transform: translateY(-20px); position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 5; pointer-events: none; }
            .ig-story-box.show-ctx .ig-ctx-layer { opacity: 1 !important; transform: translateY(0) !important; }
            .ig-story-box.show-ctx .ig-text-layer { opacity: 0 !important; pointer-events: none; }
            .ig-story-footer { position: absolute; bottom: 0; left: 0; width: 100%; padding: 15px; display: flex; align-items: center; gap: 15px; z-index: 100; box-sizing: border-box; background: linear-gradient(to top, rgba(0,0,0,0.6), transparent); pointer-events: auto; }
            .ig-story-input-wrap { flex: 1; height: 44px; border-radius: 25px; border: 1px solid rgba(255,255,255,0.8); padding: 0 20px; display: flex; align-items: center; backdrop-filter: blur(5px); position: relative; pointer-events: auto; }
            .ig-story-input { background: transparent; border: none; color: #fff; width: 100%; font-size: 14px; outline: none; pointer-events: auto; }
            .ig-story-input::placeholder { color: rgba(255,255,255,0.8); }
            .ig-story-like-btn { cursor: pointer; color: #fff; transition: transform 0.2s; position: relative; pointer-events: auto;}
            .ig-story-like-btn.active { color: #ed4956; }
            .ig-story-send-icon { cursor: pointer; color: #fff; transform: rotate(15deg); position: relative; pointer-events: auto;}

            .ig-call-overlay { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 2147483647; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: space-between; margin: 0 !important; padding: max(50px, env(safe-area-inset-top)) 20px max(40px, env(safe-area-inset-bottom)) !important; box-sizing: border-box; font-family: -apple-system, sans-serif; animation: igFadeIn 0.3s ease-out; }
            .ig-call-overlay::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 35%; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%); pointer-events: none; z-index: 0; }
            .ig-call-bg { position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; min-width: 100% !important; min-height: 100% !important; opacity: 0.3; filter: blur(30px); z-index: -1; object-fit: cover !important; object-position: center center !important; transition: opacity 0.5s; }
            .ig-call-overlay.connected .ig-call-bg { opacity: 1; filter: blur(0); background: #000; }
            .ig-call-overlay.connected .ig-call-pfp-wrapper, .ig-call-overlay.connected .ig-call-status { display: none; } 
            .ig-call-info { text-align: center; color: #fff; margin-top: 40px; z-index: 10; width: 100%; position: relative;}
            .ig-call-pfp-wrapper { width: 120px; height: 120px; margin: 0 auto 20px; position: relative; border-radius: 50%; }
            .ig-call-pfp { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.2); position: relative; z-index: 2; -webkit-mask-image: url('https://file.garden/aZx9zS2e7UEiSmfr/catta02.png'); -webkit-mask-size: cover; -webkit-mask-position: center; mask-image: url('https://file.garden/aZx9zS2e7UEiSmfr/catta02.png'); mask-size: cover; mask-position: center; border-radius: 0; border: none;}
            .ig-call-pulse { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; background: rgba(255,255,255,0.1); z-index: 1; animation: igPulse 2s infinite; }
            @keyframes igPulse { 0% { transform: scale(1); opacity: 0.6; } 70% { transform: scale(1.5); opacity: 0; } 100% { transform: scale(1.5); opacity: 0; } }
            .ig-call-name { font-size: 24px; font-weight: 700; margin-bottom: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
            .ig-call-status { font-size: 16px; opacity: 0.8; margin-bottom: 5px; }
            .ig-call-timer { font-size: 18px; opacity: 0.9; display: none; margin-top: 10px; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.5); letter-spacing: 1px; }
            .ig-call-overlay.connected .ig-call-timer { display: block; }
            .ig-call-actions { display: flex; gap: 20px; align-items: center; justify-content: center; width: 100%; margin-bottom: 20px; z-index: 20; position: relative; }
            .ig-call-btn { width: 65px; height: 65px; border-radius: 50%; background: rgba(50,50,50,0.6); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28px; cursor: pointer; border: none; transition: transform 0.2s; backdrop-filter: blur(10px); box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
            .ig-call-btn:active { transform: scale(0.9); }
            .ig-call-btn.decline { background: #ff3b30; color: #fff; transform: rotate(135deg); }
            .ig-call-btn.accept { background: #4cd964; color: #fff; }
            .ig-call-overlay.outgoing .ig-call-btn.accept { display: none; }
            .ig-call-overlay.connected .ig-call-btn.accept { display: none; }
            .ig-call-btn-small { width: 45px; height: 45px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; cursor: pointer; backdrop-filter: blur(5px); transition: background 0.2s; }
            .ig-call-btn-small:hover { background: rgba(255,255,255,0.3); }
            .ig-call-reader { position: absolute; top: 10%; left: 5%; width: 90%; height: 60%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(15px); border-radius: 20px; z-index: 15; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; opacity: 0; pointer-events: none; transform: translateY(20px); transition: all 0.3s ease; }
            .ig-call-reader.active { opacity: 1; pointer-events: auto; transform: translateY(0); }
            .ig-reader-head { padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); color: #fff; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
            .ig-reader-body { flex: 1; padding: 15px; overflow-y: auto; color: #e0e0e0; font-size: 15px; line-height: 1.6; white-space: pre-wrap; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .ig-reader-body p { margin-bottom: 10px; }
            .ig-reader-body em { color: #aaa; font-style: italic; }
            .ig-reader-body strong { color: #fff; font-weight: 700; }
            .ig-call-reply-box { position: absolute; bottom: 130px; left: 5%; width: 90%; background: rgba(40,40,40,0.9); border-radius: 30px; padding: 5px; display: flex; align-items: center; border: 1px solid rgba(255,255,255,0.2); opacity: 0; pointer-events: none; transform: translateY(20px); transition: all 0.3s ease; z-index: 25; }
            .ig-call-reply-box.active { opacity: 1; pointer-events: auto; transform: translateY(0); }
            #ig-call-input { flex: 1; background: transparent; border: none; color: #fff; padding: 10px 15px; font-size: 16px; outline: none; }
            #ig-call-send-btn { width: 40px; height: 40px; border-radius: 50%; background: #0095f6; border: none; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-left: 5px; }
        `;

        // =========================================================================
        // 6. CATTA UI MODULE REGISTRATION
        // =========================================================================
        window.CattaUI.registerModule({
            id: "insta",
            name: "📱 CattaGram (แคตแกรม)",
            desc: "(Tokens: 1622) ระบบจำลองหน้าต่างโซเซียลชื่อดัง by พี่แอ็ก&พักรบ (เปิดแล้วใช้ได้ทุกตัวละครเลย - แต่ prompt จะไม่ถูกส่งไป จนกว่าเจอคำ keywords เช่น CG, ข้อความ, แชท, พิมพ์, โพสต์, แคตแกรม, โทร เป็นต้น)",
            defaultState: false,
            promptKey: "prompt_cg",
            keywords: ["social", "phone", "mobile", "app", "instagram", "cattagram", "insta", "catta", "ig", "cg", "แคตต้าแกรม", "แคทต้า", "ส้ม", "แมวส้ม", "แคตต้า", "แกรม", "catta", "โซเชียล", "มือถือ", "ไอจี", "ซีจี", "ชีจี", "แอป", "แอพ", "notification", "alert", "screen", "unlock", "lockscreen", "wallpaper", "battery", "แจ้งเตือน", "หน้าจอ", "ล็อคจอ", "หยิบมือถือ", "วางมือถือ", "สั่น", "vibrate", "post", "story", "dm", "call", "feed", "timeline", "โพสต์", "ฟีด", "หน้าแรก", "ลงรูป", "คอมเม้น", "เม้น", "upload", "caption", "tag", "location", "อัพรูป", "แคปชั่น", "หน้าไอจี", "หน้าซีจี", "stories", "status", "moment", "สตอรี่", "อัพสตอรี่", "chat", "message", "reply", "send", "text", "แชท", "ทัก", "ข้อความ", "ดีเอ็ม", "ตอบแชท", "inbox", "ib", "read", "voice", "group", "กลุ่ม", "คุยกลุ่ม", "profile", "bio", "account", "followers", "following", "โปรไฟล์", "บัญชี", "ติดตาม", "ผู้ติดตาม", "ประวัติ", "ดูโปรไฟล์", "ส่อง", "video", "dial", "incoming", "outgoing", "[CG_CALL]", "โทร", "คอล", "วีดีโอคอล", "รับสาย", "โทรกลับ", "facetime", "ring", "answer", "image", "photo", "pic", "gallery", "album", "รูป", "ภาพ", "แกลลอรี่", "คลังภาพ", "send pic", "send photo", "ขอดูรูป", "ส่งรูป", "CG", "IG"],
            css: IG_CSS,
            rules: [
                {

                    findRegex: "(:?::\\s*\\[CG_(?:POST|CARD|DM|GROUP|PROFILE|STORY|CALL)\\][\\s\\S]*?:::)",


                    replaceString: function (match) {
                        const token = localStorage.getItem('catta_auth_token');
                        const uid = localStorage.getItem('catta_uid');

                        if (!token || !uid) {
                            return `<div style="color:#ff4444; border:1px solid #ff4444; padding:10px; border-radius:8px; margin:10px 0; background:rgba(255,0,0,0.1);">[Catta IG Error: Please login to Catta first. Disconnect and re-login via the Catta UI Menu.]<br><br><b>Original Code:</b><br>${esc(match)}</div>`;
                        }

                        const reqId = 'ig-node-' + Math.random().toString(36).substring(2, 10);

                        const _needsUserImg = /\[📱|\[PIC\]/i.test(match);
                        const _resolvedUserImg = _needsUserImg && window.CattaUI?.utils?.findLastUserImage
                            ? window.CattaUI.utils.findLastUserImage()
                            : null;

                        setTimeout(async () => {
                            const node = document.getElementById(reqId);
                            if (!node) return;

                            const textToProcess = _resolvedUserImg
                                ? match.replace(/\[📱|\[PIC\]/gi, _resolvedUserImg)
                                : match;

                            const htmlResult = await processMessageText(textToProcess, uid, token);
                            const cleanHtmlResult = window.CattaUI && window.CattaUI.utils && window.CattaUI.utils.purifyHtml ? window.CattaUI.utils.purifyHtml(htmlResult) : htmlResult;

                            node.outerHTML = cleanHtmlResult;

                            // Fallback: fill any placeholder images (e.g. when _resolvedUserImg was null)
                            setTimeout(() => {
                                document.querySelectorAll('[data-catta-userimg="1"]').forEach(el => {
                                    const aiMsg = el.closest('.mes');
                                    if (!aiMsg) return;

                                    let userImg = null;
                                    let sibling = aiMsg.previousElementSibling;
                                    let scanLimit = 5;

                                    while (sibling && scanLimit > 0) {
                                        if (sibling.getAttribute('is_user') === 'true') {
                                            const selectors = [
                                                '.mes_media_container img',
                                                '.mes_img_container img',
                                                '.img_swipes img',
                                                '.mes_file_wrapper img',
                                                '.mes_text img:not(.emoji):not([class*="avatar"])',
                                                'img.mes_img'
                                            ].join(', ');
                                            const imgs = sibling.querySelectorAll(selectors);
                                            for (let i = imgs.length - 1; i >= 0; i--) {
                                                const src = imgs[i].currentSrc || imgs[i].src;
                                                if (src && !src.includes('ui-avatars.com') && !src.includes('nhmly4.jpg') && !src.includes('type=persona')) {
                                                    userImg = src;
                                                    break;
                                                }
                                            }
                                            break;
                                        }
                                        sibling = sibling.previousElementSibling;
                                        scanLimit--;
                                    }

                                    if (!userImg && window.CattaUI?.utils?.findLastUserImage) {
                                        userImg = window.CattaUI.utils.findLastUserImage();
                                    }

                                    if (userImg) {
                                        el.src = userImg;
                                        el.style.minHeight = '';
                                        el.style.background = '';
                                        if (el.classList.contains('ig-img')) {
                                            el.onclick = () => window.expandIGImage && window.expandIGImage(userImg);
                                        }
                                    }
                                    el.removeAttribute('data-catta-userimg');
                                });
                            }, 80);

                            const callRegex = /<div class="ig-call-incoming-tag" data-name="(.*?)" data-pfp="(.*?)" data-type="(.*?)" data-upl="(.*?)">.*?<\/div>/;
                            const matchCall = htmlResult.match(callRegex);
                            if (matchCall) {
                                const chatEl = document.getElementById('chat');
                                if (chatEl) {
                                    const allMsgs = chatEl.querySelectorAll('.mes');
                                    if (allMsgs.length > 0) {
                                        const lastMsg = allMsgs[allMsgs.length - 1];
                                        if (lastMsg.classList.contains('is_user')) return;
                                        if (!lastMsg.innerHTML.includes('ig-call-incoming-tag') && !lastMsg.classList.contains('streaming')) return;
                                    }
                                }
                                const activeOverlay = document.getElementById('ig-call-overlay');
                                if (activeOverlay && (activeOverlay.classList.contains('connected') || activeOverlay.classList.contains('outgoing'))) return;
                                if (window.launchIGCallUI) {
                                    window.launchIGCallUI('incoming', { name: matchCall[1], pfp: matchCall[2], type: matchCall[3], upl: matchCall[4] });
                                }
                            }
                        }, 50);


                        // ระหว่างรอ ก็โชว์นี่ไปพลางๆ
                        return `<div id="${reqId}" style="text-align:center; padding:15px; color:var(--catta-ig-subtext); font-style:italic; border:1px dashed var(--catta-ig-border); border-radius:8px; margin: 10px 0;">
                            <i class="fa-solid fa-spinner fa-spin"></i> Loading CG Content from Server...
                        </div>`;
                    }
                }
            ]
        });
    }

    registerIG();
})();
