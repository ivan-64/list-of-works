document.addEventListener("DOMContentLoaded", function () {
  // Получаем основные элементы страницы
  const table = document.getElementById("mainTable");
  const addRowBtn = document.getElementById("addRowBtn");
  const tbody = table.querySelector("tbody");
  const totalCostCell = document.getElementById("totalCost");
  const caption = document.getElementById("captionText");

  // Ключи для localStorage
  const STORAGE_KEY = "tableData";
  const CAPTION_KEY = "captionText";

  // Получаем ссылку на кнопку создания нового документа
  const newDocBtn = document.getElementById("newDocBtn");

  // Получаем ссылки на новые кнопки
  const saveDocBtn = document.getElementById("saveDocBtn");
  const openDocBtn = document.getElementById("openDocBtn");

  // Ключ для хранения списка документов
  const DOC_LIST_KEY = "docList";

  // Получаем ссылку на выпадающий список и кнопку открытия выбранного документа
  const docSelect = document.getElementById("docSelect");
  const openSelectedDocBtn = document.getElementById("openSelectedDocBtn");

  // Получаем ссылку на кнопку удаления выбранного документа
  const deleteSelectedDocBtn = document.getElementById("deleteSelectedDocBtn");
  // Получаем ссылку на кнопку сохранения в PDF
  const savePdfBtn = document.getElementById("savePdfBtn");

  // === БУРГЕР-МЕНЮ ===
  const burgerBtn = document.getElementById("burgerBtn");
  const navMenu = document.getElementById("navMenu");
  if (burgerBtn && navMenu) {
    burgerBtn.addEventListener("click", function () {
      navMenu.classList.toggle("open");
      burgerBtn.classList.toggle("active");
    });
    // Закрытие меню при клике вне nav
    document.addEventListener("click", function (e) {
      if (
        navMenu.classList.contains("open") &&
        !navMenu.contains(e.target) &&
        !burgerBtn.contains(e.target)
      ) {
        navMenu.classList.remove("open");
        burgerBtn.classList.remove("active");
      }
    });
    // Закрытие меню при выборе пункта
    navMenu.addEventListener("click", function (e) {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "SELECT") {
        navMenu.classList.remove("open");
        burgerBtn.classList.remove("active");
      }
    });
  }

  // Сохранить данные таблицы и заголовок в localStorage
  function saveToLocalStorage() {
    // Сохраняем строки таблицы
    const data = Array.from(tbody.rows).map((row) => {
      return Array.from(row.cells).map((cell) => cell.textContent);
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Сохраняем заголовок
    localStorage.setItem(CAPTION_KEY, caption.textContent);
  }

  // Загрузить данные таблицы и заголовок из localStorage
  function loadFromLocalStorage() {
    // Загружаем заголовок
    const savedCaption = localStorage.getItem(CAPTION_KEY);
    if (savedCaption !== null) {
      caption.textContent = savedCaption;
    }
    // Загружаем строки таблицы
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (data && Array.isArray(data)) {
      tbody.innerHTML = "";
      data.forEach((rowData) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${rowData[0] || ""}</td>
          <td contenteditable="true">${rowData[1] || ""}</td>
          <td contenteditable="true">${rowData[2] || ""}</td>
          <td contenteditable="true" class="volume">${rowData[3] || ""}</td>
          <td contenteditable="true" class="price">${rowData[4] || ""}</td>
          <td class="cost">${rowData[5] || ""}</td>
          <td contenteditable="true">${rowData[6] || ""}</td>
          <td><button class="deleteRowBtn">Удалить</button></td>
        `;
        tbody.appendChild(row);
      });
    }
    renderNotesLinks();
    recalculateCosts();
  }

  // Пересчитать стоимости и обновить итоговую сумму
  function recalculateCosts() {
    let total = 0;
    Array.from(tbody.rows).forEach((row, idx) => {
      // Обновить номер строки
      row.cells[0].textContent = idx + 1;
      const volumeCell = row.querySelector(".volume");
      const priceCell = row.querySelector(".price");
      const costCell = row.querySelector(".cost");
      let volume = parseFloat(volumeCell?.textContent.replace(",", ".") || "0");
      let price = parseFloat(priceCell?.textContent.replace(",", ".") || "0");
      let cost = "";
      if (!isNaN(volume) && !isNaN(price)) {
        cost = volume * price;
        total += cost;
      }
      costCell.textContent = cost ? cost : "";
    });
    totalCostCell.textContent = total;
    saveToLocalStorage(); // Сохраняем после пересчёта
  }

  // Добавить новую строку в таблицу
  function addRow() {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td></td>
            <td contenteditable="true">заполнить</td>
            <td contenteditable="true"></td>
            <td contenteditable="true" class="volume"></td>
            <td contenteditable="true" class="price"></td>
            <td class="cost"></td>
            <td contenteditable="true"></td>
            <td><button class="deleteRowBtn">Удалить</button></td>
        `;
    tbody.appendChild(row);
    renderNotesLinks();
    recalculateCosts();
    saveToLocalStorage(); // Сохраняем после добавления строки
  }

  // Обработка событий ввода в таблице (для пересчёта и сохранения)
  function onTableInput(e) {
    if (
      e.target.classList.contains("volume") ||
      e.target.classList.contains("price")
    ) {
      recalculateCosts();
    } else if (e.target.isContentEditable) {
      saveToLocalStorage(); // Сохраняем при любом редактировании
    }
  }

  // Обработка кликов в таблице (для удаления строк)
  function onTableClick(e) {
    if (e.target.classList.contains("deleteRowBtn")) {
      const row = e.target.closest("tr");
      row.remove();
      recalculateCosts();
      saveToLocalStorage(); // Сохраняем после удаления строки
    }
  }

  // Обработка изменений текста заголовка
  function onCaptionInput() {
    saveToLocalStorage();
  }

  // Функция для создания нового документа (очистка таблицы и заголовка)
  function createNewDocument() {
    // Очищаем все строки таблицы
    tbody.innerHTML = "";
    // Добавляем одну пустую строку
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>1</td>
      <td contenteditable="true">заполнить</td>
      <td contenteditable="true"></td>
      <td contenteditable="true" class="volume"></td>
      <td contenteditable="true" class="price"></td>
      <td class="cost"></td>
      <td contenteditable="true"></td>
      <td><button class="deleteRowBtn">Удалить</button></td>
    `;
    tbody.appendChild(row);
    // Сбросить заголовок
    caption.textContent = "Новый документ";
    // Пересчитать стоимости и обновить итоговую сумму
    recalculateCosts();
    // Сохранить изменения в localStorage
    saveToLocalStorage();
    renderNotesLinks();
  }

  // Функция для получения списка сохранённых документов
  function getDocList() {
    return JSON.parse(localStorage.getItem(DOC_LIST_KEY) || "[]");
  }

  // Функция для сохранения списка документов
  function setDocList(list) {
    localStorage.setItem(DOC_LIST_KEY, JSON.stringify(list));
  }

  // Функция для сохранения текущего документа под уникальным именем
  function saveDocument() {
    // Запрашиваем у пользователя имя документа (по умолчанию - заголовок)
    let docName = prompt(
      "Введите имя для сохранения документа:",
      caption.textContent.trim()
    );
    if (!docName) return; // Если отменили или пусто - не сохраняем
    // Сохраняем данные таблицы и заголовок
    const data = Array.from(tbody.rows).map((row) =>
      Array.from(row.cells).map((cell) => cell.textContent)
    );
    const docData = {
      caption: caption.textContent,
      table: data,
    };
    // Сохраняем сам документ
    localStorage.setItem("doc_" + docName, JSON.stringify(docData));
    // Обновляем список документов
    let docList = getDocList();
    if (!docList.includes(docName)) {
      docList.push(docName);
      setDocList(docList);
    }
    alert("Документ сохранён!");
    renderNotesLinks();
  }

  // Функция для открытия сохранённого документа
  function openDocument() {
    let docList = getDocList();
    if (docList.length === 0) {
      alert("Нет сохранённых документов.");
      return;
    }
    // Показываем список документов для выбора
    let docName = prompt(
      "Введите имя документа для открытия (доступные: " +
        docList.join(", ") +
        "):"
    );
    if (!docName) return;
    if (!docList.includes(docName)) {
      alert("Документ с таким именем не найден.");
      return;
    }
    // Загружаем данные документа
    const docData = JSON.parse(localStorage.getItem("doc_" + docName));
    if (!docData) {
      alert("Ошибка загрузки документа.");
      return;
    }
    // Восстанавливаем заголовок
    caption.textContent = docData.caption;
    // Восстанавливаем таблицу
    tbody.innerHTML = "";
    docData.table.forEach((rowData) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${rowData[0] || ""}</td>
        <td contenteditable="true">${rowData[1] || ""}</td>
        <td contenteditable="true">${rowData[2] || ""}</td>
        <td contenteditable="true" class="volume">${rowData[3] || ""}</td>
        <td contenteditable="true" class="price">${rowData[4] || ""}</td>
        <td class="cost">${rowData[5] || ""}</td>
        <td contenteditable="true">${rowData[6] || ""}</td>
        <td><button class="deleteRowBtn">Удалить</button></td>
      `;
      tbody.appendChild(row);
    });
    renderNotesLinks();
    recalculateCosts();
    saveToLocalStorage(); // Сохраняем текущее состояние как последнее открытое
    alert("Документ открыт!");
  }

  // Слушатели событий
  addRowBtn.addEventListener("click", addRow);
  tbody.addEventListener("input", onTableInput);
  tbody.addEventListener("click", onTableClick);
  caption.addEventListener("input", onCaptionInput);
  newDocBtn.addEventListener("click", createNewDocument);
  saveDocBtn.addEventListener("click", saveDocument);
  openDocBtn.addEventListener("click", openDocument);

  // Первоначальная загрузка из localStorage
  loadFromLocalStorage();
  // Первоначальный пересчёт
  recalculateCosts();

  /**
   * Функция для обновления выпадающего списка документами
   */
  function updateDocSelect() {
    // Очищаем все опции, кроме первой ("Выберите документ")
    while (docSelect.options.length > 1) {
      docSelect.remove(1);
    }
    // Получаем список документов из localStorage
    const docList = getDocList();
    // Добавляем каждый документ как опцию
    docList.forEach((docName) => {
      const option = document.createElement("option");
      option.value = docName;
      option.textContent = docName;
      docSelect.appendChild(option);
    });
  }

  /**
   * Функция для открытия документа по имени (используется и для выпадающего списка)
   * @param {string} docName - имя документа
   */
  function openDocumentByName(docName) {
    if (!docName) return;
    const docList = getDocList();
    if (!docList.includes(docName)) {
      alert("Документ с таким именем не найден.");
      return;
    }
    // Загружаем данные документа
    const docData = JSON.parse(localStorage.getItem("doc_" + docName));
    if (!docData) {
      alert("Ошибка загрузки документа.");
      return;
    }
    // Восстанавливаем заголовок
    caption.textContent = docData.caption;
    // Восстанавливаем таблицу
    tbody.innerHTML = "";
    docData.table.forEach((rowData) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${rowData[0] || ""}</td>
        <td contenteditable="true">${rowData[1] || ""}</td>
        <td contenteditable="true">${rowData[2] || ""}</td>
        <td contenteditable="true" class="volume">${rowData[3] || ""}</td>
        <td contenteditable="true" class="price">${rowData[4] || ""}</td>
        <td class="cost">${rowData[5] || ""}</td>
        <td contenteditable="true">${rowData[6] || ""}</td>
        <td><button class="deleteRowBtn">Удалить</button></td>
      `;
      tbody.appendChild(row);
    });
    renderNotesLinks();
    recalculateCosts();
    saveToLocalStorage(); // Сохраняем текущее состояние как последнее открытое
    alert("Документ открыт!");
  }

  // Обработчик для кнопки "Открыть выбранный"
  openSelectedDocBtn.addEventListener("click", function () {
    const selectedDoc = docSelect.value;
    if (!selectedDoc) {
      alert("Пожалуйста, выберите документ из списка.");
      return;
    }
    openDocumentByName(selectedDoc);
  });

  // Модифицируем функцию saveDocument, чтобы обновлять выпадающий список после сохранения
  const originalSaveDocument = saveDocument;
  function saveDocumentWithSelectUpdate() {
    originalSaveDocument();
    updateDocSelect(); // Обновляем список после сохранения
  }
  saveDocBtn.removeEventListener("click", saveDocument); // На случай если уже был добавлен
  saveDocBtn.addEventListener("click", saveDocumentWithSelectUpdate);

  // Модифицируем функцию createNewDocument, чтобы сбрасывать выбор в select
  const originalCreateNewDocument = createNewDocument;
  function createNewDocumentWithSelectReset() {
    originalCreateNewDocument();
    docSelect.value = "";
  }
  newDocBtn.removeEventListener("click", createNewDocument);
  newDocBtn.addEventListener("click", createNewDocumentWithSelectReset);

  // Обновляем выпадающий список при загрузке страницы
  updateDocSelect();

  // --- Удаление выбранного документа из localStorage и выпадающего списка ---
  deleteSelectedDocBtn.addEventListener("click", function () {
    const selectedDoc = docSelect.value;
    if (!selectedDoc) {
      alert("Пожалуйста, выберите документ для удаления.");
      return;
    }
    if (!confirm(`Вы уверены, что хотите удалить документ "${selectedDoc}"?`)) {
      return;
    }
    // Удаляем сам документ
    localStorage.removeItem("doc_" + selectedDoc);
    // Обновляем список документов
    let docList = getDocList();
    docList = docList.filter((name) => name !== selectedDoc);
    setDocList(docList);
    updateDocSelect();
    docSelect.value = "";
    alert("Документ удалён!");
  });

  // --- Сохранение документа в PDF ---
  savePdfBtn.addEventListener("click", function () {
    const container = document.querySelector(".container");
    if (!container) {
      alert("Не найден контейнер для экспорта в PDF");
      return;
    }
    if (typeof window.html2pdf === "undefined") {
      alert("Библиотека html2pdf.js не подключена!");
      return;
    }
    // Опции для html2pdf
    const opt = {
      margin: 0.5,
      filename: (caption.textContent || "Документ") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
    };
    window.html2pdf().set(opt).from(container).save();
  });

  // Добавляю подсказку для кнопки PDF
  if (savePdfBtn) {
    savePdfBtn.title = "Скачать текущий документ в формате PDF";
  }

  // === АВТОЛИНКОВКА ДЛЯ КОЛОНКИ ЗАМЕТКИ ===
  /**
   * Преобразует текст с ссылками в HTML с кликабельными ссылками
   * @param {string} text - текст для обработки
   * @returns {string} - HTML с кликабельными ссылками
   */
  function linkify(text) {
    if (!text) return "";
    // Преобразуем http(s) ссылки
    return text.replace(
      /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)|(www\.[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/gi,
      function (url) {
        let href = url;
        if (!href.match(/^https?:\/\//i)) href = "http://" + href;
        return (
          '<a href="' +
          href +
          '" target="_blank" rel="noopener noreferrer">' +
          url +
          "</a>"
        );
      }
    );
  }

  /**
   * Делает все заметки в таблице кликабельными (кроме режима редактирования)
   */
  function renderNotesLinks() {
    Array.from(tbody.rows).forEach((row) => {
      const noteCell = row.cells[6];
      if (!noteCell) return;
      // Если не редактируется, показываем с ссылками
      if (!noteCell.isContentEditable || document.activeElement !== noteCell) {
        // Сохраняем только текст (без тегов <a>) в data-plain
        noteCell.dataset.plain = noteCell.textContent;
        noteCell.innerHTML = linkify(noteCell.textContent);
      }
    });
  }

  // При потере фокуса на заметке — преобразуем ссылки
  tbody.addEventListener("focusout", function (e) {
    if (e.target.cellIndex === 6 && e.target.isContentEditable) {
      // Преобразуем в ссылки
      e.target.innerHTML = linkify(e.target.textContent);
      saveToLocalStorage();
    }
  });
  // При фокусе на заметке — возвращаем чистый текст для редактирования
  tbody.addEventListener("focusin", function (e) {
    if (e.target.cellIndex === 6 && e.target.isContentEditable) {
      // Возвращаем только текст
      e.target.textContent = e.target.dataset.plain || e.target.textContent;
    }
  });
});
