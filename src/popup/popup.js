// Загрузка сохраненных чатов при открытии popup
document.addEventListener('DOMContentLoaded', () => {

  setupTabs();
  
  // Инициализация модуля медиафайлов
  if (window.mediaModule) {
    window.mediaModule.setupMediaForm();
  }
  if (window.chatMappingsModule) {
    window.chatMappingsModule.setupChatMappingsForm();
  }

});

// Настройка вкладок
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Убираем активный класс со всех вкладок и контента
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Добавляем активный класс к выбранной вкладке и контенту
      tab.classList.add('active');
      document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
  });
}

// Показ статуса
function showStatus(message, type) {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
  statusElement.style.display = 'block';
  
  // Автоматическое скрытие для успешных сообщений
  if (type === 'success') {
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 3000);
  }
}


window.showStatus = showStatus;
