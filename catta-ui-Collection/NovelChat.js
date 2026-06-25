(function () {
    function registerNovelChat() {
        if (!window.CattaUI) {
            setTimeout(registerNovelChat, 500);
            return;
        }

        console.log("💬 NovelChat Suite: Initializing (Local Mode)...");


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

        const NOVEL_CSS = `
            .catta-chat-container { display: flex; flex-direction: column; gap: 6px; width: 100%; margin: 5px 0; font-family: inherit; }
            
            #chat .mes .mes_text .catta-narration { 
                display: block; width: 100%; text-align: center; 
                padding: 6px 5%; line-height: 1.6; word-wrap: break-word; box-sizing: border-box;
                color: var(--SmartThemeBodyColor); 
                opacity: 0.9; font-style: italic;
            }
            
            .catta-bubble-wrapper { display: flex; width: 100%; margin: 2px 0; animation: cattaBubbleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .catta-bubble-bot { justify-content: flex-start; padding-left: 5px; }
            .catta-bubble-user { justify-content: flex-end; padding-right: 5px; }
            
            #chat .mes .mes_text .catta-bubble { 
                max-width: 88%; padding: 10px 16px; line-height: 1.5; word-break: break-word; 
                box-shadow: 0 3px 12px rgba(0,0,0,0.2); text-align: left;
                color: #e0e0e0; 
                background: rgba(45, 45, 45, 0.6) !important; 
                border: 1px solid rgba(255,255,255,0.1) !important; 
                opacity: 1 !important; 
                backdrop-filter: blur(4px);
            }
            #chat .mes .mes_text .catta-bubble-user .catta-bubble,
            #chat .mes.is_user .mes_text .catta-bubble-user .catta-bubble { 
                background: rgba(55, 65, 80, 0.6) !important; 
            }
            
            body.catta-light-theme #chat .mes .mes_text .catta-bubble {
                color: #222222; 
                background: rgba(255, 255, 255, 0.8) !important; 
                border: 1px solid rgba(0, 0, 0, 0.15) !important; 
                box-shadow: 0 3px 12px rgba(0,0,0,0.08);
            }
            body.catta-light-theme #chat .mes .mes_text .catta-bubble-user .catta-bubble,
            body.catta-light-theme #chat .mes.is_user .mes_text .catta-bubble-user .catta-bubble {
                background: rgba(230, 242, 255, 0.8) !important; 
                border: 1px solid rgba(0, 100, 255, 0.15) !important;
            }
            
            #chat .mes .mes_text .catta-bubble-bot .catta-bubble { border-radius: 18px 18px 18px 4px; }
            
            #chat .mes .mes_text .catta-bubble-user .catta-bubble,
            #chat .mes.is_user .mes_text .catta-bubble-user .catta-bubble { 
                border-radius: 18px 18px 4px 18px; 
            }
            
            #chat .mes .mes_text .catta-bubble-user .catta-bubble *,
            #chat .mes.is_user .mes_text .catta-bubble-user .catta-bubble * { opacity: 1 !important; }
            
            #chat .mes .mes_text .catta-chat-container .clickable,
            #chat .mes .mes_text .catta-chat-container .st-clickable {
                display: inline-block; margin: 4px 0; z-index: 10; position: relative;
            }
            
            @keyframes cattaBubbleIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        `;

        window.CattaUI.registerModule({
            id: "novelchat",
            name: "💬 Visual Novel Chat",
            desc: "(Tokens: 0) เปิดแล้วใช้ได้ทันที แยกบรรยายตรงกลาง พูดซ้าย-ขวา :: หากชน ui อื่น ให้ปิดนะครับ",
            defaultState: false,
            promptKey: "",
            css: NOVEL_CSS,
            rules: [
                {
                    findRegex: "(^[\\s\\S]+$)",
                    replaceString: function (match) {
                        const token = localStorage.getItem('catta_auth_token');
                        const uid = localStorage.getItem('catta_uid');


                        const textColor = window.getComputedStyle(document.body).color;
                        const rgbMatch = textColor.match(/\d+/g);
                        if (rgbMatch && rgbMatch.length >= 3) {
                            const luma = 0.2126 * parseInt(rgbMatch[0]) + 0.7152 * parseInt(rgbMatch[1]) + 0.0722 * parseInt(rgbMatch[2]);
                            if (luma < 128) {
                                document.body.classList.add('catta-light-theme');
                            } else {
                                document.body.classList.remove('catta-light-theme');
                            }
                        }


                        let isUser = false;
                        let currentMes = window.CattaUI.cache.currentProcessingMsg;
                        if (currentMes) {
                            let isUserAttr = currentMes.getAttribute('is_user');
                            if (isUserAttr === 'true') { isUser = true; }
                            else if (isUserAttr === 'false') { isUser = false; }
                            else if (currentMes.classList.contains('is_user')) { isUser = true; }
                        }


                        let topTags = [];
                        // ดึง :::TAG::: ออกก่อน (raw tags ที่ยังไม่ได้ถูกแปลง)
                        let rawHtml = match.replace(/:::\s*\[[A-Za-z0-9_]+\][\s\S]*?:::/gi, (t) => {
                            topTags.push(t);
                            return "";
                        });

                        // [FIX] ig-node- และ hud-node- divs ที่ CattaGram/HUD สร้างไว้แล้ว
                        // ต้องอยู่ "ตำแหน่งเดิม" ในข้อความ ไม่ใช่ถูกดึงขึ้นบนสุด
                        // แก้: ใส่ลงใน uiBlocks (จะถูก resolve ตรงตำแหน่งในภายหลัง)
                        // แทนที่จะใส่ topTags แล้วเอาขึ้นบนสุดของ output
                        let preIgBlocks = [];
                        rawHtml = rawHtml.replace(/<div\s+id="(?:hud-node-|ig-node-)[^>]+>[\s\S]*?<\/div>/gi, (t) => {
                            const idx = preIgBlocks.length;
                            preIgBlocks.push(t);
                            return `[[CATTA_IG_BLOCK_${idx}]]`;
                        });


                        if (currentMes && currentMes.classList.contains('streaming')) {
                            let output = "";
                            if (topTags.length > 0) {
                                output += "<div style='color:var(--SmartThemeQuoteColor); font-size:12px; font-style:italic; margin-bottom:5px;'>[ UI Module is generating... ]</div>\n\n";
                            }
                            output += rawHtml;
                            return output;
                        }

                        if (!token || !uid) {
                            return match;
                        }

                        if (rawHtml.trim() === "") {
                            return topTags.join('\n\n');
                        }


                        let uiBlocks = [];

                        // [FIX] ย้าย ig-node-/hud-node- blocks ที่เก็บไว้ก่อนหน้า
                        // เข้ามาใน uiBlocks เพื่อให้ถูก resolve ตรงตำแหน่งของ placeholder
                        preIgBlocks.forEach((block, i) => {
                            rawHtml = rawHtml.replace(`[[CATTA_IG_BLOCK_${i}]]`, () => {
                                const placeholder = `\n[[UI_BLOCK_${uiBlocks.length}]]\n`;
                                uiBlocks.push(block);
                                return placeholder;
                            });
                        });

                        function resolveBlocks(text) {
                            let limit = 10;
                            while (text.includes('[[UI_BLOCK_') && limit > 0) {
                                text = text.replace(/\[\[UI_BLOCK_(\d+)\]\]/g, (m, p1) => uiBlocks[p1] || m);
                                limit--;
                            }
                            return text;
                        }


                        let tempDiv = document.createElement('div');
                        tempDiv.innerHTML = window.CattaUI && window.CattaUI.utils && window.CattaUI.utils.purifyHtml ? window.CattaUI.utils.purifyHtml(rawHtml) : rawHtml;

                        let uiElements = tempDiv.querySelectorAll('div, pre, table, audio, video, iframe, details, qsna, ui, center');

                        uiElements.forEach(el => {
                            if (tempDiv.contains(el)) {
                                let placeholder = `\n[[UI_BLOCK_${uiBlocks.length}]]\n`;
                                uiBlocks.push(el.outerHTML);
                                let textNode = document.createTextNode(placeholder);
                                el.parentNode.replaceChild(textNode, el);
                            }
                        });

                        let txt = tempDiv.innerHTML;


                        txt = txt.replace(/(「[\s\S]*?」|◤[\s\S]*?◢|↪[\s\S]*?↩|【[\s\S]*?】|《[\s\S]*?》)/gi, function (m) {
                            let placeholder = `\n[[UI_BLOCK_${uiBlocks.length}]]\n`;
                            uiBlocks.push(m);
                            return placeholder;
                        });


                        txt = txt.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
                            .replace(/<\/?p[^>]*>/gi, '')
                            .replace(/<br\s*\/?>/gi, '\n');

                        txt = txt.replace(/&(quot|ldquo|rdquo|#34|#8220|#8221);/gi, '"').replace(/[“”„«»]/g, '"');


                        const inlineTags = "font|span|b|i|strong|em|mark|color|s|u";
                        const openTagRegex = new RegExp(`(<(?:${inlineTags})[^>]*>)\\s*"`, 'gi');
                        const closeTagRegex = new RegExp(`"\\s*(<\\/(?:${inlineTags})>)`, 'gi');
                        for (let i = 0; i < 4; i++) {
                            txt = txt.replace(openTagRegex, '"$1');
                            txt = txt.replace(closeTagRegex, '$1"');
                        }

                        let maskedTags = [];
                        let safeTxt = txt.replace(/<[^>]+>/g, function (m) {
                            maskedTags.push(m);
                            return `[[TAG${maskedTags.length - 1}]]`;
                        });


                        let blocks = [];
                        let currentType = 'narration';
                        let buffer = '';

                        for (let i = 0; i < safeTxt.length; i++) {
                            let char = safeTxt[i];
                            if (char === '"') {
                                if (buffer.trim() || buffer.includes('[[TAG') || buffer.includes('[[UI_BLOCK')) {
                                    blocks.push({ type: currentType, text: buffer });
                                }
                                buffer = '';
                                currentType = (currentType === 'narration') ? 'dialogue' : 'narration';
                            } else {
                                buffer += char;
                            }
                        }
                        if (buffer.trim() || buffer.includes('[[TAG') || buffer.includes('[[UI_BLOCK')) {
                            blocks.push({ type: currentType, text: buffer });
                        }

                        let htmlOut = '<div class="catta-chat-container">';
                        let activeOpenTags = [];

                        blocks.forEach(block => {
                            let blockHtml = activeOpenTags.join('');

                            let restoredText = block.text.replace(/\[\[TAG(\d+)\]\]/g, (match, p1) => {
                                let tag = maskedTags[p1];
                                if (tag) {
                                    if (tag.match(/^<\//)) activeOpenTags.pop();
                                    else if (!tag.match(/\/>$/) && !tag.match(/^<(br|img|hr)/i)) activeOpenTags.push(tag);
                                    return tag;
                                }
                                return match;
                            });
                            blockHtml += restoredText;

                            let closingTags = activeOpenTags.slice().reverse().map(t => {
                                let tagMatch = t.match(/^<([a-zA-Z0-9-]+)/);
                                return tagMatch ? `</${tagMatch[1]}>` : '';
                            }).join('');
                            blockHtml += closingTags;

                            let subParts = blockHtml.split(/(\[\[UI_BLOCK_\d+\]\])/);

                            subParts.forEach(part => {
                                if (!part) return;

                                let uiMatch = part.match(/^\[\[UI_BLOCK_(\d+)\]\]$/);

                                if (uiMatch) {
                                    htmlOut += resolveBlocks(uiBlocks[uiMatch[1]]);
                                } else {
                                    let trimmed = part.trim();
                                    let hasMedia = trimmed.includes('<img') || trimmed.includes('<video');

                                    if (trimmed !== '' || hasMedia) {
                                        let finalTxt = trimmed.replace(/\n/g, '<br>');

                                        for (let k = 0; k < 3; k++) {
                                            finalTxt = finalTxt.replace(/^((?:<[^>]+>)*)(?:<br\s*\/?>|\s)+/gi, '$1');
                                            finalTxt = finalTxt.replace(/(?:<br\s*\/?>|\s)+((?:<\/[^>]+>)*)$/gi, '$1');
                                        }

                                        finalTxt = resolveBlocks(finalTxt);
                                        let checkEmpty = finalTxt.replace(/<[^>]+>/g, '').trim();

                                        if (checkEmpty !== '' || hasMedia) {
                                            if (block.type === 'dialogue') {
                                                let alignClass = isUser ? 'catta-bubble-user' : 'catta-bubble-bot';
                                                htmlOut += `<div class="catta-bubble-wrapper ${alignClass}"><div class="catta-bubble">${finalTxt}</div></div>`;
                                            } else {
                                                htmlOut += `<div class="catta-narration">${finalTxt}</div>`;
                                            }
                                        }
                                    }
                                }
                            });
                        });

                        htmlOut += '</div>';


                        let finalOutput = "";
                        if (topTags.length > 0) {
                            finalOutput += topTags.join('\n\n') + '\n\n';
                        }
                        finalOutput += htmlOut;

                        return finalOutput;
                    }
                }
            ]
        });
    }

    registerNovelChat();
})();
