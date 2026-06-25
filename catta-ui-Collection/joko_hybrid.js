(function () {
    // ============================================================
    // 🔮 JOKO HUD HYBRID 
    // ============================================================

    const MODULE_ID = "joko_hybrid";
    const VPS_URL = 'https://st-cattacafe.casa/cattagram/api/parse_ui';

    // ------------------------------------------------------------
    // 0. AUDIO ENGINE 
    // ------------------------------------------------------------
    window._cattaCurrentMediaId = window._cattaCurrentMediaId || null;
    window._cattaActiveBtn = window._cattaActiveBtn || null;

    if (!window._cattaAudioPlayer) {
        window._cattaAudioPlayer = new Audio();
        window._cattaAudioPlayer.volume = 0.5;
        window._cattaAudioPlayer.onended = function () {
            if (window._cattaActiveBtn) {
                window._cattaActiveBtn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 1px;"></i>';
                window._cattaActiveBtn.classList.remove('playing');
                window._cattaActiveBtn = null;
            }
        };
    }

    window.cattaToggleMusic = window.cattaToggleMusic || function (event, btn, mediaUrl) {
        if (event) { event.preventDefault(); event.stopPropagation(); }
        const isSameSong = (window._cattaCurrentMediaId === mediaUrl);

        if (isSameSong && !window._cattaAudioPlayer.paused) {
            window._cattaAudioPlayer.pause();
            btn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 1px;"></i>';
            btn.classList.remove('playing');
            return;
        }

        if (window._cattaActiveBtn && window._cattaActiveBtn !== btn) {
            window._cattaActiveBtn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 1px;"></i>';
            window._cattaActiveBtn.classList.remove('playing');
            window._cattaAudioPlayer.pause();
        }

        window._cattaCurrentMediaId = mediaUrl;
        if (!isSameSong) { window._cattaAudioPlayer.src = mediaUrl; }
        window._cattaAudioPlayer.play().catch(e => console.error("Audio Error:", e));

        btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        btn.classList.add('playing');
        window._cattaActiveBtn = btn;
    };

    function esc(text) {
        if (!text) return text;
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ------------------------------------------------------------
    // 1. GLOBAL EVENT FUNCTION
    // ------------------------------------------------------------
    if (!window.toggleJokoHUD) {
        window.toggleJokoHUD = function (btn) {
            const container = btn.closest('.joko-standalone-module');
            if (!container) return;

            const allBtns = container.querySelectorAll('.joko-rpg-btn');
            const allPanels = container.querySelectorAll('.joko-panel');
            const targetIdx = btn.getAttribute('data-idx');
            const targetPanel = container.querySelector('.joko-panel[data-idx="' + targetIdx + '"]');

            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                if (targetPanel) targetPanel.classList.remove('active');
            } else {
                allBtns.forEach(b => b.classList.remove('active'));
                allPanels.forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                if (targetPanel) targetPanel.classList.add('active');
            }
        };
    }

    // ------------------------------------------------------------
    // 2. CSS STYLES (COMPACT EDITION)
    // ------------------------------------------------------------
    const JOKO_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Syne+Mono&family=Orbitron:wght@700&display=swap');

    .joko-plasma-card {
        background-color: #111; color: #ffe5fc; font-family: 'Syne Mono', monospace; border-radius: 12px;
        border: 1px solid #4a0e41; box-shadow: 0 0 15px rgba(255, 7, 227, 0.3), 0 0 10px rgba(7, 227, 255, 0.2);
        width: 100%; max-width: 350px; 
        padding: 15px; margin: 10px auto;
        display: flex; flex-direction: column; justify-content: space-between; text-align: center;
        overflow: hidden; position: relative; box-sizing: border-box;
    }
    .joko-glitch-time {
        font-family: 'Orbitron', sans-serif; 
        font-size: 4em; 
        font-weight: 700; position: relative;
        animation: glitch-main 5s infinite linear alternate-reverse; 
        margin: 5px 0;
        --color-1: #ff07e3; --color-2: #07e3ff; line-height: normal;
    }
    .joko-glitch-time::before, .joko-glitch-time::after {
        content: attr(data-time); position: absolute; top: 0; left: 0; right: 0; overflow: hidden; background: #111; z-index: 1;
    }
    .joko-glitch-time::before { left: 2px; text-shadow: -2px 0 var(--color-1); animation: glitch-anim-1 2.2s infinite linear alternate-reverse; }
    .joko-glitch-time::after { left: -2px; text-shadow: 2px 0 var(--color-2); animation: glitch-anim-2 2s infinite linear alternate-reverse; }
    
    .joko-info-line { 
        font-size: 0.95em;
        letter-spacing: 1px; opacity: 0.8; color: #c7d2fe; 
    }
    .joko-emotion-status { 
        border-top: 1px dashed #4a0e41; 
        padding-top: 8px; margin-top: 8px;
    }
    .joko-emotion-label { font-size: 0.7em; color: #888; text-transform: uppercase; }
    .joko-emotion-value { 
        font-size: 1.1em; letter-spacing: 1px; color: var(--color-1); 
        text-shadow: 0 0 5px var(--color-1), 0 0 10px var(--color-2); 
        animation: pulse-emotion 3s infinite ease-in-out; 
    }

    @keyframes glitch-main { 4% { transform: skew(0.7deg); } 6% { transform: skew(-0.4deg); } 8% { transform: skew(0); } }
    @keyframes glitch-anim-1 { 0%, 100% { clip-path: inset(31% 0 66% 0); } 20% { clip-path: inset(58% 0 39% 0); } 40% { clip-path: inset(90% 0 7% 0); } 60% { clip-path: inset(28% 0 69% 0); } 80% { clip-path: inset(9% 0 88% 0); } }
    @keyframes glitch-anim-2 { 0%, 100% { clip-path: inset(68% 0 29% 0); } 20% { clip-path: inset(71% 0 26% 0); } 40% { clip-path: inset(20% 0 77% 0); } 60% { clip-path: inset(90% 0 7% 0); } 80% { clip-path: inset(15% 0 82% 0); } }
    @keyframes pulse-emotion { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.02); } }
    
    @media (min-width: 768px) { .joko-glitch-time { font-size: 3.2em; } }

    .joko-standalone-module { box-sizing: border-box; width: 100%; max-width: 350px; margin: 10px auto; font-family: 'Syne Mono', monospace; }
    .joko-btn-group { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; padding: 0 0 5px 0; }
    .joko-rpg-btn { 
        background: rgba(17, 17, 17, 0.8); border: 1px solid #07e3ff; border-radius: 8px; color: #07e3ff; 
        width: 38px; height: 38px;
        font-size: 1.1em; display: flex; align-items: center; justify-content: center; 
        cursor: pointer; box-shadow: 0 0 5px rgba(7, 227, 255, 0.2); transition: all 0.2s ease; user-select: none; 
    }
    .joko-rpg-btn:hover { background: rgba(7, 227, 255, 0.2); box-shadow: 0 0 15px rgba(7, 227, 255, 0.6); transform: scale(1.05); }
    .joko-rpg-btn.active { background: rgba(255, 7, 227, 0.2); border-color: #ff07e3; color: #ff07e3; box-shadow: 0 0 15px rgba(255, 7, 227, 0.6); }
    .joko-panel-container { margin-top: 10px; }
    .joko-panel { 
        display: none; background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); 
        border-radius: 8px; padding: 10px 12px; font-size: 0.85em;
        text-align: left; color: #e0e0e0; line-height: 1.5; border-left: 3px solid #ff07e3; overflow-wrap: break-word; 
    }
    .joko-panel.active { display: block; }
    .joko-panel-title { color: #07e3ff; font-weight: 600; font-size: 1em; margin-bottom: 5px; border-bottom: 1px dashed rgba(7, 227, 255, 0.3); padding-bottom: 4px; }
    `;

    // ------------------------------------------------------------
    // 3. ASYNC API PROCESSOR
    // ------------------------------------------------------------
    async function processMessageText(text, uid, token) {
        try {
            const response = await fetch(VPS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-uid': uid || 'guest', 'x-token': token || 'none' },
                body: JSON.stringify({ raw_text: text })
            });

            if (!response.ok) throw new Error('API Error: ' + response.status);

            const data = await response.json();
            if (data.success && data.html) {
                return data.html;
            }
            return text;
        } catch (error) {
            console.error("Joko HUD API Error:", error);
            return '<div style="color:#ff07e3; border:1px solid #07e3ff; padding:10px; border-radius:8px; margin:10px 0; background:#111;">[Joko System Offline: API Connection Lost]</div>';
        }
    }

    // ------------------------------------------------------------
    // 4. MODULE REGISTRATION
    // ------------------------------------------------------------
    if (window.CattaUI) {
        window.CattaUI.registerModule({
            id: MODULE_ID,
            name: "📟️ Joshua HUD",
            desc: "(Tokens: 345) เปิดแล้วใช้ได้ทันที ใช้กับ โจชัวร์ หรือตัวละครอื่นๆ",
            defaultState: false,
            promptKey: "prompt_hudtop",
            css: JOKO_CSS,
            rules: [

                {
                    findRegex: "(:?::\\s*\\[HDRTop\\][\\s\\S]*?:::)",
                    replaceString: function (match) {
                        const token = localStorage.getItem('catta_auth_token');
                        const uid = localStorage.getItem('catta_uid');

                        if (!token || !uid) {
                            return '<div style="color:#ff07e3; border:1px solid #07e3ff; padding:10px; border-radius:8px; margin:10px 0; background:#111;">[System Error: Please login to Catta first]<br><br>' + esc(match) + '</div>';
                        }

                        const reqId = 'joko-hdr-' + Math.random().toString(36).substring(2, 10);

                        setTimeout(async () => {
                            const node = document.getElementById(reqId);
                            if (!node) return;
                            const htmlResult = await processMessageText(match, uid, token);
                            const cleanHtmlResult = window.CattaUI && window.CattaUI.utils && window.CattaUI.utils.purifyHtml ? window.CattaUI.utils.purifyHtml(htmlResult) : htmlResult;
                            node.outerHTML = cleanHtmlResult;
                        }, 50);

                        return '<div id="' + reqId + '" style="text-align:center; padding:15px; color:#07e3ff; font-family:\'Orbitron\', sans-serif; border:1px dashed #ff07e3; border-radius:12px; margin: 10px auto; max-width: 350px; background:#111;"><i class="fa-solid fa-spinner fa-spin"></i> INITIALIZING SYSTEM...</div>';
                    }
                },

                {
                    findRegex: "((?:\\s*◤\\[FTR\\d+\\][\\s\\S]*?◢\\s*)+)",
                    replaceString: function (match) {
                        const token = localStorage.getItem('catta_auth_token');
                        const uid = localStorage.getItem('catta_uid');

                        if (!token || !uid) {
                            return '<div style="color:#ff07e3; border:1px solid #07e3ff; padding:10px; border-radius:8px; margin:10px 0; background:#111;">[System Error: Please login to Catta first]<br><br>' + esc(match) + '</div>';
                        }

                        const reqId = 'joko-ftr-' + Math.random().toString(36).substring(2, 10);

                        setTimeout(async () => {
                            const node = document.getElementById(reqId);
                            if (!node) return;
                            const htmlResult = await processMessageText(match, uid, token);
                            const cleanHtmlResult = window.CattaUI && window.CattaUI.utils && window.CattaUI.utils.purifyHtml ? window.CattaUI.utils.purifyHtml(htmlResult) : htmlResult;
                            node.outerHTML = cleanHtmlResult;
                        }, 50);

                        return '<div id="' + reqId + '" style="text-align:center; padding:15px; color:#07e3ff; font-family:\'Orbitron\', sans-serif; border:1px dashed #ff07e3; border-radius:12px; margin: 10px auto; max-width: 350px; background:#111;"><i class="fa-solid fa-spinner fa-spin"></i> LOADING MODULES...</div>';
                    }
                },

                {
                    findRegex: "(:?::\\s*\\[(?:Thought|💭)\\][\\s\\S]*?:::)",
                    replaceString: function (match) {
                        const token = localStorage.getItem('catta_auth_token');
                        const uid = localStorage.getItem('catta_uid');

                        if (!token || !uid) {
                            return '<div style="color:#ff07e3; border:1px solid #07e3ff; padding:10px; border-radius:8px; margin:10px 0; background:#111;">[System Error: Please login to Catta first]<br><br>' + esc(match) + '</div>';
                        }

                        const reqId = 'joko-tht-' + Math.random().toString(36).substring(2, 10);

                        setTimeout(async () => {
                            const node = document.getElementById(reqId);
                            if (!node) return;
                            const htmlResult = await processMessageText(match, uid, token);
                            const cleanHtmlResult = window.CattaUI && window.CattaUI.utils && window.CattaUI.utils.purifyHtml ? window.CattaUI.utils.purifyHtml(htmlResult) : htmlResult;
                            node.outerHTML = cleanHtmlResult;
                        }, 50);

                        return '<div id="' + reqId + '" style="max-width: 600px; margin: 20px auto; text-align:center; color:#FFA43A; font-style:italic;"><i class="fa-solid fa-spinner fa-spin"></i> Syncing thought...</div>';
                    }
                },

                {
                    findRegex: "(:?::\\s*\\[💸\\][\\s\\S]*?:::)",
                    replaceString: function (match) {
                        const token = localStorage.getItem('catta_auth_token');
                        const uid = localStorage.getItem('catta_uid');

                        if (!token || !uid) {
                            return '<div style="color:#D4AF37; border:1px solid #D4AF37; padding:10px; border-radius:8px; margin:10px 0; background:#111;">[System Error: Please login to Catta first]<br><br>' + esc(match) + '</div>';
                        }

                        const reqId = 'joko-debt-' + Math.random().toString(36).substring(2, 10);

                        setTimeout(async () => {
                            const node = document.getElementById(reqId);
                            if (!node) return;
                            const htmlResult = await processMessageText(match, uid, token);
                            const cleanHtmlResult = window.CattaUI && window.CattaUI.utils && window.CattaUI.utils.purifyHtml ? window.CattaUI.utils.purifyHtml(htmlResult) : htmlResult;
                            node.outerHTML = cleanHtmlResult;
                        }, 50);

                        return '<div id="' + reqId + '" style="text-align:center; padding:15px; color:#D4AF37; font-family:\'Garamond\', serif; border:1px dashed #D4AF37; margin: 20px auto; max-width: 400px; background:#121212;"><i class="fa-solid fa-spinner fa-spin"></i> Accessing Portfolio...</div>';
                    }
                }
            ]
        });
    }
})();
