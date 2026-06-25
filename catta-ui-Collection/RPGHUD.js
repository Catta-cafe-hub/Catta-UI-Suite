(function () {
    const VPS_URL = 'https://st-cattacafe.casa/cattagram/api/parse_ui';

    // --- AUDIO ENGINE (Shared Core) ---
    window._cattaCurrentMediaId = window._cattaCurrentMediaId || null;
    window._cattaActiveBtn = window._cattaActiveBtn || null;

    if (!window.cattaToggleMusic) {
        window.cattaToggleMusic = function (btnElement, mediaId) {
            let audioEl = document.getElementById(mediaId);
            if (!audioEl) {
                console.error("CattaAudio: Cannot find audio element", mediaId);
                return;
            }

            if (window._cattaCurrentMediaId && window._cattaCurrentMediaId !== mediaId) {
                let oldAudio = document.getElementById(window._cattaCurrentMediaId);
                if (oldAudio) {
                    oldAudio.pause();
                    oldAudio.currentTime = 0;
                }
                if (window._cattaActiveBtn) {
                    window._cattaActiveBtn.innerHTML = '▶';
                    window._cattaActiveBtn.classList.remove('playing');
                }
            }

            if (audioEl.paused) {
                audioEl.play().catch(e => console.error("CattaAudio Play Error:", e));
                btnElement.innerHTML = '⏸';
                btnElement.classList.add('playing');
                window._cattaCurrentMediaId = mediaId;
                window._cattaActiveBtn = btnElement;
            } else {
                audioEl.pause();
                btnElement.innerHTML = '▶';
                btnElement.classList.remove('playing');
                window._cattaCurrentMediaId = null;
                window._cattaActiveBtn = null;
            }
        };
    }

    // --- ANTI-XSS & FORMATTING ENGINE ---
    function esc(text) {
        if (!text) return "";
        let clean = text.toString().replace(/<\/?q>/ig, "").replace(/&lt;\/?q&gt;/ig, "");
        clean = clean.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        return clean;
    }

    function registerRPGHUD() {
        if (!window.CattaUI) {
            setTimeout(registerRPGHUD, 500);
            return;
        }

        console.log("🎮 RPG HUD Suite: Initializing...");

        // ============================================================
        // 0. LOREBOOK DATA
        // ============================================================
        const LOREBOOK_RACES = [
            "Sunstrider Elf", "Drow", "Lich", "Vampire", "Beastkin",
            "Sylvan Elf", "Gargoyle", "Djinn", "Merfolk", "Frost Giant",
            "Dryad", "Shadow Demon", "Angel", "Lava Dwarf", "Yuki-Onna",
            "Automaton", "Harpy", "Lamia", "Kitsune", "Goblin", "Naga",
            "Minotaur", "Centaur", "Oni", "Slime", "Dragonborn",
            "Incubus", "Triton", "Lamassu", "Siren", "Tengu"
        ];

        const ELEMENTS_DATA = {
            "PSIONIC": { img: "https://file.garden/aaWjcAB_JUBaS4Ni/psionic.png", color: "#d946ef", emojis: ['🔮', '👁️', '✨', '💜'] },
            "NATURE": { img: "https://file.garden/aaWjcAB_JUBaS4Ni/nature.png", color: "#22c55e", emojis: ['🍃', '🌸', '🌿', '🦋'] },
            "FIRE": { img: "https://file.garden/aaWjcAB_JUBaS4Ni/fire.png", color: "#ef4444", emojis: ['🔥', '☄️', '💥', '✨'] },
            "WATER": { img: "https://file.garden/aaWjcAB_JUBaS4Ni/water.png", color: "#3b82f6", emojis: ['💧', '🌊', '🫧', '💙'] },
            "WIND": { img: "https://file.garden/aaWjcAB_JUBaS4Ni/wind.png", color: "#14b8a6", emojis: ['💨', '🌪️', '🎐', '🤍'] },
            "EARTH": { img: "https://file.garden/aaWjcAB_JUBaS4Ni/earth.png", color: "#d97706", emojis: ['🪨', '🍂', '⛰️', '🤎'] },
            "LIGHTNING": { img: "https://file.garden/aaWjcAB_JUBaS4Ni/lightning.png", color: "#eab308", emojis: ['⚡', '🌩️', '⚡', '💛'] },
            "LIGHT": { img: "https://file.garden/aaWjcAB_JUBaS4Ni/light.png", color: "#fef08a", emojis: ['✨', '🌟', '💫', '☀️'] },
            "DARK": { img: "https://file.garden/aaWjcAB_JUBaS4Ni/dark.png", color: "#a855f7", emojis: ['🌑', '🦇', '🌌', '🖤'] },
            "ICE": { img: "https://file.garden/aaWjcAB_JUBaS4Ni/ice.png", color: "#38bdf8", emojis: ['❄️', '🧊', '🌨️', '💙'] }
        };

        const GENDERS_DATA = {
            "ENIGMA": "https://file.garden/aaWjcAB_JUBaS4Ni/enigma.png",
            "ALPHA": "https://file.garden/aaWjcAB_JUBaS4Ni/alpha.png",
            "BETA": "https://file.garden/aaWjcAB_JUBaS4Ni/beta.png",
            "QUEEN OMEGA": "https://file.garden/aaWjcAB_JUBaS4Ni/queenOmega.png",
            "OMEGA": "https://file.garden/aaWjcAB_JUBaS4Ni/omega.png"
        };

        // ============================================================
        // 2. ACTIONS & MODALS 
        // ============================================================
        window.AcademyActions = {
            magicInterval: null,
            isMagicActive: false,
            combatState: null,
            latestData: null,

            // --- LOCAL STORAGE AVATAR SYSTEM ---
            getStoredAvatars: function () {
                try {
                    return JSON.parse(localStorage.getItem('catta_rpg_avatars')) || {};
                } catch (e) { return {}; }
            },
            saveStoredAvatars: function (dataObj) {
                localStorage.setItem('catta_rpg_avatars', JSON.stringify(dataObj));
            },
            getCustomAvatar: function (nameKey, fallbackUrl) {
                if (!nameKey) return fallbackUrl;
                const avatars = this.getStoredAvatars();
                return avatars[nameKey.toLowerCase()] || fallbackUrl;
            },
            setCustomAvatar: function (nameKey, newUrl) {
                if (!nameKey || !newUrl) return;
                const avatars = this.getStoredAvatars();
                avatars[nameKey.toLowerCase()] = newUrl.trim();
                this.saveStoredAvatars(avatars);
            },
            updateAllImagesBySelector: function (selectorPrefix, nameKey, newUrl) {
                const imgs = document.querySelectorAll(`img[data-avatar-key="${selectorPrefix}_${nameKey.toLowerCase()}"]`);
                imgs.forEach(img => { img.src = newUrl; });
                const bgs = document.querySelectorAll(`div[data-avatar-key="${selectorPrefix}_${nameKey.toLowerCase()}"]`);
                bgs.forEach(div => { div.style.backgroundImage = `url('${newUrl}')`; });
            },

            expandImage: function (src) {
                if (document.getElementById('aca-lightbox')) return;
                const box = document.createElement('div');
                box.id = 'aca-lightbox';
                box.style.cssText = `position: fixed !important; top: 0; left: 0; right: 0; bottom: 0; width: 100vw; height: 100vh; z-index: 999999; background: rgba(0, 0, 0, 0.95); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; cursor: zoom-out; animation: acaPopIn 0.2s;`;
                const img = document.createElement('img');
                img.src = src;
                img.style.cssText = `max-width: 95vw; max-height: 95vh; object-fit: contain; border-radius: 12px; box-shadow: 0 0 30px rgba(0,0,0,0.8); border: 2px solid #a855f7;`;
                box.onclick = () => { box.style.opacity = '0'; box.style.transition = 'opacity 0.2s'; setTimeout(() => box.remove(), 200); };
                box.appendChild(img);
                document.body.appendChild(box);
            },

            fillChatbox: function (msg) {
                const ta = document.getElementById('send_textarea');
                if (ta) {
                    ta.value = ta.value ? ta.value + '\n\n' + msg : msg;
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                    const toast = document.createElement('div');
                    toast.innerText = "✅ เตรียมข้อความในช่องพิมพ์แล้ว พิมพ์โรลเพลย์ต่อได้เลย!";
                    Object.assign(toast.style, {
                        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                        background: '#38bdf8', color: '#fff', padding: '10px 20px', borderRadius: '8px',
                        zIndex: '999999', fontFamily: 'Sarabun', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                    });
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 2500);
                }
            },

            copyPrompt: function (e, text) {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                if (!text || text === 'null') return;
                navigator.clipboard.writeText(text).then(() => {
                    const toast = document.createElement('div');
                    toast.innerText = "✅ คัดลอก Prompt แล้ว!";
                    Object.assign(toast.style, {
                        position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                        background: '#22c55e', color: '#fff', padding: '10px 20px', borderRadius: '8px',
                        zIndex: '999999', fontFamily: 'Sarabun', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                    });
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 2000);
                });
            },

            hatchEgg: function () {
                let randomRace = LOREBOOK_RACES[Math.floor(Math.random() * LOREBOOK_RACES.length)];
                let msg = `*(✨ {{user}} ใช้พลังเวทมนตร์ฟักไข่สำเร็จ! สิ่งที่ฟักออกมาคือสิ่งมีชีวิตเผ่าพันธุ์: **${randomRace}** ! โปรดบรรยายรูปลักษณ์แรกเกิดและปฏิกิริยาของมันทันที)*`;
                this.closeModal();
                this.fillChatbox(msg);
            },

            openPetUI: function (e, rawJson) {
                if (e) { e.preventDefault(); e.stopPropagation(); }

                // Try parsing data from button first, then fallback to latestData
                let data = null;
                if (rawJson) {
                    try { data = JSON.parse(decodeURIComponent(rawJson)); } catch (e) { }
                }
                if (data) this.latestData = data;

                if (!this.latestData) return alert("ข้อมูลยังไม่พร้อม ลองคุยกับบอทสักครั้งก่อน");

                const p = this.latestData.pet;
                const modal = document.getElementById('aca-modal-base');
                if (!modal) return;
                const contentEl = document.getElementById('aca-modal-content');

                const DEFAULT_PET_IMG = "https://file.garden/aZx9zS2e7UEiSmfr/egg.jpg";
                // Priority: localStorage custom > p.custom_img from server > default egg
                let petImgUrl = this.getCustomAvatar("pet_" + (p.name || "egg"), null);
                if (!petImgUrl) {
                    if (p.custom_img && p.custom_img.startsWith("http")) {
                        petImgUrl = p.custom_img;
                    } else {
                        petImgUrl = DEFAULT_PET_IMG;
                    }
                }

                const btn = (txt, actionCmd, icon, count, css) => `
                    <div class="aca-pet-btn catta-clickable" style="position:relative; ${css || ''}" data-action="academy-action" data-fn="petLogicAction" data-arg="${actionCmd}">
                        <div style="font-size:1.2em;">${icon}</div>
                        <div style="font-size:0.7em; font-weight:bold;">${txt}</div>
                        ${count !== undefined ? `<div style="position:absolute; top:-5px; right:-5px; background:#e91e63; color:white; font-size:0.6em; padding:2px 4px; border-radius:10px;">${count}</div>` : ''}
                    </div>`;

                const shopBtn = (txt, actionCmd, icon, isRare) => `
                    <div class="catta-clickable" style="background: ${isRare ? '#fff3e0' : '#f3e5f5'}; border: 1px solid ${isRare ? '#ffb74d' : '#ce93d8'}; border-radius: 8px; padding: 4px; text-align: center; cursor: pointer; font-size:0.75em;" data-action="academy-action" data-fn="petLogicAction" data-arg="${actionCmd}">
                        ${icon} ${txt} <br><b style="color:${isRare ? '#ef6c00' : '#8e24aa'}">${isRare ? '20' : '5'} 🪙</b>
                    </div>`;

                contentEl.innerHTML = `
                <div style="background: linear-gradient(135deg, #fff0f5, #f3e5f5); padding: 15px; border-radius: 20px; border: 3px solid #ffb7c5; width: 340px; color: #5c5470; font-family: 'Sarabun', sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.3); max-height:85vh; overflow-y:auto;">
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; background: #1A1B1E; color: #EAEAEA; padding: 5px 10px; border-radius: 8px;">
                        <span style="font-family:'Courier New'; font-size:0.8em; font-weight:bold; color:#FFD700;">🪙 ${p.coins || 0} G</span>
                        <span style="font-family:'Courier New'; font-size:0.8em;">St: <span style="color:#4CAF50;">${p.status || 'ALIVE'}</span></span>
                    </div>

                    <div style="display: flex; gap: 15px; align-items: flex-start; margin-bottom: 10px;">
                        <div style="position: relative;">
                            <div class="catta-clickable" style="width:70px; height:70px; border-radius:50%; border:3px solid #E91E63; overflow:hidden; cursor:pointer;" data-action="expand-image" data-src="${petImgUrl}"><img src="${petImgUrl}" style="width:100%; height:100%; object-fit:cover;"></div>
                            <div style="position: absolute; bottom: -5px; right: -5px; background: #fff; border-radius: 50%; padding: 2px; font-size: 1.2em;">${p.is_sick === 'TRUE' ? '🦠' : '✨'}</div>
                            <div class="catta-clickable" style="position: absolute; top: -5px; left: -5px; background: #8e24aa; color: white; border-radius: 50%; padding: 2px 4px; font-size: 0.6em; cursor: pointer; border: 1px solid #fff; box-shadow: 0 0 5px rgba(0,0,0,0.5);" title="เปลี่ยนรูปลิงก์ด้วยตัวเอง" data-action="academy-action" data-fn="petLogicAction" data-arg="change_img">🖼️</div>
                        </div>
                        <div style="flex-grow: 1; font-size: 0.8em;">
                            <div style="font-size: 1.3em; color: #d81b60; font-weight: bold;">${p.name || '???'}</div> 
                            <div style="font-size: 0.9em; color: #8e24aa;">${p.species || 'Egg'} <span style="font-size:0.8em;">(${p.growth || 0}%)</span></div>
                            <span style="background:#E1BEE7; color:#4A148C; padding:1px 4px; border-radius:4px; font-size:0.8em;">นิสัย: ${p.trait || '???'}</span>
                            
                            <div style="margin-top:5px; display:flex; justify-content:space-between;"><span>💖 รัก</span><span>${p.love || 0}%</span></div>
                            <div style="background:#fff; height:4px; border-radius:2px; margin-bottom:2px;"><div style="width:${p.love || 0}%; height:100%; background:#e91e63;"></div></div>
                            <div style="display:flex; justify-content:space-between;"><span>😊 สุข</span><span>${p.happiness || 0}%</span></div>
                            <div style="background:#fff; height:4px; border-radius:2px;"><div style="width:${p.happiness || 0}%; height:100%; background:#00BCD4;"></div></div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8em; margin-bottom: 10px; background: rgba(255,255,255,0.6); padding: 8px; border-radius: 8px;">
                        <div>🧡 หิว: ${p.hunger || 0}% <div style="height:4px; background:#FFE0B2;"><div style="width:${p.hunger || 0}%; height:100%; background:#FF9800;"></div></div></div>
                        <div>💙 พลัง: ${p.energy || 0}% <div style="height:4px; background:#BBDEFB;"><div style="width:${p.energy || 0}%; height:100%; background:#2196F3;"></div></div></div>
                        <div>💚 สะอาด: ${p.hygiene || 0}% <div style="height:4px; background:#C8E6C9;"><div style="width:${p.hygiene || 0}%; height:100%; background:#4CAF50;"></div></div></div>
                        <div>❤️ เลือด: ${p.health || 0}% <div style="height:4px; background:#FFCDD2;"><div style="width:${p.health || 0}%; height:100%; background:${p.is_sick === 'TRUE' ? '#9C27B0' : '#F44336'};"></div></div></div>
                    </div>

                    <div style="font-weight:bold; color:#D68B9A; font-size:0.85em; margin-bottom:4px; text-align:center;">🎯 ใช้ของธรรมดา</div>
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin-bottom:10px;">
                        ${btn('อาหาร', 'feed', '🍖', p.inv_food)}
                        ${btn('อาบน้ำ', 'bath', '🛁', p.inv_bath)}
                        ${btn('นอน', 'bed', '🛌', p.inv_bed)}
                        ${btn('เล่น', 'toy', '🧸', p.inv_toy)}
                        ${btn('รักษา', 'med', '💊', p.inv_med)}
                    </div>

                    <div style="font-weight:bold; color:#ef6c00; font-size:0.85em; margin-bottom:4px; text-align:center;">🌟 ใช้ของแรร์</div>
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin-bottom:10px;">
                        ${btn('สเต็ก', 'feed_R', '🍗', p.inv_food_R, 'border-color:#ffb74d;')}
                        ${btn('นมอาบ', 'bath_R', '🫧', p.inv_bath_R, 'border-color:#ffb74d;')}
                        ${btn('เตียง', 'bed_R', '🏰', p.inv_bed_R, 'border-color:#ffb74d;')}
                        ${btn('เกม', 'toy_R', '🎮', p.inv_toy_R, 'border-color:#ffb74d;')}
                        ${btn('ยาเทพ', 'med_R', '💉', p.inv_med_R, 'border-color:#ffb74d;')}
                    </div>

                    <div style="display:flex; justify-content:center; gap:10px; margin-bottom:15px; border-bottom:1px dashed #ccc; padding-bottom:10px;">
                        ${btn('ลูบหัว', 'pat', '👋', undefined)}
                        ${btn('กอด', 'hug', '🫂', undefined)}
                    </div>

                    <details>
                        <summary style="font-weight:bold; color:#8e24aa; text-align:center; outline:none; cursor:pointer;">🛒 เปิดร้านค้า (ซื้อของ)</summary>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; margin-top:10px;">
                            ${shopBtn('อาหาร(N)', 'buy_food', '🍖', false)}
                            ${shopBtn('สเต็ก(R)', 'buy_food_R', '🍗', true)}
                            ${shopBtn('สบู่(N)', 'buy_bath', '🛁', false)}
                            ${shopBtn('นมอาบ(R)', 'buy_bath_R', '🫧', true)}
                            ${shopBtn('ที่นอน(N)', 'buy_bed', '🛌', false)}
                            ${shopBtn('เตียง(R)', 'buy_bed_R', '🏰', true)}
                            ${shopBtn('ของเล่น(N)', 'buy_toy', '🧸', false)}
                            ${shopBtn('เกม(R)', 'buy_toy_R', '🎮', true)}
                            ${shopBtn('ยา(N)', 'buy_med', '💊', false)}
                            ${shopBtn('ยาเทพ(R)', 'buy_med_R', '💉', true)}
                        </div>
                    </details>
                </div>`;
                modal.classList.add('active');
            },

            buildPetMemLog: function (p) {
                let base = `[MEMLOG: Name=${p.name}, Age=${p.age}, Coin=${p.coins}, Trt=${p.trait}, Gen=${p.gender}, Spec=${p.species}, Stg=${p.stage}, Seed=${p.seed}, Grw=${p.growth}, H=${p.hunger}, E=${p.energy}, Hyg=${p.hygiene}, HP=${p.health}, Hap=${p.happiness}, Lov=${p.love}, Stat=${p.status}, Sick=${p.is_sick}, Sum=${p.is_summoned}, Date=${p.last_date}]`;
                let invN = `[INV_N: F=${p.inv_food}, B=${p.inv_bath}, M=${p.inv_med}, Slp=${p.inv_bed}, T=${p.inv_toy}]`;
                let invR = `[INV_R: F=${p.inv_food_R}, B=${p.inv_bath_R}, M=${p.inv_med_R}, Slp=${p.inv_bed_R}, T=${p.inv_toy_R}]`;
                return `${base}\n${invN}\n${invR}`;
            },

            petLogicAction: function (action) {
                if (!this.latestData) return;
                let p = this.latestData.pet;
                let currentDate = this.latestData.date || "ไม่ระบุ";

                if (p.status === "DEAD" || p.status === "GONE") {
                    this.closeModal();
                    this.fillChatbox(`*(System: สัตว์เลี้ยงจากไปแล้ว...)*`);
                    return;
                }

                let sysMsg = "";
                if (currentDate !== p.last_date && currentDate !== "ไม่ระบุ") {
                    p.age += 1; p.last_date = currentDate;
                    let dH = 5, dE = 5, dHyg = 5, dHap = 8;
                    if (p.trait === "ตะกละ") dH = 10;
                    if (p.trait === "ซุกซน") dHyg = 10;
                    if (p.trait === "ขี้เซา") dE = 10;
                    if (p.trait === "อ่อนไหว") dHap = 15;

                    p.hunger = Math.max(0, p.hunger - (Math.floor(Math.random() * 3) + dH));
                    p.energy = Math.max(0, p.energy - (Math.floor(Math.random() * 3) + dE));
                    p.hygiene = Math.max(0, p.hygiene - (Math.floor(Math.random() * 3) + dHyg));
                    p.growth = Math.min(100, p.growth + Math.floor(Math.random() * 4) + 1);

                    if (Math.random() * 100 <= (p.hygiene < 30 ? 30 : 5) && p.is_sick === "FALSE") p.is_sick = "TRUE";
                    if (p.is_sick === "TRUE") { p.health -= 10; p.happiness -= 5; }
                    else if (p.hunger < 20 || p.hygiene < 20) { p.health -= 5; }

                    if (p.inv_toy > 0 || p.inv_toy_R > 0) dHap = Math.floor(dHap / 2);
                    p.happiness -= dHap;

                    if (p.hunger <= 0 || p.energy <= 0 || p.hygiene <= 0 || p.health <= 0) p.status = "DEAD";
                    if (p.happiness <= 0 && p.status === "ALIVE") p.status = "GONE";
                    sysMsg += `[เวลาผ่านไป 1 วัน: สเตตัสลดลง, Growth +] `;
                }

                let actDesc = "";
                if (action === 'change_img') {
                    let newUrl = prompt("โปรดระบุ URL ลิงก์รูปภาพของสัตว์เลี้ยงคุณ (ควรขึ้นต้นด้วย http):");
                    if (newUrl !== null && newUrl.trim() !== "") {
                        this.setCustomAvatar("pet_" + (p.name || "egg"), newUrl.trim());
                        this.updateAllImagesBySelector("pet", p.name || "egg", newUrl.trim());
                        // Re-open modal to reflect new image immediately
                        this.openPetUI(null, null);
                    }
                    return;
                }

                if (action.startsWith('buy_') && !action.includes('_R')) {
                    if (p.coins < 5) return alert("เงิน (🪙) ไม่พอ!");
                    p.coins -= 5; actDesc = "ซื้อไอเทมธรรมดาสำเร็จ";
                    if (action === 'buy_food') p.inv_food++; if (action === 'buy_bath') p.inv_bath++;
                    if (action === 'buy_med') p.inv_med++; if (action === 'buy_bed') p.inv_bed++;
                    if (action === 'buy_toy') p.inv_toy++;
                }
                else if (action.startsWith('buy_') && action.includes('_R')) {
                    if (p.coins < 20) return alert("เงิน (🪙) ไม่พอ!");
                    p.coins -= 20; actDesc = "ซื้อไอเทมพิเศษ(Rare)สำเร็จ";
                    let type = action.replace('buy_', '').replace('_R', '');
                    if (type === 'food') p.inv_food_R++; if (type === 'bath') p.inv_bath_R++;
                    if (type === 'med') p.inv_med_R++; if (type === 'bed') p.inv_bed_R++;
                    if (type === 'toy') p.inv_toy_R++;
                }
                else if (action === 'feed') { if (p.inv_food <= 0) return alert("ไม่มีอาหารธรรมดา!"); p.inv_food--; p.hunger = Math.min(100, p.hunger + 25); actDesc = "ให้อาหารธรรมดา"; }
                else if (action === 'bath') { if (p.inv_bath <= 0) return alert("ไม่มีสบู่ธรรมดา!"); p.inv_bath--; p.hygiene = Math.min(100, p.hygiene + 25); actDesc = "อาบน้ำธรรมดา"; }
                else if (action === 'med') { if (p.inv_med <= 0) return alert("ไม่มียาธรรมดา!"); p.inv_med--; p.health = Math.min(100, p.health + 25); p.is_sick = "FALSE"; actDesc = "รักษาธรรมดา"; }
                else if (action === 'bed') { if (p.inv_bed <= 0) return alert("ไม่มีที่นอนธรรมดา!"); p.inv_bed--; p.energy = Math.min(100, p.energy + 25); actDesc = "พาเข้านอนธรรมดา"; }
                else if (action === 'toy') { if (p.inv_toy <= 0) return alert("ไม่มีของเล่นธรรมดา!"); p.inv_toy--; p.happiness = Math.min(100, p.happiness + 30); actDesc = "เล่นด้วยของเล่นธรรมดา"; }

                else if (action === 'feed_R') { if (p.inv_food_R <= 0) return alert("ไม่มีอาหารพิเศษ!"); p.inv_food_R--; p.hunger = Math.min(100, p.hunger + 75); actDesc = "ให้อาหารพิเศษหรูหรา"; }
                else if (action === 'bath_R') { if (p.inv_bath_R <= 0) return alert("ไม่มีสบู่พิเศษ!"); p.inv_bath_R--; p.hygiene = Math.min(100, p.hygiene + 75); actDesc = "อาบน้ำด้วยสบู่น้ำนมพิเศษ"; }
                else if (action === 'med_R') { if (p.inv_med_R <= 0) return alert("ไม่มียาพิเศษ!"); p.inv_med_R--; p.health = 100; p.is_sick = "FALSE"; actDesc = "รักษาด้วยยาระดับเทพ"; }
                else if (action === 'bed_R') { if (p.inv_bed_R <= 0) return alert("ไม่มีที่นอนพิเศษ!"); p.inv_bed_R--; p.energy = Math.min(100, p.energy + 75); actDesc = "พาเข้านอนในเตียงหรู"; }
                else if (action === 'toy_R') { if (p.inv_toy_R <= 0) return alert("ไม่มีของเล่นพิเศษ!"); p.inv_toy_R--; p.happiness = 100; actDesc = "เล่นด้วยของเล่นแรร์"; }

                else if (action === 'pat') { p.happiness = Math.min(100, p.happiness + 10); p.love = Math.min(100, p.love + 5); actDesc = "ลูบหัวด้วยความเอ็นดู"; }
                else if (action === 'hug') { p.happiness = Math.min(100, p.happiness + 15); p.love = Math.min(100, p.love + 10); actDesc = "สวมกอดแน่นๆ"; }

                sysMsg += `[ผู้เล่นทำการ: ${actDesc}] `;

                if (Math.random() * 100 <= 30) {
                    let cDrop = Math.floor(Math.random() * 5) + 1; p.coins += cDrop;
                    let items = ['food', 'bath', 'med', 'bed', 'toy'];
                    let rollItem = items[Math.floor(Math.random() * items.length)];
                    if (Math.random() * 100 <= 20) { p[`inv_${rollItem}_R`]++; sysMsg += `[ดรอปแรร์: ${rollItem}_R และได้เงิน ${cDrop} G] `; }
                    else { p[`inv_${rollItem}`]++; sysMsg += `[ดรอปธรรมดา: ${rollItem} และได้เงิน ${cDrop} G] `; }
                } else {
                    let cDrop = Math.floor(Math.random() * 3) + 1; p.coins += cDrop; sysMsg += `[ได้เงิน ${cDrop} G] `;
                }

                if (p.growth >= 100) {
                    if (p.stage === "Egg") {
                        p.stage = "Beast"; p.growth = 0;
                        p.species = LOREBOOK_RACES[Math.floor(Math.random() * LOREBOOK_RACES.length)];
                        sysMsg += `[✨ EVOLUTION!: ฟักออกจากไข่กลายเป็น ${p.species} ร่าง Beast] `;
                    } else if (p.stage === "Beast") {
                        p.stage = "Demihuman"; p.growth = 0;
                        p.gender = Math.random() > 0.5 ? "Boy" : "Girl";
                        sysMsg += `[✨ EVOLUTION!: กลายร่างเป็นมนุษย์ครึ่งสัตว์ (${p.gender})] `;
                    }
                }

                let finalPrompt = `*(System: ตรรกะสัตว์เลี้ยงอัปเดต -> ${sysMsg} | โปรดบรรยายรีแอคชั่นของสัตว์เลี้ยงแบบสั้นๆ และ **บังคับนำโค้ดด้านล่างนี้ไปวางท้ายข้อความของคุณโดยห้ามปรับแก้เด็ดขาด**)\n<div style="display:none;">\n${this.buildPetMemLog(p)}\n</div>*`;

                this.closeModal();
                this.fillChatbox(finalPrompt);
            },

            openStatusUI: function (e, rawJson) {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                const data = JSON.parse(decodeURIComponent(rawJson));
                const modal = document.getElementById('aca-modal-base');
                if (!modal) return;
                const contentEl = document.getElementById('aca-modal-content');

                let st = data.playerStats || { lv: 1, exp: 0, sp: 0, str: 5, agi: 5, int: 5, vit: 5 };
                let maxExp = st.lv * 100;
                let expPct = Math.min(100, (st.exp / maxExp) * 100);
                let canUpgrade = st.sp > 0;

                const statRow = (label, key, val, desc) => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:8px; margin-bottom:8px;">
                        <div>
                            <div style="font-weight:bold; color:#f8fafc;">${label} <span style="color:#38bdf8;">${val}</span></div>
                            <div style="font-size:0.7em; color:#94a3b8;">${desc}</div>
                        </div>
                        ${canUpgrade ? `<button class="aca-tool-btn catta-clickable" style="background:#22c55e; color:#fff; border:none; padding:5px 15px; font-weight:bold;" data-action="academy-action" data-fn="upgradeStat" data-arg="${key}">UP (+)</button>` : `<span style="color:#64748b; font-size:0.8em;">-</span>`}
                    </div>
                `;

                contentEl.innerHTML = `
                <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 20px; border-radius: 16px; border: 2px solid #38bdf8; width: 320px; color: #e2e8f0; font-family: 'Sarabun', sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <div style="font-size: 1.4em; font-weight: bold; color: #bae6fd;">📊 STATUS WINDOW</div>
                        <div style="font-size: 0.9em; color: #fcd34d;">Level ${st.lv}</div>
                    </div>
                    
                    <div style="background:rgba(0,0,0,0.4); padding:10px; border-radius:10px; margin-bottom:15px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.8em; margin-bottom:5px;">
                            <span style="color:#cbd5e1;">EXP</span> <span style="color:#38bdf8;">${st.exp} / ${maxExp}</span>
                        </div>
                        <div style="width:100%; height:8px; background:#1e293b; border-radius:4px; overflow:hidden;">
                            <div style="width:${expPct}%; height:100%; background:linear-gradient(90deg, #0ea5e9, #38bdf8); transition:0.3s;"></div>
                        </div>
                        ${st.exp >= maxExp ? `<button class="aca-tool-btn catta-clickable" style="width:100%; background:#22c55e; color:#fff; font-weight:bold; border:none; padding:8px; margin-top:10px; border-radius:8px; box-shadow:0 0 10px rgba(34,197,94,0.5); animation: acaPopIn 0.5s infinite alternate;" data-action="academy-action" data-fn="fillChatbox" data-arg="*(System: 🌟 {{user}} ทำการเลื่อนระดับ! โปรดอัปเดต [STAT:...] โดยปรับ LV เป็น ${st.lv + 1}, หัก EXP ออก ${maxExp} (เหลือ ${st.exp - maxExp}), และเพิ่ม SP อีก +5 ทันที)*">✨ กดเพื่อเลเวลอัพ!</button>` : ''}
                    </div>

                    <div style="text-align:center; font-size:0.9em; color:#fca5a5; font-weight:bold; margin-bottom:10px;">
                        แต้มคงเหลือ (SP): <span style="font-size:1.2em;">${st.sp}</span>
                    </div>

                    <div>
                        ${statRow('⚔️ STR (พละกำลัง)', 'STR', st.str, 'เพิ่มดาเมจกายภาพ / เลือดสูงสุด')}
                        ${statRow('⚡ AGI (ความเร็ว)', 'AGI', st.agi, 'เพิ่มความเร็ว / โอกาสหลบหลีก')}
                        ${statRow('🔮 INT (สติปัญญา)', 'INT', st.int, 'เพิ่มดาเมจเวท / มานาสูงสุด')}
                        ${statRow('🛡️ VIT (ความทนทาน)', 'VIT', st.vit, 'เพิ่มพลังป้องกัน / อึดขึ้น')}
                    </div>
                </div>`;
                modal.classList.add('active');
            },

            upgradeStat: function (statKey) {
                this.closeModal();
                let msg = `*(System: {{user}} ทำการฝึกฝนและใช้แต้ม SP อัปเกรดค่าสเตตัส **${statKey}** !)*\n*(รบกวนระบบ: โปรดหักลบ SP -1 และเพิ่มค่า ${statKey} +1 ใน [STAT:...] ทันที)*`;
                this.fillChatbox(msg);
            },

            openSkillUI: function (e, rawJson) {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                const data = JSON.parse(decodeURIComponent(rawJson));
                const modal = document.getElementById('aca-modal-base');
                if (!modal) return;
                const contentEl = document.getElementById('aca-modal-content');

                const BASE_SKILLS = {
                    "DPS": [{ icon: "💥", name: "Mana Burst", desc: "ระเบิดพลังเวทใส่ศัตรู" }, { icon: "⚔️", name: "Lethal Strike", desc: "เคลือบมานาโจมตีจุดตาย" }],
                    "TANK": [{ icon: "🛡️", name: "Aegis Shield", desc: "กางโล่ลดความเสียหาย" }, { icon: "💢", name: "Taunt", desc: "ยั่วยุศัตรู" }],
                    "SUPPORT": [{ icon: "💚", name: "Healing Light", desc: "ฟื้นฟูพลังชีวิต" }, { icon: "✨", name: "Blessing", desc: "บัฟเพิ่มพลังโจมตี/ป้องกัน" }],
                    "CONTROLLER": [{ icon: "🌀", name: "Mind Bind", desc: "ตรึงร่างศัตรู" }, { icon: "👁️", name: "Illusion", desc: "สร้างภาพลวงตา" }]
                };

                let pClass = (data.class || "").toUpperCase();
                let mySkills = [];

                if (pClass.includes("DPS") || pClass.includes("ATTACKER")) mySkills = [...BASE_SKILLS["DPS"]];
                else if (pClass.includes("TANK") || pClass.includes("DEFENDER")) mySkills = [...BASE_SKILLS["TANK"]];
                else if (pClass.includes("SUPPORT") || pClass.includes("HEALER")) mySkills = [...BASE_SKILLS["SUPPORT"]];
                else if (pClass.includes("CONTROL") || pClass.includes("SUMMON")) mySkills = [...BASE_SKILLS["CONTROLLER"]];

                if (data.learnedSkills && data.learnedSkills.length > 0) {
                    data.learnedSkills.forEach(sName => {
                        if (!mySkills.find(bs => bs.name === sName)) {
                            mySkills.push({ icon: "🌟", name: sName, desc: "สกิลระดับสูง (Custom)" });
                        }
                    });
                }

                let lv = data.playerStats ? data.playerStats.lv : 1;
                let nextSkillLv = Math.ceil((lv + 1) / 5) * 5;
                let canLearn = (lv % 5 === 0) && (lv > 0);

                let learnBtnHtml = "";
                if (canLearn) {
                    learnBtnHtml = `
                    <div style="background: linear-gradient(90deg, #7e22ce, #a855f7); padding: 15px; border-radius: 8px; margin-bottom: 15px; text-align: center; border: 1px solid #d8b4fe; box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); animation: acaPopIn 0.5s infinite alternate;">
                        <div style="font-weight:bold; color:#fff; font-size:1.1em; margin-bottom:5px;">🌟 ปลดล็อคสกิลใหม่! (Lv.${lv})</div>
                         <button class="aca-tool-btn catta-clickable" style="width:100%; background:#fff; color:#7e22ce; font-weight:bold; border:none; padding:8px;" 
                            data-action="academy-action" data-fn="fillChatbox" data-arg="*(System: ตอนนี้ฉันเลเวล ${lv} แล้ว! ช่วยแสดงตัวเลือกสกิลใหม่ 3 สาย (Attack/Defense/Utility) ที่เข้ากับคลาส ${data.class} และธาตุ ${data.element} ให้ฉันเลือกหน่อย)*">
                            ⚡ เข้าสู่สภาวะตื่นรู้ (เลือกสกิล)
                        </button>
                    </div>`;
                } else {
                    learnBtnHtml = `
                    <div style="text-align:center; font-size:0.8em; color:#64748b; margin-bottom:15px; padding:10px; background:rgba(0,0,0,0.2); border-radius:8px;">
                        🔒 สกิลถัดไปปลดล็อคเมื่อ: <span style="color:#facc15; font-weight:bold;">Lv.${nextSkillLv}</span>
                    </div>`;
                }

                let listHtml = mySkills.length > 0 ? mySkills.map(s => `
                    <div style="background:rgba(0,0,0,0.4); padding:10px; border-radius:8px; margin-bottom:10px; border-left:3px solid #facc15; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:bold; color:#f8fafc; font-size:1em;">${s.icon} ${s.name}</div>
                            <div style="font-size:0.75em; color:#cbd5e1;">${s.desc}</div>
                        </div>
                        <button class="aca-tool-btn catta-clickable" style="background:rgba(255,255,255,0.1); border:1px solid #facc15; color:#facc15;" data-action="academy-action" data-fn="fillChatbox" data-arg="*(ร่ายสกิล: ${s.name} !)*">ใช้</button>
                    </div>`).join('')
                    : `<div style="text-align:center; color:#94a3b8; padding:20px;">ยังไม่มีข้อมูลสกิล...</div>`;

                contentEl.innerHTML = `
                    <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 20px; border-radius: 16px; border: 2px solid #facc15; width: 320px; color: #e2e8f0; font-family: 'Sarabun', sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
                        <div style="text-align: center; margin-bottom: 15px;">
                            <div style="font-size: 1.4em; font-weight: bold; color: #fde047;">✨ SKILL GRIMOIRE</div>
                            <div style="font-size: 0.9em; color: #94a3b8;">Class: ${data.class} | Lv.${lv}</div>
                        </div>
                        ${learnBtnHtml}
                        <div style="max-height:300px; overflow-y:auto; padding-right:5px;">
                            ${listHtml}
                        </div>
                    </div>`;
                modal.classList.add('active');
            },

            // ⚔️ ADVANCED COMBAT ENGINE (ROCK PAPER SCISSORS)
            initCombat: function (monsterName, maxHp, attack, imgUrl, playerHp, playerMaxHp) {
                if (!monsterName || monsterName.toLowerCase() === 'none' || monsterName === 'ไม่มี' || monsterName.includes('MEMLOG')) return;

                if (imgUrl === 'AUTO' || !imgUrl || !imgUrl.startsWith("http")) {
                    // Fallback to Crest/Silhouette style (DiceBear shapes)
                    const safeName = encodeURIComponent(monsterName);
                    imgUrl = `https://api.dicebear.com/9.x/shapes/svg?seed=${safeName}&backgroundColor=0f0f0f,1a1a1a&shape1Color=b0bec5,ffffff,94a3b8&shape2Color=ef4444,b91c1c,991b1b&shape3Color=64748b,475569`;
                }

                let stats = this.latestData?.playerStats || { str: 10, agi: 10, int: 10, vit: 10 };
                let pClass = (this.latestData?.class || "Novice").toUpperCase();

                let eAtk = parseInt(attack) || 20;
                let eDef = Math.floor(eAtk / 4);
                let pAtk = (stats.str * 2) + Math.floor(stats.agi / 2);
                if (pClass.includes("MAGE") || pClass.includes("SUPPORT") || pClass.includes("CONTROL")) pAtk = (stats.int * 2);

                let pDef = Math.floor(stats.vit * 1.5);
                let pMaxMp = this.latestData?.maxMp || 100;
                let pMp = this.latestData?.mp || pMaxMp;

                this.combatState = {
                    enemy: { name: monsterName, hp: parseInt(maxHp) || 100, maxHp: parseInt(maxHp) || 100, atk: eAtk, def: eDef, img: imgUrl, exp: Math.floor(eAtk * 2.5), money: Math.floor(eAtk * 1.5) },
                    player: { hp: parseInt(playerHp) || 100, maxHp: parseInt(playerMaxHp) || 100, mp: pMp, maxMp: pMaxMp, atk: pAtk, def: pDef },
                    skillCooldown: 0,
                    log: `คุณเผชิญหน้ากับ ${monsterName}! เตรียมพร้อมต่อสู้!`
                };
                this.renderCombatUI();
            },

            showFloatingText: function (text, target) {
                const box = document.querySelector('.aca-combat-box');
                if (!box) return;
                const el = document.createElement('div');
                el.className = 'aca-damage-text';
                el.innerText = text;

                if (target === 'enemy') { el.style.color = '#ff3333'; el.style.left = (Math.random() * 20 + 40) + '%'; el.style.top = '25%'; }
                else if (target === 'heal') { el.style.color = '#4ade80'; el.style.left = '50%'; el.style.bottom = '30%'; }
                else { el.style.color = '#ff9933'; el.style.left = (Math.random() * 20 + 40) + '%'; el.style.bottom = '25%'; }

                box.appendChild(el);
                setTimeout(() => el.remove(), 1200);
            },

            renderCombatUI: function () {
                let cModal = document.getElementById('aca-combat-modal');
                if (!cModal) {
                    cModal = document.createElement('div');
                    cModal.id = 'aca-combat-modal';
                    cModal.className = 'aca-combat-overlay';
                    document.body.appendChild(cModal);
                }

                let s = this.combatState;
                if (!s) return;

                let enemyHpPct = Math.max(0, (s.enemy.hp / s.enemy.maxHp) * 100);
                let playerHpPct = Math.max(0, (s.player.hp / s.player.maxHp) * 100);
                let playerMpPct = Math.max(0, (s.player.mp / s.player.maxMp) * 100);
                let isGameOver = s.player.hp <= 0 || s.enemy.hp <= 0;

                let controlsHtml = "";
                if (!isGameOver) {
                    let skText = s.skillCooldown > 0 ? `รอ (${s.skillCooldown})` : `✨ ใช้สกิล (20 MP)`;
                    controlsHtml = `
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:15px;">
                            <button class="aca-cb-btn atk catta-clickable" data-action="academy-action" data-fn="combatTurn" data-arg="scissors">⚔️ โจมตี<br><span style="font-size:0.7em">(กรรไกร)</span></button>
                            <button class="aca-cb-btn def catta-clickable" data-action="academy-action" data-fn="combatTurn" data-arg="rock">🛡️ ป้องกัน<br><span style="font-size:0.7em">(ค้อน)</span></button>
                            <button class="aca-cb-btn cnt catta-clickable" data-action="academy-action" data-fn="combatTurn" data-arg="paper">⚡ สวนกลับ<br><span style="font-size:0.7em">(กระดาษ)</span></button>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:10px;">
                            <button class="aca-cb-btn aca-cb-skill-btn catta-clickable" ${s.skillCooldown > 0 || s.player.mp < 20 ? 'disabled' : ''} data-action="academy-action" data-fn="useCombatSkill">${skText}</button>
                            <button class="aca-cb-btn aca-cb-item-btn catta-clickable" data-action="academy-action" data-fn="useCombatItem">💊 ใช้ยาฟื้นฟู</button>
                            <button class="aca-cb-btn tame catta-clickable" data-action="academy-action" data-fn="combatTurn" data-arg="tame">💖 จับ (Tame)</button>
                        </div>
                    `;
                } else {
                    let resultText = s.enemy.hp <= 0 ? "🎉 ชัยชนะ! ศัตรูพ่ายแพ้" : "💀 พ่ายแพ้... ร่างกายบาดเจ็บสาหัส";
                    controlsHtml = `
                        <div style="text-align:center; margin-top:15px; font-size:1.2em; font-weight:bold; color:${s.enemy.hp <= 0 ? '#4ade80' : '#ff3366'}; animation: acaPopIn 0.5s;">${resultText}</div>
                        <button class="aca-cb-btn catta-clickable" style="width:100%; margin-top:15px; background:linear-gradient(90deg, #8b5cf6, #3b82f6); color:white;" data-action="academy-action" data-fn="endCombat">ยืนยันผลและรับรางวัล</button>
                    `;
                }

                cModal.innerHTML = `
                    <div class="aca-combat-box" style="background: linear-gradient(160deg, #0d051c 0%, #1a0530 25%, #0f0a1e 50%, #1c0a0a 75%, #0d051c 100%); border: 2px solid #a855f7; box-shadow: 0 0 40px rgba(168,85,247,0.3), inset 0 0 60px rgba(139,0,0,0.15);">
                        <div class="catta-clickable" style="position:absolute; top:10px; right:15px; cursor:pointer; font-size:1.5em; color:#ef4444; font-weight:bold; text-shadow:0 0 10px #ef4444; z-index:99;" data-action="academy-action" data-fn="forceCloseCombat">✖</div>
                        <div style="text-align:center; font-family:'Cinzel', serif; font-size:1.3em; color:#00e5ff; margin-bottom:15px; text-shadow: 0 0 10px #00e5ff;">
                            ⚔️ COMBAT ENCOUNTER ⚔️
                        </div>
                        <div style="text-align:center; margin-bottom:15px; position:relative;">
                            <img src="${s.enemy.img}" style="width:110px; height:110px; object-fit:cover; border-radius:12px; border:2px solid #ff3366; box-shadow:0 0 15px rgba(255,51,102,0.6); margin-bottom:10px;">
                            <div style="font-weight:bold; color:#fca5a5; font-size:1.2em;">${s.enemy.name}</div>
                            <div style="background:rgba(0,0,0,0.6); border-radius:8px; height:12px; overflow:hidden; margin:5px auto; width:80%;">
                                <div style="width:${enemyHpPct}%; height:100%; background:linear-gradient(90deg, #800030, #ff3366); transition:0.3s;"></div>
                            </div>
                            <div style="font-size:0.8em; color:#94a3b8;">HP: ${Math.max(0, s.enemy.hp)} / ${s.enemy.maxHp} | ATK: ${s.enemy.atk}</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:15px; border-left:3px solid #33ccff; backdrop-filter:blur(5px);">
                            <div style="display:flex; justify-content:space-between; font-size:0.8em; color:#bae6fd; margin-bottom:3px;">
                                <span>🛡️ ผู้เล่น (ATK: ${s.player.atk} | DEF: ${s.player.def})</span> <span>HP: ${Math.max(0, s.player.hp)}/${s.player.maxHp}</span>
                            </div>
                            <div style="background:rgba(0,0,0,0.6); border-radius:8px; height:8px; overflow:hidden; margin-bottom:6px;">
                                <div style="width:${playerHpPct}%; height:100%; background:linear-gradient(90deg, #800030, #ff3366); transition:0.3s;"></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:0.7em; color:#93c5fd; margin-bottom:3px;">
                                <span>🔹 มานา (MP)</span> <span>${Math.max(0, s.player.mp)}/${s.player.maxMp}</span>
                            </div>
                            <div style="background:rgba(0,0,0,0.6); border-radius:8px; height:6px; overflow:hidden;">
                                <div style="width:${playerMpPct}%; height:100%; background:linear-gradient(90deg, #00667d, #33ccff); transition:0.3s;"></div>
                            </div>
                        </div>
                        <div style="background:rgba(0,0,0,0.7); border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:10px; min-height:60px; font-size:0.85em; color:#e8dff5; line-height:1.5; text-align:center;">
                            ${s.log}
                        </div>
                        ${controlsHtml}
                    </div>
                `;
                cModal.classList.add('active');
            },

            combatTurn: function (playerChoice) {
                let s = this.combatState;
                if (s.player.hp <= 0 || s.enemy.hp <= 0) return;

                if (playerChoice === 'tame') {
                    let tameChance = (s.enemy.hp / s.enemy.maxHp) <= 0.3 ? 0.6 : 0.1;
                    if (Math.random() <= tameChance) {
                        s.enemy.hp = 0; s.isTamed = true;
                        s.log = `✨ จับมอนสเตอร์สำเร็จ! ${s.enemy.name} ยอมศิโรราบและกลายเป็นสัตว์เลี้ยงของคุณ!`;
                        this.renderCombatUI(); return;
                    } else {
                        let dmgToPlayer = Math.max(1, s.enemy.atk - s.player.def);
                        s.player.hp -= dmgToPlayer;
                        s.log = `⚠️ จับพลาด! ${s.enemy.name} ขัดขืนและโจมตีสวนกลับ! โดนดาเมจ ${dmgToPlayer}!`;
                        this.showFloatingText(`-${dmgToPlayer}`, 'player');
                        this.renderCombatUI(); return;
                    }
                }

                const choices = ['rock', 'paper', 'scissors'];
                const labels = { 'rock': 'ป้องกัน (ค้อน)', 'paper': 'สวนกลับ (กระดาษ)', 'scissors': 'โจมตี (กรรไกร)' };
                const compChoice = choices[Math.floor(Math.random() * 3)];

                let log = `คุณ: [${labels[playerChoice]}] vs ศัตรู:[${labels[compChoice]}]<br>`;
                let pDmg = 0; let eDmg = 0;

                if (playerChoice === compChoice) {
                    if (playerChoice === 'scissors') { if (s.player.atk > s.enemy.atk) pDmg = s.player.atk; else eDmg = s.enemy.atk; }
                    else { log += '🤝 เสมอกัน! ต่างฝ่ายต่างดูเชิง'; }
                }
                else if (playerChoice === 'paper' && compChoice === 'scissors') { eDmg = s.enemy.atk * 2; log += '💥 คุณโดน Counter!'; }
                else if (playerChoice === 'scissors' && compChoice === 'paper') { pDmg = s.player.atk * 1.5; log += '💥 โจมตีทะลุการสวนกลับ!'; }
                else if (playerChoice === 'paper' && compChoice === 'rock') { pDmg = s.player.atk; log += '⚡ สวนกลับการป้องกันได้สำเร็จ!'; }
                else if (playerChoice === 'rock' && compChoice === 'scissors') { log += '🛡️ คุณป้องกันสมบูรณ์แบบ!'; }
                else if (playerChoice === 'scissors' && compChoice === 'rock') { log += '🛡️ ศัตรูป้องกันสมบูรณ์แบบ!'; }
                else { eDmg = s.enemy.atk; }

                let finalPDmg = Math.max(0, pDmg - (playerChoice === 'paper' ? 0 : s.enemy.def));
                let finalEDmg = Math.max(0, eDmg - (compChoice === 'paper' ? 0 : s.player.def));

                if (finalPDmg > 0) { s.enemy.hp -= finalPDmg; log += `<br><span style="color:#4ade80">คุณทำดาเมจ ${finalPDmg}!</span>`; this.showFloatingText(`-${finalPDmg}`, 'enemy'); }
                if (finalEDmg > 0) { s.player.hp -= finalEDmg; log += `<br><span style="color:#ff3366">ศัตรูทำดาเมจ ${finalEDmg}!</span>`; this.showFloatingText(`-${finalEDmg}`, 'player'); }

                let pet = this.latestData?.pet;
                if (pet && pet.status === 'ALIVE' && pet.growth >= 50 && finalEDmg < s.player.maxHp) {
                    let petDmg = Math.floor(s.player.atk * 0.4);
                    s.enemy.hp -= petDmg;
                    log += `<br>🐾 ${pet.name} ช่วยโจมตีสร้างดาเมจ ${petDmg}!`;
                    setTimeout(() => this.showFloatingText(`-${petDmg}`, 'enemy'), 300);
                }

                if (s.skillCooldown > 0) s.skillCooldown--;
                s.log = log;
                this.renderCombatUI();
            },

            useCombatSkill: function () {
                let s = this.combatState;
                if (s.player.mp < 20 || s.skillCooldown > 0) return;

                s.player.mp -= 20;
                let dmg = Math.floor(s.player.atk * 1.8);
                s.enemy.hp -= dmg;
                s.skillCooldown = 3;

                s.log = `✨ คุณใช้สกิล! รวบรวมมานาและโจมตีอย่างรุนแรงสร้างความเสียหาย <span style="color:#f59e0b">${dmg}</span>!`;
                this.showFloatingText(`-${dmg}`, 'enemy');
                this.renderCombatUI();
            },

            useCombatItem: function () {
                let s = this.combatState;
                let healAmt = Math.floor(s.player.maxHp * 0.3);
                s.player.hp = Math.min(s.player.maxHp, s.player.hp + healAmt);
                s.log = `💊 คุณใช้ยาฟื้นฟู! พลังชีวิตฟื้นฟูขึ้น <span style="color:#4ade80">${healAmt}</span> HP!`;
                this.showFloatingText(`+${healAmt}`, 'heal');
                this.renderCombatUI();
            },

            endCombat: function () {
                let s = this.combatState;
                document.getElementById('aca-combat-modal').classList.remove('active');

                if (s.player.hp <= 0) {
                    this.fillChatbox(`*(System: {{user}} พ่ายแพ้ให้กับการต่อสู้กับ ${s.enemy.name}... ร่างกายบาดเจ็บสาหัส หมดสติลง พลังชีวิตเหลือ 0)*`);
                } else {
                    let money = s.enemy.money + Math.floor(Math.random() * 10);
                    let exp = s.enemy.exp;
                    let loot = Math.random() > 0.5 ? "Health Potion" : "Mana Potion";

                    let resultMsg = s.isTamed
                        ? `*(System: ศึกสิ้นสุด! {{user}} ใช้เวทจับมอนสเตอร์ ${s.enemy.name} ได้สำเร็จ! | ได้รับ EXP +${exp}, เงิน +${money} Zeny | เลือดคงเหลือ ${s.player.hp}/${s.player.maxHp})*`
                        : `*(System: ศึกสิ้นสุด! {{user}} เอาชนะ ${s.enemy.name} ได้สำเร็จ! | ได้รับ EXP +${exp}, เงิน +${money} Zeny, และได้รับ ${loot} 1 ชิ้น | เลือดคงเหลือ ${s.player.hp}/${s.player.maxHp})*`;

                    this.fillChatbox(resultMsg);
                }
            },

            forceCloseCombat: function () {
                document.getElementById('aca-combat-modal').classList.remove('active');
                this.fillChatbox(`*(System: {{user}} วิ่งหนีออกจากการต่อสู้ หรือยกเลิกฉากฉุกเฉิน)*\n*(รบกวนระบบ: อัปเดตบรรทัด Combat กลับเป็น Combat: ไม่มี ในเทิร์นถัดไปทันที)*`);
            },

            // --- UI ของ HUD ปกติ ---
            toggleBody: function (uid) {
                const body = document.getElementById('aca-body-' + uid);
                const btn = document.getElementById('aca-toggle-' + uid);
                if (body && btn) {
                    if (body.style.display === 'none') { body.style.display = 'block'; btn.innerText = '▼'; }
                    else { body.style.display = 'none'; btn.innerText = '◀'; }
                }
            },

            closeModal: function () {
                const el = document.getElementById('aca-modal-base');
                if (el) el.classList.remove('active');
            },

            // 🎉 SYSTEM: CELEBRATION
            confettiInterval: null,

            openCelebration: function (title, desc) {
                let modal = document.getElementById('aca-celeb-modal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'aca-celeb-modal';
                    modal.className = 'aca-celeb-overlay';
                    modal.innerHTML = `
                        <div id="aca-celeb-content" class="aca-celeb-box">
                            <div style="font-size:4em; margin-bottom:10px;">🏆</div>
                            <div id="aca-celeb-title" class="aca-celeb-title">CONGRATULATIONS</div>
                            <div id="aca-celeb-desc" class="aca-celeb-desc">รายละเอียด</div>
                            <div style="margin-top:20px;">
                                <button class="aca-celeb-btn catta-clickable" data-action="academy-action" data-fn="closeCelebration">รับทราบ!</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(modal);
                }
                document.getElementById('aca-celeb-title').innerText = title || "CONGRATULATIONS";
                document.getElementById('aca-celeb-desc').innerText = desc || "ขอแสดงความยินดี!";
                modal.classList.add('active');
                this.startConfetti();
            },

            closeCelebration: function () {
                const modal = document.getElementById('aca-celeb-modal');
                if (modal) modal.classList.remove('active');
                this.stopConfetti();
            },

            startConfetti: function () {
                this.stopConfetti();
                const colors = ['#f43f5e', '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#f97316'];
                const modal = document.getElementById('aca-celeb-modal');
                if (!modal) return;

                this.confettiInterval = setInterval(() => {
                    if (!modal.classList.contains('active')) return;
                    const el = document.createElement('div');
                    el.classList.add('aca-confetti');
                    el.style.left = Math.random() * 100 + 'vw';
                    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    el.style.animationDuration = (Math.random() * 2 + 2) + 's';
                    el.style.transform = `rotate(${Math.random() * 360}deg)`;
                    modal.appendChild(el);
                    setTimeout(() => el.remove(), 4000);
                }, 100);
            },

            stopConfetti: function () {
                if (this.confettiInterval) clearInterval(this.confettiInterval);
                const existing = document.querySelectorAll('.aca-confetti');
                existing.forEach(e => e.remove());
            },

            openModal: function (e, type, rawJson) {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                if (type === 'familiar') { this.openPetUI(e, rawJson); return; }

                try {
                    const data = JSON.parse(decodeURIComponent(rawJson));
                    const modal = document.getElementById('aca-modal-base');
                    if (!modal) return;
                    const contentEl = document.getElementById('aca-modal-content');

                    if (type === 'inventory') {
                        let invHtml = data.inventory.length > 0
                            ? data.inventory.map(i => `<div style="background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:6px; margin-bottom:5px; border-left:3px solid #a855f7;">🔹 ${i}</div>`).join('')
                            : `<div style="text-align:center; color:#64748b; padding:20px;">กระเป๋าว่างเปล่า...</div>`;
                        contentEl.innerHTML = `
                            <div style="background:#0f172a; padding:20px; border-radius:12px; border:2px solid #a855f7; width:300px; color:#e2e8f0; font-family:'Sarabun', sans-serif;">
                                <div style="text-align:center; font-size:1.2em; font-weight:bold; color:#d8b4fe; margin-bottom:15px; border-bottom:1px dashed #475569; padding-bottom:10px;">
                                    🎒 กระเป๋าสัมภาระ
                                </div>
                                <div style="max-height:300px; overflow-y:auto;">
                                    ${invHtml}
                                </div>
                            </div>
                        `;
                    }
                    else if (type === 'quest') {
                        let qHtml = data.quests.length > 0
                            ? data.quests.map(q => `
                                <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:8px; border-left:4px solid #f59e0b;">
                                    <div style="color:#fcd34d; font-weight:bold; font-size:1.1em;">📜 ${q.title}</div>
                                    <div style="font-size:0.85em; color:#cbd5e1; margin:5px 0;">${q.desc}</div>
                                    <div style="font-size:0.8em; color:#34d399;">🎁 รางวัล: ${q.reward}</div>
                                </div>`).join('')
                            : `<div style="text-align:center; color:#64748b; padding:20px;">ไม่มีภารกิจในขณะนี้...</div>`;

                        contentEl.innerHTML = `
                            <div style="background:#0f172a; padding:20px; border-radius:12px; border:2px solid #f59e0b; width:320px; color:#e2e8f0; font-family:'Sarabun', sans-serif;">
                                <div style="text-align:center; font-size:1.2em; font-weight:bold; color:#fcd34d; margin-bottom:15px; border-bottom:1px dashed #475569; padding-bottom:10px;">
                                    📜 ภารกิจปัจจุบัน
                                </div>
                                <div style="max-height:350px; overflow-y:auto;">
                                    ${qHtml}
                                </div>
                            </div>
                        `;
                    }
                    else if (type === 'schedule') {
                        contentEl.innerHTML = `
                            <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 20px; border-radius: 16px; border: 2px solid #38bdf8; width: 340px; color: #e2e8f0; font-family: 'Sarabun', sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
                                <div style="text-align: center; margin-bottom: 15px; border-bottom: 1px dashed #475569; padding-bottom: 10px;">
                                    <div style="font-size: 1.3em; font-weight: bold; color: #bae6fd;">📅 ตารางข้อมูลปัจจุบัน</div>
                                    <div style="font-size: 0.85em; color: #fcd34d;">"ข้อมูลจากเกมเพลย์"</div>
                                </div>
                                
                                <div style="max-height: 400px; overflow-y: auto; padding-right: 5px;">
                                    <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #fef08a;">
                                        <div style="font-size: 0.75em; color: #94a3b8; margin-bottom: 3px;">📖 สถานที่:</div>
                                        <div style="color: #fff; font-size: 0.9em; line-height: 1.5;">${data.location}</div>
                                    </div>
                                    <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; margin-bottom: 8px; border-left: 3px solid #f97316;">
                                        <div style="font-size: 0.75em; color: #94a3b8; margin-bottom: 3px;">เวลาปัจจุบัน:</div>
                                        <div style="color: #fff; font-size: 0.9em;">วันที่: ${data.date} | เวลา: ${data.time}</div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    else if (type === 'idcard') {
                        let elKey = data.element.toUpperCase();
                        let elData = ELEMENTS_DATA[elKey] || ELEMENTS_DATA["LIGHT"];
                        let genKey = (data.gender || "BETA").toUpperCase();
                        let genImg = GENDERS_DATA[genKey] || GENDERS_DATA["BETA"];

                        // ✅ ใช้ lowercase key ตรงกับที่ setCustomAvatar เก็บไว้
                        const storedAvatars = window.AcademyActions?.getStoredAvatars?.() || {};
                        const playerAvatar = storedAvatars['player_local_user'] || data.avatar;

                        contentEl.innerHTML = `
                        <div class="student-card-container">
                            <label class="flipper-label">
                                <input type="checkbox" class="flipper-toggle" style="display:none;">
                                <div class="flipper">
                                    <div class="front" style="border: 2px solid ${elData.color}; background: url('https://i.imgur.com/8QZ8GqA.gif') center/cover; padding: 20px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white;">
                                        <div style="position: absolute; top:0; left:0; right:0; bottom:0; background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.3)); border-radius: 18px;"></div>
                                        <div style="position: relative; z-index: 2;">
                                            <img src="https://file.garden/aaWjcAB_JUBaS4Ni/image-removebg-preview%20(62).png" style="width: 150px; opacity: 0.85; filter: drop-shadow(0 0 15px ${elData.color});">
                                            <div style="font-weight: bold; font-size: 1.5em; margin-top: 10px; letter-spacing: 2px; color: ${elData.color}; text-shadow: 0 0 10px ${elData.color}80;">
                                                บัตรประจำตัว
                                            </div>
                                            <div style="font-size: 0.8em; color: #cbd5e1; margin-top: 5px;">(คลิกเพื่อพลิกด้าน)</div>
                                        </div>
                                    </div>
                                    <div class="back" style="border: 2px solid ${elData.color}; background: #000; padding: 20px; color: #e2e8f0; display: flex; flex-direction: column; gap: 15px; border-radius: 20px; transform: rotateY(180deg);">
                                        <div style="position:relative; margin: 0 auto;">
                                            <div class="catta-clickable" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid ${elData.color}; padding: 4px; overflow:hidden; background: #111; box-shadow: 0 0 15px ${elData.color}80; cursor:pointer;" data-action="expand-image" data-src="${playerAvatar}">
                                                <img src="${playerAvatar}" data-avatar-key="player_local_user" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                                            </div>
                                            <div class="catta-clickable" style="position: absolute; top: -5px; right: -10px; background: #8e24aa; color: white; border-radius: 50%; padding: 4px 6px; font-size: 0.7em; cursor: pointer; border: 1px solid #fff; box-shadow: 0 0 5px rgba(0,0,0,0.5);" title="เปลี่ยนรูปโปรไฟล์ของคุณ" data-action="change-player-avatar">🖼️</div>
                                        </div>
                                        <div style="text-align:center; line-height: 1.3;">                                            <div style="font-weight: bold; font-size: 1.5em; color: ${elData.color};">${data.name.toUpperCase()}</div>
                                            <div style="font-size: 0.9em; color: #94a3b8;">ปี ${data.year} | คลาส: ${data.class}</div>
                                        </div>
                                        
                                        <div style="display:flex; justify-content:space-around; align-items:center; margin-top:10px;">
                                            <div style="text-align:center;">
                                                <div style="font-size: 0.6em; color: #94a3b8; margin-bottom: 5px; font-weight: bold;">ธาตุหลัก</div>
                                                <div style="position: relative; width:60px; height:60px; margin:0 auto;">
                                                    <img src="${elData.img}" style="height:100%; width:100%; object-fit:contain; position:relative; z-index:1; mix-blend-mode: screen;">
                                                    <div style="position:absolute; inset:0; border-radius:50%; background: radial-gradient(circle, transparent 35%, ${elData.color}99 100%); z-index:2; pointer-events:none;"></div>
                                                </div>
                                                <div style="font-size: 0.75em; color: ${elData.color}; font-weight:bold; margin-top:8px; text-shadow: 0 0 8px ${elData.color}80;">${elKey}</div>
                                            </div>
                                            <div style="text-align:center;">
                                                <div style="font-size: 0.6em; color: #94a3b8; margin-bottom: 5px; font-weight: bold;">เพศรอง</div>
                                                <div style="position: relative; width:60px; height:60px; margin:0 auto;">
                                                    <img src="${genImg}" style="height:100%; width:100%; object-fit:contain; position:relative; z-index:1; mix-blend-mode: screen;">
                                                    <div style="position:absolute; inset:0; border-radius:50%; background: radial-gradient(circle, transparent 35%, #a855f799 100%); z-index:2; pointer-events:none;"></div>
                                                </div>
                                                <div style="font-size: 0.75em; color: #d8b4fe; font-weight:bold; margin-top:8px;">${genKey}</div>
                                            </div>
                                        </div>

                                        <div style="margin-top:auto; text-align:center; position:relative; z-index:999;">
                                            <div id="aca-magic-btn" class="aca-tool-btn catta-clickable" style="box-shadow: 0 0 10px ${elData.color}60; padding:10px; font-weight:bold; font-size:1em; width:100%; box-sizing:border-box;" data-action="academy-action" data-fn="toggleMagicEffect" data-arg="${elKey}">✨ แสดงพลังเวทมนตร์ ✨</div>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>`;
                    }
                    modal.classList.add('active');
                } catch (e) { console.error("Modal Error:", e); }
            },

            toggleMagicEffect: function (e, elementKey) {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                const btn = document.getElementById("aca-magic-btn");
                const container = document.getElementById("aca-particle-layer");
                if (!container) return;

                if (this.isMagicActive) {
                    clearInterval(this.magicInterval);
                    container.innerHTML = '';
                    btn.innerText = "✨ แสดงพลังเวทมนตร์ ✨";
                    this.isMagicActive = false;
                } else {
                    btn.innerText = "⛔ ปิดพลังเวทมนตร์";
                    this.isMagicActive = true;

                    let emojis = ELEMENTS_DATA[elementKey]?.emojis || ['✨', '🌟', '💫', '⚡'];
                    this.magicInterval = setInterval(() => {
                        const particle = document.createElement('div');
                        particle.classList.add('aca-magic-particle');
                        particle.innerText = emojis[Math.floor(Math.random() * emojis.length)];
                        particle.style.left = Math.random() * 100 + 'vw';
                        particle.style.fontSize = (Math.random() * 15 + 10) + 'px';
                        particle.style.animationDuration = (Math.random() * 5 + 5) + 's';
                        container.appendChild(particle);
                        setTimeout(() => { particle.remove(); }, 15000);
                    }, 500);
                }
            },

            openYearbook: function (e, rawJson) {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                try {
                    const data = JSON.parse(decodeURIComponent(rawJson));
                    const modal = document.getElementById('aca-modal-base');
                    const contentEl = document.getElementById('aca-modal-content');

                    let ybHtml = "";
                    if (data.npcs.length > 0) {
                        ybHtml = data.npcs.map(npc => {
                            let promptCmd = (npc.prompt || "").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                            return `
                            <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 10px; display: flex; gap: 12px; margin-bottom: 10px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
                                <div style="position:relative; width:70px; height:85px; flex-shrink:0;">
                                    <div class="catta-clickable" style="width:100%; height:100%; background:#1e293b; border-radius:8px; overflow:hidden; border:2px solid #3b82f6; cursor:pointer;" data-action="expand-image" data-src="${npc.image}">
                                        <img src="${npc.image}" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                    <div class="catta-clickable" style="position: absolute; top: -5px; left: -5px; background: #8e24aa; color: white; border-radius: 50%; padding: 2px 4px; font-size: 0.6em; cursor: pointer; border: 1px solid #fff; box-shadow: 0 0 5px rgba(0,0,0,0.5);" title="เปลี่ยนรูป NPC" data-action="change-npc-avatar" data-npc="${npc.name}">🖼️</div>
                                </div>
                                <div style="flex-grow:1; display:flex; flex-direction:column; justify-content:space-between;">
                                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                        <div>
                                            <div style="font-weight:bold; color:#f8fafc; font-size:1.1em;">${npc.name}</div>
                                            <div style="font-size:0.8em; color:#d8b4fe;">♚ ${npc.gender}</div>
                                        </div>
                                        <div class="aca-tool-btn catta-clickable" style="background:rgba(34,197,94,0.2); border-color:#22c55e; color:#86efac;" data-action="copy-prompt" data-content="${promptCmd}">🎨 Prompt</div>
                                    </div>
                                    <div style="font-size:0.8em; color:#cbd5e1; margin-top:5px;">🤝 ${npc.relation}</div>
                                    <div style="margin-top:6px; font-size:0.8em; color:#fcd34d; font-style:italic; border-left:2px solid #fcd34d; padding-left:5px;">💬 "${npc.feelings}"</div>
                                </div>
                            </div>`;
                        }).join('');
                    } else {
                        ybHtml = `
                        <div style="text-align:center; padding:40px; color:#94a3b8;">
                            <div style="font-size:3em; margin-bottom:10px;">👻</div>
                            ยังไม่มีบันทึกบุคคลที่พบเจอในพื้นที่นี้...
                        </div>`;
                    }

                    contentEl.innerHTML = `
                        <div style="background:#1e293b; padding:20px; border-radius:16px; border:2px solid #8b5cf6; width:360px; color:#e2e8f0; font-family:'Sarabun', sans-serif; max-height:85vh; display:flex; flex-direction:column; box-shadow: 0 0 30px rgba(0,0,0,0.8);">
                            <div style="text-align:center; margin-bottom:15px; border-bottom:1px solid #4c1d95; padding-bottom:10px;">
                                <div style="font-size:1.4em; font-weight:bold; color:#e9d5ff;">📖 RPG Character Roster</div>
                                <div style="font-size:0.8em; color:#a78bfa;">บันทึกข้อมูลตัวละครและเพื่อนร่วมทาง</div>
                            </div>
                            <div style="overflow-y:auto; padding-right:5px; flex-grow:1;">
                                ${ybHtml}
                            </div>
                        </div>`;
                    modal.classList.add('active');
                } catch (e) { console.error("Yearbook Error:", e); }
            },

            changePlayerAvatar: function (e) {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                let newUrl = prompt("โปรดระบุ URL ลิงก์รูปภาพของตัวคุณ (ควรขึ้นต้นด้วย http):");
                if (newUrl && newUrl.trim() !== "") {
                    this.setCustomAvatar("player_LOCAL_USER", newUrl.trim());
                    this.updateAllImagesBySelector("player", "LOCAL_USER", newUrl.trim());
                }
            },

            changeNpcAvatar: function (e, npcName) {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                let newUrl = prompt(`โปรดระบุ URL ลิงก์รูปภาพสำหรับตัวละคร "${npcName}":`);
                if (newUrl && newUrl.trim() !== "") {
                    this.setCustomAvatar("npc_" + npcName, newUrl.trim());
                    this.updateAllImagesBySelector("npc", npcName, newUrl.trim());
                }
            }
        };

        const CSS = `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Sarabun:wght@400;700&family=Cinzel:wght@700&display=swap');

            #aca-global-layer { position: relative; z-index: 100; font-family: 'Sarabun', sans-serif; }
            #aca-particle-layer { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 99999; overflow: hidden; }
            
            .aca-magic-particle { position: absolute; top: -10vh; animation: acaFall linear forwards; opacity: 0.8; text-shadow: 0 0 5px rgba(255,255,255,0.5); }
            @keyframes acaFall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(110vh) rotate(360deg); opacity: 0; } }
            @keyframes acaPopIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

            .aca-tool-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px; font-size: 0.7em; color: #e2e8f0; cursor: pointer; transition: 0.2s; display: inline-block; vertical-align: middle; margin-left:4px; }
            .aca-tool-btn:hover { background: rgba(168,85,247,0.3); color: #fff; border-color: #a855f7; }
            
            .aca-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 100000; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: none; justify-content: center; align-items: center; font-family: 'Sarabun', sans-serif;}
            .aca-modal-overlay.active { display: flex !important; animation: hFadeIn 0.3s; }
            @keyframes hFadeIn { from { opacity: 0; } to { opacity: 1; } }
            
            .student-card-container { perspective: 1000px; width: 320px; height: 500px; position: relative;}
            .flipper-toggle { display: none; }
            .flipper { position: relative; width: 100%; height: 100%; transition: transform 0.8s cubic-bezier(0.4, 0.2, 0.2, 1); transform-style: preserve-3d; cursor: pointer; }
            .front, .back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 20px; box-sizing: border-box; }
            .front { z-index: 2; transform: rotateY(0deg); }
            .back { transform: rotateY(180deg); }
            .flipper-toggle:checked ~ .flipper { transform: rotateY(180deg); }

            .aca-npc-card { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 10px; display: flex; gap: 12px; margin-bottom: 10px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5); }

            /* Pet UI */
            .aca-pet-btn {
                background: #fff; border: 1px solid #FFB7C5; border-radius: 10px;
                padding: 8px 5px; text-align: center; cursor: pointer; color: #E91E63;
                transition: transform 0.1s, background 0.2s;
            }
            .aca-pet-btn:hover { background: #FFE5E9; transform: scale(1.05); }

            /* Combat UI */
            .aca-combat-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 999999; background: transparent; backdrop-filter: blur(5px); display: none; justify-content: center; align-items: center; font-family: 'Sarabun', sans-serif; }
            .aca-combat-overlay.active { display: flex !important; animation: hFadeIn 0.3s; }
            .aca-combat-box { background: #0d051c; border: 2px solid #a855f7; border-radius: 15px; padding: 20px; width: 90%; max-width: 400px; color: #e2e8f0; box-shadow: 0 0 30px #a855f7, inset 0 0 15px rgba(0,0,0,0.8); position: relative; z-index: 10; }
            .aca-cb-btn { background: rgba(0,0,0,0.5); border: 1px solid #64748b; color: #f8fafc; padding: 10px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-family: 'Sarabun', sans-serif; font-weight: bold; }
            .aca-cb-btn:hover { transform: scale(1.05); }
            .aca-cb-btn.atk { border-color: #ef4444; color: #fca5a5; } .aca-cb-btn.atk:hover { background: rgba(239,68,68,0.2); }
            .aca-cb-btn.def { border-color: #3b82f6; color: #bae6fd; } .aca-cb-btn.def:hover { background: rgba(59,130,246,0.2); }
            .aca-cb-btn.cnt { border-color: #eab308; color: #fef08a; } .aca-cb-btn.cnt:hover { background: rgba(234,179,8,0.2); }
            .aca-cb-btn.tame { border-color: #ec4899; color: #fbcfe8; } .aca-cb-btn.tame:hover { background: rgba(236,72,153,0.2); }

            /* CELEBRATION */
            .aca-celeb-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 200000; background: rgba(0,0,0,0.85); backdrop-filter: blur(5px); display: none; flex-direction: column; justify-content: center; align-items: center; font-family: 'Sarabun', sans-serif; overflow: hidden; }
            .aca-celeb-overlay.active { display: flex !important; animation: hFadeIn 0.5s; }
            .aca-celeb-box { padding: 40px; border-radius: 20px; text-align: center; width: 400px; background: linear-gradient(135deg, #fff, #fef9c3); border: 4px solid #facc15; }
            .aca-confetti { position: absolute; top: -20px; width: 10px; height: 20px; opacity: 0.8; animation: acaFall linear forwards; z-index: 1; pointer-events: none; }
            
            @keyframes acaFloatUpDmg { 0% { transform: translate(-50%, 0) scale(1); opacity: 1; } 100% { transform: translate(-50%, -60px) scale(1.3); opacity: 0; } }
            .aca-damage-text { position: absolute; font-size: 28px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8); pointer-events: none; z-index: 9999; animation: acaFloatUpDmg 1.2s ease-out forwards; }
        `;

        // Check and inject global HTML layers
        if (!document.getElementById('aca-global-layer')) {
            const layer = document.createElement('div'); layer.id = 'aca-global-layer'; document.body.appendChild(layer);
            const pLayer = document.createElement('div'); pLayer.id = 'aca-particle-layer'; document.body.appendChild(pLayer);
            const modal = document.createElement('div');
            modal.innerHTML = `<div id="aca-modal-base" class="aca-modal-overlay catta-clickable" data-action="academy-action" data-fn="closeModal"><div id="aca-modal-content"></div></div>`;
            // ป้องกัน click bubble ขึ้น overlay จาก modal content
            setTimeout(() => {
                const mc = document.getElementById('aca-modal-content');
                if (mc) mc.addEventListener('click', e => e.stopPropagation());
            }, 0);
            document.body.appendChild(modal.firstElementChild);
        }

        window.CattaUI.registerModule({
            id: "rpghud_module_v1",
            name: "⚔️ RPG HUD",
            desc: "(Tokens: 859) หน้าจอแสดงผลสเตตัสผู้เล่น - ระบบสัตว์เลี้ยง - ระบบต่อสู้มอนสเตอร์",
            defaultState: false,
            promptKey: "inject_PromptRPG",
            css: CSS,
            rules: [
                {
                    // FIX: Using the exact Regex format and replaceString function style as universal_hud.js
                    findRegex: "(:?::\\s*\\[HUDRPG\\][\\s\\S]*?:::)",
                    replaceString: function (match) {
                        const reqId = "rpghud_loading_" + Math.random().toString(36).substr(2, 9);
                        const rawText = match;

                        const payload = { raw_text: rawText, source: "rpghud" };

                        const uid = localStorage.getItem('catta_uid') || '';
                        const token = localStorage.getItem('catta_auth_token') || '';

                        fetch(VPS_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-uid': uid,
                                'x-token': token
                            },
                            body: JSON.stringify(payload)
                        })
                            .then(res => res.json())
                            .then(data => {
                                const el = document.getElementById(reqId);
                                if (el) {
                                    if (data.success && data.html) {
                                        // INTERCEPT HTML AND REPLACE AVATARS FROM LOCAL STORAGE
                                        let tempHtml = data.html;
                                        let parser = new DOMParser();
                                        let doc = parser.parseFromString(tempHtml, 'text/html');

                                        const avatars = window.AcademyActions.getStoredAvatars();

                                        // Replace all images that have a matching data-avatar-key
                                        const allAvatarImgs = doc.querySelectorAll('img[data-avatar-key]');
                                        allAvatarImgs.forEach(img => {
                                            // ✅ ใช้ toLowerCase() เพื่อ match key ที่เก็บใน localStorage
                                            const key = img.getAttribute('data-avatar-key').toLowerCase();
                                            if (avatars[key]) {
                                                img.src = avatars[key];
                                            }
                                        });

                                        // Replace all background images that have a matching data-avatar-key (for ID cards etc)
                                        const allAvatarDivs = doc.querySelectorAll('div[data-avatar-key]');
                                        allAvatarDivs.forEach(div => {
                                            // ✅ ใช้ toLowerCase() เพื่อ match key ที่เก็บใน localStorage
                                            const key = div.getAttribute('data-avatar-key').toLowerCase();
                                            if (avatars[key]) {
                                                div.style.backgroundImage = `url('${avatars[key]}')`;
                                            }
                                        });

                                        const finalHtml = doc.body.innerHTML;
                                        el.outerHTML = window.CattaUI && window.CattaUI.utils && window.CattaUI.utils.purifyHtml ? window.CattaUI.utils.purifyHtml(finalHtml) : finalHtml;

                                        // Trigger Combat UI if combat JSON was returned
                                        if (data.combat_json && data.combat_json !== "null") {
                                            try {
                                                const cb = JSON.parse(data.combat_json);
                                                setTimeout(() => {
                                                    const cModal = document.getElementById('aca-combat-modal');
                                                    if (!cModal || !cModal.classList.contains('active')) {
                                                        window.AcademyActions.initCombat(cb.name, cb.hp, cb.atk, cb.img, cb.playerHp, cb.playerMaxHp);
                                                    }
                                                }, 1000);
                                            } catch (e) { console.error("Combat init error:", e); }
                                        }
                                    } else {
                                        el.outerHTML = `<div style="color:red; font-size:0.8em; border:1px solid red; padding:5px;">[HUD Render Error: Parsing failed]</div>`;
                                    }
                                }
                            })
                            .catch(err => {
                                const el = document.getElementById(reqId);
                                if (el) el.innerHTML = `<span style="color:red;">API Connection Error</span>`;
                            });

                        return `<div id="${reqId}" style="text-align:center; padding:20px; color:#a855f7;"><i class="fa-solid fa-spinner fa-spin"></i> Loading Interactive RPG HUD...</div>`;
                    }
                }
            ]
        });
    }

    registerRPGHUD();
})();
