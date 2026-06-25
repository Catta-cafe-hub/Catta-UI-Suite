(function () {
    // ============================================================
    // IB HUD UNIVERSAL MODULE
    // ============================================================

    const VPS_URL = 'https://st-cattacafe.casa/cattagram/api/parse_ui'; // Updated to use Nginx Reverse Proxy

    // --- AUDIO ENGINE (Shared Core) ---
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

    window.cattaPlayBasicMusic = function (event, btn, mediaUrl) {
        if (event && event.preventDefault) { event.preventDefault(); event.stopPropagation(); }
        const isSameSong = (window._cattaCurrentMediaId === mediaUrl);

        // Pause the main Catta-music player if it's playing
        if (window.cattaPauseMainMusic) {
            window.cattaPauseMainMusic();
        }

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

    // --- Theme Engine ---
    function autoDetectHudTheme() {
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        const rgb = bodyBg.match(/\d+/g);
        let isDark = true;
        if (rgb && rgb.length >= 3) {
            const brightness = Math.round(((parseInt(rgb[0]) * 299) + (parseInt(rgb[1]) * 587) + (parseInt(rgb[2]) * 114)) / 1000);
            isDark = brightness < 128;
        }

        const r = document.documentElement;
        // User Toggle Override Check
        const manualTheme = localStorage.getItem('catta_hud_theme');
        if (manualTheme === 'light') isDark = false;
        if (manualTheme === 'dark') isDark = true;

        if (isDark) {
            r.style.setProperty('--hud-bg', 'rgba(28, 28, 30, 0.95)');
            r.style.setProperty('--hud-text', '#ffffff');
            r.style.setProperty('--hud-text-muted', '#ebebf5');
            r.style.setProperty('--hud-border', 'rgba(255, 255, 255, 0.12)');
            r.style.setProperty('--hud-border-inner', 'rgba(255, 255, 255, 0.05)');
            r.style.setProperty('--hud-highlight-bg', 'rgba(255, 255, 255, 0.07)');
            r.style.setProperty('--hud-hover', 'rgba(255, 255, 255, 0.05)');
            r.style.setProperty('--hud-track', 'rgba(0, 0, 0, 0.3)');
            r.style.setProperty('--hud-footer', 'rgba(0, 0, 0, 0.2)');
        } else {
            r.style.setProperty('--hud-bg', 'rgba(245, 245, 247, 0.95)');
            r.style.setProperty('--hud-text', '#1c1c1e');
            r.style.setProperty('--hud-text-muted', '#3c3c43');
            r.style.setProperty('--hud-border', 'rgba(0, 0, 0, 0.12)');
            r.style.setProperty('--hud-border-inner', 'rgba(0, 0, 0, 0.05)');
            r.style.setProperty('--hud-highlight-bg', 'rgba(0, 0, 0, 0.04)');
            r.style.setProperty('--hud-hover', 'rgba(0, 0, 0, 0.05)');
            r.style.setProperty('--hud-track', 'rgba(0, 0, 0, 0.1)');
            r.style.setProperty('--hud-footer', 'rgba(255, 255, 255, 0.5)');
        }
    }

    // Run Theme Engine
    setInterval(autoDetectHudTheme, 2000);
    autoDetectHudTheme();

    window.toggleHudTheme = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const current = localStorage.getItem('catta_hud_theme');
        if (!current || current === 'auto') {
            localStorage.setItem('catta_hud_theme', 'light');
        } else if (current === 'light') {
            localStorage.setItem('catta_hud_theme', 'dark');
        } else {
            localStorage.removeItem('catta_hud_theme'); // reset to auto
        }
        autoDetectHudTheme();
    };


    const HUD_CSS = " \
    .ios-card { display: block; position: relative; width: 100%; margin: 8px 0; background: var(--hud-bg); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid var(--hud-border); border-radius: 18px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); font-family: 'Sarabun', 'Kanit', -apple-system, BlinkMacSystemFont, sans-serif; color: var(--hud-text); overflow: hidden; transition: all 0.3s ease; } \
    .ios-header { padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid transparent; cursor: pointer; user-select: none; touch-action: manipulation; -webkit-tap-highlight-color: transparent; } \
    @media (hover: hover) { .ios-header:hover { background: var(--hud-hover); } } \
    .ios-card.expanded .ios-header { border-bottom: 1px solid var(--hud-border-inner); } \
    .ios-big-time { font-size: 1.8rem; line-height: 1; font-weight: 200; letter-spacing: -1px; color: var(--hud-text); text-shadow: 0 0 15px rgba(0, 0, 0, 0.05); display: flex; align-items: center; gap: 8px; } \
    .weather-icon { font-size: 0.8em; opacity: 0.9; filter: drop-shadow(0 0 5px rgba(0,0,0,0.1)); } \
    .ios-date-row { display: flex; align-items: center; gap: 6px; margin-top: 4px; font-size: 0.8rem; color: var(--hud-text-muted); opacity: 0.8; font-weight: 500; } \
    .ios-theme-toggle { cursor:pointer; font-size:1.1em; opacity:0.6; transition: opacity 0.2s; margin-left: 5px; touch-action: manipulation; -webkit-tap-highlight-color: transparent; } \
    @media (hover: hover) { .ios-theme-toggle:hover { opacity: 1; } } \
    .ios-toggle-btn { background: var(--hud-highlight-bg); padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; color: var(--hud-text); transition: background 0.2s; display: flex; align-items: center; gap: 6px; border: 1px solid var(--hud-border-inner); } \
    .arrow-icon { font-size: 0.7em; transition: transform 0.3s ease; } \
    .ios-card.expanded .arrow-icon { transform: rotate(180deg); } \
    .ios-content-wrapper { max-height: 0; opacity: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease; } \
    .ios-card.expanded .ios-content-wrapper { max-height: 1500px; opacity: 1; } \
    .ios-inner-body { padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; } \
    .ios-loc-box { background: var(--hud-border-inner); border-radius: 10px; padding: 8px 10px; display: flex; flex-direction: column; gap: 4px; font-size: 0.8rem; border: 1px solid var(--hud-border-inner); } \
    .loc-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; } \
    .loc-label { font-weight: 700; color: #3478f6; margin-right: 4px; } \
    .loc-val { opacity: 0.9; } \
    .ios-highlight-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(75px, 1fr)); gap: 6px; } \
    .highlight-box { background: var(--hud-highlight-bg); border-radius: 10px; padding: 6px 4px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid var(--hud-border-inner); min-height: 55px; } \
    .highlight-icon { font-size: 1.2rem; margin-bottom: 2px; display: block; } \
    .highlight-text { font-size: 0.65rem; color: var(--hud-text); line-height: 1.2; font-weight: 500; word-break: break-word;} \
    .ios-bars-container { display: flex; flex-direction: column; gap: 6px; } \
    .ios-stat-row { width: 100%; } \
    .ios-stat-head { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 3px; color: var(--hud-text); font-weight: 500; } \
    .ios-track { height: 6px; background: var(--hud-track); border-radius: 10px; overflow: hidden; position: relative; } \
    .ios-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; box-shadow: 0 0 10px currentColor; } \
    .ios-outfit-box { display: flex; flex-direction: column; gap: 8px; padding-top: 6px; border-top: 1px solid var(--hud-border-inner); } \
    .outfit-row { display: flex; align-items: flex-start; font-size: 0.75rem; line-height: 1.4; gap: 7px; } \
    .outfit-icon { font-size: 0.95rem; flex-shrink: 0; padding-top: 2px; } \
    .outfit-text { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; } \
    .outfit-badge { padding: 2px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; white-space: nowrap; border: 1px solid; box-shadow: 0 2px 5px rgba(0,0,0,0.1); align-self: flex-start; } \
    .outfit-cloth { opacity: 0.88; font-size: 0.73rem; line-height: 1.4; word-break: break-word; overflow-wrap: anywhere; } \
    .ios-footer { background: var(--hud-footer); padding: 8px 12px; font-size: 0.75rem; border-top: 1px solid var(--hud-border-inner); display: flex; flex-direction: column; gap: 4px; } \
    .footer-item { display: flex; align-items: center; gap: 8px; color: var(--hud-text-muted); font-weight: 500; } \
    .disk-spin { animation: spin 4s linear infinite; display: inline-block; } \
    @keyframes spin { 100% { transform: rotate(360deg); } } \
    .hud-play-btn { background: var(--hud-highlight-bg); border: 1px solid var(--hud-border); border-radius: 50%; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; color: var(--hud-text); cursor: pointer; transition: all 0.2s; margin-right: 2px; touch-action: manipulation; -webkit-tap-highlight-color: transparent; } \
    @media (hover: hover) { .hud-play-btn:hover { background: var(--hud-hover); transform: scale(1.05); } } \
    .hud-play-btn.playing { background: #bf5af2; color: #fff; border-color: #bf5af2; } \
    ";

    // ------------------------------------------------------------
    // 2. ASYNC API PROCESSOR & HUD MANAGER
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
                // แทรกปุ่มเปลี่ยน Theme ไว้ข้างๆ วันที่
                let finalHtml = data.html;
                if (finalHtml.includes('class="ios-date-row"')) {
                    finalHtml = finalHtml.replace('</div></div>', '<i class="fa-solid fa-circle-half-stroke ios-theme-toggle catta-clickable" data-action="toggle-hud-theme" title="Toggle Theme (Auto/Light/Dark)"></i></div></div>');
                }
                return finalHtml;
            }
            return text;
        } catch (error) {
            console.error("HUD API Error:", error);
            return '<div style="color:#ff4444; border:1px solid #ff4444; padding:10px; border-radius:8px; margin:10px 0;">[HUD Offline: Could not connect to API]</div>';
        }
    }

    function esc(text) {
        if (!text) return text;
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- Auto Collapse Old HUDs ---
    // เก็บประวัติ ID ของ HUD ที่โหลดเข้ามา
    window._ibHudHistory = window._ibHudHistory || [];
    const MAX_EXPANDED_HUDS = 20;

    function manageHudStates(newId) {
        if (newId && !window._ibHudHistory.includes(newId)) {
            window._ibHudHistory.push(newId);
        }

        // ถ้าจำนวนเกินที่กำหนด ให้สั่งปิดอันเก่าๆ
        if (window._ibHudHistory.length > MAX_EXPANDED_HUDS) {
            const hudsToCollapse = window._ibHudHistory.slice(0, window._ibHudHistory.length - MAX_EXPANDED_HUDS);

            hudsToCollapse.forEach(id => {
                const el = document.getElementById(id);
                if (el && el.classList.contains('expanded')) {
                    el.classList.remove('expanded');
                }
            });

            // ล้างประวัติเก็บไว้เฉพาะ 50 อันล่าสุดเพื่อไม่ให้ array ใหญ่เกินไป
            if (window._ibHudHistory.length > 50) {
                window._ibHudHistory = window._ibHudHistory.slice(-50);
            }
        }
    }

    // ------------------------------------------------------------
    // 3. MODULE REGISTRATION
    // ------------------------------------------------------------
    if (window.CattaUI) {
        window.CattaUI.registerModule({
            id: "ib_hud_universal",
            name: "📟️ IB HUD (1 ต่อ 1)",
            desc: "(Tokens: 559) เปิดแล้วใช้ได้ทันที ใช้กับ โจ๊กเกอร์ หรือตัวละครอื่นๆ",
            defaultState: false,
            promptKey: "prompt_ib_hud",
            css: HUD_CSS,
            rules: [
                {
                    findRegex: "(:?::\\s*\\[HUDR\\][\\s\\S]*?:::)",
                    replaceString: function (match) {
                        const token = localStorage.getItem('catta_auth_token');
                        const uid = localStorage.getItem('catta_uid');

                        if (!token || !uid) {
                            return '<div style="color:#ff4444; border:1px solid #ff4444; padding:10px; border-radius:8px; margin:10px 0; background:rgba(255,0,0,0.1);">[Catta Error: Please login to Catta first.]<br><br><b>Original Code:</b><br>' + esc(match) + '</div>';
                        }

                        const reqId = 'hud-node-' + Math.random().toString(36).substring(2, 10);

                        setTimeout(async () => {
                            const node = document.getElementById(reqId);
                            if (!node) return;
                            const htmlResult = await processMessageText(match, uid, token);
                            const cleanHtmlResult = window.CattaUI && window.CattaUI.utils && window.CattaUI.utils.purifyHtml ? window.CattaUI.utils.purifyHtml(htmlResult) : htmlResult;
                            node.outerHTML = cleanHtmlResult;

                            // หา ID ที่แท้จริงจาก HTML ที่ API ส่งกลับมา
                            const divMatch = htmlResult.match(/id="(ib-hud-\d+)"/);
                            if (divMatch && divMatch[1]) {
                                const realId = divMatch[1];
                                setTimeout(() => {
                                    const newCard = document.getElementById(realId);
                                    if (newCard) {
                                        newCard.classList.add('expanded'); // บังคับให้หน้าใหม่เปิดเสมอ
                                        manageHudStates(realId);
                                    }
                                }, 50);
                            }
                        }, 50);

                        return '<div id="' + reqId + '" style="text-align:center; padding:15px; color:rgba(255,255,255,0.5); font-style:italic; border:1px dashed rgba(255,255,255,0.2); border-radius:18px; margin: 8px 0; background:var(--hud-bg, rgba(0,0,0,0.5));"><i class="fa-solid fa-spinner fa-spin"></i> Loading HUD Data...</div>';
                    }
                }
            ]
        });
    }
})();
