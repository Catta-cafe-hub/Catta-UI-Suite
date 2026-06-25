(function () {
    // ============================================================
    // 🎵 BASIC MUSIC PLAYER (Hybrid Module via VPS API)
    // ============================================================

    const VPS_URL = 'https://st-cattacafe.casa/cattagram/api/parse_ui';

    // --- AUDIO ENGINE (Shared Core) ---
    window._cattaCurrentMediaId = window._cattaCurrentMediaId || null;
    window._cattaActiveBtn = window._cattaActiveBtn || null;

    if (!window._cattaAudioPlayer) {
        window._cattaAudioPlayer = new Audio();
        window._cattaAudioPlayer.volume = 0.5;
        window._cattaAudioPlayer.onended = function () {
            if (window._cattaActiveBtn) {
                window._cattaActiveBtn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 2px;"></i>';
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
            btn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 2px;"></i>';
            btn.classList.remove('playing');
            return;
        }

        if (window._cattaActiveBtn && window._cattaActiveBtn !== btn) {
            window._cattaActiveBtn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 2px;"></i>';
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

    const MUSIC_CSS = " \
    .catta-ios-music { box-sizing: border-box; display: flex; align-items: center; justify-content: center; width: fit-content; max-width: 85%; margin: 10px auto; padding: 4px 15px 4px 4px; background: rgba(150, 150, 150, 0.15); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border-radius: 25px; border: 1px solid rgba(255, 255, 255, 0.1); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15); } \
    .catta-ios-btn { width: 30px; height: 30px; border-radius: 50%; background: #ffffff; color: #1c1c1e; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; transition: transform 0.2s, background 0.2s; margin-right: 10px; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.2); user-select: none; } \
    .catta-ios-btn:active { transform: scale(0.9); } \
    .catta-ios-btn.playing { background: #000000; color: #ffffff; } \
    .catta-ios-title { font-size: 13px; font-weight: 500; color: #e5e5ea; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; letter-spacing: 0.2px; user-select: none; } \
    ";

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
            console.error("Basic Music API Error:", error);
            return '<div style="color:#ff9900; border:1px dashed #ff9900; padding:10px; border-radius:8px; margin:10px 0;">[Basic Music Error: ไม่สามารถเชื่อมต่อกับ VPS API ได้]</div>';
        }
    }

    // --- MODULE REGISTRATION ---
    if (window.CattaUI) {
        window.CattaUI.registerModule({
            id: "basic-music",
            name: "🎵 Basic Music Player",
            desc: "(Tokens: 0) เครื่องเล่นเพลงมินิมอล (รูปแบบใช้งาน ≣[music] ชื่อเพลง (ลิงก์.mp3) ≣)",
            defaultState: false,
            css: MUSIC_CSS,
            rules: [
                {

                    findRegex: "(≣\\s*\\[music\\]\\s*(.*?)\\s*\\(([^)]+)\\)\\s*≣)",
                    replaceString: function (match) {

                        if (document.getElementById('cattamusic-player-window') || document.getElementById('cattamusic-bubble')) {
                            return match;
                        }

                        const token = localStorage.getItem('catta_auth_token');
                        const uid = localStorage.getItem('catta_uid');

                        if (!token || !uid) {
                            return '<div style="color:#ff4444; border:1px solid #ff4444; padding:10px; border-radius:8px; margin:10px 0; background:rgba(255,0,0,0.1);">[Catta Error: Please login to Catta first.]<br><br><b>Original Code:</b><br>' + esc(match) + '</div>';
                        }

                        const reqId = 'basic-music-node-' + Math.random().toString(36).substring(2, 10);

                        setTimeout(async () => {
                            const node = document.getElementById(reqId);
                            if (!node) return;
                            const htmlResult = await processMessageText(match, uid, token);
                            const cleanHtmlResult = window.CattaUI && window.CattaUI.utils && window.CattaUI.utils.purifyHtml ? window.CattaUI.utils.purifyHtml(htmlResult) : htmlResult;
                            node.outerHTML = cleanHtmlResult;
                        }, 50);

                        return '<div id="' + reqId + '" class="catta-ios-music" style="color:#e5e5ea; font-style:italic;"><i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Loading Music...</div>';
                    }
                }
            ]
        });
    }
})();
