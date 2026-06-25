(function () {
    // ============================================================
    // ABC HUD MODULE (Frontend Parsing)
    // ============================================================

    // ใช้ Event Delegation ในการดักคลิกเพื่อป้องกันการถูกลบ onclick ออกโดย CattaCore (DOMPurify/Sanitizer)
    if (!window._abcHudListenerAdded) {
        document.addEventListener('click', function (e) {
            if (e.target && e.target.classList && e.target.classList.contains('abc-hud-btn')) {
                const text = e.target.getAttribute('data-raw') || e.target.innerText;
                const ta = document.getElementById('send_textarea');
                const btn = document.getElementById('send_but');
                if (ta && btn) {
                    ta.value = text;
                    // Trigger input event to update React/Vue states if any, though SillyTavern uses jQuery mostly
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                    btn.click();
                }
            }
        });
        window._abcHudListenerAdded = true;
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

    if (window.CattaUI) {
        window.CattaUI.registerModule({
            id: "abchud",
            name: "🐥: ตัวเลือก V 1.0",
            desc: "(Tokens: 282) ปุ่มทางเลือก (Choice) V 1.0",
            defaultState: false,
            promptKey: "abchud_Prompt",
            css: "",
            rules: [
                {
                    // Catch :::[CHOICE] ... :::
                    findRegex: "(:?::\\s*\\[CHOICE\\][\\s\\S]*?:::)",
                    replaceString: function (match) {
                        // Extract content between :::[CHOICE] and :::
                        const contentMatch = match.match(/\[CHOICE\]([\s\S]*?):::/);
                        if (!contentMatch) return '';

                        const content = contentMatch[1].trim();
                        // ถ้าระบบใช้ | เป็นตัวแบ่ง ให้ตัดด้วย | แต่ถ้าไม่มี ให้กลับไปใช้การขึ้นบรรทัดใหม่
                        const rawChoices = content.includes('|') ? content.split('|') : content.split(/\r?\n|\\n/);
                        let choices = [];

                        for (let raw of rawChoices) {
                            let text = raw.trim();
                            // ลบการเว้นบรรทัดที่อาจติดมาในกรณีที่ตัดด้วย |
                            text = text.replace(/\r?\n|\\n/g, '').trim();
                            
                            // ลบวงเล็บปีกกา { } ที่ครอบอยู่
                            text = text.replace(/^{|}$/g, '').trim();
                            
                            // เผื่อ AI เผลอใส่เลข 1. 2. หรือ - ติดมาด้วย
                            text = text.replace(/^(?:\d+[\.\:]|-)\s*/, '').trim();

                            // ลบแท็ก <q> และ </q> ที่ AI อาจจะพ่นออกมา
                            text = text.replace(/<\/?q>/gi, '').trim();

                            if (text && !text.includes('[CHOICE]')) {
                                choices.push(text);
                            }
                        }

                        let html = '<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; font-size:0.9em; width:100%;">';
                        if (choices.length === 0) {
                            html += '<div style="color:#ff4444; border:1px solid #ff4444; padding:10px; border-radius:8px; margin:10px 0;">[ABC HUD: No choices parsed. Pattern might be wrong.]<br><br>' + esc(match) + '</div>';
                        } else {
                            const colors = ['#FFB7B2', '#A2D2FF', '#FACE7F', '#99E2B4'];
                            for (let i = 0; i < choices.length; i++) {
                                const color = colors[i % 4];
                                // ใช้ choices[i] ตรงๆ เพื่อให้แสดงผลแท็ก HTML (เช่น <font>) ได้ และเก็บค่าดิบไว้ใน data-raw เผื่อส่งกลับเข้าแชท
                                html += '<button class="abc-hud-btn" data-raw="' + esc(choices[i]) + '" style="background:transparent; border:2px solid ' + color + '; border-radius:15px; padding:10px; color:' + color + '; flex:1 1 45%; text-align:left; cursor:pointer;">' + choices[i] + '</button>';
                            }
                        }
                        html += '</div>';

                        return html;
                    }
                }
            ]
        });
    }
})();
