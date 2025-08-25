let hintBox;
let previewBox;
let currentAudio = null;
let currentButton = null;
let debounceTimer = null;
let chatMappings = {};
let input = null;

async function loadChatMappings() {
  try {
    const result = await browser.storage.local.get(["chatMappings"]);
    chatMappings = result.chatMappings || {};
    console.log("Загружены маппинги чатов:", chatMappings);
  } catch (error) {
    console.error("Ошибка загрузки маппингов чатов:", error);
    chatMappings = {};
  }
}

async function loadSettings() {
  try {
    const result = await browser.storage.local.get(["settings"]);
    window.CONFIG.API.BASE_URL =
      result.settings?.baseUrl || window.CONFIG.API.BASE_URL;
    console.log("Загружены настройки:", window.CONFIG.API.BASE_URL);
  } catch (error) {
    console.error("Ошибка загрузки настроек:", error);
    window.CONFIG.API.BASE_URL = "https://myapi.com/v1/";
  }
}

function createHintBox() {
  hintBox = document.createElement("div");
  hintBox.id = CONFIG.ELEMENTS.HINT_BOX;

  previewBox = document.createElement("div");
  previewBox.id = CONFIG.ELEMENTS.PREVIEW_BOX;
  document.body.appendChild(previewBox);
  document.body.appendChild(hintBox);
}

function hideHintBox() {
  if (hintBox) {
    hintBox.innerHTML = "";
    hintBox.style.display = "none";
  }
}

function hidePreviewBox() {
  if (previewBox) {
    previewBox.style.display = "none";
    previewBox.innerHTML = "";
  }
}

function updateHints(suggestions) {
  hintBox.innerHTML = "";
  if (suggestions === undefined || suggestions.length == 0 || input.innerText.length < CONFIG.SEARCH.MIN_LENGTH) {
    hideHintBox();
    hidePreviewBox();
    return;
  }
  console.log(suggestions);
  hintBox.style.display = "block";
  suggestions.forEach(function (item) {
    console.log(item);
    const entry = document.createElement("div");
    entry.className = CONFIG.CLASSES.HINT_ENTRY;
    var preview = getPreview(item);
    var inner = `<div class="${
      CONFIG.CLASSES.HINT_PREVIEW_CONTAINER
    }">${preview}</div>
                <div class="${CONFIG.CLASSES.HINT_TEXT}">
                <strong>${item.description}</strong>
                <small>${item.tags.join(", ")}</small>
            </div>`;
    entry.innerHTML = inner;
    entry.onclick = () => attachMedia(item);
    hintBox.appendChild(entry);
  });
  document
    .querySelectorAll("." + CONFIG.CLASSES.HINT_PREVIEW_AUDIO)
    .forEach((btn) => {
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

  document
    .querySelectorAll("." + CONFIG.CLASSES.HINT_PREVIEW_IMG)
    .forEach((img) => {
      img.addEventListener("mouseenter", () => {
        const src = img.src;
        previewBox.innerHTML = `<img src="${src}&x=256&y=256&a=1" alt="preview">`;
        previewBox.style.display = "block";
      });
      img.addEventListener("mouseleave", () => {
        hidePreviewBox();
      });
    });
}

function getPreview(media) {
  switch (media.mediaType) {
    case "picture":
      return `<img class="${CONFIG.CLASSES.HINT_PREVIEW_IMG}" src="${media.mediaUrl}${CONFIG.IMAGES.PREVIEW_PARAMS}"></img>`;
    case "voice":
      return `<button class="${CONFIG.CLASSES.HINT_PREVIEW_AUDIO}" data-src="${media.mediaUrl}">▶️</button>`;
    default:
      return "";
  }
}

function getChatId(chatname) {
  return chatMappings[chatname] || null;
}

function attachMedia(media) {
  const input = document.querySelector("[contenteditable]");
  if (!input) return;

  input.focus();
  input.innerText = "";

  switch (media.mediaType) {
    case "picture":
      fetch(media.mediaUrl + CONFIG.IMAGES.FULL_PARAMS)
        .then((res) => res.blob())
        .then((blob) => {
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
    case "voice":
      const chatId = getChatId(media.messageLocation.dialogId);
      if (chatId) {
        const messageLink =
          "https://vk.com/im/convo/" +
          chatId +
          "?cmid=" +
          media.messageLocation.messageId +
          "&entrypoint=go_to_source_message";
        window.open(messageLink);
      } else {
        // Показываем popup с сообщением о необходимости добавить маппинг
        showMappingPopup(media.messageLocation.dialogId);
      }
      break;
  }
  updateHints();
}

// Функция для показа popup с сообщением о маппинге
function showMappingPopup(dialogId) {
  // Создаем popup элемент
  const popup = document.createElement("div");
  popup.id = CONFIG.ELEMENTS.POPUP;

  popup.innerHTML = `
        <h3>${CONFIG.MESSAGES.POPUP_TITLE}</h3>
        <p>${CONFIG.MESSAGES.MAPPING_REQUIRED} <strong>"${dialogId}"</strong> в настройках расширения.</p>
        <p>${CONFIG.MESSAGES.MAPPING_INSTRUCTIONS}</p>
        <button id="closePopup">${CONFIG.MESSAGES.BUTTON_UNDERSTAND}</button>
    `;

  document.body.appendChild(popup);

  // Обработчик кнопки закрытия
  popup.querySelector("#closePopup").addEventListener("click", () => {
    document.body.removeChild(popup);
  });

  // Закрытие по клику вне popup
  popup.addEventListener("click", (e) => {
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
    input = document.querySelector("[contenteditable]");
    if (input && !input.dataset.hooked) {
      input.dataset.hooked = "true"; // пометка, чтобы не вешать повторно
      console.log("✅ Найдено поле!");
      //todo: переделать и пофиксить
      startObservingInput();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function startObservingInput() {
  if (input) {
    input.addEventListener("input", onInput);
  }
}

async function onInput() {
  browser.storage.local.get(["extensionEnabled"], (result) => {
    if (result.extensionEnabled !== false) {
      if (window.CONFIG.IDENTITY.TOKEN) {
        const text = input.innerText;

        // Очищаем предыдущий таймер
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        if (
          text.length > CONFIG.SEARCH.MIN_LENGTH - 1 &&
          text.length <= CONFIG.SEARCH.MAX_LENGTH
        ) {
          // Устанавливаем новый таймер
          debounceTimer = setTimeout(async () => {
            console.log(text);
            const address =
              CONFIG.API.BASE_URL +
              "suggestions?client=" +
              CONFIG.IDENTITY.CLIENT +
              "&searchString=" +
              encodeURIComponent(text);
            const response = await fetch(address, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.CONFIG.IDENTITY.TOKEN,
              },
            });
            const json = await response.json();
            console.debug("Ответ от API:", json);
            updateHints(json.items);
          }, CONFIG.DEBOUNCE.DELAY);
        } else {
          hideHintBox();
        }
      } else {
        authenticateUser();
      }
    }
  });
}

// Слушатель изменений в хранилище
function setupStorageListener() {
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.chatMappings) {
      chatMappings = changes.chatMappings.newValue || {};
      console.log("Маппинги чатов обновлены:", chatMappings);
    }
  });
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.extensionEnabled) {
      const enabled = changes.extensionEnabled.newValue;
      if (!enabled) {
        hideHintBox();
        hidePreviewBox();
      }
    }
  });
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.settings) {
      const settings = changes.settings.newValue || {};
      window.CONFIG.API.BASE_URL =
        settings.baseUrl || window.CONFIG.API.BASE_URL;
      console.log("Настройки обновлены:", window.CONFIG.API.BASE_URL);
    }
  });
}

