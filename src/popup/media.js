// Инициализация формы медиафайлов
async function setupMediaForm() {
  const result = await browser.storage.local.get(["identity"])
  console.debug(result);
  window.CONFIG.IDENTITY.TOKEN = result.identity.token || "";
  window.CONFIG.IDENTITY.USER_ID = result.identity.userId || "";
  window.CONFIG.IDENTITY.CLIENT = result.identity.client || "";
  
  if (!result.identity?.userId){
    document.getElementById("hideMediaOptions").style.display = "block";
    return;
  }

  // Обработчик добавления медиафайла
  document.getElementById("addMedia").addEventListener("click", addMediaFile);

  // Обработчики для кнопок получения данных
  document.getElementById("getDialog").addEventListener("click", getDialogData);
  document
    .getElementById("getMessage")
    .addEventListener("click", getMessageData);

  // Обработчик изменения типа медиа
  document
    .getElementById("mediaType")
    .addEventListener("change", toggleMessageFields);

  document.getElementById('uploadFile')
    .addEventListener('click', () => {
        document.getElementById('fileInput').click();
      });
        
  document.getElementById('fileInput')
    .addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        document.getElementById('mediaUrl').value = "[File] " + e.target.files[0].name;
      }
  });
  // Инициализация отображения полей
  toggleMessageFields();
}



// Переключение отображения полей диалога и сообщения
function toggleMessageFields() {
  const mediaType = document.getElementById("mediaType").value;
  const dialogGroup = document
    .getElementById("dialogId")
    .closest(".form-group");
  const messageGroup = document
    .getElementById("messageId")
    .closest(".form-group");

  if (mediaType === "picture") {
    dialogGroup.classList.add("hidden");
    messageGroup.classList.add("hidden");
  } else {
    dialogGroup.classList.remove("hidden");
    messageGroup.classList.remove("hidden");
  }
}

// Получение данных диалога с активной страницы
async function getDialogData() {
  try {
    const [tab] = await browser.tabs.query({
      active: true,
    });

    const results = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const chatName = document
          .querySelector(".ConvoTitle__title h2")
          .textContent.trim();
        return { chatName };
      },
    });

    const result = results[0].result;

    if (result.chatName) {
      document.getElementById("dialogId").value = result.chatName;
      showStatus("ID диалога получен", "success");
    } else {
      showStatus(
        "Не удалось получить ID диалога. Убедитесь, что вы находитесь на странице беседы ВКонтакте.",
        "error"
      );
    }
  } catch (error) {
    console.error("Ошибка при получении ID диалога:", error);
    showStatus("Произошла ошибка при получении ID диалога.", "error");
  }
}

// Получение ID сообщения с активной страницы
async function getMessageData() {
  try {
    const [tab] = await browser.tabs.query({
      active: true,
    });

    const results = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Ищем ID сообщения  в элементах страницы
        const messageElements = document
          .querySelector(".ConvoHistory__messageBlockSelected--withoutBubbles")
          ?.closest(".VirtualScrollItem");
        if (!messageElements) {
          return { messageId: null };
        }

        const messageId = messageElements.getAttribute("data-itemkey");
        console.log(messageId);
        return { messageId };
      },
    });

    const result = results[0].result;

    if (result.messageId) {
      document.getElementById("messageId").value = result.messageId;
      showStatus("ID сообщения получен", "success");
    } else {
      showStatus(
        "Не удалось получить ID сообщения. Попробуйте кликнуть на сообщение или перейти по ссылке на сообщение.",
        "error"
      );
    }
  } catch (error) {
    console.error("Ошибка при получении ID сообщения:", error);
    showStatus("Произошла ошибка при получении ID сообщения.", "error");
  }
}

// Добавление медиафайла через API
async function addMediaFile() {
  const mediaType = document.getElementById("mediaType").value;
  var mediaUrl = document.getElementById("mediaUrl").value.trim();

  if (mediaUrl.includes("[File]")) {
    if (document.getElementById("fileInput").files.length > 0) {
      const file = document.getElementById("fileInput").files[0];
      
      const formData = new FormData();
      formData.append("File", file, file.name);
      formData.append("MediaType", mediaType);
      console.debug(window.CONFIG.IDENTITY);
      const response = await fetch(window.CONFIG.API.BASE_URL + "media/upload", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${window.CONFIG.IDENTITY.TOKEN}`
        },
        body: formData,
      });
      console.debug(response);
      if (response.ok) {
        const data = await response.json();
        mediaUrl = data.previewUrl; // Получаем URL загруженного файла
      } else {
        const errorData = await response.json();
        showStatus(`Ошибка загрузки файла: ${errorData.title}`, "error");
        return;
      }
    }
    else{
      showStatus("Пожалуйста, загрузите файл", "error");
      return;
    }
  }
  else if (!URL.canParse(mediaUrl)) {
    showStatus("Пожалуйста, введите корректный URL медиафайла", "error");
    return;
  }
  

  const description = document.getElementById("description").value.trim();
  const platform = "vk";
  const dialogId = document.getElementById("dialogId").value.trim();
  const messageId = document.getElementById("messageId").value.trim();

  // Валидация
  if (!description) {
    showStatus("Пожалуйста, заполните все обязательные поля", "error");
    return;
  }

  const currentTags = document
    .getElementById("tags")
    .value.split(",")
    .map((tag) => tag.trim());

  if (currentTags.length === 0) {
    showStatus("Добавьте хотя бы один тег", "error");
    return;
  }

  // Создание объекта медиафайла
  const mediaData = {
    mediaFile: {
      mediaType: mediaType,
      mediaUrl: mediaUrl,
      description: description,
      messageLocation: {
        platform: platform,
        dialogId: dialogId,
        messageId: messageId,
      },
      tags: currentTags,
    },
  };

  if (mediaType === "picture") {
    mediaData.mediaFile.messageLocation = null;
  }

  try {
    showStatus("Отправка данных...", "info");

    // Отправка на API
    const response = await fetch(window.CONFIG.API.BASE_URL + "media", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${window.CONFIG.IDENTITY.TOKEN}`,
      },
      body: JSON.stringify(mediaData),
    });

    if (response.ok) {
      showStatus("Медиафайл успешно добавлен!", "success");
      clearMediaForm();
    } else {
      const errorData = await response.json();
      showStatus(
        `Ошибка: ${errorData.title || "Неизвестная ошибка"}`,
        "error"
      );
    }
  } catch (error) {
    console.error("Ошибка при добавлении медиафайла:", error);
    showStatus("Ошибка сети при отправке данных", "error");
  }
}

// Очистка формы медиафайлов
function clearMediaForm() {
  document.getElementById("mediaUrl").value = "";
  document.getElementById("description").value = "";
  document.getElementById("dialogId").value = "";
  document.getElementById("messageId").value = "";
}

// Экспорт функций для использования в popup.js
window.mediaModule = {
  setupMediaForm,
  toggleMessageFields,
  getDialogData,
  getMessageData,
  addMediaFile,
  clearMediaForm,
};
