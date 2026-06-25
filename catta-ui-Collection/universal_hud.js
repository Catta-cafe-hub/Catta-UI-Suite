(function () {
    const VPS_URL = 'https://st-cattacafe.casa/cattagram/api/parse_ui';
    const MODULE_ID = "catta_universal_hud_v1";

    function esc(text) {
        if (!text) return "";
        return String(text).replace(/<\/?q>/gi, '').replace(/&lt;\/?q&gt;/gi, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ============================================================
    // LANGUAGE DICTIONARY
    // ============================================================
    const UI_DICT = {
        'copy_done': { th: '📋 คัดลอกคำสั่งแล้ว! วางส่งในแชทได้เลย', en: '📋 Copied! Paste to send in chat', zh: '📋 已复制！粘贴并发送到聊天' },
        'inv_title': { th: '🏆 คลังสมบัติและทรัพย์สิน', en: '🏆 Inventory & Assets', zh: '🏆 宝库与资产' },
        'no_inv': { th: '(ยังไม่มีสมบัติสะสม)', en: '(No items collected)', zh: '(暂无收藏)' },
        'lovers_title': { th: '💕 ความสัมพันธ์เชิงลึก', en: '💕 Deep Relationships', zh: '💕 亲密关系' },
        'intimacy': { th: 'ระดับความสนิท:', en: 'Intimacy Level:', zh: '亲密度:' },
        'no_lovers': { th: 'ยังไม่มีผู้ใดครองใจท่าน...', en: 'No one has captured your heart yet...', zh: '还没有人俘获你的心...' },
        'status_title': { th: '🧘 สถานะร่างกาย', en: '🧘 Physical Status', zh: '🧘 身体状态' },
        'current_pos': { th: 'ตำแหน่งปัจจุบัน', en: 'Current Position', zh: '当前位置' },
        'hunger': { th: '🍖 ความอิ่ม', en: '🍖 Hunger', zh: '🍖 饱食度' },
        'hygiene': { th: '✨ สะอาด', en: '✨ Hygiene', zh: '✨ 清洁度' },
        'energy': { th: '💤 พักผ่อน', en: '💤 Energy', zh: '💤 休息' },
        'preg_status': { th: '👶 สถานะครรภ์:', en: '👶 Pregnancy:', zh: '👶 怀孕状态:' },
        'pregnant': { th: '<span style="color:#ff4081; font-weight:bold;">ตั้งครรภ์ 👶</span>', en: '<span style="color:#ff4081; font-weight:bold;">Pregnant 👶</span>', zh: '<span style="color:#ff4081; font-weight:bold;">怀孕 👶</span>' },
        'normal': { th: '<span style="color:#888;">ปกติ</span>', en: '<span style="color:#888;">Normal</span>', zh: '<span style="color:#888;">正常</span>' },
        'emp_title': { th: '🐲 บันทึกความชอบเป้าหมายหลัก', en: '🐲 Main Target Preferences', zh: '🐲 主要目标喜好' },
        'likes': { th: 'สิ่งที่ชอบ', en: 'Likes', zh: '喜欢' },
        'hates': { th: 'สิ่งที่เกลียด', en: 'Hates', zh: '讨厌' },
        'skill_title': { th: '🎨 ทักษะความสามารถ', en: '🎨 Skills & Abilities', zh: '🎨 技能与能力' },
        'train': { th: '⚔️ ฝึกฝน', en: '⚔️ Train', zh: '⚔️ 训练' },
        'train_cmd': { th: '[Action: ฝึกฝนทักษะ \'{val}\'] ข้าตั้งจิตให้มั่นและเริ่มฝึกฝน...', en: '[Action: Train skill \'{val}\'] I focus my mind and start training...', zh: '[Action: 训练技能 \'{val}\'] 我集中精神开始训练...' },
        'no_skill': { th: 'ไม่มีทักษะ', en: 'No skills', zh: '没有技能' },
        'promo_title': { th: '📜 ประกาศเลื่อนขั้น', en: '📜 Promotion Notice', zh: '📜 晋升通知' },
        'appoint': { th: 'แต่งตั้ง:', en: 'Appointed as:', zh: '任命为:' },
        'rewards': { th: '🎁 รางวัลที่ได้รับ:', en: '🎁 Rewards Received:', zh: '🎁 获得奖励:' },
        'req_outfit': { th: '👗 สร้างภาพลักษณ์เครื่องแต่งกายประจำตำแหน่งใหม่:', en: '👗 Request new official attire image:', zh: '👗 申请新的官方服装图片:' },
        'req_btn': { th: 'ร้องขอชุดประจำตำแหน่งจากระบบ', en: 'Request Official Attire', zh: '申请官方服装' },
        'req_note': { th: '*ระบบจะดึงข้อมูลเครื่องแต่งกายจาก Lorebook ตามยศใหม่ของท่าน*', en: '*System fetches attire data from Lorebook based on your new rank*', zh: '*系统将根据您的新等级从 Lorebook 获取服装数据*' },
        'quest_title': { th: '📜 ภารกิจใหม่!', en: '📜 New Quest!', zh: '📜 新任务！' },
        'q_level': { th: 'ระดับ:', en: 'Level:', zh: '等级:' },
        'q_cost': { th: '🔥 จ่าย/ความต้องการ:', en: '🔥 Cost/Requirement:', zh: '🔥 消耗/需求:' },
        'q_reward': { th: '🎁 รางวัล:', en: '🎁 Reward:', zh: '🎁 奖励:' },
        'q_time': { th: '⏳ เวลา:', en: '⏳ Time:', zh: '⏳ 时间:' },
        'q_note': { th: '(พิมพ์ตอบโต้เพื่อเริ่มหรือปฏิเสธภารกิจ)', en: '(Type a reply to start or decline the quest)', zh: '(回复以开始或拒绝任务)' },
        'q_success': { th: 'ภารกิจสำเร็จ!', en: 'Quest Success!', zh: '任务成功！' },
        'q_fail': { th: 'ภารกิจล้มเหลว', en: 'Quest Failed', zh: '任务失败' },
        'q_check': { th: '*ตรวจเช็คกระเป๋าหรือสถานะของท่าน*', en: '*Check your inventory or status*', zh: '*检查您的背包或状态*' },
        'letter_title': { th: '✉️ จดหมายลับ', en: '✉️ Secret Letter', zh: '✉️ 密信' },
        'alert_title': { th: '⚠️ เตือนภัย', en: '⚠️ Alert', zh: '⚠️ 警告' },
        'd_hygiene': { th: '🤢 สกปรก', en: '🤢 Dirty', zh: '🤢 肮脏' },
        'd_health': { th: '🩸 บาดเจ็บ', en: '🩸 Injured', zh: '🩸 受伤' },
        'd_energy': { th: '⚡ หมดแรง', en: '⚡ Exhausted', zh: '⚡ 精疲力竭' },
        'd_hunger': { th: '🍖 หิวโหย', en: '🍖 Starving', zh: '🍖 饥饿' },
        'fx_ambient': { th: '🌗 แสงเงา', en: '🌗 Ambient', zh: '🌗 光影' }
    };

    function t(key) {
        let lang = localStorage.getItem('catta_univ_lang') || 'th';
        return UI_DICT[key] ? (UI_DICT[key][lang] || UI_DICT[key].th) : key;
    }

    // ============================================================
    // SHARED AUDIO ENGINE (Compatible with Basic/Catta Music)
    // ============================================================
    window._cattaCurrentMediaId = window._cattaCurrentMediaId || null;
    window._cattaActiveBtn = window._cattaActiveBtn || null;

    if (!window._cattaAudioPlayer) {
        window._cattaAudioPlayer = new Audio();
        window._cattaAudioPlayer.volume = 0.5;
        window._cattaAudioPlayer.onended = function () {
            if (window._cattaActiveBtn) {
                window._cattaActiveBtn.dataset.playing = 'false';
                window._cattaActiveBtn.style.background = 'rgba(255, 255, 255, 0.1)';
                window._cattaActiveBtn.style.color = '#d4af37';
                window._cattaActiveBtn.innerHTML = '🎵';
                window._cattaActiveBtn = null;
            }
        };
    }

    window.cattaToggleMusic = function (btn) {
        if (event && event.preventDefault) { event.preventDefault(); event.stopPropagation(); }

        const mediaUrl = 'https://files.catbox.moe/2f2osb.mp3';
        const isSameSong = (window._cattaCurrentMediaId === mediaUrl);

        if (window.cattaPauseMainMusic) {
            window.cattaPauseMainMusic();
        }

        if (isSameSong && !window._cattaAudioPlayer.paused && window._cattaActiveBtn === btn) {
            window._cattaAudioPlayer.pause();
            btn.dataset.playing = 'false';
            btn.style.background = 'rgba(255, 255, 255, 0.1)';
            btn.style.color = '#d4af37';
            btn.innerHTML = '🎵';
            return;
        }

        if (window._cattaActiveBtn && window._cattaActiveBtn !== btn) {
            if (window._cattaActiveBtn.classList && window._cattaActiveBtn.classList.contains('catta-ios-btn')) {
                window._cattaActiveBtn.innerHTML = '<i class="fa-solid fa-play" style="margin-left: 2px;"></i>';
                window._cattaActiveBtn.classList.remove('playing');
            } else {
                window._cattaActiveBtn.dataset.playing = 'false';
                window._cattaActiveBtn.style.background = 'rgba(255, 255, 255, 0.1)';
                window._cattaActiveBtn.style.color = '#d4af37';
                window._cattaActiveBtn.innerHTML = '🎵';
            }
            window._cattaAudioPlayer.pause();
        }

        window._cattaCurrentMediaId = mediaUrl;
        if (!isSameSong || window._cattaAudioPlayer.src !== mediaUrl) {
            window._cattaAudioPlayer.src = mediaUrl;
            window._cattaAudioPlayer.loop = true;
        }
        window._cattaAudioPlayer.play().catch(e => console.error("Audio Error:", e));

        btn.dataset.playing = 'true';
        btn.style.background = '#d4af37';
        btn.style.color = '#000';
        btn.innerHTML = '⏸️';
        window._cattaActiveBtn = btn;
    };

    // ============================================================
    // GLOBAL ACTIONS & UI LOGIC
    // ============================================================
    const DB_COLLECTION = {
        "Harem_F": {
            "empress": { th: "ฮองเฮา", salary: "1,000 ตำลึงทอง", imgPrompt: "1girl, majestic chinese empress, wearing elaborate bright yellow and gold embroidered silk hanfu, heavy golden phoenix crown with dangling pearls, red lips, regal makeup, sitting on a dragon throne, highly detailed, masterpiece, 8k resolution" },
            "ฮองเฮา": { th: "ฮองเฮา", salary: "1,000 ตำลึงทอง", imgPrompt: "1girl, majestic chinese empress, wearing elaborate bright yellow and gold embroidered silk hanfu, heavy golden phoenix crown with dangling pearls, red lips, regal makeup, sitting on a dragon throne, highly detailed, masterpiece, 8k resolution" },
            "皇后": { th: "ฮองเฮา", salary: "1,000 ตำลึงทอง", imgPrompt: "1girl, majestic chinese empress, wearing elaborate bright yellow and gold embroidered silk hanfu, heavy golden phoenix crown with dangling pearls, red lips, regal makeup, sitting on a dragon throne, highly detailed, masterpiece, 8k resolution" },

            "imperial noble consort": { th: "ฮวงกุ้ยเฟย", salary: "800 ตำลึง", imgPrompt: "1girl, stunning imperial noble consort, wearing rich dark purple and gold silk hanfu, elegant ruby and gold hairpins, graceful posture, standing in an imperial garden, highly detailed, masterpiece, 8k" },
            "ฮวงกุ้ยเฟย": { th: "ฮวงกุ้ยเฟย", salary: "800 ตำลึง", imgPrompt: "1girl, stunning imperial noble consort, wearing rich dark purple and gold silk hanfu, elegant ruby and gold hairpins, graceful posture, standing in an imperial garden, highly detailed, masterpiece, 8k" },
            "皇贵妃": { th: "ฮวงกุ้ยเฟย", salary: "800 ตำลึง", imgPrompt: "1girl, stunning imperial noble consort, wearing rich dark purple and gold silk hanfu, elegant ruby and gold hairpins, graceful posture, standing in an imperial garden, highly detailed, masterpiece, 8k" },

            "noble consort": { th: "กุ้ยเฟย", salary: "600 ตำลึง", imgPrompt: "1girl, elegant noble consort, wearing vibrant red and silver embroidered hanfu, jade hair ornaments, serene expression, beautiful chinese palace background, highly detailed, masterpiece" },
            "กุ้ยเฟย": { th: "กุ้ยเฟย", salary: "600 ตำลึง", imgPrompt: "1girl, elegant noble consort, wearing vibrant red and silver embroidered hanfu, jade hair ornaments, serene expression, beautiful chinese palace background, highly detailed, masterpiece" },
            "贵妃": { th: "กุ้ยเฟย", salary: "600 ตำลึง", imgPrompt: "1girl, elegant noble consort, wearing vibrant red and silver embroidered hanfu, jade hair ornaments, serene expression, beautiful chinese palace background, highly detailed, masterpiece" },

            "consort": { th: "เฟย", salary: "300 ตำลึง", imgPrompt: "1girl, beautiful consort, wearing flowing pink and blue silk hanfu, silver hairpins with pearls, holding a silk fan, palace courtyard, highly detailed, 8k" },
            "เฟย": { th: "เฟย", salary: "300 ตำลึง", imgPrompt: "1girl, beautiful consort, wearing flowing pink and blue silk hanfu, silver hairpins with pearls, holding a silk fan, palace courtyard, highly detailed, 8k" },
            "妃": { th: "เฟย", salary: "300 ตำลึง", imgPrompt: "1girl, beautiful consort, wearing flowing pink and blue silk hanfu, silver hairpins with pearls, holding a silk fan, palace courtyard, highly detailed, 8k" },

            "concubine": { th: "ผิน", salary: "200 ตำลึง", imgPrompt: "1girl, lovely concubine, wearing light green and peach hanfu, simple jade hairpin, standing by a lotus pond, highly detailed, beautiful lighting" },
            "ผิน": { th: "ผิน", salary: "200 ตำลึง", imgPrompt: "1girl, lovely concubine, wearing light green and peach hanfu, simple jade hairpin, standing by a lotus pond, highly detailed, beautiful lighting" },
            "嫔": { th: "ผิน", salary: "200 ตำลึง", imgPrompt: "1girl, lovely concubine, wearing light green and peach hanfu, simple jade hairpin, standing by a lotus pond, highly detailed, beautiful lighting" },

            "noble lady": { th: "กุ้ยเหริน", salary: "100 ตำลึง", imgPrompt: "1girl, pretty noble lady, wearing soft blue hanfu with floral patterns, minimal jewelry, gentle smile, bamboo grove background, highly detailed" },
            "กุ้ยเหริน": { th: "กุ้ยเหริน", salary: "100 ตำลึง", imgPrompt: "1girl, pretty noble lady, wearing soft blue hanfu with floral patterns, minimal jewelry, gentle smile, bamboo grove background, highly detailed" },
            "贵人": { th: "กุ้ยเหริน", salary: "100 ตำลึง", imgPrompt: "1girl, pretty noble lady, wearing soft blue hanfu with floral patterns, minimal jewelry, gentle smile, bamboo grove background, highly detailed" },

            "first class attendant": { th: "ฉางไจ้", salary: "50 ตำลึง", imgPrompt: "1girl, cute first class attendant, wearing simple yellow and white hanfu, single flower hairpin, palace corridor background, masterpiece" },
            "changzai": { th: "ฉางไจ้", salary: "50 ตำลึง", imgPrompt: "1girl, cute first class attendant, wearing simple yellow and white hanfu, single flower hairpin, palace corridor background, masterpiece" },
            "ฉางไจ้": { th: "ฉางไจ้", salary: "50 ตำลึง", imgPrompt: "1girl, cute first class attendant, wearing simple yellow and white hanfu, single flower hairpin, palace corridor background, masterpiece" },
            "常在": { th: "ฉางไจ้", salary: "50 ตำลึง", imgPrompt: "1girl, cute first class attendant, wearing simple yellow and white hanfu, single flower hairpin, palace corridor background, masterpiece" },

            "second class attendant": { th: "ตาอิ้ง", salary: "30 ตำลึง", imgPrompt: "1girl, modest attendant, wearing plain light pink hanfu, no makeup, simple hair bun, courtyard background, detailed" },
            "daying": { th: "ตาอิ้ง", salary: "30 ตำลึง", imgPrompt: "1girl, modest attendant, wearing plain light pink hanfu, no makeup, simple hair bun, courtyard background, detailed" },
            "ตาอิ้ง": { th: "ตาอิ้ง", salary: "30 ตำลึง", imgPrompt: "1girl, modest attendant, wearing plain light pink hanfu, no makeup, simple hair bun, courtyard background, detailed" },
            "答应": { th: "ตาอิ้ง", salary: "30 ตำลึง", imgPrompt: "1girl, modest attendant, wearing plain light pink hanfu, no makeup, simple hair bun, courtyard background, detailed" },

            "maid": { th: "นางกำนัล", salary: "4 ตำลึง", imgPrompt: "1girl, palace maid, wearing uniform green and brown hanfu, hair in double buns, carrying a wooden tray, highly detailed" },
            "นางกำนัล": { th: "นางกำนัล", salary: "4 ตำลึง", imgPrompt: "1girl, palace maid, wearing uniform green and brown hanfu, hair in double buns, carrying a wooden tray, highly detailed" },
            "宫女": { th: "นางกำนัล", salary: "4 ตำลึง", imgPrompt: "1girl, palace maid, wearing uniform green and brown hanfu, hair in double buns, carrying a wooden tray, highly detailed" }
        },
        "Harem_M": {
            "fengjun": { th: "เฟิ่งจวิน (จักรพรรดินีชาย)", salary: "1,000 ตำลึงทอง", imgPrompt: "1boy, handsome male empress, wearing majestic black and gold embroidered silk robes, heavy golden crown, regal posture, sitting on a throne, highly detailed, masterpiece, 8k resolution" },
            "เฟิ่งจวิน": { th: "เฟิ่งจวิน", salary: "1,000 ตำลึงทอง", imgPrompt: "1boy, handsome male empress, wearing majestic black and gold embroidered silk robes, heavy golden crown, regal posture, sitting on a throne, highly detailed, masterpiece, 8k resolution" },
            "empress": { th: "เฟิ่งจวิน", salary: "1,000 ตำลึงทอง", imgPrompt: "1boy, handsome male empress, wearing majestic black and gold embroidered silk robes, heavy golden crown, regal posture, sitting on a throne, highly detailed, masterpiece, 8k resolution" },
            "凤君": { th: "เฟิ่งจวิน", salary: "1,000 ตำลึงทอง", imgPrompt: "1boy, handsome male empress, wearing majestic black and gold embroidered silk robes, heavy golden crown, regal posture, sitting on a throne, highly detailed, masterpiece, 8k resolution" },

            "guijun": { th: "กุ้ยจวิน (พระสนมเอก)", salary: "600 ตำลึง", imgPrompt: "1boy, elegant noble consort, wearing rich dark blue and silver robes, jade hair ornament, holding a fan, standing in a royal garden, highly detailed, masterpiece, 8k" },
            "กุ้ยจวิน": { th: "กุ้ยจวิน", salary: "600 ตำลึง", imgPrompt: "1boy, elegant noble consort, wearing rich dark blue and silver robes, jade hair ornament, holding a fan, standing in a royal garden, highly detailed, masterpiece, 8k" },
            "noble lord": { th: "กุ้ยจวิน", salary: "600 ตำลึง", imgPrompt: "1boy, elegant noble consort, wearing rich dark blue and silver robes, jade hair ornament, holding a fan, standing in a royal garden, highly detailed, masterpiece, 8k" },
            "贵君": { th: "กุ้ยจวิน", salary: "600 ตำลึง", imgPrompt: "1boy, elegant noble consort, wearing rich dark blue and silver robes, jade hair ornament, holding a fan, standing in a royal garden, highly detailed, masterpiece, 8k" },

            "jun": { th: "จวิน (สนม)", salary: "300 ตำลึง", imgPrompt: "1boy, beautiful consort, wearing flowing white and light blue robes, silver hairpin, serene expression, palace courtyard, highly detailed, 8k" },
            "จวิน": { th: "จวิน", salary: "300 ตำลึง", imgPrompt: "1boy, beautiful consort, wearing flowing white and light blue robes, silver hairpin, serene expression, palace courtyard, highly detailed, 8k" },
            "lord": { th: "จวิน", salary: "300 ตำลึง", imgPrompt: "1boy, beautiful consort, wearing flowing white and light blue robes, silver hairpin, serene expression, palace courtyard, highly detailed, 8k" },
            "君": { th: "จวิน", salary: "300 ตำลึง", imgPrompt: "1boy, beautiful consort, wearing flowing white and light blue robes, silver hairpin, serene expression, palace courtyard, highly detailed, 8k" },

            "shiqin": { th: "ซื่อฉิน (นายบำเรอ)", salary: "50 ตำลึง", imgPrompt: "1boy, handsome attendant, wearing simple light green robes, minimal accessories, gentle smile, bamboo grove background, highly detailed" },
            "ซื่อฉิน": { th: "ซื่อฉิน", salary: "50 ตำลึง", imgPrompt: "1boy, handsome attendant, wearing simple light green robes, minimal accessories, gentle smile, bamboo grove background, highly detailed" },
            "attendant": { th: "ซื่อฉิน", salary: "50 ตำลึง", imgPrompt: "1boy, handsome attendant, wearing simple light green robes, minimal accessories, gentle smile, bamboo grove background, highly detailed" },
            "侍寝": { th: "ซื่อฉิน", salary: "50 ตำลึง", imgPrompt: "1boy, handsome attendant, wearing simple light green robes, minimal accessories, gentle smile, bamboo grove background, highly detailed" },

            "servant": { th: "บ่าวรับใช้", salary: "4 ตำลึง", imgPrompt: "1boy, palace servant, wearing plain brown uniform robes, hair tied back, carrying a lantern, courtyard background, detailed" },
            "บ่าวรับใช้": { th: "บ่าวรับใช้", salary: "4 ตำลึง", imgPrompt: "1boy, palace servant, wearing plain brown uniform robes, hair tied back, carrying a lantern, courtyard background, detailed" },
            "仆人": { th: "บ่าวรับใช้", salary: "4 ตำลึง", imgPrompt: "1boy, palace servant, wearing plain brown uniform robes, hair tied back, carrying a lantern, courtyard background, detailed" }
        },
        "Manor": {
            "main wife": { th: "ฮูหยินเอก", salary: "คุมกุญแจคลัง", imgPrompt: "1girl, elegant main wife, wearing luxurious red and gold hanfu, elaborate gold and jade hairpins, dignified expression, sitting in a grand manor hall, masterpiece, highly detailed, 8k" },
            "ฮูหยินเอก": { th: "ฮูหยินเอก", salary: "คุมกุญแจคลัง", imgPrompt: "1girl, elegant main wife, wearing luxurious red and gold hanfu, elaborate gold and jade hairpins, dignified expression, sitting in a grand manor hall, masterpiece, highly detailed, 8k" },
            "正妻": { th: "ฮูหยินเอก", salary: "คุมกุญแจคลัง", imgPrompt: "1girl, elegant main wife, wearing luxurious red and gold hanfu, elaborate gold and jade hairpins, dignified expression, sitting in a grand manor hall, masterpiece, highly detailed, 8k" },
            "大夫人": { th: "ฮูหยินเอก", salary: "คุมกุญแจคลัง", imgPrompt: "1girl, elegant main wife, wearing luxurious red and gold hanfu, elaborate gold and jade hairpins, dignified expression, sitting in a grand manor hall, masterpiece, highly detailed, 8k" },

            "secondary wife": { th: "ฮูหยินรอง", salary: "300 ตำลึง", imgPrompt: "1girl, beautiful secondary wife, wearing rich pink and silver hanfu, delicate silver hair ornaments, holding a silk fan, manor garden background, highly detailed, masterpiece" },
            "ฮูหยินรอง": { th: "ฮูหยินรอง", salary: "300 ตำลึง", imgPrompt: "1girl, beautiful secondary wife, wearing rich pink and silver hanfu, delicate silver hair ornaments, holding a silk fan, manor garden background, highly detailed, masterpiece" },
            "平妻": { th: "ฮูหยินรอง", salary: "300 ตำลึง", imgPrompt: "1girl, beautiful secondary wife, wearing rich pink and silver hanfu, delicate silver hair ornaments, holding a silk fan, manor garden background, highly detailed, masterpiece" },
            "二夫人": { th: "ฮูหยินรอง", salary: "300 ตำลึง", imgPrompt: "1girl, beautiful secondary wife, wearing rich pink and silver hanfu, delicate silver hair ornaments, holding a silk fan, manor garden background, highly detailed, masterpiece" },

            "concubine": { th: "อนุภรรยา", salary: "100 ตำลึง", imgPrompt: "1girl, lovely concubine, wearing light blue and white hanfu, simple jade hairpin, standing by a lotus pond in a manor, highly detailed" },
            "อนุภรรยา": { th: "อนุภรรยา", salary: "100 ตำลึง", imgPrompt: "1girl, lovely concubine, wearing light blue and white hanfu, simple jade hairpin, standing by a lotus pond in a manor, highly detailed" },
            "妾": { th: "อนุภรรยา", salary: "100 ตำลึง", imgPrompt: "1girl, lovely concubine, wearing light blue and white hanfu, simple jade hairpin, standing by a lotus pond in a manor, highly detailed" },
            "姨娘": { th: "อนุภรรยา", salary: "100 ตำลึง", imgPrompt: "1girl, lovely concubine, wearing light blue and white hanfu, simple jade hairpin, standing by a lotus pond in a manor, highly detailed" },

            "maid": { th: "สาวใช้", salary: "2 ตำลึง", imgPrompt: "1girl, manor maid, wearing plain green and beige hanfu, hair in double buns, carrying a tea set, manor corridor, detailed" },
            "สาวใช้": { th: "สาวใช้", salary: "2 ตำลึง", imgPrompt: "1girl, manor maid, wearing plain green and beige hanfu, hair in double buns, carrying a tea set, manor corridor, detailed" },
            "丫鬟": { th: "สาวใช้", salary: "2 ตำลึง", imgPrompt: "1girl, manor maid, wearing plain green and beige hanfu, hair in double buns, carrying a tea set, manor corridor, detailed" }
        }
    };

    window.HaremActions = {
        toggleLang: function () {
            let langs = ['th', 'en', 'zh'];
            let current = localStorage.getItem('catta_univ_lang') || 'th';
            let nextIdx = (langs.indexOf(current) + 1) % langs.length;
            let nextLang = langs[nextIdx];
            localStorage.setItem('catta_univ_lang', nextLang);
            window.HaremActions.applyLang(nextLang);

            const modal = document.getElementById('harem-modal-base');
            if (modal && modal.classList.contains('active')) {
                const type = modal.getAttribute('data-active-type');
                const rawJson = modal.getAttribute('data-active-json');
                if (type && rawJson) window.HaremActions.openModal(type, rawJson);
            }
        },
        applyLang: function (lang) {
            document.querySelectorAll('.hud-i18n').forEach(el => {
                if (el.dataset[lang]) el.innerHTML = el.dataset[lang];
            });

            document.querySelectorAll('.h-lang-btn').forEach(el => {
                el.innerHTML = '🌐 ' + lang.toUpperCase();
            });

            document.querySelectorAll('.hud-i18n-music').forEach(el => {
                let isPlaying = el.dataset.playing === 'true';
                if (lang === 'en') el.innerHTML = isPlaying ? '⏸️' : '🎵';
                else if (lang === 'zh') el.innerHTML = isPlaying ? '⏸️' : '🎵';
                else el.innerHTML = isPlaying ? '⏸️' : '🎵';
            });
        },
        closeModal: function () {
            const el = document.getElementById('harem-modal-base');
            if (el) {
                el.classList.remove('active');
                el.removeAttribute('data-active-type');
                el.removeAttribute('data-active-json');
            }
        },
        toggleBody: function (uid) {
            const b = document.getElementById('h-body-' + uid);
            const btn = document.getElementById('h-toggle-' + uid);
            if (b && btn) {
                if (b.classList.contains('collapsed')) { b.classList.remove('collapsed'); btn.innerText = '▼'; }
                else { b.classList.add('collapsed'); btn.innerText = '◀'; }
            }
        },
        copyFromBtn: function (btn) {
            const txt = btn.dataset.content; if (!txt) return;
            navigator.clipboard.writeText(txt).then(() => {
                const toast = document.createElement('div'); toast.innerHTML = t('copy_done');
                Object.assign(toast.style, { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(20,20,20,0.95)', color: '#ffd700', padding: '20px', borderRadius: '12px', zIndex: '999999999', pointerEvents: 'none', border: '2px solid #d4af37' });
                document.body.appendChild(toast); setTimeout(() => toast.remove(), 2500);
            });
        },
        toggleParticles: function (btn) {
            let state = localStorage.getItem('catta_univ_particles') || 'on';
            if (state === 'on') {
                localStorage.setItem('catta_univ_particles', 'off');
                const pLayer = document.getElementById('harem-global-layer');
                if (pLayer) {
                    pLayer.innerHTML = '';
                    pLayer.setAttribute('data-active-season', '');
                }
            } else {
                localStorage.setItem('catta_univ_particles', 'on');
            }
            let pState = localStorage.getItem('catta_univ_particles');
            document.querySelectorAll('.fx-toggle-btn').forEach(b => {
                b.style.color = pState === 'on' ? '#ffd700' : '#888';
            });
        },
        toggleAmbient: function (btn) {
            let state = localStorage.getItem('catta_univ_ambient') || 'on';
            if (state === 'on') {
                localStorage.setItem('catta_univ_ambient', 'off');
            } else {
                localStorage.setItem('catta_univ_ambient', 'on');
            }
            let aState = localStorage.getItem('catta_univ_ambient');
            document.querySelectorAll('.ambient-toggle-btn').forEach(b => {
                b.style.color = aState === 'on' ? '#ffd700' : '#888';
            });
            document.querySelectorAll('.harem-data-holder').forEach(card => {
                if (aState === 'on') {
                    card.classList.remove('ambient-off');
                } else {
                    card.classList.add('ambient-off');
                }
            });
        },
        openModal: function (type, rawJson) {
            try {
                const data = JSON.parse(decodeURIComponent(rawJson));
                const modal = document.getElementById('harem-modal-base');
                const titleEl = document.getElementById('h-modal-title');
                const contentEl = document.getElementById('h-modal-content');
                if (!modal) return;

                modal.setAttribute('data-active-type', type);
                modal.setAttribute('data-active-json', rawJson);

                contentEl.className = ""; titleEl.innerText = "";

                let modalBorder = "#d4af37";
                if (data.season.includes('spring')) modalBorder = "#ad1457";
                if (data.season.includes('summer')) modalBorder = "#004d40";
                if (data.season.includes('autumn')) modalBorder = "#d84315";
                if (data.season.includes('winter')) modalBorder = "#1565c0";
                document.querySelector('.h-modal-box').style.borderColor = modalBorder;

                if (type === 'inv') {
                    titleEl.innerText = t('inv_title');
                    const cleanInv = data.inv;
                    contentEl.innerHTML = `<ul style="padding:0; list-style:none;">${cleanInv.length ? cleanInv.map(i => `<li style="border-bottom:1px dashed #444; padding:5px;">💎 ${esc(i)}</li>`).join('') : `<div style='color:#666; text-align:center;'>${t('no_inv')}</div>`}</ul>`;
                }
                else if (type === 'lovers') {
                    titleEl.innerText = t('lovers_title');
                    contentEl.innerHTML = data.lovers.length ? data.lovers.map(l => `<div style="margin-bottom:10px;"><div style="font-weight:bold; color:#ff80ab;">${esc(l.name)}</div><div style="height:8px; background:#440015; border-radius:4px; margin:5px 0;"><div style="height:100%; width:${l.val}%; background: linear-gradient(90deg, #ff4081, #ff80ab);"></div></div><div style="text-align:right; font-size:11px; color:#aaa;">${t('intimacy')} ${l.val}%</div></div>`).join('') : `<div style='color:#666; text-align:center;'>${t('no_lovers')}</div>`;
                }
                else if (type === 'status') {
                    titleEl.innerText = t('status_title');
                    let pregText = data.pregnant ? t('pregnant') : t('normal');

                    let salary = "";
                    let rnk = data.rank ? data.rank.toLowerCase() : "";
                    for (let modeKey in DB_COLLECTION) {
                        for (let k in DB_COLLECTION[modeKey]) {
                            if (rnk.includes(k.toLowerCase())) {
                                salary = DB_COLLECTION[modeKey][k].salary;
                                break;
                            }
                        }
                        if (salary) break;
                    }

                    let lang = localStorage.getItem('catta_univ_lang') || 'th';
                    let defaultSalaryText = { th: 'รายได้ตามสายอาชีพ', en: 'Profession Income', zh: '职业收入' };
                    let salaryDisplay = salary ? salary : (defaultSalaryText[lang] || defaultSalaryText.th);

                    let salaryHtml = `<div style="color:#ffd700; font-size:14px; margin-top:5px;">💰 <span>${salaryDisplay}</span></div>`;

                    contentEl.innerHTML = `<div style="text-align:center; margin-bottom:15px; background:#222; padding:10px; border-radius:8px; border:1px dashed #555;"><div style="color:#aaa; font-size:12px;">${t('current_pos')}</div><div style="color:${modalBorder}; font-size:18px; font-weight:bold;">${esc(data.rank)}</div>${salaryHtml}</div><div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center;"><div style="background: #222; padding: 8px; border-radius: 6px;"><div>${t('hunger')}</div><div style="color:${modalBorder}; font-weight:bold;">${data.hunger}%</div></div><div style="background: #222; padding: 8px; border-radius: 6px;"><div>${t('hygiene')}</div><div style="color:${modalBorder}; font-weight:bold;">${data.hygiene}%</div></div><div style="background: #222; padding: 8px; border-radius: 6px;"><div>${t('energy')}</div><div style="color:${modalBorder}; font-weight:bold;">${data.energy}%</div></div></div><div style="margin-top:15px; padding:10px; background:#2a2a2a; border-radius:8px;"><div>${t('preg_status')} ${pregText}</div></div>`;
                }
                else if (type === 'emperor') {
                    titleEl.innerText = t('emp_title');
                    contentEl.innerHTML = `<div style="display:flex; gap:10px;"><div style="flex:1; background:#1b301b; padding:10px; border-radius:8px;"><strong style="color:#81c784">${t('likes')}</strong><ul style="padding-left:15px; font-size:13px; color:#c8e6c9;">${data.empLikes.join('') || '-'}</ul></div><div style="flex:1; background:#3e1b1b; padding:10px; border-radius:8px;"><strong style="color:#e57373">${t('hates')}</strong><ul style="padding-left:15px; font-size:13px; color:#ffcdd2;">${data.empHates.join('') || '-'}</ul></div></div>`;
                }
                else if (type === 'skill') {
                    titleEl.innerText = t('skill_title');
                    let html = '';
                    for (const [name, val] of Object.entries(data.skills)) {
                        let pct = (val.xp / val.max) * 100;
                        let trainTxt = t('train_cmd').replace('{val}', esc(name));
                        html += `
                        <div style="margin-bottom:10px;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                                <span style="color:#ffd700;">${esc(name)} <span style="font-size:11px; color:#aaa;">Lv.${val.lv}</span></span>
                                <span class="catta-clickable" style="background: #444; font-size: 10px; padding: 2px 6px; border-radius: 4px; cursor: pointer; border: 1px solid #666;" data-action="copy-from-btn" data-content="${trainTxt}">${t('train')}</span>
                            </div>
                            <div style="background: #111; height: 12px; border-radius: 6px; overflow: hidden; position:relative; border: 1px solid #333;">
                                <div style="height:100%; width:${pct}%; background:${modalBorder};"></div>
                                <div style="position:absolute; top:0; left:0; width:100%; text-align:center; font-size:9px; color:#fff; line-height:12px;">${val.xp}/${val.max}</div>
                            </div>
                        </div>`;
                    }
                    contentEl.innerHTML = html || `<div style='color:#666; text-align:center;'>${t('no_skill')}</div>`;
                }
                else if (type === 'promo') {
                    titleEl.innerText = t('promo_title');

                    let hardcodedPrompt = "";
                    let promotedRank = data.promotion.newRank ? data.promotion.newRank.toLowerCase() : "";
                    for (let modeKey in DB_COLLECTION) {
                        for (let k in DB_COLLECTION[modeKey]) {
                            if (promotedRank.includes(k.toLowerCase()) && DB_COLLECTION[modeKey][k].imgPrompt) {
                                hardcodedPrompt = DB_COLLECTION[modeKey][k].imgPrompt;
                                break;
                            }
                        }
                        if (hardcodedPrompt) break;
                    }

                    let copyCommand = "";
                    if (hardcodedPrompt) {
                        copyCommand = `[System Note: User has been promoted to ${esc(data.promotion.newRank)}. Describe their magnificent new appearance in the story, and then immediately output the following exact Image Prompt block at the end of your response to generate their portrait: [Image Prompt: ${hardcodedPrompt}]]`;
                    } else {
                        copyCommand = `[System Note: User has been promoted to ${esc(data.promotion.newRank)}. Retrieve the attire details and image prompt for this rank from the Lorebook immediately.]`;
                    }

                    contentEl.innerHTML = `
                    <div style="text-align:center; padding:15px; border:2px solid ${modalBorder}; background:#1a1a1a; color:#ffd700; margin-bottom:15px; font-family:'Sarabun', serif;">
                        <div style="font-size:16px; font-weight:bold;">${t('appoint')} <span style="font-size:20px;">${esc(data.promotion.newRank)}</span></div>
                    </div>
                    <div style="background:#2a2a2a; padding:10px; color:#ddd; margin-bottom:15px; border-radius: 6px;">
                        <b>${t('rewards')}</b><br>${esc(data.promotion.rewards)}
                    </div>
                    <div style="margin-top:10px; border-top:1px dashed #555; padding-top:15px;">
                        <div style="font-size:13px; color:#aaa; margin-bottom:8px; text-align:center;">${t('req_outfit')}</div>
                        <div class="catta-clickable" style="text-align:center; background:${modalBorder}; color:#fff; font-weight:bold; padding:12px; border-radius: 6px; cursor:pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5);" data-action="copy-from-btn" data-content="${esc(copyCommand).replace(/"/g, '&quot;')}">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> ${t('req_btn')}
                        </div>
                        <div style="font-size:11px; color:#888; margin-top:8px; font-style:italic; text-align:center;">${t('req_note')}</div>
                    </div>`;
                }
                else if (type === 'quest') {
                    titleEl.innerText = t('quest_title');
                    let q = data.quest;
                    contentEl.innerHTML = `
                        <div style="text-align:center; padding-bottom:10px; margin-bottom:10px; border-bottom:1px dashed #555;">
                            <div style="font-size:18px; font-weight:bold; color:#ffd700;">${esc(q.title)}</div>
                            <span style="font-size:10px; background:#333; padding:2px 8px; border-radius:10px; color:#aaa;">${t('q_level')} ${esc(q.diff)}</span>
                        </div>
                        <div style="font-size:13px; color:#e0e0e0; margin-bottom:15px; line-height:1.4;">${esc(q.desc)}</div>
                        <div style="background:#2a1a1a; padding:10px; border-radius:6px; border:1px solid #4a2c2c;">
                            <div style="font-size:12px; color:#ef5350;">${t('q_cost')} ${esc(q.cost)}</div>
                            <div style="font-size:12px; color:#66bb6a; margin-top:3px;">${t('q_reward')} ${esc(q.reward)}</div>
                            <div style="font-size:12px; color:#aaa; margin-top:3px; font-style:italic;">${t('q_time')} ${esc(q.time)}</div>
                        </div>
                        <div style="margin-top:10px; text-align:center; font-size:10px; color:#666;">${t('q_note')}</div>`;
                }
                else if (type === 'quest_done') {
                    titleEl.innerText = "";
                    let q = data.questDone;
                    let isSuccess = q.result.toLowerCase().includes('success') || q.result.includes('สำเร็จ');
                    let color = isSuccess ? "#4caf50" : "#d32f2f";
                    let icon = isSuccess ? "🎉" : "💀";
                    let headText = isSuccess ? t('q_success') : t('q_fail');
                    contentEl.innerHTML = `<div style="text-align:center; font-family: 'Sarabun', serif; padding: 20px;"><div style="font-size: 50px; margin-bottom: 10px;">${icon}</div><h2 style="color: ${color}; margin: 0 0 10px 0;">${headText}</h2><h3 style="color: #ddd; border-bottom: 1px solid #444; padding-bottom: 10px; margin-bottom: 15px;">${esc(q.title)}</h3><div style="background: #2a2a2a; padding: 15px; border-radius: 8px; color: #ffd700;">${esc(q.reward)}</div><div style="margin-top:20px; font-size:12px; color:#888;">${t('q_check')}</div></div>`;
                }
                else if (type === 'letter') {
                    titleEl.innerText = t('letter_title');
                    contentEl.innerHTML = `<div style="background: #e0c090; padding: 15px; color: #3e2723; border: 2px solid #5d4037;"><h3 style="text-align:center; border-bottom:1px solid #5d4037; color:#3e2723;">${esc(data.letter.title)}</h3><p style="white-space: pre-wrap; font-family:serif; color:#3e2723;">${esc(data.letter.content)}</p></div>`;
                }
                modal.classList.add('active');
            } catch (e) { console.error("Modal Error:", e); }
        }
    };

    const CSS = `
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&display=swap');
        #harem-global-layer { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999999; pointer-events: none; overflow: hidden; }
        .h-particle { position: absolute; top: -10vh; animation: hFall linear infinite; text-shadow: 0 0 5px rgba(255,255,255,0.5); opacity:0.8; }
        @keyframes hFall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(110vh) rotate(360deg); opacity: 0; } }

        .h-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 100000000; background: rgba(0,0,0,0.9); backdrop-filter: blur(8px); display: none; justify-content: center; align-items: center; pointer-events: auto; font-family: 'Sarabun', sans-serif; }
        .h-modal-overlay.active { display: flex !important; animation: hFadeIn 0.3s; }
        @keyframes hFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .h-modal-box { background: #1a1a1a; color: #eee; width: 90%; max-width: 400px; max-height: 85vh; overflow-y: auto; border: 2px solid #d4af37; border-radius: 12px; padding: 20px; position: relative; box-shadow: 0 0 30px rgba(0,0,0,0.8); }
        .h-close-top { position: absolute; top: 15px; right: 20px; font-size: 24px; cursor: pointer; color: #666; }
        .h-modal-header { color: #eee; font-size: 20px; font-weight: bold; text-align: center; border-bottom: 1px dashed #444; padding-bottom: 10px; margin-bottom: 15px; }
        
        .harem-card { font-family: 'Sarabun', sans-serif; color: #e0e0e0; border-radius: 8px; margin: 10px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.6); overflow: hidden; display: block; border-left: 5px solid #d4af37; position: relative; transition: box-shadow 0.3s, background 0.3s, filter 0.3s; }
        
        /* 4 SEASONS CSS RESTORATION */
        .t-spring { border-left-color: #ad1457 !important; background: linear-gradient(145deg, #4a1425 0%, #1a0a10 100%); border: 1px solid #880e4f; }
        .t-spring .h-card-head { border-bottom: 1px solid #ad1457 !important; }
        .t-spring .h-card-head span { color: #f8bbd0 !important; }
        .t-spring .h-bar-fill { background: #ec407a !important; box-shadow: 0 0 8px #ec407a !important; }

        .t-summer { border-left-color: #004d40 !important; background: linear-gradient(145deg, #0d2918 0%, #05140a 100%); border: 1px solid #004d40; }
        .t-summer .h-card-head { border-bottom: 1px solid #00695c !important; }
        .t-summer .h-card-head span { color: #ffd700 !important; }
        .t-summer .h-bar-fill { background: #00bfa5 !important; box-shadow: 0 0 8px #00bfa5 !important; }

        .t-autumn { border-left-color: #d84315 !important; background: linear-gradient(145deg, #3e2723 0%, #1a100d 100%); border: 1px solid #4e342e; }
        .t-autumn .h-card-head { border-bottom: 1px solid #d84315 !important; }
        .t-autumn .h-card-head span { color: #ffcc80 !important; }
        .t-autumn .h-bar-fill { background: #ff7043 !important; box-shadow: 0 0 8px #ff7043 !important; }

        .t-winter { border-left-color: #1565c0 !important; background: linear-gradient(145deg, #0d47a1 0%, #051020 100%); border: 1px solid #1565c0; }
        .t-winter .h-card-head { border-bottom: 1px solid #1976d2 !important; }
        .t-winter .h-card-head span { color: #bbdefb !important; }
        .t-winter .h-bar-fill { background: #42a5f5 !important; box-shadow: 0 0 8px #42a5f5 !important; }

        /* REAL-TIME AMBIENT LIGHTING CSS */
        .time-day:not(.ambient-off) { box-shadow: 0 0 15px rgba(255, 235, 150, 0.15); filter: brightness(1.05); }
        .time-sunset:not(.ambient-off) { box-shadow: 0 0 15px rgba(255, 100, 50, 0.2); filter: sepia(0.2) brightness(0.95); }
        .time-night:not(.ambient-off) { box-shadow: 0 0 15px rgba(50, 100, 255, 0.2); filter: brightness(0.85); }
        .time-night:not(.ambient-off) .h-card-head { text-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }

        /* VIP RANK BADGE CSS */
        .h-rank-vip { position: relative; color: #ffd700 !important; text-shadow: 0 0 5px rgba(255,215,0,0.5); }
        .h-rank-vip::after { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent); animation: hVipShimmer 3s infinite; }
        @keyframes hVipShimmer { 0% { left: -100%; } 50% { left: 200%; } 100% { left: 200%; } }

        .h-card-head { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: rgba(0,0,0,0.4); cursor: pointer; text-shadow: 0 1px 2px rgba(0,0,0,0.8); overflow: hidden; }
        .h-card-body { padding: 15px; display: block; }
        .h-card-body.collapsed { display: none; }
        .h-toolbar { display: flex; gap: 5px; margin-bottom: 12px; justify-content: flex-end; flex-wrap: wrap; }
        .h-tool-btn { background: #222; border: 1px solid #444; border-radius: 4px; padding: 5px 10px; font-size: 12px; cursor: pointer; color: #ccc; transition: all 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.3); user-select: none; }
        .h-tool-btn:hover { background: #333; color: #fff; transform: translateY(-1px); }
        .h-bar-container { background: #111; height: 12px; border-radius: 6px; overflow: hidden; margin-top: 5px; border: 1px solid #333; }
        .h-bar-fill { height: 100%; transition: width 0.5s; box-shadow: 0 0 5px rgba(0,0,0,0.5); }
        
        .h-npc-row { background: rgba(0,0,0,0.4); padding: 10px; border-radius: 6px; border: 1px solid #555; display:flex; flex-direction:column; gap:5px; margin-bottom: 5px; }
        .h-stat-pill { background:#2a2a2a; padding:2px 6px; border-radius:4px; border:1px solid #444; color:#ccc; font-size:10px; white-space: nowrap; }
        .h-rumor-box { background: linear-gradient(135deg, #1a0b1a 0%, #2d1b2d 100%); border: 2px solid #9c27b0; border-radius: 8px; padding: 12px; margin-top: 15px; box-shadow: 0 0 10px rgba(156, 39, 176, 0.4); color: #e1bee7; }
        
        #h-debuff-toast { display: none; position: fixed; bottom: 80px; right: 20px; background: #3e1b1b; color: #ffcdd2; padding: 15px; border-radius: 8px; border: 2px solid #e53935; z-index: 999999999; box-shadow: 0 4px 15px rgba(0,0,0,0.8); font-family: 'Sarabun', sans-serif; animation: hPulse 2s infinite; font-size: 12px; }
        @keyframes hPulse { 0% { box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(229, 57, 53, 0); } 100% { box-shadow: 0 0 0 0 rgba(229, 57, 53, 0); } }
        
        .h-lang-btn { transition: all 0.2s; user-select: none; }
        .h-lang-btn:hover { background: rgba(255,255,255,0.1); color: #fff !important; }
    `;

    // ============================================================
    // DOM RENDERER (Post-Processing from VPS)
    // ============================================================
    let _lastProcessedJson = "";
    function updateScreen() {
        const allCards = document.querySelectorAll('.harem-data-holder');
        if (allCards.length === 0) {
            const el = document.getElementById('harem-global-layer');
            if (el) el.innerHTML = '';
            return;
        }
        const lastCard = allCards[allCards.length - 1];
        const rawJson = lastCard.getAttribute('data-json');

        if (!rawJson || rawJson === _lastProcessedJson) return;
        _lastProcessedJson = rawJson;

        try {
            const data = JSON.parse(decodeURIComponent(rawJson));

            // Check VIP Rank logic
            const vipRanks = ['empress', 'ฮองเฮา', 'fengjun', 'เฟิ่งจวิน', 'main wife', 'ฮูหยินเอก'];
            const isVip = data.rank && vipRanks.some(v => data.rank.toLowerCase().includes(v));
            if (isVip) {
                const rankSpan = lastCard.querySelector('.h-rank-text');
                if (rankSpan) rankSpan.classList.add('h-rank-vip');
            }

            if (!document.getElementById('harem-global-layer')) {
                const layer = document.createElement('div'); layer.id = 'harem-global-layer';
                layer.setAttribute('data-active-season', ''); document.body.appendChild(layer);
                const modal = document.createElement('div');
                modal.innerHTML = `<div id="harem-modal-base" class="h-modal-overlay"><div class="h-modal-box"><div class="h-close-top catta-clickable" data-action="harem-close-modal">×</div><div id="h-modal-title" class="h-modal-header"></div><div id="h-modal-content"></div></div></div>`;
                document.body.appendChild(modal.firstElementChild);
            }

            let pState = localStorage.getItem('catta_univ_particles') || 'on';
            document.querySelectorAll('.fx-toggle-btn').forEach(btn => {
                btn.style.color = pState === 'on' ? '#ffd700' : '#888';
            });

            let aState = localStorage.getItem('catta_univ_ambient') || 'on';
            document.querySelectorAll('.ambient-toggle-btn').forEach(btn => {
                btn.style.color = aState === 'on' ? '#ffd700' : '#888';
            });
            if (aState !== 'on') {
                lastCard.classList.add('ambient-off');
            }

            let pLayer = document.getElementById('harem-global-layer');
            if (pState === 'on') {
                let char = '🌸'; let seasonKey = 'spring';
                if (data.season.includes('summer')) { char = '🍃'; seasonKey = 'summer'; }
                else if (data.season.includes('autumn')) { char = '🍁'; seasonKey = 'autumn'; }
                else if (data.season.includes('winter')) { char = '❄️'; seasonKey = 'winter'; }

                if (pLayer.getAttribute('data-active-season') !== seasonKey || pLayer.childElementCount === 0) {
                    pLayer.innerHTML = ''; pLayer.setAttribute('data-active-season', seasonKey);
                    for (let i = 0; i < 20; i++) {
                        let s = document.createElement('div');
                        s.className = 'h-particle';
                        s.innerText = char;
                        s.style.left = Math.random() * 100 + 'vw';
                        s.style.fontSize = (Math.random() * 15 + 10) + 'px';
                        s.style.animationDuration = (Math.random() * 8 + 12) + 's';
                        s.style.animationDelay = (Math.random() * 10) + 's';
                        pLayer.appendChild(s);
                    }
                }
            } else {
                if (pLayer.innerHTML !== '') {
                    pLayer.innerHTML = '';
                    pLayer.setAttribute('data-active-season', '');
                }
            }

            const toast = document.getElementById('h-debuff-toast');
            if (!toast) {
                const t_el = document.createElement('div'); t_el.id = 'h-debuff-toast';
                t_el.innerHTML = `<div class="catta-clickable" data-action="remove-closest" data-target="#h-debuff-toast" style="position:absolute; top:-10px; right:-10px; background:#e53935; color:white; width:20px; height:20px; border-radius:50%; text-align:center; line-height:20px; cursor:pointer;">×</div><div id="h-debuff-title" style="font-weight:bold; font-size:14px;">${t('alert_title')}</div><div id="h-debuff-msg" style="font-size:12px; margin-top:5px;"></div>`;
                document.body.appendChild(t_el);
            } else {
                document.getElementById('h-debuff-title').innerHTML = t('alert_title');
            }

            let debuffs = [];
            if (data.hygiene < 40) debuffs.push(t('d_hygiene'));
            if (data.health < 40) debuffs.push(t('d_health'));
            if (data.energy < 30) debuffs.push(t('d_energy'));
            if (data.hunger < 30) debuffs.push(t('d_hunger'));

            const msgEl = document.getElementById('h-debuff-msg');
            if (debuffs.length && msgEl) { msgEl.innerHTML = debuffs.join("<br>"); document.getElementById('h-debuff-toast').style.display = 'block'; }
            else if (msgEl) document.getElementById('h-debuff-toast').style.display = 'none';

            // --- EVENT POPUP SYSTEM ---
            let isLatestMessage = false;
            const chatEl = document.getElementById('chat');
            if (chatEl) {
                const allMsgs = chatEl.querySelectorAll('.mes');
                if (allMsgs.length > 0) {
                    const lastMsg = allMsgs[allMsgs.length - 1];
                    if (lastMsg.contains(lastCard)) {
                        isLatestMessage = true;
                    }
                }
            }

            if (!document.getElementById('harem-modal-base').classList.contains('active')) {
                if (isLatestMessage) {
                    if (data.promotion) { window.HaremActions.openModal('promo', rawJson); }
                    else if (data.letter) { window.HaremActions.openModal('letter', rawJson); }
                    else if (data.quest) { window.HaremActions.openModal('quest', rawJson); }
                    else if (data.questDone) { window.HaremActions.openModal('quest_done', rawJson); }
                }
            }

            window.HaremActions.applyLang(localStorage.getItem('catta_univ_lang') || 'th');

        } catch (e) { }
    }

    // ============================================================
    // REGISTRATION
    // ============================================================
    if (window.CattaUI) {
        setInterval(updateScreen, 500);
        window.CattaUI.registerModule({
            id: MODULE_ID,
            name: "🌸 Wuxia HUD",
            desc: "(Tokens: 727) เปิดแล้วใช้ได้ทันที ใช้กับ 🌸Seasons of the Harem หรือตัวละครจีนโบราณอื่นๆ",
            defaultState: false,
            promptKey: "universal_hud_prompt",
            css: CSS,
            rules: [
                {
                    // Rule 1: Cloak the System Note for Attire Retrieval
                    findRegex: "(:?\\[System Note: User has been promoted to [^\\.\\]]+\\. Retrieve the attire details and image prompt for this rank from the Lorebook immediately\\.\\])",
                    replaceString: function (match) {
                        let lang = localStorage.getItem('catta_univ_lang') || 'th';
                        const cloakDict = {
                            th: "🪡 <i>ข้ารับใช้แห่งตำหนักอาภรณ์กำลังจัดเตรียมพัสตราภรณ์ชุดใหม่...</i>",
                            en: "🪡 <i>The Imperial Tailors are preparing the new ceremonial attire...</i>",
                            zh: "🪡 <i>内务府正在为大人准备新的官服...</i>"
                        };
                        let text = cloakDict[lang] || cloakDict.th;
                        return `<div style="text-align:center; padding:12px; margin:10px 0; border:1px solid #d4af37; border-radius:8px; background:linear-gradient(90deg, rgba(30,10,15,0.8) 0%, rgba(50,15,25,0.8) 100%); color:#ffecb3; font-family:'Sarabun', serif; font-size:14px; box-shadow: 0 2px 10px rgba(212,175,55,0.2);">
                                    <i class="fa-solid fa-scroll" style="color:#d4af37; margin-right:5px;"></i> ${text}
                                </div>`;
                    }
                },
                {
                    // Rule 2: Cloak the System Note with specific Hardcoded Image Prompt
                    findRegex: "(:?\\[System Note: User has been promoted to [^\\.\\]]+\\. Describe their magnificent new appearance in the story, and then immediately output the following exact Image Prompt block at the end of your response to generate their portrait: \\[[\\s\\S]*?\\]\\])",
                    replaceString: function (match) {
                        let lang = localStorage.getItem('catta_univ_lang') || 'th';
                        const cloakDict = {
                            th: "🪡 <i>ข้ารับใช้แห่งตำหนักอาภรณ์กำลังจัดเตรียมพัสตราภรณ์ชุดใหม่...</i>",
                            en: "🪡 <i>The Imperial Tailors are preparing the new ceremonial attire...</i>",
                            zh: "🪡 <i>内务府正在为大人准备新的官服...</i>"
                        };
                        let text = cloakDict[lang] || cloakDict.th;
                        return `<div style="text-align:center; padding:12px; margin:10px 0; border:1px solid #d4af37; border-radius:8px; background:linear-gradient(90deg, rgba(30,10,15,0.8) 0%, rgba(50,15,25,0.8) 100%); color:#ffecb3; font-family:'Sarabun', serif; font-size:14px; box-shadow: 0 2px 10px rgba(212,175,55,0.2);">
                                    <i class="fa-solid fa-scroll" style="color:#d4af37; margin-right:5px;"></i> ${text}
                                </div>`;
                    }
                },
                {
                    // Rule 3: Parse the main Universal HUD
                    findRegex: "(:?::\\s*\\[SHHUD\\][\\s\\S]*?:::)",
                    replaceString: function (match) {
                        const rawData = match;
                        const uid = localStorage.getItem('catta_uid') || "guest";
                        const token = localStorage.getItem('catta_auth_token') || "none";
                        const placeholderId = 'univ-hud-' + Math.random().toString(36).substr(2, 9);

                        fetch(VPS_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-uid': uid,
                                'x-token': token
                            },
                            body: JSON.stringify({ raw_text: rawData, source: "universal_hud" })
                        })
                            .then(res => res.json())
                            .then(data => {
                                const el = document.getElementById(placeholderId);
                                if (el && data.success) el.outerHTML = window.CattaUI.utils.purifyHtml(data.html);
                            }).catch(e => console.error(e));

                        return `<div id="${placeholderId}" style="text-align:center; padding:15px; color:#d4af37; border: 1px dashed rgba(212,175,55,0.5); background: rgba(0,0,0,0.6); border-radius: 8px; margin: 10px 0;"><i class="fa-solid fa-spinner fa-spin"></i> Rendering Interface...</div>`;
                    }
                }
            ]
        });
    }

})();
