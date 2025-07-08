function setupChatMappingsForm() {
    loadChatMappings();

    // Добавляем делегирование событий для кнопок
    document.getElementById("chatList").addEventListener("click", removeChat);
    
    document.getElementById("addChat").addEventListener("click", addChat);

    document.getElementById("getChat").addEventListener("click", getChatData);
}

function removeChat(e){
    if (e.target.classList.contains("remove-btn")) {
        const chatName = e.target.dataset.chatName;
        if (chatName) {
            removeChatMapping(chatName);
        }
    }
}

// Обработчик добавления нового чата
function addChat(){
    const chatName = document.getElementById("chatName").value.trim();
    const chatId = document.getElementById("chatId").value.trim();

    if (!chatName || !chatId) {
        alert("Пожалуйста, заполните оба поля!");
        return;
    }

    // Проверяем, что ID содержит только цифры
    if (!/^\d+$/.test(chatId)) {
        alert("ID чата должен содержать только цифры!");
        return;
    }

    addChatMapping(chatName, chatId);

    // Очищаем поля
    document.getElementById("chatName").value = "";
    document.getElementById("chatId").value = "";
}

async function getChatData(){
    try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        // Выполняем скрипт на странице для получения данных
        const results = await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const url = window.location.href;
                const titleElement = document.querySelector('.ConvoTitle__title h2');
                const chatName = titleElement ? titleElement.textContent.trim() : null;

                // Извлекаем ID из URL
                const match = url.match(/\/convo\/(\d+)/);
                const chatId = match ? match[1] : null;

                return { chatName, chatId, url };
            }   
        });

        const result = results[0].result;

        if (result.chatId && result.chatName) {
            addChatMapping(result.chatName, result.chatId);
            console.log(`Добавлен чат: ${result.chatName} (ID: ${result.chatId})`);
        } else {
            showStatus('Не удалось получить данные чата. Убедитесь, что вы находитесь на странице беседы ВКонтакте', 'error');
        }

    } catch (error) {
        console.error('Ошибка при получении данных чата:', error);
        showStatus('Произошла ошибка при получении данных чата', 'error');
    }
}


// Функция загрузки и отображения маппингов
function loadChatMappings() {
    browser.storage.local.get(['chatMappings']).then((result) => {
        const mappings = result.chatMappings || {};
        const chatList = document.getElementById("chatList");

        if (Object.keys(mappings).length === 0) {
            chatList.innerHTML = '<p style="color: #999; text-align: center;">Нет сохраненных чатов</p>';
            return;
        }

        chatList.innerHTML = '';

        Object.entries(mappings).forEach(([chatName, chatId]) => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.innerHTML = `
          <div>
            <strong>${chatName}</strong><br>
            <small>ID: ${chatId}</small>
          </div>
          <button class="remove-btn" data-chat-name="${chatName}">Удалить</button>
        `;
            chatList.appendChild(chatItem);
        });
    });
}

// Функция добавления маппинга чата
function addChatMapping(chatName, chatId) {
    browser.storage.local.get(['chatMappings']).then((result) => {
        const mappings = result.chatMappings || {};
        mappings[chatName] = chatId;

        browser.storage.local.set({ chatMappings: mappings }).then(() => {
            loadChatMappings(); // Перезагружаем список
            console.log(`Добавлен чат: ${chatName} -> ${chatId}`);
        });
    });
}

// Функция удаления маппинга чата
function removeChatMapping(chatName) {
    browser.storage.local.get(['chatMappings']).then((result) => {
        const mappings = result.chatMappings || {};
        delete mappings[chatName];

        browser.storage.local.set({ chatMappings: mappings }).then(() => {
            loadChatMappings(); // Перезагружаем список
            console.log(`Удален чат: ${chatName}`);
        });
    });
}


window.chatMappingsModule = {
    setupChatMappingsForm,
    loadChatMappings,
    addChatMapping,
    removeChatMapping
};
