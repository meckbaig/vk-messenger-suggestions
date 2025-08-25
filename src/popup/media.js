
// Инициализация формы медиафайлов
async function setupMediaForm() {
  
  // Обработчик добавления медиафайла
  document.getElementById("addMedia").addEventListener("click", addMediaFile);

  // Обработчики для кнопок получения данных
  document.getElementById("getMessageData").addEventListener("click", getMessageData);

  // Обработчик изменения типа медиа
  document
    .getElementById("mediaType")
    .addEventListener("change", toggleMediaTypes);

  document.getElementById('getFile')
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
  toggleMediaTypes();
}



// Переключение отображения полей диалога и сообщения
function toggleMediaTypes() {
  const mediaType = document.getElementById("mediaType").value;
  const messageGroup = document
    .getElementById("messageId")
    .closest(".form-group");
  const getFileButton = document.getElementById("getFile");
  switch (mediaType) {
    case "picture":
      messageGroup.classList.add("hidden");
      getFileButton.classList.remove("hidden");
      break;

    case "voice":
      messageGroup.classList.remove("hidden");
      getFileButton.classList.add("hidden");
      break;
  }
}

// Получение данных диалога
async function getMessageData() {
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

        // Ищем ID сообщения  в элементах страницы
        const messageElements = document
          .querySelector(".ConvoHistory__messageBlockSelected--withoutBubbles")
          ?.closest(".VirtualScrollItem");
        if (!messageElements) {
          return { messageId: null };
        }

        const messageId = messageElements.getAttribute("data-itemkey");
        console.log(messageId);
        const audioUrl = messageElements.querySelector(".vkEnhancerDownloadAudioButton")?.href;
        console.log(audioUrl);
        return { messageId, chatName, audioUrl };
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
    if (result.messageId) {
      document.getElementById("messageId").value = result.messageId;
      showStatus("ID сообщения получен", "success");
    } else {
      showStatus(
        "Не удалось получить ID сообщения. Попробуйте выделить сообщение.",
        "error"
      );
    }
    if (result.audioUrl){
      document.getElementById('mediaUrl').value = result.audioUrl;
      showStatus("URL аудио получен", "success");
    }else {
      showStatus(
        "Не удалось получить аудио. Проверьте, установлено ли расширение VKTools.",
        "error"
      );
    }
  } catch (error) {
    console.error("Ошибка при получении данных сообщения:", error);
    showStatus("Произошла ошибка при получении данных", "error");
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
      formData.append("file", file, file.name);
      formData.append("mediaType", mediaType);
      console.debug(window.CONFIG.IDENTITY);
      try {
        showStatus("Загрузка файла...", "info");
        const response = await fetch(window.CONFIG.API.BASE_URL + "media/upload", {
          method: "POST",
          headers: {
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
      } catch (error) {
        console.error("Ошибка при загрузке файла:", error);
        showStatus("Ошибка сети при отправке данных", "error");
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
  toggleMediaTypes,
  getMessageData,
  addMediaFile,
  clearMediaForm,
};
