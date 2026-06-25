(function () {
    // ============================================================
    // 💎 HUD 2NPC (Hybrid Version)
    // ============================================================

    const VPS_URL = 'https://st-cattacafe.casa/cattagram/api/parse_ui';
    const MODULE_ID = "hud_2npc_hybrid";

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

    // --- XSS Protection ---
    function esc(text) {
        if (!text) return text;
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- CSS ---
    const HUD_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');

    .hud2npc-card {
        display: block; position: relative; width: 100%; margin: 8px 0;
        background: rgba(30, 30, 35, 0.85);
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 18px;
        box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4);
        font-family: "Sarabun", -apple-system, BlinkMacSystemFont, sans-serif;
        color: #fff; overflow: hidden;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }

    .hud2npc-header {
        padding: 10px 16px;
        display: flex; justify-content: space-between; align-items: center;
        border-bottom: 1px solid transparent;
        cursor: pointer; user-select: none;
        transition: background 0.2s;
        touch-action: manipulation; -webkit-tap-highlight-color: transparent;
    }
    @media (hover: hover) { .hud2npc-header:hover { background: rgba(255,255,255,0.05); } }
    .hud2npc-card.expanded .hud2npc-header { border-bottom: 1px solid rgba(255, 255, 255, 0.1); }

    .hud2npc-big-time {
        font-size: 2.0rem; line-height: 1; font-weight: 300;
        letter-spacing: -0.5px; color: #fff;
        display: flex; align-items: center; gap: 7px;
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
    }
    .hud2npc-weather-icon { font-size: 0.8em; opacity: 0.9; }

    .hud2npc-date-row {
        display: flex; align-items: center; gap: 6px; margin-top: 2px;
        font-size: 0.85rem; color: #aeaeb2; font-weight: 500;
        padding-left: 2px;
    }

    .hud2npc-toggle-btn {
        background: rgba(118, 118, 128, 0.2);
        padding: 4px 10px; border-radius: 20px;
        font-size: 0.65rem; font-weight: 700; color: #fff;
        display: flex; align-items: center; gap: 6px;
        border: 1px solid rgba(255,255,255,0.1);
        backdrop-filter: blur(5px);
    }
    .hud2npc-arrow-icon { font-size: 0.7em; transition: transform 0.3s ease; }
    .hud2npc-card.expanded .hud2npc-arrow-icon { transform: rotate(180deg); }

    .hud2npc-content {
        max-height: 0; opacity: 0; overflow: hidden;
        transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
    }
    .hud2npc-card.expanded .hud2npc-content { max-height: 3000px; opacity: 1; }
    .hud2npc-inner { padding: 10px 14px; display: flex; flex-direction: column; gap: 10px; }

    .hud2npc-locs {
        display: flex; flex-wrap: wrap; gap: 6px;
        padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .hud2npc-loc-pill {
        font-size: 0.78rem; background: rgba(255, 214, 10, 0.15); color: #ffd60a;
        padding: 4px 10px; border-radius: 10px; border: 1px solid rgba(255, 214, 10, 0.3);
        display: flex; align-items: center; gap: 5px; font-weight: 600;
    }

    .hud2npc-npc-box {
        background: rgba(255,255,255,0.03);
        border-radius: 12px; padding: 10px;
        border: 1px solid rgba(255,255,255,0.05);
    }
    .hud2npc-npc-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 7px; }
    .hud2npc-npc-name { font-size: 0.95rem; font-weight: 700; color: #fff; }
    .hud2npc-npc-role { 
        font-size: 0.62rem; color: #ebebf5; text-transform: uppercase; letter-spacing: 0.5px; 
        background: rgba(255,255,255,0.15); padding: 2px 6px; border-radius: 5px; font-weight: 600;
    }

    .hud2npc-stats-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
        gap: 8px; margin-bottom: 6px;
    }
    .hud2npc-stat-item { display: flex; flex-direction: column; gap: 3px; }
    .hud2npc-stat-txt { font-size: 0.68rem; color: #d1d1d6; display: flex; justify-content: space-between; }
    .hud2npc-stat-val { font-weight: 700; color: #fff; }
    
    .hud2npc-track { height: 6px; background: rgba(0,0,0,0.4); border-radius: 4px; overflow: hidden; position: relative;}
    .hud2npc-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; box-shadow: 0 0 8px currentColor; }

    .hud2npc-bar-red    { background: linear-gradient(90deg, #ff453a, #ff9f0a); color: rgba(255, 69, 58, 0.4); }
    .hud2npc-bar-pink   { background: linear-gradient(90deg, #ff375f, #ff9f0a); color: rgba(255, 55, 95, 0.4); }
    .hud2npc-bar-blue   { background: linear-gradient(90deg, #0a84ff, #64d2ff); color: rgba(10, 132, 255, 0.4); }
    .hud2npc-bar-green  { background: linear-gradient(90deg, #30d158, #66d4cf); color: rgba(48, 209, 88, 0.4); }
    .hud2npc-bar-purple { background: linear-gradient(90deg, #bf5af2, #5e5ce6); color: rgba(191, 90, 242, 0.4); }
    .hud2npc-bar-orange { background: linear-gradient(90deg, #ff9f0a, #ffd60a); color: rgba(255, 159, 10, 0.4); }

    .hud2npc-detail { font-size: 0.78rem; color: #e5e5ea; display: flex; gap: 8px; margin-top: 4px; line-height: 1.4; }
    .hud2npc-icon { min-width: 18px; text-align: center; }

    .hud2npc-user {
        margin-top: 3px; padding: 10px 12px; 
        background: linear-gradient(90deg, rgba(10, 132, 255, 0.15), rgba(10, 132, 255, 0.05));
        border: 1px solid rgba(10, 132, 255, 0.3); border-radius: 12px;
        display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: #fff;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    }
    .hud2npc-user-badge {
        background: #007aff; color: #fff; font-size: 0.68rem; font-weight: 800;
        padding: 3px 9px; border-radius: 6px; text-transform: uppercase;
        box-shadow: 0 2px 6px rgba(10, 132, 255, 0.5);
        white-space: nowrap; max-width: 160px; 
        overflow: hidden; text-overflow: ellipsis;
        display: flex; align-items: center; gap: 5px;
    }
    .hud2npc-user-text { flex: 1; opacity: 0.95; font-weight: 400; }

    /* =============================================
       📱 RESPONSIVE — Tablet (≤ 768px)
    ============================================= */
    @media (max-width: 768px) {
        .hud2npc-card { margin: 6px 0; border-radius: 14px; }
        .hud2npc-header { padding: 9px 14px; }
        .hud2npc-big-time { font-size: 1.8rem; gap: 6px; }
        .hud2npc-date-row { font-size: 0.80rem; }
        .hud2npc-inner { padding: 9px 12px; gap: 9px; }
        .hud2npc-npc-box { padding: 9px; border-radius: 11px; }
        .hud2npc-stats-grid { gap: 7px; }
        .hud2npc-user { padding: 9px 11px; font-size: 0.78rem; }
    }

    /* =============================================
       📱 RESPONSIVE — Mobile (≤ 480px)
    ============================================= */
    @media (max-width: 480px) {
        .hud2npc-card { margin: 5px 0; border-radius: 12px; }

        /* Header: จัดเรียงแนวนอนเหมือนเดิม เพื่อให้ปุ่มอยู่ตรงกลางขวา */
        .hud2npc-header {
            padding: 8px 12px;
        }

        .hud2npc-big-time { font-size: 1.6rem; gap: 5px; }
        .hud2npc-date-row { font-size: 0.75rem; margin-top: 1px; }

        .hud2npc-inner { padding: 8px 10px; gap: 8px; }
        .hud2npc-npc-box { padding: 8px; border-radius: 10px; }
        .hud2npc-npc-name { font-size: 0.88rem; }
        .hud2npc-npc-role { font-size: 0.58rem; padding: 2px 5px; }

        /* Stats: บน mobile ให้ได้แค่ 2 column */
        .hud2npc-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
        }
        .hud2npc-stat-txt { font-size: 0.64rem; }
        .hud2npc-track { height: 5px; }

        .hud2npc-detail { font-size: 0.74rem; gap: 6px; margin-top: 3px; }
        .hud2npc-icon { min-width: 16px; }

        .hud2npc-loc-pill { font-size: 0.72rem; padding: 3px 8px; }

        .hud2npc-user { padding: 8px 10px; font-size: 0.74rem; gap: 8px; }
        .hud2npc-user-badge { font-size: 0.62rem; padding: 3px 7px; max-width: 120px; }
    }
    `;

    // --- ASYNC PROCESSOR ---
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
            console.error("HUD API Error:", error);
            return '<div style="color:#ff4444; border:1px solid #ff4444; padding:10px; border-radius:8px; margin:10px 0;">[HUD Offline: Could not connect to API]</div>';
        }
    }

    // --- Auto Collapse Old HUDs ---
    window._hud2npcHistory = window._hud2npcHistory || [];
    const MAX_EXPANDED_HUDS = 20;

    function manageHudStates(newId) {
        if (newId && !window._hud2npcHistory.includes(newId)) {
            window._hud2npcHistory.push(newId);
        }

        if (window._hud2npcHistory.length > MAX_EXPANDED_HUDS) {
            const hudsToCollapse = window._hud2npcHistory.slice(0, window._hud2npcHistory.length - MAX_EXPANDED_HUDS);

            hudsToCollapse.forEach(id => {
                const el = document.getElementById(id);
                if (el && el.classList.contains('expanded')) {
                    el.classList.remove('expanded');
                }
            });

            if (window._hud2npcHistory.length > 50) {
                window._hud2npcHistory = window._hud2npcHistory.slice(-50);
            }
        }
    }

    // ------------------------------------------------------------
    // MODULE REGISTRATION
    // ------------------------------------------------------------
    if (window.CattaUI) {
        window.CattaUI.registerModule({
            id: MODULE_ID,
            name: "📟 IB HUD 2NPC",
            desc: "(Tokens: 589) รองรับ NPC หลายตัวละคร",
            defaultState: false,
            promptKey: "prompt_many",
            css: HUD_CSS,
            rules: [
                {
                    findRegex: "(:?::\\s*\\[HUDNPC\\][\\s\\S]*?:::)",
                    replaceString: function (match) {
                        const token = localStorage.getItem('catta_auth_token');
                        const uid = localStorage.getItem('catta_uid');

                        if (!token || !uid) {
                            return '<div style="color:#ff4444; border:1px solid #ff4444; padding:10px; border-radius:8px; margin:10px 0; background:rgba(255,0,0,0.1);">[Catta Error: Please login to Catta first.]<br><br><b>Original Code:</b><br>' + esc(match) + '</div>';
                        }

                        const reqId = 'hud2npc-node-' + Math.random().toString(36).substring(2, 10);

                        setTimeout(async () => {
                            const node = document.getElementById(reqId);
                            if (!node) return;
                            const htmlResult = await processMessageText(match, uid, token);
                            const cleanHtmlResult = window.CattaUI && window.CattaUI.utils && window.CattaUI.utils.purifyHtml ? window.CattaUI.utils.purifyHtml(htmlResult) : htmlResult;
                            node.outerHTML = cleanHtmlResult;

                            const divMatch = htmlResult.match(/id="(hud2npc-\d+)"/);
                            if (divMatch && divMatch[1]) {
                                const realId = divMatch[1];
                                setTimeout(() => {
                                    const newCard = document.getElementById(realId);
                                    if (newCard) {
                                        newCard.classList.add('expanded');
                                        manageHudStates(realId);
                                    }
                                }, 50);
                            }
                        }, 50);

                        return '<div id="' + reqId + '" style="text-align:center; padding:15px; color:rgba(255,255,255,0.5); font-style:italic; border:1px dashed rgba(255,255,255,0.2); border-radius:18px; margin: 8px 0; background:rgba(30, 30, 35, 0.85);"><i class="fa-solid fa-spinner fa-spin"></i> Loading 2NPC HUD...</div>';
                    }
                }
            ]
        });
    }

})();
