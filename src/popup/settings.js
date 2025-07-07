// Инициализация формы настроек
function setupSettingsForm() {
    
    const saveButton = document.getElementById('saveSettings');

    const baseUrlField = document.getElementById('baseUrl');

    // Загрузка текущих настроек
    browser.storage.local.get(['settings'], function(data) {
        console.log('Загруженные настройки:', data.settings);

        window.CONFIG.API.BASE_URL = data.settings?.baseUrl || window.CONFIG.API.BASE_URL;
        baseUrlField.value = window.CONFIG.API.BASE_URL;
    });

    // Сохранение настроек
    saveButton.addEventListener('click', function(event) {
        const settings = {};
        settings.baseUrl = baseUrlField.value.trim();
        if (!settings.baseUrl) {
            showStatus('Пожалуйста заполните поле базового адреса API', 'error');
            return;
        }
        window.CONFIG.API.BASE_URL = settings.baseUrl;
        // Сохраняем настройки в локальное хранилище
        browser.storage.local.set({ settings: settings }, function() {
            showStatus('Настройки сохранены', 'success');
        });
    });
}


window.settingsModule = {
    setupSettingsForm
};