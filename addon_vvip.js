(function () {
    console.log("🧸 Catta Toys Box: Online [Dynamic Mode - Sync with Core]!");


    window.CattaToys_List = [{
        id: "vvip_pose",
        icon: "🔞🚺",
        title: "ท่าเซ็กส์หลากหลายไม่ซ้ำซาก (Hardcore Engine)",
        desc: "สุ่มเปลี่ยนท่าร่วมรักไปเรื่อย ๆ ตลอดการร่วมรัก ไม่มีคำว่าจำเจ! <br> อธิบายเพิ่มเติม: เปิดของเล่นอันนี้เมื่อ user เป็น 'ฝ่ายรับ' นะฮะ!",
        fileKey: "engine_vvip_pose",
        promptId: "catta_toy_vvip_pose",
        allowedTiers: ['VVIP', 'ADMIN']
    },
    {
        id: "vvip_pose_male",
        icon: "🔞🚹",
        title: "ท่าเซ็กส์หลากหลายไม่ซ้ำซาก (Hardcore Engine)",
        desc: "สุ่มเปลี่ยนท่าร่วมรักไปเรื่อย ๆ ตลอดการร่วมรัก ไม่มีคำว่าจำเจ!  <br> อธิบายเพิ่มเติม: เปิดของเล่นอันนี้เมื่อ user เป็น 'ฝ่ายรุก' นะฮะ!",
        fileKey: "engine_vvip_pose_male",
        promptId: "catta_toy_vvip_pose_male",
        allowedTiers: ['VVIP', 'ADMIN']
    },
    {
        id: "vvip_romance",
        icon: "🔞🍭",
        title: "การร่วมรักแบบลึกซึ้ง นุ่มนวล (Vanilla Engine)",
        desc: "เป็นการบรรยายการร่วมรักที่ทำให้รู้สึกใจเต้น แสนหวานเหมือนกินลูกอม",
        fileKey: "vvip_romance_vanilla",
        promptId: "catta_toy_romance",
        allowedTiers: ['VVIP', 'ADMIN']
    },
    {
        id: "vvip_multiplayer",
        icon: "🔞🍰",
        title: "การร่วมรักแบบหมู่คณะ (Gangbang Engine)",
        desc: "เป็นการบรรยายการร่วมรักแบบหมู่คณะ โดยเน้นให้อนาโตมี่และท่าทางไม่ผิดปกติ",
        fileKey: "vvip_multiplayer_loc",
        promptId: "catta_toy_multiplayer",
        allowedTiers: ['VVIP', 'ADMIN']
    },
    {
        id: "bdsm_hardcore",
        icon: "🔞⛓️",
        title: "BDSM & Hardcore",
        desc: "สุ่มกิจกรรมสายดาร์ก ตั้งแต่มัดตราสังข์ไปจนถึงความวิปริตขั้นสุด (Extreme BDSM)",
        fileKey: "vvip_bdsm_hardcore",
        promptId: "catta_toy_bdsm",
        allowedTiers: ['VVIP', 'ADMIN']
    },
    {
        id: "50_outdoor",
        icon: "🔞🏕️",
        title: "50 สถานที่ (Outdoor/Public)",
        desc: "สุ่มสถานที่เอาท์ดอร์สุดเสียว ริมหาด ตรอกมืด หรือห้องน้ำ",
        fileKey: "vvip_outdoor_loc",
        promptId: "catta_toy_outdoor",
        allowedTiers: ['VVIP', 'ADMIN']
    },
    {
        id: "fantasy_kink",
        icon: "🔞🦑",
        title: "แฟนตาซี (Monster & Kink)",
        desc: "ปลดล็อคเซ็กส์ข้ามเผ่าพันธุ์ วางไข่ หนวด และสัญชาตญาณสัตว์",
        fileKey: "vvip_fantasy_kink",
        promptId: "catta_toy_fantasy",
        allowedTiers: ['VVIP', 'ADMIN']
    },
    {
        id: "titania_fantasy_vault",
        icon: "🔞🪄",
        title: "คลังของเล่นแฟนตาซี (Fantasy Toys Vault)",
        desc: "สุ่มหยิบอุปกรณ์และของเล่นแฟนตาซี 61 ชนิดจากลอร์บุ๊คมาใช้ในฉาก (มีตั้งแต่เวทมนตร์ยันฮาร์ดคอร์ BDSM) <br> <b>จัดทำโดย: Titania 💜</b>",
        fileKey: "vvip_titania_toys",
        promptId: "catta_toy_titania_vault",
        allowedTiers: ['VVIP', 'ADMIN']
    },
    {
        id: "serial_killer",
        icon: "🔪🩸",
        title: "สัญชาตญาณนักฆ่า (The Serial Killer / Slasher)",
        desc: "ปลุกสัญชาตญาณดิบ! เปลี่ยนบทสนทนาให้เต็มไปด้วยกลิ่นคาวเลือด การไล่ล่า และความวิปริตของฆาตกรโรคจิต <br> อธิบายเพิ่มเติม: เหมาะสำหรับสาย Dark RP ที่อยากลองลิ้มรสความตายและความเจ็บปวดขั้นสุด!",
        fileKey: "vvip_serial_killer",
        promptId: "catta_toy_killer",
        allowedTiers: ['VVIP', 'ADMIN']
    },
    {
        id: "lethal_gambling_engine",
        icon: "🎲💀",
        title: "เดิมพันมรณะ (Lethal Wager Engine)",
        desc: "เข้าสู่การพนันที่เดิมพันด้วยชีวิตและทั้งหมดที่คุณมี! สุ่มเกมเดิมพันที่ต้องแลกด้วยชีวิต อวัยวะ หรือคนในครอบครัว <br> อธิบายเพิ่มเติม: เปิดเมื่อคุณต้องการเดิมพันที่สูงกว่าแค่เงินหรือความบันเทิงธรรมดาผู้ไร้ความปรานี หากคุณแพ้... เตรียมจ่ายด้วยสิ่งที่คุณรักที่สุด!",
        fileKey: "vvip_lethal_wager",
        promptId: "catta_toy_wager_engine",
        allowedTiers: ['VVIP', 'ADMIN']
    },
    {
        id: "universal_dark_occult",
        icon: "🔮💀",
        title: "ศาสตร์มืดคุณไสยสากล (Dark Occultism)",
        desc: "สุ่มโดนคุณไสยไทย-เขมร 100 รูปแบบ พร้อมอาการ 3 ระยะและวิธีแก้!",
        fileKey: "vvip_universal_occult",
        promptId: "catta_toy_occult_universal",
        allowedTiers: ['VVIP', 'ADMIN']
    },
    {
        id: "CAPTURE_MODULE",
        icon: "✏️🎨",
        title: "ภาพสะท้อนจากเรื่องราว (CONCISE IMAGE PROMPT GENERATOR)",
        desc: "ระบบจะทำการร่างรูปภาพมาในรูปแบบ Prompt เพื่อนำไปเจนต่อในแพลตฟอร์มอื่น ๆ",
        fileKey: "vvip_CAPTURE_MODULE",
        promptId: "catta_toy_CAPTURE_MODULE",
        allowedTiers: ['VVIP', 'ADMIN']
    },
    {
        id: "COLOR_MASTER",
        icon: "🎲🌈",
        title: "จานสีมหัศจรรย์ (Colors Master Engine)",
        desc: "เมื่อมีตัวละครเข้าฉากใหม่ หรือต้องการสร้างตัวละครอย่างหลากหลาย สามารถเปิดเพื่อสุ่มได้!<br> <b>จัดทำโดย: Titania 💜</b>",
        fileKey: "vvip_COLOR_MASTER",
        promptId: "catta_toy_COLOR_MASTER",
        allowedTiers: ['VVIP', 'ADMIN']
    }
    ];


    async function fetchVVIPPrompt(key) {
        try {
            const uid = localStorage.getItem('catta_uid');
            const token = localStorage.getItem('catta_auth_token');
            if (!uid || !token) return "";

            const res = await fetch(`https://st-cattacafe.casa/dante/api/get-module?name=${key}`, {
                headers: { 'x-uid': uid, 'x-token': token }
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const raw = await res.text();
            try {
                const json = JSON.parse(raw);
                return (json.code || raw).trim();
            } catch {
                return raw.trim();
            }
        } catch (e) {
            console.error("Fetch Error:", e);
            return "";
        }
    }


    function injectToysUI() {
        const $ = window.jQuery;
        if (!$) return;
        if ($('#catta_toys_box').length > 0) return;


        const $target = $('#extensions_settings');
        if ($target.length === 0) return;

        let userTier = (window.CattaUserTier || "STANDARD").toUpperCase().trim();
        let uTiers = userTier.split(',');

        let availableToys = window.CattaToys_List.filter(item => {
            if (item.allowedTiers) return uTiers.some(t => item.allowedTiers.includes(t));
            return uTiers.some(t => ['VVIP', 'ADMIN'].includes(t));
        });

        let html = `
        <div id="catta_toys_box" class="inline-drawer" style="margin-top: 10px;">
            <div class="inline-drawer-header catta-toys-header" style="user-select: none; border-left: 5px solid #E066FF; background: rgba(224, 102, 255, 0.15); cursor: pointer; display: flex; justify-content: space-between; padding:8px; border-radius: 5px 5px 0 0;">
                <b style="color:#E066FF; text-shadow: 0 0 5px rgba(224,102,255,0.3);"><i class="fa-solid fa-box-open"></i> 🧸 ของเล่น VVIP</b>
                <div class="icon fa-solid fa-circle-chevron-down" style="color:#E066FF;"></div>
            </div>
            <div class="inline-drawer-content" style="display:none; padding:15px; border: 1px solid rgba(224, 102, 255, 0.3); border-top: none; background: var(--black70); backdrop-filter: blur(10px); border-radius: 0 0 5px 5px;">
        `;

        if (window.CattaToys_List && window.CattaToys_List.length > 0) {
            html += `
                <div style="margin-bottom:12px; padding: 8px; text-align: center; color: #E066FF; font-size: 0.85em; background: rgba(224, 102, 255, 0.05); border-radius: 5px; line-height:1.4; border: 1px dashed rgba(224, 102, 255, 0.2);">
                    ยินดีต้อนรับสู่กล่องของเล่นฮะนายท่าน! <br>เลือกเปิดใช้งาน "ส่วนเสริมความเสียว" ที่ต้องการได้เลยฮะ
                </div>`;

            availableToys.forEach(item => {
                let isSavedChecked = localStorage.getItem(`toy_state_${item.id}`) === 'true';
                const displayOn = isSavedChecked ? '' : 'display:none';
                const displayOff = isSavedChecked ? 'display:none' : '';
                html += `
                <div style="margin-bottom: 8px; padding: 5px; border: 1px solid var(--SmartThemeBorderColor); border-radius: 10px; display:flex; align-items:center; justify-content:space-between;">
                    <div style="flex:1; padding-right:10px;">
                        <strong style="color:#fff;">${item.icon} ${item.title}</strong><br>
                        <small style="opacity:0.7; color:#aaa;">${item.desc}</small>
                    </div>
                    <div>
                        <label class="checkbox flex-container margin-r5" style="cursor:pointer; margin:0;">
                            <input type="checkbox" class="toy-kink-toggle" data-id="${item.id}" ${isSavedChecked ? 'checked' : ''} style="display:none;">
                            <span class="toy-toggle-on fa-solid fa-toggle-on"  style="${displayOn};  color: var(--SmartThemeQuoteColor); font-size:1.4em;"></span>
                            <span class="toy-toggle-off fa-solid fa-toggle-off" style="${displayOff}; opacity:0.5; font-size:1.4em;"></span>
                        </label>
                    </div>
                </div>`;
            });
        } else {
            html += `
                <div style="text-align: center; padding: 15px;">
                    <i class="fa-solid fa-lock" style="font-size: 2.5em; color: #555; margin-bottom: 10px;"></i>
                    <div style="color: #FF5555; font-weight: bold; margin-bottom: 5px; font-size: 1.1em;">เนื้อหานี้สำหรับ VVIP เท่านั้น!</div>
                    <div style="color: #AAA; font-size: 0.85em; line-height: 1.4;">สิทธิพิเศษนี้เฉพาะลูกค้า VVIP เท่านั้นฮะ นายท่านสามารถอัปเกรดยศเพื่อปลดล็อคกล่องของเล่นสุดพิเศษนี้ได้ใน Discord เลยนะฮะ 💜</div>
                </div>`;
        }

        html += `</div></div>`;

        const $presetBox = $('#catta_preset_ui_box');
        if ($presetBox.length > 0) {
            $presetBox.after(html);
        } else {
            $target.prepend(html);
        }

        $(document).off('click', '.catta-toys-header').on('click', '.catta-toys-header', function () {
            $(this).next().slideToggle();
        });

        if (availableToys.length > 0) {
            const toggleToy = async (item, isChecked) => {
                localStorage.setItem(`toy_state_${item.id}`, isChecked);

                if (isChecked) {
                    if (window.toastr) window.toastr.info(`⏳ กำลังหยิบของเล่น: ${item.title}...`, "Catta Toys");
                    const promptData = await fetchVVIPPrompt(item.fileKey);

                    if (promptData && promptData !== "") {
                        console.log(`✅ [CattaToys] ${item.title}: สำเร็จ`);
                        if (window.CattaPromptInject) window.CattaPromptInject(item.promptId, promptData, true);
                        if (window.toastr) window.toastr.success(`🔥 เปิดใช้งาน: ${item.title} สำเร็จ!`, "Catta Toys");
                    } else {
                        console.error(`❌ [CattaToys] ${item.title}: ไม่สำเร็จ`);
                        if (window.toastr) window.toastr.error(`❌ ดึงของเล่นชิ้นนี้ไม่สำเร็จฮะ!`, "System Error");
                        $(`.toy-kink-toggle[data-id="${item.id}"]`).prop('checked', false);
                        localStorage.setItem(`toy_state_${item.id}`, false);
                    }
                } else {
                    console.log(`🔕 [CattaToys] ${item.title}: ปิดแล้ว`);
                    if (window.CattaPromptInject) window.CattaPromptInject(item.promptId, "", false);
                    if (window.toastr) window.toastr.warning(`เก็บของเล่นเข้ากล่องแล้ว`, "Catta Toys");
                }
            };

            // Toggle icon click → toggle hidden checkbox (เหมือน Catta UI Suite)
            $(document).off('click', '.toy-toggle-on, .toy-toggle-off').on('click', '.toy-toggle-on, .toy-toggle-off', function (e) {
                e.preventDefault(); e.stopPropagation();
                const checkbox = $(this).siblings('input.toy-kink-toggle');
                checkbox.prop('checked', !checkbox.prop('checked')).trigger('change');
            });

            $(document).on('change', '.toy-kink-toggle', function () {
                const targetId = $(this).attr('data-id');
                const isChecked = $(this).is(':checked');

                // สลับ icon
                if (isChecked) {
                    $(this).siblings('.toy-toggle-off').hide();
                    $(this).siblings('.toy-toggle-on').show();
                } else {
                    $(this).siblings('.toy-toggle-on').hide();
                    $(this).siblings('.toy-toggle-off').show();
                }

                const targetItem = availableToys.find(i => i.id === targetId);
                if (targetItem) toggleToy(targetItem, isChecked);
            });

            availableToys.forEach(item => {
                let isSavedChecked = localStorage.getItem(`toy_state_${item.id}`) === 'true';
                if (isSavedChecked) {
                    console.log(`♻️ [CattaToys] Auto-restore หลังรีเฟรช → id: "${item.id}"`);
                    toggleToy(item, true);
                }
            });
        }
    }


    let injectAttempts = 0;
    const injectInterval = setInterval(() => {
        if (document.getElementById('catta_preset_ui_box') || injectAttempts > 60) {
            clearInterval(injectInterval);
            injectToysUI();
            console.log("🧸 Catta Toys Box: Injected Successfully (Subordinate to Core)!");
        }
        injectAttempts++;
    }, 500);

})();
