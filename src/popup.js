// Полифилл для совместимости с Chromium
if (typeof browser === 'undefined') {
    window.browser = chrome;
}

// Загрузка сохраненных чатов при открытии popup
document.addEventListener('DOMContentLoaded', () => {
  loadChatMappings();
  
  // Добавляем делегирование событий для кнопок удаления
  document.getElementById("chatList").addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const chatName = e.target.dataset.chatName;
      if (chatName) {
        removeChatMapping(chatName);
      }
    }
  });
});

// Обработчик добавления нового чата
document.getElementById("addChat").addEventListener("click", () => {
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
});

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

// Делаем функцию removeChatMapping доступной глобально
window.removeChatMapping = removeChatMapping;

document.getElementById("run").addEventListener("click", () => {
  console.log("[VK-HINT] Нажата кнопка в popup");

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browser.tabs.executeScript(tabs[0].id, {
      code: 
        'alert("Привет из popup.js!");'
    });
  });
});
