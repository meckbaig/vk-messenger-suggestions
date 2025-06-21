// Конфигурация расширения VK Messenger Suggestions

const CONFIG = {
    // API настройки
    API: {
        BASE_URL: "url",
        CLIENT: "vk"
    },
    
    // Настройки debounce
    DEBOUNCE: {
        DELAY: 200 // миллисекунды
    },
    
    // Настройки поиска
    SEARCH: {
        MIN_LENGTH: 3,    // минимальная длина для поиска
        MAX_LENGTH: 50    // максимальная длина для поиска
    },
    
    // Настройки изображений
    IMAGES: {
        PREVIEW_PARAMS: "&x=64&y=64&a=0",
        FULL_PARAMS: "&x=4096&y=4096&a=1"
    },
    
    // Настройки popup
    POPUP: {
        AUTO_CLOSE_DELAY: 10000,  // автозакрытие через 10 секунд
        Z_INDEX: 10000,           // z-index для popup
        MAX_WIDTH: "400px"        // максимальная ширина popup
    },
    
    // CSS классы
    CLASSES: {
        HINT_BOX: 'vk-hint-box',
        HINT_ENTRY: 'vk-hint-entry',
        HINT_PREVIEW_CONTAINER: 'vk-hint-preview-container',
        HINT_PREVIEW_IMG: 'vk-hint-preview-img',
        HINT_PREVIEW_AUDIO: 'vk-hint-preview-audio',
        HINT_TEXT: 'vk-hint-text',
        HINT_HOVER_PREVIEW: 'vk-hint-hover-preview-container'
    },
    
    // ID элементов
    ELEMENTS: {
        HINT_BOX: 'vk-hint-box',
        PREVIEW_BOX: 'vk-hint-hover-preview-container',
        POPUP: 'vk-hint-popup'
    },
    
    // Цвета (в стиле ВКонтакте)
    COLORS_LIGHT: {
        PRIMARY: '#4a76a8',
        SECONDARY: '#6c757d',
        TEXT_PRIMARY: '#333',
        TEXT_SECONDARY: '#666',
        TEXT_MUTED: '#777',
        BORDER: '#ddd',
        BORDER_LIGHT: '#eee',
        BACKGROUND: '#fff',
        BACKGROUND_HOVER: '#f0f0f0',
        SHADOW: 'rgba(0,0,0,0.3)',
        SHADOW_LIGHT: 'rgba(0,0,0,0.1)',
        SUCCESS: '#28a745',
        WARNING: '#ffc107',
        ERROR: '#dc3545'
    },

    // URL// Цвета (в стиле ВКонтакте)
    COLORS_DARK: {
        PRIMARY: '#4a76a8',
        SECONDARY: '#6c757d',
        TEXT_PRIMARY: '#fff',
        TEXT_SECONDARY: '#828282',
        TEXT_MUTED: '#777',
        BORDER: '#363738',
        BORDER_LIGHT: '#eee',
        BACKGROUND: '#222222',
        BACKGROUND_HOVER: '#262626',
        SHADOW: 'rgba(0,0,0,0.3)',
        SHADOW_LIGHT: 'rgba(0,0,0,0.1)',
        SUCCESS: '#28a745',
        WARNING: '#ffc107',
        ERROR: '#dc3545'
    },
    
    // Сообщения
    MESSAGES: {
        MAPPING_REQUIRED: 'Добавьте маппинг на беседу',
        MAPPING_INSTRUCTIONS: 'Откройте popup расширения и добавьте новый маппинг.',
        POPUP_TITLE: 'Настройка маппинга',
        BUTTON_UNDERSTAND: 'Понятно'
    }
};

CONFIG.COLORS = CONFIG.COLORS_DARK;

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
} 

// Загрузка css переменных
function loadCssVariables() {
    const root = document.documentElement;
    Object.entries(CONFIG.COLORS).forEach(([key, value]) => {
        const cssVarName = `--vk-color-${key.toLowerCase().replace('_', '-')}`;
        root.style.setProperty(cssVarName, value);
    });

    root.style.setProperty('--vk-popup-z-index', CONFIG.POPUP.Z_INDEX);
    root.style.setProperty('--vk-popup-max-width', CONFIG.POPUP.MAX_WIDTH);
}

loadCssVariables();