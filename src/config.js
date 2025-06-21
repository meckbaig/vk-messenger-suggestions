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
        PREVIEW_BOX: 'vk-hint-hover-preview-container'
    },
    
    // Цвета (в стиле ВКонтакте)
    COLORS: {
        PRIMARY: '#4a76a8',
        SECONDARY: '#6c757d',
        TEXT_PRIMARY: '#333',
        TEXT_SECONDARY: '#666',
        BORDER: '#ddd',
        BACKGROUND: '#fff'
    },
    
    // Сообщения
    MESSAGES: {
        MAPPING_REQUIRED: 'Добавьте маппинг на беседу',
        MAPPING_INSTRUCTIONS: 'Откройте popup расширения и добавьте новый маппинг.',
        POPUP_TITLE: 'Настройка маппинга',
        BUTTON_UNDERSTAND: 'Понятно'
    }
};

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
} 