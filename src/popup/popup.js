// Загрузка сохраненных чатов при открытии popup
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();

  // Инициализация модуля медиафайлов
  if (window.mediaModule) {
    window.mediaModule.setupMediaForm();
  }
  if (window.chatMappingsModule) {
    window.chatMappingsModule.setupChatMappingsForm();
  }
  if (window.settingsModule) {
    window.settingsModule.setupSettingsForm();
  }

  const result = browser.storage.local.get(["identity"], (result) => {
    console.debug(result);
    window.CONFIG.IDENTITY.TOKEN = result.identity.token || "";
    window.CONFIG.IDENTITY.USER_ID = result.identity.userId || "";
    window.CONFIG.IDENTITY.CLIENT = result.identity.client || "";
    if (!result.identity?.userId){
      const tabs = document.querySelectorAll(".tab");
      tabs.forEach((tab) => { 
        tab.classList.add('disabled');
      });
      return;
    }
    else {
      document.getElementById("authSection").style.display = "none";
    }
  });

  // === Обработка переключателя включения/выключения расширения ===
  const toggle = document.getElementById("extensionToggle");
  const toggleContainer = document.getElementById("extensionToggleContainer");
  if (toggle) {
    // Загрузка состояния
    if (window.browser && browser.storage && browser.storage.local) {
      browser.storage.local.get(["extensionEnabled"], (result) => {
        toggle.checked = result.extensionEnabled !== false;
        toggleContainer.title = toggle.checked
          ? "Расширение включено"
          : "Расширение выключено";
      });
    }

    toggle.addEventListener("change", () => {
      const enabled = toggle.checked;
      toggleContainer.title = toggle.checked
        ? "Расширение включено"
        : "Расширение выключено";
      if (window.browser && browser.storage && browser.storage.local) {
        browser.storage.local.set({ extensionEnabled: enabled });
      }
      showStatus(
        enabled ? "Функциональность включена" : "Функциональность выключена",
        enabled ? "success" : "error"
      );
    });
  }
});

// Настройка вкладок
function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab;

      // Убираем активный класс со всех вкладок и контента
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Добавляем активный класс к выбранной вкладке и контенту
      tab.classList.add("active");
      document.getElementById(`${targetTab}-tab`).classList.add("active");
    });
  });
}

// Показ статуса
function showStatus(message, type) {
  const statusElement = document.getElementById("status-box");
  const status = document.createElement("div");
  status.textContent = message;
  status.className = `status ${type}`;
  statusElement.appendChild(status);
  setTimeout(() => {
    statusElement.removeChild(status);
  }, 3000);
}

window.showStatus = showStatus;