function getUser() {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (/^\d+:web_token:login:auth$/.test(key)) {
        resolve(localStorage.getItem(key));
        return;
      }
    }
    reject(new Error("Пользователь не найден в localStorage")); // Если не найдено
  });
}

async function authenticateUser() {
  // Очищаем данные в хранилище
  await storeUser("", "", "")
  const userData = {
    messengerId: "",
    client: "vk",
  };
  
  getUser()
    .then((user) => {
      return JSON.parse(user);
    })
    .then((user) => {
      userData.messengerId = user.user_id.toString();
    })
    .then(() => {
      return fetch(
        window.CONFIG.API.BASE_URL +
          `auth?messengerId=${userData.messengerId}&client=${userData.client}`
      )
    })
    .then((response) => response.json())
    .then((data) => {
      console.debug("Ответ от API:", data);
      if (data.status == 404) {
        showRegistrationPopup(userData.messengerId);
      } else if (data.token) {
      // Сохраняем токен и идентификатор пользователя в хранилище и обновляем конфигурацию
        storeUser(data.token, userData.messengerId, userData.client);
        console.log(
          "Пользователь успешно аутентифицирован:",
          userData.messengerId
        );
      } else {
        console.error("Ошибка аутентификации пользователя:", data.errors);
      }
    })
    .catch((error) => {
      console.error("Ошибка аутентификации пользователя:", error);
    });
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
    .then((data) => {
      if (data.token) {
        console.debug("Пользователь успешно зарегистрирован:", userId);
        storeUser(data.token, userData.messengerId, userData.client);
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

// Функция для показа popup с сообщением о маппинге
function showRegistrationPopup(messengerId) {
  // Создаем popup элемент
  if (document.getElementById(CONFIG.ELEMENTS.POPUP)) {
    return; // Если уже открыт, не открываем снова
  }

  const popup = document.createElement("dialog");
  popup.open = true;
  popup.id = CONFIG.ELEMENTS.POPUP;

  popup.innerHTML = `
        <button id="popupCloseButton" value="close">&times;</button>
        <h3>Регистрация</h3>
        <p id="popupMessage">Укажите хэш, предоставленный администратором API.</p>
        <input type="text" id="userHash" placeholder="Введите хэш пользователя">
        <button id="register">Зарегистрироваться</button>
    `;

  // Обработчик кнопки крестика
  popup
    .querySelector("#popupCloseButton")
    .addEventListener("click", closePopup);

  popup.querySelector("#register").addEventListener("click", async () => {
    const userHash = document.getElementById("userHash").value.trim();
    if (await registerUser(messengerId, userHash)) {
      closePopup();
    } else {
      document.getElementById("popupMessage").textContent =
        "Ошибка регистрации. Проверьте хэш и попробуйте снова.";
    }
  });

  document.body.appendChild(popup);
}

function closePopup() {
  const popup = document.getElementById(CONFIG.ELEMENTS.POPUP);
  if (popup) {
    document.body.removeChild(popup);
  }
}

async function init() {
  createHintBox();
  await loadChatMappings();
  await loadSettings();
  setupStorageListener();
  observeInput();
  authenticateUser();
}

init();
