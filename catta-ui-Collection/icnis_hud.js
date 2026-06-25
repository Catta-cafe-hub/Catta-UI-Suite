(function () {
    // ============================================================
    // ICNIS HUD MODULE — "THE ADJUDICATOR" STYLE (UPDATED)
    // Version: 1.1.0
    // Location: catta-ui-Collection/icnis_hud.js
    // ============================================================

    const VPS_URL = 'https://st-cattacafe.casa/cattagram/api/parse_ui';

    // --- Audio Engine (Shared Core) ---
    window._cattaCurrentMediaId = window._cattaCurrentMediaId || null;
    window._cattaActiveBtn = window._cattaActiveBtn || null;

    if (!window._cattaAudioPlayer) {
        window._cattaAudioPlayer = new Audio();
        window._cattaAudioPlayer.volume = 0.5;
        window._cattaAudioPlayer.onended = function () {
            if (window._cattaActiveBtn) {
                window._cattaActiveBtn.innerHTML = '<i class="fa-solid fa-play" style="margin-left:1px;"></i>';
                window._cattaActiveBtn.classList.remove('playing');
                window._cattaActiveBtn = null;
            }
        };
    }

    window.cattaPlayBasicMusic = window.cattaPlayBasicMusic || function (event, btn, mediaUrl) {
        if (event && event.preventDefault) { event.preventDefault(); event.stopPropagation(); }
        const isSameSong = (window._cattaCurrentMediaId === mediaUrl);
        if (window.cattaPauseMainMusic) window.cattaPauseMainMusic();
        if (isSameSong && !window._cattaAudioPlayer.paused) {
            window._cattaAudioPlayer.pause();
            btn.innerHTML = '<i class="fa-solid fa-play" style="margin-left:1px;"></i>';
            btn.classList.remove('playing');
            return;
        }
        if (window._cattaActiveBtn && window._cattaActiveBtn !== btn) {
            window._cattaActiveBtn.innerHTML = '<i class="fa-solid fa-play" style="margin-left:1px;"></i>';
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

    // ============================================================
    // CSS STYLES
    // ============================================================
    const HUD_CSS = `
        details>summary{list-style:none;outline:none;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
        details>summary::-webkit-details-marker{display:none}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        .lanka-close-header,.lanka-overlay{display:none}
        .lanka-modal[open] .lanka-close-header{display:flex;position:absolute;top:18px;left:10px;right:10px;z-index:100;justify-content:space-between;align-items:center;border-bottom:1px solid #E1E8ED;padding-bottom:6px}
        .lanka-modal[open] .lanka-overlay{display:flex;position:absolute;top:0;left:0;right:0;bottom:0;background:#F5F8FA;z-index:90;padding:50px 10px 10px;flex-direction:column;gap:6px;overflow-y:auto}
        .btn-close-small{font-size:.65em;font-weight:bold;color:#FFF;background:#333;padding:3px 8px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
        .ios-time{font-family:'Times New Roman',Times,serif;font-size:4.5em;font-weight:bold;line-height:1;color:#FFF;text-align:center;letter-spacing:-1px;text-shadow:0 2px 8px rgba(0,0,0,.4)}
        .ios-date{font-size:.85em;font-weight:600;color:#FFF;text-align:center;margin-bottom:-5px;text-shadow:0 1px 4px rgba(0,0,0,.4)}
        .widget-row{display:flex;justify-content:center;align-items:center;gap:15px;margin-top:8px}
        .widget-mood{display:flex;flex-direction:column;justify-content:center;width:65px;color:#FFF;text-shadow:0 1px 2px rgba(0,0,0,.5)}
        .widget-clean{display:flex;align-items:center;gap:6px;color:#FFF;text-shadow:0 1px 3px rgba(0,0,0,.6)}
        .ios-noti{background:rgba(255,255,255,.15);backdrop-filter:blur(12px);border-radius:16px;padding:10px 12px;margin-bottom:6px;color:#FFF;border:1px solid rgba(255,255,255,.1);box-shadow:0 2px 10px rgba(0,0,0,.2)}
        .catchat-bubble-left{background:#FFF;color:#000;padding:8px 12px;border-radius:12px 12px 12px 0;max-width:80%;align-self:flex-start;font-size:.8em;box-shadow:0 1px 2px rgba(0,0,0,.1)}
        .catchat-bubble-right{background:#85E04A;color:#000;padding:8px 12px;border-radius:12px 12px 0 12px;max-width:80%;align-self:flex-end;font-size:.8em;box-shadow:0 1px 2px rgba(0,0,0,.1)}
        
        @keyframes icnis-sd{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        .icnis-lc-h,.icnis-ov{display:none}
        .icnis-dm[open] .icnis-lc-h{display:flex;position:absolute;top:18px;left:10px;right:10px;z-index:100;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.2);padding-bottom:6px}
        .icnis-dm[open] .icnis-ov{display:flex;position:absolute;top:0;left:0;right:0;bottom:0;z-index:90;padding:50px 10px 10px;flex-direction:column;gap:6px;overflow-y:auto;border-radius:20px}
        .icnis-back{font-size:.65em;font-weight:bold;color:#FFF;background:#333;padding:4px 10px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.5);cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
        @media (hover: hover) { .icnis-back:hover{background:#555} }
        .icnis-t{font-family:'Times New Roman',Times,serif;font-size:4.5em;font-weight:bold;line-height:1;color:#FFF;text-align:center;letter-spacing:-1px;text-shadow:0 2px 8px rgba(0,0,0,.4)}
        .icnis-d{font-size:.85em;font-weight:600;color:#FFF;text-align:center;margin-bottom:-5px;text-shadow:0 1px 4px rgba(0,0,0,.4)}
        .icnis-wr{display:flex;justify-content:center;align-items:center;gap:15px;margin-top:8px}
        .icnis-mood{display:flex;flex-direction:column;justify-content:center;width:65px;color:#FFF;text-shadow:0 1px 2px rgba(0,0,0,.5)}
        .icnis-wc{display:flex;align-items:center;gap:6px;color:#FFF;text-shadow:0 1px 3px rgba(0,0,0,.6)}
        .icnis-noti{background:rgba(255,255,255,.15);backdrop-filter:blur(12px);border-radius:16px;padding:10px 12px;margin-bottom:6px;color:#FFF;border:1px solid rgba(255,255,255,.1);box-shadow:0 2px 10px rgba(0,0,0,.2)}
        .icnis-bl{background:#FFF;color:#000;padding:8px 12px;border-radius:12px 12px 12px 0;max-width:80%;align-self:flex-start;font-size:.8em;box-shadow:0 1px 2px rgba(0,0,0,.1)}
        .icnis-br{background:#85E04A;color:#000;padding:8px 12px;border-radius:12px 12px 0 12px;max-width:80%;align-self:flex-end;font-size:.8em;box-shadow:0 1px 2px rgba(0,0,0,.1)}
    `;

    // ============================================================
    // ASYNC API PROCESSOR
    // ============================================================
    function esc(text) {
        if (!text) return text;
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

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
            console.error("ICNIS HUD API Error:", error);
            return '<div style="color:#ff4444;border:1px solid #ff4444;padding:10px;border-radius:8px;margin:10px 0;">[ICNIS HUD Offline: Could not connect to API]</div>';
        }
    }

    // --- HUD State Manager ---
    window._icnisHudHistory = window._icnisHudHistory || [];
    const MAX_EXPANDED_HUDS = 20;

    function manageHudStates(newId) {
        if (newId && !window._icnisHudHistory.includes(newId)) {
            window._icnisHudHistory.push(newId);
        }
        if (window._icnisHudHistory.length > MAX_EXPANDED_HUDS) {
            const old = window._icnisHudHistory.slice(0, window._icnisHudHistory.length - MAX_EXPANDED_HUDS);
            old.forEach(id => {
                const el = document.getElementById(id);
                if (el && el.classList.contains('icnis-expanded')) {
                    el.classList.remove('icnis-expanded');
                }
            });
            if (window._icnisHudHistory.length > 50) {
                window._icnisHudHistory = window._icnisHudHistory.slice(-50);
            }
        }
    }

    // --- Global Click Handler for Back Buttons ---
    document.addEventListener('click', function (e) {
        // .icnis-back → used by new Python output (details.icnis-dm)
        if (e.target.closest('.icnis-back')) {
            e.preventDefault();
            const details = e.target.closest('details.icnis-dm');
            if (details) { details.removeAttribute('open'); }
        }
        // .btn-close-small → legacy / older template
        if (e.target.closest('.btn-close-small')) {
            e.preventDefault();
            const details = e.target.closest('details.lanka-modal');
            if (details) { details.removeAttribute('open'); }
        }
    });

    // ============================================================
    // MODULE REGISTRATION
    // ============================================================
    if (window.CattaUI) {
        window.CattaUI.registerModule({
            id: "icnis_hud",
            name: "📱 ICNIS HUD (HUD + Phone)",
            desc: "(Tokens: 916) โดย ICNIS มี HUD และแอพมือถือ ระดับความสัมพันธ์ พร้อมแจ้งเตือนแอปโซเชียล",
            defaultState: false,
            promptKey: "prompt_icnis_hud",
            css: HUD_CSS,
            rules: [
                {
                    findRegex: "(:?::\\s*\\[ICNIS\\][\\s\\S]*?:::)",
                    replaceString: function (match) {
                        const token = localStorage.getItem('catta_auth_token');
                        const uid = localStorage.getItem('catta_uid');

                        if (!token || !uid) {
                            return '<div style="color:#ff4444;border:1px solid #ff4444;padding:10px;border-radius:8px;margin:10px 0;background:rgba(255,0,0,0.1);">[Catta Error: Please login to Catta first.]<br><br><b>Original Code:</b><br>' + esc(match) + '</div>';
                        }

                        const reqId = 'icnis-hud-loader-' + Math.random().toString(36).substring(2, 10);

                        setTimeout(async () => {
                            const node = document.getElementById(reqId);
                            if (!node) return;
                            const htmlResult = await processMessageText(match, uid, token);
                            const cleanHtml = window.CattaUI && window.CattaUI.utils && window.CattaUI.utils.purifyHtml
                                ? window.CattaUI.utils.purifyHtml(htmlResult)
                                : htmlResult;
                            node.outerHTML = cleanHtml;

                            const divMatch = htmlResult.match(/id="(icnis-hud-\d+)"/);
                            if (divMatch && divMatch[1]) {
                                const realId = divMatch[1];
                                setTimeout(() => {
                                    const newCard = document.getElementById(realId);
                                    if (newCard) {
                                        manageHudStates(realId);
                                    }
                                }, 50);
                            }
                        }, 50);

                        return '<div id="' + reqId + '" style="text-align:center;padding:15px;color:rgba(255,255,255,0.4);font-style:italic;border:1px dashed rgba(255,255,255,0.15);border-radius:12px;margin:8px 0;background:#0D0D0D;"><i class="fa-solid fa-spinner fa-spin"></i> Loading ICNIS HUD...</div>';
                    }
                }
            ]
        });
    }
})();
