let hintBox;
let previewBox;
let currentAudio = null;
let currentButton = null;
let debounceTimer = null;
let chatMappings = {};
let input = null;


async function loadChatMappings() {
    try {
        const result = await browser.storage.local.get(['chatMappings']);
        chatMappings = result.chatMappings || {};
        console.log('Загружены маппинги чатов:', chatMappings);
    } catch (error) {
        console.error('Ошибка загрузки маппингов чатов:', error);
        chatMappings = {};
    }
}

function createHintBox() {
    hintBox = document.createElement('div');
    hintBox.id = CONFIG.ELEMENTS.HINT_BOX;

    previewBox = document.createElement('div');
    previewBox.id = CONFIG.ELEMENTS.PREVIEW_BOX;
    document.body.appendChild(previewBox);
    document.body.appendChild(hintBox);
}

function hideHintBox() {
    if (hintBox) {
        hintBox.innerHTML = '';
        hintBox.style.display = 'none'
    }
}

function hidePreviewBox() {
    if (previewBox) {
        previewBox.style.display = 'none';
        previewBox.innerHTML = '';
    }
}

function updateHints(suggestions) {
    hintBox.innerHTML = '';
    if (suggestions === undefined || suggestions.length == 0) {
        hideHintBox();
        hidePreviewBox();
        return;
    } 
    console.log(suggestions);
    hintBox.style.display = 'block'
    suggestions.forEach(function (item) {
        console.log(item);
        const entry = document.createElement('div');
        entry.className = CONFIG.CLASSES.HINT_ENTRY;
        var preview = getPreview(item)
        var inner =
            `<div class="${CONFIG.CLASSES.HINT_PREVIEW_CONTAINER}">${preview}</div>
                <div class="${CONFIG.CLASSES.HINT_TEXT}">
                <strong>${item.description}</strong>
                <small>${item.tags.join(', ')}</small>
            </div>`
        entry.innerHTML = inner;
        entry.onclick = () => attachMedia(item);
        hintBox.appendChild(entry);
    });
    document.querySelectorAll("." + CONFIG.CLASSES.HINT_PREVIEW_AUDIO).forEach(btn => {
        btn.addEventListener("click", (e) => {
            const src = btn.dataset.src;
            e.stopPropagation();
            // Останавливаем текущий проигрываемый
            if (currentAudio && !currentAudio.paused) {
                currentAudio.pause();
                if (currentButton) currentButton.textContent = "▶️";
                return;
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
            btn.textContent = "⏹️";

            currentAudio.addEventListener("ended", () => {
                btn.textContent = "▶️";
                currentAudio = null;
                currentButton = null;
            });
        });
    });

    document.querySelectorAll("." + CONFIG.CLASSES.HINT_PREVIEW_IMG).forEach(img => {
        img.addEventListener("mouseenter", () => {
            const src = img.src;
            previewBox.innerHTML = `<img src="${src}&x=256&y=256&a=1" alt="preview">`;
            previewBox.style.display = 'block';
        });
        img.addEventListener('mouseleave', () => {
            hidePreviewBox()
        });
    });
}

function getPreview(media) {
    switch (media.mediaType) {
        case 'picture':
            return `<img class="${CONFIG.CLASSES.HINT_PREVIEW_IMG}" src="${media.mediaUrl}${CONFIG.IMAGES.PREVIEW_PARAMS}"></img>`;
        case 'voice':
            return `<button class="${CONFIG.CLASSES.HINT_PREVIEW_AUDIO}" data-src="${media.mediaUrl}">▶️</button>`;
        default:
            return ''
    }
}

function getChatId(chatname) {
    return chatMappings[chatname] || null;
}

function attachMedia(media) {
    const input = document.querySelector('[contenteditable]');
    if (!input) return;

    input.focus();
    input.innerText = '';

    switch (media.mediaType) {
        case 'picture':
            fetch(media.mediaUrl + CONFIG.IMAGES.FULL_PARAMS)
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
            const chatId = getChatId(media.messageLocation.dialogId);
            if (chatId) {
                const messageLink = 'https://vk.com/im/convo/' + chatId + '?cmid=' + media.messageLocation.messageId + '&entrypoint=go_to_source_message';
                window.open(messageLink);
            } else {
                // Показываем popup с сообщением о необходимости добавить маппинг
                showMappingPopup(media.messageLocation.dialogId);
            }
            break;
    }
    updateHints()
}

// Функция для показа popup с сообщением о маппинге
function showMappingPopup(dialogId) {
    // Создаем popup элемент
    const popup = document.createElement('div');
    popup.id = CONFIG.ELEMENTS.POPUP;
    
    popup.innerHTML = `
        <h3>${CONFIG.MESSAGES.POPUP_TITLE}</h3>
        <p>${CONFIG.MESSAGES.MAPPING_REQUIRED} <strong>"${dialogId}"</strong> в настройках расширения.</p>
        <p>${CONFIG.MESSAGES.MAPPING_INSTRUCTIONS}</p>
        <button id="closePopup">${CONFIG.MESSAGES.BUTTON_UNDERSTAND}</button>
    `;
    
    document.body.appendChild(popup);
    
    // Обработчик кнопки закрытия
    popup.querySelector('#closePopup').addEventListener('click', () => {
        document.body.removeChild(popup);
    });
    
    // Закрытие по клику вне popup
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            document.body.removeChild(popup);
        }
    });
    
    // Автоматическое закрытие через 10 секунд
    setTimeout(() => {
        if (document.body.contains(popup)) {
            document.body.removeChild(popup);
        }
    }, CONFIG.POPUP.AUTO_CLOSE_DELAY);
}

function observeInput() {
    const observer = new MutationObserver(() => {
        input = document.querySelector('[contenteditable]');
        if (input && !input.dataset.hooked) {
            input.dataset.hooked = 'true'; // пометка, чтобы не вешать повторно
            console.log('✅ Найдено поле!');
            //todo: переделать и пофиксить
            startObservingInput();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function startObservingInput() {
    if(input){
        input.addEventListener('input', async () => {
            browser.storage.local.get(['extensionEnabled'], (result) => {
                if (result.extensionEnabled !== false) {
                    const text = input.innerText;
            
                // Очищаем предыдущий таймер
                if (debounceTimer) {
                    clearTimeout(debounceTimer);
                }
                
                if (text.length > CONFIG.SEARCH.MIN_LENGTH - 1 && text.length <= CONFIG.SEARCH.MAX_LENGTH) {
                    // Устанавливаем новый таймер
                    debounceTimer = setTimeout(async () => {
                        console.log(text);
                        const address = CONFIG.API.BASE_URL + encodeURIComponent(text)
                        const response = await fetch(address);
                        const json = await response.json();
                        updateHints(json.items);
                    }, CONFIG.DEBOUNCE.DELAY);
                } else {
                    hideHintBox()
                }
                    
                }
            });
            
        });
    }
}
// Слушатель изменений в хранилище
function setupStorageListener() {
    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.chatMappings) {
            chatMappings = changes.chatMappings.newValue || {};
            console.log('Маппинги чатов обновлены:', chatMappings);
        }
    });
    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.extensionEnabled) {
            const enabled = changes.extensionEnabled.newValue;
            if (!enabled) {
                hideHintBox();
                hidePreviewBox();
            }
        }
    });
}

createHintBox();
loadChatMappings();
setupStorageListener();
observeInput();
