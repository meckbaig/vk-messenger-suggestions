// Инициализация формы настроек
function setupSettingsForm() {
  const saveButton = document.getElementById("saveSettings");

  const baseUrlField = document.getElementById("baseUrl");

  // Загрузка текущих настроек
  browser.storage.local.get(["settings"], function (data) {
    console.log("Загруженные настройки:", data.settings);

    window.CONFIG.API.BASE_URL =
      data.settings?.baseUrl || window.CONFIG.API.BASE_URL;
    baseUrlField.value = window.CONFIG.API.BASE_URL;
  });

  // Сохранение настроек
  saveButton.addEventListener("click", function (event) {
    const settings = {};
    settings.baseUrl = baseUrlField.value.trim();
    if (!settings.baseUrl) {
      showStatus("Пожалуйста заполните поле базового адреса API", "error");
      return;
    }
    window.CONFIG.API.BASE_URL = settings.baseUrl;
    // Сохраняем настройки в локальное хранилище
    browser.storage.local.set({ settings: settings },  () => {
      showStatus("Настройки сохранены", "success");
    });
  });

  document.getElementById("register").addEventListener("click", async () => {
    const userHash = document.getElementById("userHash").value.trim();
    try {
      const [tab] = await browser.tabs.query({
        active: true,
      });
      const user = await browser.tabs.sendMessage(tab.id, { type: "GET_VK_USER" });
      if(user && await registerUser(user?.user_id?.toString(), userHash))
      {
        const tabs = document.querySelectorAll(".tab");
        tabs.forEach((tab) => { 
          tab.classList.remove('disabled');
        });
        document.getElementById("authSection").style.display = "none";
        showStatus("Регистрация успешна", "success");
      } else {
        showStatus("Ошибка регистрации. Проверьте хэш и попробуйте снова.", "error");
      }
    }
    catch (error) {
      showStatus("Ошибка регистрации " + error, "error");
    }
  });
}

window.settingsModule = {
  setupSettingsForm,
};
