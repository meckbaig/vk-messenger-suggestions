// Инициализация формы медиафайлов
function setupMediaForm() {
  // Обработчик добавления медиафайла
  document.getElementById('addMedia').addEventListener('click', addMediaFile);
  
  // Обработчики для кнопок получения данных
  document.getElementById('getDialog').addEventListener('click', getDialogData);
  document.getElementById('getMessage').addEventListener('click', getMessageData);
  
  // Обработчик изменения типа медиа
  document.getElementById('mediaType').addEventListener('change', toggleMessageFields);
  
  // Инициализация отображения полей
  toggleMessageFields();
}

// Переключение отображения полей диалога и сообщения
function toggleMessageFields() {
  const mediaType = document.getElementById('mediaType').value;
  const dialogGroup = document.getElementById('dialogId').closest('.form-group');
  const messageGroup = document.getElementById('messageId').closest('.form-group');
  
  if (mediaType === 'picture') {
    dialogGroup.classList.add('hidden');
    messageGroup.classList.add('hidden');
  } else {
    dialogGroup.classList.remove('hidden');
    messageGroup.classList.remove('hidden');
  }
}

// Получение данных диалога с активной страницы
async function getDialogData() {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    
    const results = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const chatName = document.querySelector('.ConvoTitle__title h2').textContent.trim();
        return { chatName };
      }
    });
    
    const result = results[0].result;
    
    if (result.chatName) {
      document.getElementById('dialogId').value = result.chatName;
      showStatus('ID диалога получен', 'success');
    } else {
      showStatus('Не удалось получить ID диалога. Убедитесь, что вы находитесь на странице беседы ВКонтакте.', 'error');
    }
  } catch (error) {
    console.error('Ошибка при получении ID диалога:', error);
    showStatus('Произошла ошибка при получении ID диалога.', 'error');
  }
}

// Получение ID сообщения с активной страницы
async function getMessageData() {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });


    const results = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Ищем ID сообщения  в элементах страницы
        const messageElements = document
            .querySelector('.ConvoHistory__messageBlockSelected--withoutBubbles')
            ?.closest('.VirtualScrollItem');
        if (!messageElements) {
          return { messageId: null };
        }

        const messageId = messageElements.getAttribute('data-itemkey');
        console.log(messageId);
        return { messageId };
      }
    });
    
    const result = results[0].result;
    

    if (result.messageId) {
      document.getElementById('messageId').value = result.messageId;
      showStatus('ID сообщения получен', 'success');
    } else {
      showStatus('Не удалось получить ID сообщения. Попробуйте кликнуть на сообщение или перейти по ссылке на сообщение.', 'error');
    }
  } catch (error) {
    console.error('Ошибка при получении ID сообщения:', error);
    showStatus('Произошла ошибка при получении ID сообщения.', 'error');
  }
}

// Добавление медиафайла через API
async function addMediaFile() {
  const mediaType = document.getElementById('mediaType').value;
  const mediaUrl = document.getElementById('mediaUrl').value.trim();
  const description = document.getElementById('description').value.trim();
  const platform = "vk";
  const dialogId = document.getElementById('dialogId').value.trim();
  const messageId = document.getElementById('messageId').value.trim();
  
  // Валидация
  if (!description) {
    showStatus('Пожалуйста, заполните все обязательные поля', 'error');
    return;
  }
  
  const currentTags = document.getElementById('tags').value.split(',').map(tag => tag.trim());

  if (currentTags.length === 0) {
    showStatus('Добавьте хотя бы один тег', 'error');
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
        messageId: messageId
      },
      tags: currentTags
    }
  };

  if (mediaType === 'picture') {
    mediaData.mediaFile.messageLocation = null;
  }
  
  try {
    showStatus('Отправка данных...', 'info');
    
    // Отправка на API
    const response = await fetch(window.CONFIG.API.MEDIA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mediaData)
    });
    
    if (response.ok) {
      showStatus('Медиафайл успешно добавлен!', 'success');
      clearMediaForm();
    } else {
      const errorData = await response.json();
      showStatus(`Ошибка: ${errorData.message || 'Неизвестная ошибка'}`, 'error');
    }
  } catch (error) {
    console.error('Ошибка при добавлении медиафайла:', error);
    showStatus('Ошибка сети при отправке данных', 'error');
  }
}

// Очистка формы медиафайлов
function clearMediaForm() {
  document.getElementById('mediaUrl').value = '';
  document.getElementById('description').value = '';
  document.getElementById('dialogId').value = '';
  document.getElementById('messageId').value = '';
}

// Экспорт функций для использования в popup.js
window.mediaModule = {
  setupMediaForm,
  toggleMessageFields,
  getDialogData,
  getMessageData,
  addMediaFile,
  clearMediaForm
};