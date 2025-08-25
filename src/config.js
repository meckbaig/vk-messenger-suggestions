// Конфигурация расширения VK Messenger Suggestions

const CONFIG = {
  // API настройки
  API: {
    BASE_URL: "https://myapi.com/v1/",
  },

  // Настройки идентификации
  IDENTITY: {
    TOKEN: null, // Токен пользователя
    USER_ID: null, // Идентификатор пользователя
    CLIENT: "vk", // Клиент, для которого используется расширение
  },

  // Настройки debounce
  DEBOUNCE: {
    DELAY: 200, // миллисекунды
  },

  // Настройки поиска
  SEARCH: {
    MIN_LENGTH: 3, // минимальная длина для поиска
    MAX_LENGTH: 50, // максимальная длина для поиска
  },

  // Настройки изображений
  IMAGES: {
    PREVIEW_PARAMS: "&x=64&y=64&a=0",
    FULL_PARAMS: "&x=4096&y=4096&a=1",
  },

  // Настройки popup
  POPUP: {
    AUTO_CLOSE_DELAY: 10000, // автозакрытие через 10 секунд
    Z_INDEX: 10000, // z-index для popup
    MAX_WIDTH: "400px", // максимальная ширина popup
  },

  // CSS классы
  CLASSES: {
    HINT_BOX: "vk-hint-box",
    HINT_ENTRY: "vk-hint-entry",
    HINT_PREVIEW_CONTAINER: "vk-hint-preview-container",
    HINT_PREVIEW_IMG: "vk-hint-preview-img",
    HINT_PREVIEW_AUDIO: "vk-hint-preview-audio",
    HINT_TEXT: "vk-hint-text",
    HINT_HOVER_PREVIEW: "vk-hint-hover-preview-container",
  },

  // ID элементов
  ELEMENTS: {
    HINT_BOX: "vk-hint-box",
    PREVIEW_BOX: "vk-hint-hover-preview-container",
    POPUP: "vk-hint-popup",
  },

  // Цвета (в стиле ВКонтакте)
  COLORS_LIGHT: {
    PRIMARY: "#4a76a8",
    SECONDARY: "#6c757d",
    TEXT_PRIMARY: "#333333",
    TEXT_ON_PRIMARY: "#ffffff",
    TEXT_SECONDARY: "#666666",
    TEXT_MUTED: "#777777",
    BORDER: "#dddddd",
    BORDER_LIGHT: "#eeeeee",
    BACKGROUND: "#ffffff",
    BACKGROUND_HOVER: "#f0f0f0",
    SHADOW: "rgba(0,0,0,0.3)",
    SHADOW_LIGHT: "rgba(0,0,0,0.1)",
    SUCCESS: "#28a745",
    WARNING: "#ffc107",
    ERROR: "#dc3545",
  },

  // URL// Цвета (в стиле ВКонтакте)
  COLORS_DARK: {
    PRIMARY: "#4a76a8",
    SECONDARY: "#6c757d",
    TEXT_PRIMARY: "#ffffff",
    TEXT_ON_PRIMARY: "#ffffff",
    TEXT_SECONDARY: "#828282",
    TEXT_MUTED: "#777777",
    BORDER: "#363738",
    BORDER_LIGHT: "#eeeeee",
    BACKGROUND: "#222222",
    BACKGROUND_HOVER: "#262626",
    SHADOW: "rgba(0,0,0,0.3)",
    SHADOW_LIGHT: "rgba(0,0,0,0.1)",
    SUCCESS: "#28a745",
    WARNING: "#ffc107",
    ERROR: "#dc3545",
  },
};

CONFIG.COLORS = CONFIG.COLORS_DARK;

// Экспорт для использования в других файлах
window.CONFIG = CONFIG;

// Загрузка css переменных
function loadCssVariables() {
  const root = document.documentElement;
  Object.entries(CONFIG.COLORS).forEach(([key, value]) => {
    const cssVarName = `--vk-color-${key.toLowerCase().replace("_", "-")}`;
    root.style.setProperty(cssVarName, value);
  });

  root.style.setProperty("--vk-popup-z-index", CONFIG.POPUP.Z_INDEX);
  root.style.setProperty("--vk-popup-max-width", CONFIG.POPUP.MAX_WIDTH);
}



async function registerUser(userId, userHash) {
  const userData = {
    userHash: userHash,
    messengerId: userId,
    client: "vk",
  };
  return fetch(window.CONFIG.API.BASE_URL + "auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })
    .then((response) => response.json())
    .then(async (data) => {
      if (data.token) {
        console.debug("Пользователь успешно зарегистрирован:", userId);
        await storeUser(data.token, userData.messengerId, userData.client);
        return true;
      } else {
        console.error("Ошибка регистрации пользователя");
        return false;
      }
    })
    .catch((error) => {
      console.error("Ошибка регистрации пользователя:", error);
      return false;
    });
}

async function authenticateUser(messengerId) {
  // Очищаем данные в хранилище
  await storeUser("", "", "")
  const userData = {
    messengerId: messengerId,
    client: "vk",
  };
  return await fetch(
    window.CONFIG.API.BASE_URL +
      `auth?messengerId=${userData.messengerId}&client=${userData.client}`
  )
  .then((response) => response.json())
  .then(async (data) => {
    console.debug("Ответ от API:", data);
    if (data.token) {
    // Сохраняем токен и идентификатор пользователя в хранилище и обновляем конфигурацию
      await storeUser(data.token, userData.messengerId, userData.client);
      console.log(
        "Пользователь успешно аутентифицирован:",
        userData.messengerId
      );
      return true;
    } else {
      console.error("Ошибка аутентификации пользователя:", data.errors);
      return false;
    }
  })
  .catch((error) => {
    console.error("Ошибка аутентификации пользователя:", error);
    return false;
  });
}

window.authenticateUser = authenticateUser;
window.registerUser = registerUser;


async function storeUser(token, userId, client) {
  window.CONFIG.IDENTITY.TOKEN = token;
  window.CONFIG.IDENTITY.USER_ID = userId;
  window.CONFIG.IDENTITY.CLIENT = client;

  await browser.storage.local.set({
    identity: {
      token: token,
      userId: userId,
      client: client,
    },
  });
}

loadCssVariables();
