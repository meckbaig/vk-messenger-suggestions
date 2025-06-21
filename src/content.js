let hintBox;
let previewBox;
let currentAudio = null;
let currentButton = null;
let debounceTimer = null;

function createHintBox() {
    hintBox = document.createElement('div');
    hintBox.id = 'vk-hint-box';

    previewBox = document.createElement('div');
    previewBox.id = 'vk-hint-hover-preview-container';
    document.body.appendChild(previewBox);
    document.body.appendChild(hintBox);
}

function updateHints(suggestions) {
    hintBox.innerHTML = '';
    if (suggestions === undefined || suggestions.length == 0) {
        hintBox.style.display = 'none'
        return
    } 
    console.log(suggestions);
    hintBox.style.display = 'block'
    suggestions.forEach(function (item) {
        console.log(item);
        const entry = document.createElement('div');
        entry.className = 'vk-hint-entry';
        var preview = getPreview(item)
        var inner =
            `<div class="vk-hint-preview-container">${preview}</div>
        <div class="vk-hint-text">
            <strong>${item.description}</strong>
            <small>${item.tags.join(', ')}</small>
        </div>`
        entry.innerHTML = inner;
        entry.onclick = () => attachMedia(item);
        hintBox.appendChild(entry);
    });
    document.querySelectorAll(".vk-hint-preview-audio").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const src = btn.dataset.src;
            e.stopPropagation();
            // Останавливаем текущий проигрываемый
            if (currentAudio && !currentAudio.paused) {
                currentAudio.pause();
                if (currentButton) currentButton.textContent = "▶️";
            }

            // Если это тот же файл — просто останавливаем
            if (currentAudio && currentAudio.src === src && !currentAudio.paused) {
                currentAudio = null;
                currentButton = null;
                return;
            }

            // Новый файл
            currentAudio = new Audio(src);
            currentButton = btn;
            currentAudio.play();
            btn.textContent = "⏸️";

            currentAudio.addEventListener("ended", () => {
                btn.textContent = "▶️";
                currentAudio = null;
                currentButton = null;
            });
        });
    });

    document.querySelectorAll(".vk-hint-preview-img").forEach(img => {
        img.addEventListener("mouseenter", () => {
            const src = img.src;
            previewBox.innerHTML = `<img src="${src}&x=256&y=256&a=0" alt="preview">`;
            previewBox.style.display = 'block';
        });
        img.addEventListener('mouseleave', () => {
            previewBox.style.display = 'none';
            previewBox.innerHTML = '';
        });
    });
}

// function createHint(media){
//     const entry = document.createElement('div');
//     entry.className = 'vk-hint-entry';

// }



function getPreview(media) {
    switch (media.mediaType) {
        case 'picture':
            return `<img class="vk-hint-preview-img" src="${media.mediaUrl}&x=64&y=64&a=0"></img>`;
        case 'voice':
            return `<button class="vk-hint-preview-audio" data-src="${media.mediaUrl}">▶️</button>`;
        default:
            return ''
    }
}



function getChatId(chatname) {
    var chats = new Map([["(ред.)", "2000000039"]]);
    return chats.get(chatname);
}


function attachMedia(media) {
    //const input = document.querySelector('textarea[name="message"]'); 
    //const textField = document.querySelector('div.uMailWrite__textareaGhost');
    const input = document.querySelector('[contenteditable]');
    if (!input) return;

    input.focus();
    input.innerText = '';

    switch (media.mediaType) {
        case 'picture':
            fetch(media.mediaUrl + '&x=4096&y=4096&a=1')
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "suggestion.webp", { type: blob.type });

                    // Ищем input[type=file] для изображений — на десктопной версии ВК это может быть такой класс:
                    const fileInput = document.querySelector('input[type="file"]');

                    if (fileInput) {
                        const dt = new DataTransfer();
                        dt.items.add(file);
                        fileInput.files = dt.files;

                        // Триггерим выбор файла
                        fileInput.dispatchEvent(new Event("change", { bubbles: true }));
                    } else {
                        console.warn("Не найден input[type=file]");
                    }
                });
            break;
        case 'voice':
            const messageLink = 'https://vk.com/im/convo/' + getChatId(media.messageLocation.dialogId) + '?cmid=' + media.messageLocation.messageId + '&entrypoint=go_to_source_message';
            window.open(messageLink);
            break;
    }
    updateHints()
}

function observeInput() {
    //const input = document.querySelector('textarea[name="message"]');
    //const textField = document.querySelector('div.uMailWrite__textareaGhost');

    const observer = new MutationObserver(() => {
        const input = document.querySelector('[contenteditable]');
        if (input && !input.dataset.hooked) {
            input.dataset.hooked = 'true'; // пометка, чтобы не вешать повторно
            console.log('✅ Найдено поле!');
            input.addEventListener('input', async () => {
                const text = input.innerText;
                
                // Очищаем предыдущий таймер
                if (debounceTimer) {
                    clearTimeout(debounceTimer);
                }
                
                if (text.length > 2) {
                    // Устанавливаем новый таймер
                    debounceTimer = setTimeout(async () => {
                    console.log(text);
                    const address = "url" + encodeURIComponent(text)
                    const response = await fetch(address);
                    const json = await response.json();
                    updateHints(json.items);
                    }, 200);
                } else {
                    // Если текст короткий, сразу скрываем подсказки
                    hintBox.innerHTML = '';
                    hintBox.style.display = 'none'
                }
            });
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

}

createHintBox();
observeInput();

