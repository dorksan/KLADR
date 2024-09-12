// const ip = '172.20.10.7:3000'; // раздача
const ip = '192.168.0.5:3000'; // вайфай

let currentURL = 'http://' + ip + '/?queryType=getRegions';

let dataJSON = [];
let copy;
let locatePage;
let msg;
let dropdownType;

let notesOnPage = 20;
let countOfItems;
let currentPage = 1;

// Слова, идущие вторыми в "хлебных крошках"
const secondWord = ['Область', 'Край', 'Автономный округ', 'Автономная область', 'Район', 'Километр'];
let breadcrumbText;
let breadcrumbID;
let breadcrumbsInfo = [];
let idInSelect;
let deletedID;

// Подключение к серверу и получение JSON c данными
async function fetchData(url) {
    try {
        const response = await fetch(url);
        dataJSON = await response.json();
        if (dataJSON[0].locate !== undefined) {
            locatePage = dataJSON[0].locate.charAt(0);
        }
        msg = dataJSON[1].msg;
        dataJSON[1].msg = undefined;
        if ((msg !== '') && (msg !== undefined)){
            alert(msg);
        }
        console.log(msg);
        dataJSON = dataJSON.slice(2);
        if (locatePage !== 'r') {
            dataJSON.sort((a, b) => a.name[0].localeCompare(b.name[0]));
        } else {
            dataJSON.sort((a, b) => a.code - b.code);
        }
        const selectElement = document.getElementById('type');
        selectElement.innerHTML = '';
        while (selectElement.firstChild) {
            selectElement.removeChild(selectElement.firstChild);
        }
        idInSelect = [];
        copy = dataJSON;
    } catch (error) {
        console.error(error);
    }
}

// Показ формы добавления
function togglePopupAdd() {
    const overlay = document.getElementById('popupOverlay');
    overlay.classList.toggle('show');
}

// Показ формы удаления
function togglePopupDelete() {
    const overlay = document.getElementById('popupOverlay-delete');
    overlay.classList.toggle('show');
}

function togglePopupType() {
    const overlay = document.getElementById('popupOverlay-type');
    overlay.classList.toggle('show');
}

// Показ подсказки о выходе из режима изменения
function outputAlert() {
    alert('Для выхода из режима изменения таблицы нажмите иконку просмотра');
}

// Показ подсказки о выходе из режима просмотра
function viewAlert() {
    alert('Вы перешли в режим просмотра');
}

// Основная функция, показывающая все содержимое страницы
function showAll() {

    // Получение элементов таблицы и пагинации
    let table = document.querySelector('#table');
    let pagination = document.querySelector('#pagination');

    // Отображение данных КЛАДР в виде таблицы
    let showTable = function(dataJSON) {

        let start = (currentPage - 1) * notesOnPage;
        let end = start + notesOnPage;

        //counter = 1;

        let notes = dataJSON.slice(start, end);
        countOfItems = Math.ceil(dataJSON.length / notesOnPage);
        dropdownType = document.getElementById("type");

        table.innerHTML = '';

        let thead = document.createElement('thead');
        table.appendChild(thead);

        let headerRow = document.createElement('tr');
        thead.appendChild(headerRow);

        table.classList.remove("r");
        if (locatePage === 'r') {
            table.classList.add(locatePage);
            createAllHeaderCells('Название', 'Тип', 'ОКАТО', 'Код налоговой', headerRow);
            addDropdown(dropdownType, "Тип региона", "");
        } else if (locatePage === 'd') {
            createAllHeaderCells('Название', 'Тип', 'ОКАТО', 'Код налоговой', headerRow);
            addDropdown(dropdownType, "Тип района", "");
        } else if (locatePage === 'c'){
            createAllHeaderCells('Название', 'Тип', 'ОКАТО', 'Код налоговой', headerRow);
            addDropdown(dropdownType, "Тип города", "");
            console.log(locatePage);
        } else if (locatePage === 't'){
            createAllHeaderCells('Название', 'Тип', 'ОКАТО', 'Код налоговой', headerRow);
            addDropdown(dropdownType, "Тип населённого пункта", "");
            console.log(locatePage);
        } else if (locatePage === 's') {
            createAllHeaderCells('Название', 'Тип', 'ОКАТО', 'Код налоговой', headerRow);
            addDropdown(dropdownType, "Тип улицы", "");
        } else {
            createAllHeaderCells('Интервал домов', 'Почтовый индекс', 'ОКАТО', 'Код налоговой', headerRow);
        }

        let tbody = document.createElement('tbody');
        table.appendChild(tbody);

        for (let note of notes) {
            let tr = document.createElement('tr');
            tbody.appendChild(tr);

            if (locatePage === 'r') {
                createCode(note.code, note.name, note.id, tr, "code", "name");
                createCell(note.type_name, note.type_id, tr);
                createCell(note.okato, note.id, tr);
                createCell(note.tax_code, note.id, tr);
            }
            else if ((locatePage === 'd') ||
                (locatePage === 'c') ||
                (locatePage === 't') ||
                (locatePage === 's')) {
                createCell(note.name, note.id, tr, "name");
                createCell(note.type_name, note.type_id, tr);
                createCell(note.okato, note.id, tr);
                createCell(note.tax_code, note.id, tr);
            } else {
                createCell(note.name, note.id, tr);
                createCell(note.zip, note.id, tr);
                createCell(note.okato, note.id, tr);
                createCell(note.tax_code, note.id, tr);
            }
        }
        if (locatePage !== 'b' && locatePage !== 'f') {
            for (let i = 0; i < dataJSON.length; i++) {
                addDropdown(dropdownType, dataJSON[i].type_name, dataJSON[i].type_id);
                dropdownType.style.visibility = 'visible';
            }
        } else {
            dropdownType.style.visibility = 'hidden';
        }

        let note = notes;
        note.type_id = undefined;
        note.type_name = undefined;
        note.tax_code = undefined;
        note.okato = undefined;
        note.zip = undefined;
    };

    // Отображение результатов поиска в виде таблицы
    let showSearchResult = function(dataJSON) {

        while (breadcrumb.firstChild) {
            breadcrumb.removeChild(breadcrumb.firstChild);
        }
        breadcrumbsInfo = [];

        let start = (currentPage - 1) * notesOnPage;
        let end = start + notesOnPage;

        let notes = dataJSON.slice(start, end);
        countOfItems = Math.ceil(dataJSON.length / notesOnPage);
        dropdownType = document.getElementById("type");

        table.innerHTML = '';

        locatePage = 'f';
        dropdownType.style.visibility = 'hidden';

        let thead = document.createElement('thead');
        table.appendChild(thead);

        let headerRow = document.createElement('tr');
        thead.appendChild(headerRow);

        table.classList.remove("r");
        createAllHeaderCells('Регион', 'Район', 'Населённый пункт', 'Улица', headerRow);
        createAllHeaderCells('Интервал домов', 'Почтовый индекс', 'ОКАТО', 'Код налоговой', headerRow);

        let tbody = document.createElement('tbody');
        table.appendChild(tbody);

        for (let note of notes) {

            if (note.type_id.charAt(0) === 'r') {
                let tr = document.createElement('tr');
                tbody.appendChild(tr);
                if (!secondWord.includes(note.type_name)) {
                    createCode(note.code, note.type_name + ' ' + note.name, note.id, tr, "code", "name");
                } else {
                    createCode(note.code, note.name + ' ' + note.type_name, note.id, tr, "code", "name");
                }
                createCell('', '', tr);
                createCell('', '', tr);
                createCell('', '', tr);
                createCell('', '', tr);
                createCell('', '', tr);
                createCell(note.okato, note.id, tr);
                createCell(note.tax_code, note.id, tr);
            } else if (note.type_id.charAt(0) === 'd') {
                let tr = document.createElement('tr');
                tbody.appendChild(tr);
                createCell('', '', tr);
                if (!secondWord.includes(note.type_name)) {
                    createCell(note.type_name + ' ' + note.name, note.id, tr);
                } else {
                    createCell(note.name + ' ' + note.type_name, note.id, tr);
                }
                createCell('', '', tr);
                createCell('', '', tr);
                createCell('', '', tr);
                createCell('', '', tr);
                createCell(note.okato, note.id, tr);
                createCell(note.tax_code, note.id, tr);
            } else if ((note.type_id.charAt(0) === 'c') || (note.type_id.charAt(0) === 't')){
                let tr = document.createElement('tr');
                tbody.appendChild(tr);
                createCell('', '', tr);
                createCell('', '', tr);
                if (!secondWord.includes(note.type_name)) {
                    createCell(note.type_name + ' ' + note.name, note.id, tr);
                } else {
                    createCell(note.name + ' ' + note.type_name, note.id, tr);
                }
                createCell('', '', tr);
                createCell('', '', tr);
                createCell('', '', tr);
                createCell(note.okato, note.id, tr);
                createCell(note.tax_code, note.id, tr);
            } else if (note.type_id.charAt(0) === 's'){
                let tr = document.createElement('tr');
                tbody.appendChild(tr);
                createCell('', '', tr);
                createCell('', '', tr);
                createCell('', '', tr);
                if (!secondWord.includes(note.type_name)) {
                    createCell(note.type_name + ' ' + note.name, note.id, tr);
                } else {
                    createCell(note.name + ' ' + note.type_name, note.id, tr);
                }
                createCell('', '', tr);
                createCell('', '', tr);
                createCell(note.okato, note.id, tr);
                createCell(note.tax_code, note.id, tr);
            } else {
                let tr = document.createElement('tr');
                tbody.appendChild(tr);
                createCell('', '', tr);
                createCell('', '', tr);
                createCell('', '', tr);
                createCell('', '', tr);
                if (!secondWord.includes(note.type_name)) {
                    createCell(note.type_name + ' ' + note.name, note.id, tr);
                } else {
                    createCell(note.name + ' ' + note.type_name, note.id, tr);
                }
                createCell(note.zip, note.id, tr);
                createCell(note.okato, note.id, tr);
                createCell(note.tax_code, note.id, tr);
            }
        }

    };

    // Отображение страницы справочника типов
    let showTypePage = function(dataJSON) {

        while (breadcrumb.firstChild) {
            breadcrumb.removeChild(breadcrumb.firstChild);
        }
        breadcrumbsInfo = [];

        let start = (currentPage - 1) * notesOnPage;
        let end = start + notesOnPage;

        let notes = dataJSON.slice(start, end);
        countOfItems = Math.ceil(dataJSON.length / notesOnPage);
        dropdownType = document.getElementById("type");

        table.innerHTML = '';

        locatePage = 'p';
        dropdownType.style.visibility = 'hidden';

        let thead = document.createElement('thead');
        table.appendChild(thead);

        let headerRow = document.createElement('tr');
        thead.appendChild(headerRow);

        //table.classList.remove("r");
        createHeaderCell('№', headerRow);
        createHeaderCell('Тип', headerRow);

        let tbody = document.createElement('tbody');
        table.appendChild(tbody);

        for (let note of notes) {

            let tr = document.createElement('tr');
            tbody.appendChild(tr);
            createCell(note.counter, note.id, tr);
            createCell(note.name, note.id, tr);
        }
    };

    // Генерация пагинации
    let generatePagination = function() {
        pagination.innerHTML = '';
        if (countOfItems === 1) {
            let page = createPaginationElement(1);
            pagination.appendChild(page);
        }
        if (countOfItems > 1) {
            let firstPage = createPaginationElement(1);
            pagination.appendChild(firstPage);

            if (currentPage > 3) {
                let ellipsisStart = createPaginationElement('...', 'EllipsisStart');
                pagination.appendChild(ellipsisStart);
            }

            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                if (i > 1 && i < countOfItems) {
                    let page = createPaginationElement(i);
                    pagination.appendChild(page);
                }
            }

            if (currentPage < countOfItems - 2) {
                let ellipsisEnd = createPaginationElement('...', 'EllipsisEnd');
                pagination.appendChild(ellipsisEnd);
            }

            let lastPage = createPaginationElement(countOfItems);
            pagination.appendChild(lastPage);
        }
    };

    // Генерация элемента пагинации
    let createPaginationElement = function(pageNumber, type) {
        let element;
        if (type === 'EllipsisStart' || type === 'EllipsisEnd') {
            element = document.createElement('span');
            element.innerHTML = pageNumber;
        } else {
            element = document.createElement('a');
            element.innerHTML = pageNumber;
            if (type === 'Prev') {
                element.classList.add('prev');
            } else if (type === 'Next') {
                element.classList.add('next');
            } else if (pageNumber === currentPage) {
                element.classList.add('active-page');
            }

            element.addEventListener('click', function() {
                if (type === 'Prev' && currentPage > 1) {
                    currentPage--;
                } else if (type === 'Next' && currentPage < countOfItems) {
                    currentPage++;
                } else if (type !== 'Prev' && type !== 'Next') {
                    currentPage = pageNumber;
                }

                if (locatePage === 'f') {
                    showSearchResult(dataJSON);
                } else if (locatePage === 'p'){
                    showTypePage(dataJSON);
                } else {
                    showTable(dataJSON);
                }
                generatePagination();
            });
        }

        return element;
    };

    // Создание одной ячейки таблицы
    function createCell(text, id, tr, className) {
        let td = document.createElement('td');
        td.innerHTML = text;
        td.id = id;
        td.classList.add(className);
        tr.appendChild(td);
    }

    // Создание таблицы ячейки, содержащей код региона
    function createCode(code, text, id, tr, className, className2) {
        let td = document.createElement('td');
        let span = document.createElement('span');
        td.id = id;
        span.classList.add('region-code');
        td.classList.add(className);
        if (className2 === 'name') {
            td.classList.add(className2);
        }
        span.innerHTML = code;
        td.appendChild(span);
        td.innerHTML += ' ' + text;
        tr.appendChild(td);
    }

    // Создание заголовков столбцов таблицы
    function createHeaderCell(text, tr) {
        let th = document.createElement('th');
        th.innerHTML = text;
        tr.appendChild(th);
    }

    // Создание всех заголовков таблицы разом
    function createAllHeaderCells(text1, text2, text3, text4, header) {
        createHeaderCell(text1, header);
        createHeaderCell(text2, header);
        createHeaderCell(text3, header);
        createHeaderCell(text4, header);
    }

    // Создание выпадающего списка
    let addDropdown = function (dropdown, text, id) {
        const option = document.createElement("option")
        if (!idInSelect.includes(id)) {
            option.text = text;
            option.value = id;
            dropdown.add(option);
            idInSelect.push(id);
        }
    }

    showTable(dataJSON);
    generatePagination();
    generateAddForm(locatePage);
    generateTypeForm();

    // Получение элементов выпадающего списка и таблицы
    const selectElement = document.getElementById('type');
    const tableElement = document.getElementById('table');

    // Слушатель событий, обрабатывающий изменение активного элемента списка
    selectElement.addEventListener('change', function() {
        const selectedTypeId = this.value;
        dataJSON = copy;
        currentPage = 1;
        if (selectedTypeId !== "") {
            dataJSON = copy.filter(function(element) {
                return element.type_id === selectedTypeId;
            });
        }
        tableElement.innerHTML = '';
        showTable(dataJSON);
        generatePagination();
        generateAddForm(locatePage);
        generateTypeForm();
    });

    // Получение кнопки возврата на начальную страницу
    const buttonHomePage = document.getElementById('button-home-page');

    // Добавление слушателя событий на кнопку возврата на начальную страницу
    buttonHomePage.addEventListener('click', function () {
        currentURL = 'http://' + ip + '/?queryType=getRegions'
        fetchData('http://' + ip + '/?queryType=getRegions').then(() => {
            currentPage = 1;
            showTable(dataJSON);
            generatePagination();
            generateAddForm(locatePage);
            generateTypeForm();
        });

        while (breadcrumb.firstChild) {
            breadcrumb.removeChild(breadcrumb.firstChild);
        }
        breadcrumbsInfo = [];
    })

    // Получение кнопки отображения справочника типов
    const buttonTypePage = document.getElementById('button-type-page');

    // Добавление слушателя событий на кнопку отображения справочника типов
    buttonTypePage.addEventListener('click', function () {

        const overlayType = document.getElementById('popupOverlay-type');
        overlayType.classList.toggle('show');

        while (breadcrumb.firstChild) {
            breadcrumb.removeChild(breadcrumb.firstChild);
        }
        breadcrumbsInfo = [];
    })

    // Получение кнопки поиска
    const submit = document.getElementById('submit')

    // Добавление слушателя событий на кнопку поиска
    submit.addEventListener('click', function () {
        let searchInput = document.getElementById('search');
        let searchString = searchInput.value;
        searchInput.value = '';
        currentPage = 1;

        if (!isNaN(searchString) && isFinite(searchString) && (searchString.length === 11)) {
            fetchData('http://' + ip + '/?queryType=searchByOkato&okato=' + searchString).then(() => {
                //setTimeout(function() {}, 10000);
                showSearchResult(dataJSON);
                generatePagination();
                generateAddForm(locatePage);
                generateTypeForm();
            });
        } else if (!isNaN(searchString) && isFinite(searchString) && (searchString.length === 6)){
            fetchData('http://' + ip + '/?queryType=searchBuildingsByIndex&index=' + searchString).then(() => {
                showSearchResult(dataJSON);
                generatePagination();
                generateAddForm(locatePage);
                generateTypeForm();
            });
        } else if (!isNaN(searchString) && isFinite(searchString) && (searchString.length === 4)){
            fetchData('http://' + ip + '/?queryType=searchByTaxcode&taxcode=' + searchString).then(() => {
                showSearchResult(dataJSON);
                generatePagination();
                generateAddForm(locatePage);
                generateTypeForm();
            });
        } else if (!isNaN(searchString) && isFinite(searchString) && (searchString.length === 2)){
            fetchData('http://' + ip + '/?queryType=searchByCode&code=' + searchString).then(() => {
                showSearchResult(dataJSON);
                generatePagination();
                generateAddForm(locatePage);
                generateTypeForm();
            });
        } else {
            fetchData('http://' + ip + '/?queryType=searchByName&name=' + searchString).then(() => {
                showSearchResult(dataJSON);
                generatePagination();
                generateAddForm(locatePage);
                generateTypeForm();
            });
        }
        breadcrumbsInfo = [];
    })

    // Генерация формы добавления
    function generateAddForm(locatePage) {
        const locationTypes = {
            'r': ['rРегион', 'dРайон', 'cГород','tНас. пункт', 'sУлица'],
            'd': ['dРайон', 'cГород', 'tНас. пункт', 'sУлица'],
            'c': ['cГород', 'tНас. пункт', 'sУлица'],
            't': ['tНас. пункт', 'sУлица'],
            's': ['sУлица'],
            'b': ['bЗдание']
        };

        let selectAddType = document.getElementById('select-type-form');

        while (selectAddType.firstChild) {
            selectAddType.removeChild(selectAddType.firstChild);
        }
        addDropdown(selectAddType, 'Выберите тип объекта');

        if (locatePage !== 'r') {
            locationTypes[locatePage].forEach((type) => {
                addDropdown(selectAddType, type.slice(1), type.charAt(0));
            });
        } else {
            addDropdown(selectAddType, 'Регион', 'r');
        }

        selectAddType.onchange = function() {
            let nameLabel = document.getElementById('add-name-label');
            let indexLabel = document.getElementById('add-type-label');
            let codeLabel = document.getElementById('add-code-label');

            let nameInput = document.getElementById('add-name');
            let indexInput = document.getElementById('add-type');
            let codeInput = document.getElementById('add-code');

            let selectedOptionId = selectAddType.value;

            if (selectedOptionId === 'b') {
                nameLabel.innerHTML = 'Номер/интервал:';
                nameInput.placeholder = 'Введите номер здания либо интервал';

                indexLabel.innerHTML = 'Индекс:';
                indexInput.placeholder = 'Введите индекс';

                codeLabel.innerHTML = 'Код налоговой:';
                codeInput.placeholder = 'Введите код налоговой';

            } else if (selectedOptionId === 'r') {
                nameLabel.innerHTML = 'Название:';
                nameInput.placeholder = 'Введите название';

                indexLabel.innerHTML = 'Тип:';
                indexInput.placeholder = 'Введите тип';

                codeLabel.innerHTML = 'Код региона:';
                codeInput.placeholder = 'Введите код региона';

            } else {
                nameLabel.innerHTML = 'Название:';
                nameInput.placeholder = 'Введите название';

                indexLabel.innerHTML = 'Тип:';
                indexInput.placeholder = 'Введите тип';

                codeLabel.innerHTML = 'Код налоговой:';
                codeInput.placeholder = 'Введите код налоговой';
            }
        };

    }

    let query;

    // Генерация формы выбора справочника типов
    function generateTypeForm() {
        const types = ['mРегион', 'dРайон', 'cГород', 'tНаселенный пункт', 'sУлица'];

        currentPage = 1;

        let selectTypeBtmForm = document.getElementById('select-type-button-form');

        addDropdown(selectTypeBtmForm, 'Выберите справочник', '');

        let length = selectTypeBtmForm.options.length;

        for (let i = length - 1; i > 0; i--) {
            selectTypeBtmForm.removeChild(selectTypeBtmForm.options[i]);
        }

        types.forEach((type) => {
            addDropdown(selectTypeBtmForm, type.slice(1), type.charAt(0));
        });

        selectTypeBtmForm.onchange = function() {

            let selectedOptionId = selectTypeBtmForm.value;

            if (selectedOptionId === 'm') {
                query = 'region';
            } else if (selectedOptionId === 'd') {
                query = 'district';
            } else if (selectedOptionId === 'c') {
                query = 'city';
            } else if (selectedOptionId === 't') {
                query = 'town';
            } else if (selectedOptionId === 's') {
                query = 'street';
            }

        };

    }

    // Получение кнопки подтверждения добавления
    const addButtonOk = document.getElementById('btn-submit-add');

    // Добавление слушателя событий на кнопку подтверждения добавления
    addButtonOk.addEventListener('click', function () {

        let selectAddType = document.getElementById('select-type-form');
        let selectedOptionId = selectAddType.value;

        let nameInput = document.getElementById('add-name').value;
        let typeInput = document.getElementById('add-type').value;
        let okatoInput = document.getElementById('add-okato').value;
        let codeInput = document.getElementById('add-code').value;

        let parentID = '';

        if (locatePage !== 'r') {
            parentID = breadcrumbsInfo[breadcrumbsInfo.length - 1].id;
        }

        if (selectedOptionId === 'r') {
            fetchData('http://' + ip + '/?queryType=addRegion&name=' + nameInput + '&code=' + codeInput +
                '&type=' + typeInput + '&tax_code=' + (codeInput + '00') + '&okato=' + okatoInput).then(() => {
                showTable(dataJSON);
                generatePagination();
                generateAddForm(locatePage);
                generateTypeForm();
            });

        } else if (selectedOptionId === 'd') {
            fetchData('http://' + ip + '/?queryType=addDistrict&parent_id=' + parentID + '&name=' + nameInput +
                '&type=' + typeInput + '&tax_code=' + codeInput + '&okato=' + okatoInput).then(() => {
                showTable(dataJSON);
                generatePagination();
                generateAddForm(locatePage);
                generateTypeForm();
            });

        } else if (selectedOptionId === 'c') {
            fetchData('http://' + ip + '/?queryType=addCity&parent_id=' + parentID + '&name=' + nameInput +
                '&type=' + typeInput + '&tax_code=' + codeInput + '&okato=' + okatoInput).then(() => {
                showTable(dataJSON);
                generatePagination();
                generateAddForm(locatePage);
                generateTypeForm();
            });

        } else if (selectedOptionId === 't') {
            fetchData('http://' + ip + '/?queryType=addTown&parent_id=' + parentID + '&name=' + nameInput +
                '&type=' + typeInput + '&tax_code=' + codeInput + '&okato=' + okatoInput).then(() => {
                showTable(dataJSON);
                generatePagination();
                generateAddForm(locatePage);
                generateTypeForm();
            });

        } else if (selectedOptionId === 's') {
            fetchData('http://' + ip + '/?queryType=addStreet&parent_id=' + parentID + '&name=' + nameInput +
                '&type=' + typeInput + '&tax_code=' + codeInput + '&okato=' + okatoInput).then(() => {
                showTable(dataJSON);
                generatePagination();
                generateAddForm(locatePage);
                generateTypeForm();
            });

        } else if (selectedOptionId === 'b') {
            fetchData('http://' + ip + '/?queryType=addBuilding&street_id=' + parentID + '&name=' + nameInput +
                '&zip=' + codeInput + '&tax_code=' + codeInput + '&okato=' + okatoInput).then(() => {
                showTable(dataJSON);
                generatePagination();
                generateAddForm(locatePage);
                generateTypeForm();
            });
        }

    })

    // Получение кнопки подтверждения удаления
    const deleteButtonOk = document.getElementById('btn-submit-delete');

    // Добавление слушателя событий на кнопку подтверждения удаления
    deleteButtonOk.addEventListener('click', function () {

        if (!isNaN(deletedID.charAt(0))) {
            fetchData('http://' + ip + '/?queryType=deleteRecord&id=' + deletedID).then(() => {
                showTable(dataJSON);
                generatePagination();
                generateAddForm(locatePage);
                generateTypeForm();
            });

        } else {
            fetchData('http://' + ip + '/?queryType=deleteType&id=' + deletedID).then(() => {
                showTable(dataJSON);
                generatePagination();
                generateAddForm(locatePage);
                generateTypeForm();
            });
        }
        location.reload();
    })

    // Получение кнопки подтверждения выбора справочника типов
    const typeButtonOk = document.getElementById('btn-type');

    // Добавление слушателя событий на кнопку подтверждения выбора справочника типов
    typeButtonOk.addEventListener('click', function () {

        togglePopupType();

        fetchData('http://' + ip + '/?queryType=getTypes&type=' + query).then(() => {
            showTypePage(dataJSON);
            generatePagination();
            generateTypeForm();
        });
    })

    // Получения элемента "хлебных крошек"
    const breadcrumb = document.getElementById("breadcrumb");

    /**
     * Создает "хлебные крошки" - цепочки навигации, которые отображают путь пользователя от корня сайта до текущей страницы
     * @param text - текст "хлебной крошки"
     * @param id - id записи
     * @param locate - отслеживание страницы
     */
    function createBreadcrumb(text, id, locate) {
        const breadcrumbItem = document.createElement("li");
        const breadcrumbURL = document.createElement("a");
        breadcrumbURL.textContent = text;
        const activeItems = document.querySelectorAll('ul > li.active');

        activeItems.forEach((breadcrumb) => {
            breadcrumb.classList.remove('active');
        });

        breadcrumbItem.id = id;
        breadcrumbURL.id = id;
        breadcrumbItem.classList.add('active');
        breadcrumbItem.appendChild(breadcrumbURL);
        breadcrumb.appendChild(breadcrumbItem);

        const breadcrumbInfo = {
            text: text,
            id: id,
            locate: locate
        };
        breadcrumbsInfo.push(breadcrumbInfo);
    }

    // Добавление слушателя событий на "хлебные крошки"
    breadcrumb.addEventListener('click', (event) => {
        if (!(event.target.closest('li').classList.contains('active'))) {
            const clickedBreadcrumb = event.target;
            const locateToGo = (clickedBreadcrumb.id+'');
            const currentID = clickedBreadcrumb.id;

            while (breadcrumb.firstChild) {
                breadcrumb.removeChild(breadcrumb.firstChild);
            }

            currentPage = 1;

            if (locateToGo === '0000000000000') {
                currentURL = 'http://' + ip + '/?queryType=getRegions'
                fetchData('http://' + ip + '/?queryType=getRegions').then(() => {
                    showTable(dataJSON);
                    generatePagination();
                    generateAddForm(locatePage);
                    generateTypeForm();
                });
                breadcrumbsInfo = [];
            } else if (locateToGo.slice(2) === '00000000000') {
                currentURL = 'http://' + ip + '/?queryType=getChildren&parent_id='+currentID
                fetchData('http://' + ip + '/?queryType=getChildren&parent_id='+currentID).then(() => {
                    showTable(dataJSON);
                    generatePagination();
                    generateAddForm(locatePage);
                    generateTypeForm();
                });
                breadcrumbsInfo = breadcrumbsInfo.slice(0, 2);
            } else if (locateToGo.slice(8) === '00000') {
                currentURL = 'http://' + ip + '/?queryType=getChildren&parent_id='+currentID
                fetchData('http://' + ip + '/?queryType=getChildren&parent_id='+currentID).then(() => {
                    showTable(dataJSON);
                    generatePagination();
                    generateAddForm(locatePage);
                    generateTypeForm();
                });
                breadcrumbsInfo = breadcrumbsInfo.slice(0, 3);
            } else if (locateToGo.slice(11) === '00') {
                currentURL = 'http://' + ip + '/?queryType=getChildren&parent_id='+currentID
                fetchData('http://' + ip + '/?queryType=getChildren&parent_id=' + currentID).then(() => {
                    showTable(dataJSON);
                    generatePagination();
                    generateAddForm(locatePage);
                    generateTypeForm();
                });
                breadcrumbsInfo = breadcrumbsInfo.slice(0, 4);
            }

            const selectElement = document.getElementById('type');
            selectElement.innerHTML = '';
            while (selectElement.firstChild) {
                selectElement.removeChild(selectElement.firstChild);
            }
            idInSelect = [];
        }

        currentPage = 1;

        breadcrumbsInfo.forEach((info) => {
            createBreadcrumb(info.text, info.id, info.locate);
        });
        showTable(dataJSON);
        generatePagination();
        generateAddForm(locatePage);
        generateTypeForm();

    });

    const getTable = document.querySelector('table');

    const viewButton = document.getElementById('view');
    const addButton = document.getElementById('add');
    const editButton = document.getElementById('edit');
    const deleteButton = document.getElementById('delete');

    viewButton.disabled = true;

    // Добавления слушателя событий на переход по таблицам
    getTable.addEventListener('dblclick', transitionThroughTable);

    // Редактирование данных
    function editData(event) {
        let target = event.target.closest('.edit-cancel, .edit-ok, td');

        if (!this.contains(target)) return;

        if (target.classList.contains('edit-cancel')) {
            finishTdEdit(target.closest('td'), false);
        } else if (target.classList.contains('edit-ok')) {
            finishTdEdit(target.closest('td'), true);
        } else if (target.nodeName === 'TD') {
            if (target.classList.contains('edit-td')) return; // уже редактируется

            makeTdEditable(target);
        }

    }

    let tdDataWithTags = '';

    function makeTdEditable(td) {
        tdDataWithTags = td.innerHTML;
        let data = td.innerText;
        if (tdDataWithTags.charAt(0) === '<') {
            data = data.slice(3);
        }
        td.classList.add('edit-td');
        td.innerHTML = `<textarea class="edit-area" name="edit-area" style="width: ${td.clientWidth}px; height: ${td.clientHeight}px">${data}</textarea>
        <div class="edit-controls"><button class="edit-ok">Ок</button><button class="edit-cancel">Отмена</button></div>`;

        let editOkBtn = td.querySelector('.edit-ok');
        editOkBtn.addEventListener('click', function() {
            finishTdEdit(td, true);
        });

        let editCancelBtn = td.querySelector('.edit-cancel');
        editCancelBtn.addEventListener('click', function() {
            finishTdEdit(td, false);
        });

        td.querySelector('.edit-area').focus();
    }

    function finishTdEdit(td, isOk) {

        let row = td.parentNode;
        let editedID = row.querySelector('td:first-child').id;
        let editedName = row.querySelector('td:first-child').innerText;
        let editedType = row.querySelectorAll('td')[1].innerText;
        let editedOkato = row.querySelectorAll('td')[2].innerText;
        let editedTaxCode = row.querySelectorAll('td')[3].innerText;

        let textarea = row.querySelector('.edit-area');
        let data;
        if (textarea !== null) {
            data = textarea.value;
        } else {
            // Обработка случая, когда textarea равно null
            // Например, можно установить значение по умолчанию для переменной data
            data = "Default value";
        }
        let char = editedName.charAt(0)
        if ((editedID.slice(2) === '00000000000') && (!isNaN(parseInt(char)))){
            editedName = editedName.slice(3);
        }
        if (editedName === 'ОкОтмена'){
            editedName = data;
        }
        if (editedType === 'ОкОтмена'){
            editedType = data;
        }
        if (editedOkato === 'ОкОтмена'){
            editedOkato = data;
        }
        if (editedTaxCode === 'ОкОтмена'){
            editedTaxCode = data;
        }


        let textArea = td.querySelector('.edit-area');

        let editing = false;

        if (tdDataWithTags.charAt(0) === '<') {

            if ((isOk) && textArea.value.length > 0) {
                td.innerHTML = tdDataWithTags.slice(0, 35) + ' ' + textArea.value;
                editedName.slice(3);
                editing = true;

            } else if ((isOk) && textArea.value.length < 1) {
                alert('Введите название!');
                td.innerHTML = tdDataWithTags;
            }

        } else {
            td.innerHTML = textArea.value;
            editing = true;
        }
        td.classList.remove('edit-td');

        if (editing === true) {

            let queryType;

            let notBuilding = false;

            if (editedID.slice(2) === '00000000000') {
                queryType = 'Region';
                notBuilding = true;
            } else if (editedID.slice(5) === '00000000') {
                queryType = 'District';
                notBuilding = true;
            } else if (editedID.slice(8) === '00000') {
                queryType = 'City';
                notBuilding = true;
            } else if (editedID.slice(11) === '00') {
                queryType = 'Town';
                notBuilding = true;
            } else if (editedID.slice(15) === '00') {
                queryType = 'Street';
                notBuilding = true;
            }

            if (notBuilding && (isOk)) {
                fetchData('http://' + ip + '/?queryType=change' + queryType + '&id=' + editedID + '&name=' + editedName +
                    '&type=' + editedType + '&tax_code=' + editedTaxCode + '&okato=' + editedOkato).then(() => {
                    showTable(dataJSON);
                    generatePagination();
                    generateAddForm(locatePage);
                    generateTypeForm();
                });
            }

            if ((editedID.length === 15) && (editedID.slice(15) !== '00') && (!notBuilding) && (isOk)){
                fetchData('http://' + ip + '/?queryType=change' + queryType + '&id=' + editedID + '&name=' + editedName +
                    '&zip=' + editedType + '&tax_code=' + editedTaxCode + '&okato=' + editedOkato).then(() => {
                    showTable(dataJSON);
                    generatePagination();
                    generateAddForm(locatePage);
                    generateTypeForm();
                });
            }

            fetchData(currentURL).then(() => {
                showTable(dataJSON);
                generatePagination();
                generateAddForm(locatePage);
                generateTypeForm();
            })
        }

        editing = false;
    }

    // Перемещение вглубь таблицы к дочерним элементам
    function transitionThroughTable(event) {
        if (event.target.closest('td').classList.contains('name')) {
            breadcrumbID = event.target.getAttribute('id');
            const table = document.getElementById('table');
            let cells = table.querySelectorAll('td');
            let columnCells = table.querySelectorAll('td.name');

            columnCells.forEach(cell => {
                const cellID = cell.id;
                if (cellID === breadcrumbID) {
                    breadcrumbText = cell.textContent;
                    const clickedIndex = Array.from(cells).indexOf(cell);
                    const rightCell = cells[clickedIndex + 1];
                    let rightCellValue = rightCell.textContent;
                    if (!secondWord.includes(rightCellValue) && locatePage === 'r') {
                        breadcrumbText = breadcrumbText.slice(0, 2) + ' ' + '—' + ' ' + rightCellValue + ' ' + breadcrumbText.slice(2);
                    } else if (secondWord.includes(rightCellValue) && locatePage === 'r') {
                        breadcrumbText = breadcrumbText.slice(0, 2) + ' ' + '—' + ' ' + breadcrumbText.slice(2) + ' ' + rightCellValue;
                    } else if (!secondWord.includes(rightCellValue) && locatePage !== 'r') {
                        breadcrumbText = rightCellValue + ' ' + breadcrumbText;
                    } else {
                        breadcrumbText = breadcrumbText + ' ' + rightCellValue;
                    }
                }
            });
            currentPage = 1;

            if (locatePage === 'r') {
                currentURL = 'http://' + ip + '/?queryType=getChildren&parent_id='+breadcrumbID
                fetchData('http://' + ip + '/?queryType=getChildren&parent_id='+breadcrumbID).then(() => {
                    showTable(dataJSON);
                    generatePagination();
                    generateAddForm(locatePage);
                    generateTypeForm();
                    createBreadcrumb(breadcrumbText, breadcrumbID, locatePage);
                });
                createBreadcrumb("Регионы РФ",  "0000000000000", 'a');
            } else if (breadcrumbID.slice(11) === '00') {
                currentURL = 'http://' + ip + '/?queryType=getChildren&parent_id='+breadcrumbID
                fetchData('http://' + ip + '/?queryType=getChildren&parent_id='+breadcrumbID).then(() => {
                    showTable(dataJSON);
                    generatePagination();
                    generateAddForm(locatePage);
                    generateTypeForm();
                    createBreadcrumb(breadcrumbText, breadcrumbID, locatePage);
                });
            } else if (breadcrumbID.slice(15) === '00') {
                currentURL = 'http://' + ip + '/?queryType=getBuildings&street_id='+breadcrumbID
                fetchData('http://' + ip + '/?queryType=getBuildings&street_id='+breadcrumbID).then(() => {
                    showTable(dataJSON);
                    generatePagination();
                    generateAddForm(locatePage);
                    createBreadcrumb(breadcrumbText, breadcrumbID, locatePage);
                });
            }
            currentPage = 1;
            showTable(dataJSON);
            generateAddForm(locatePage);
            generateTypeForm();
        }
    }

    // Удаление данных
    function deleteData(event) {

        let clickedCell = event.target;
        let row = clickedCell.parentNode;
        deletedID = row.querySelector('td:first-child').id;

        let cells = row.querySelectorAll('td');

        let rowData = [];

        cells.forEach(function(cell) {
            rowData.push(cell.innerText);
        });

        const overlayDelete = document.getElementById('popupOverlay-delete');
        overlayDelete.classList.toggle('show');

        let deletedRow = document.getElementById('deleted-row');
        deletedRow.textContent = rowData.join(', ') + '?';

    }

    // Добавление слушателя событий для кнопки просмотра таблицы без возможности редактирования
    viewButton.addEventListener('click', function() {
        getTable.removeEventListener('click', editData);
        getTable.removeEventListener('click', deleteData);
        getTable.addEventListener('dblclick', transitionThroughTable);

        viewButton.classList.add('active-button');

        const editButtonHasClass = editButton.classList.contains('active-button');
        const deleteButtonHasClass = deleteButton.classList.contains('active-button');

        if (editButtonHasClass) {
            editButton.classList.remove('active-button');

            addButton.classList.remove('non-active-button');
            deleteButton.classList.remove('non-active-button');
        }
        if (deleteButtonHasClass) {
            deleteButton.classList.remove('active-button');

            addButton.classList.remove('non-active-button');
            editButton.classList.remove('non-active-button');
        }

        viewButton.disabled = true;
        addButton.disabled = false;
        editButton.disabled = false;
        deleteButton.disabled = false;

        viewButton.style.pointerEvents = 'none';
        addButton.style.pointerEvents = 'auto';
        editButton.style.pointerEvents = 'auto';
        deleteButton.style.pointerEvents = 'auto';

    });

    // Добавление слушателя событий для кнопки редактирования
    editButton.addEventListener('click', function() {
        getTable.removeEventListener('dblclick', transitionThroughTable);
        getTable.addEventListener('click', editData);

        editButton.classList.add('active-button');

        viewButton.classList.remove('active-button');

        addButton.classList.add('non-active-button');
        deleteButton.classList.add('non-active-button');

        viewButton.disabled = false;
        addButton.disabled = true;
        editButton.disabled = true;
        deleteButton.disabled = true;

        viewButton.style.pointerEvents = 'auto';
        addButton.style.pointerEvents = 'none';
        editButton.style.pointerEvents = 'none';
        deleteButton.style.pointerEvents = 'none';

    });

    // Добавление слушателя событий для кнопки удаления
    deleteButton.addEventListener('click', function() {
        getTable.removeEventListener('dblclick', transitionThroughTable);
        getTable.addEventListener('click', deleteData);

        deleteButton.classList.add('active-button');

        viewButton.classList.remove('active-button');

        addButton.classList.add('non-active-button');
        editButton.classList.add('non-active-button');

        viewButton.disabled = false;
        addButton.disabled = true;
        editButton.disabled = true;
        deleteButton.disabled = true;

        viewButton.style.pointerEvents = 'auto';
        addButton.style.pointerEvents = 'none';
        editButton.style.pointerEvents = 'none';
        deleteButton.style.pointerEvents = 'none';

    });

}

// Вызов главной функции
fetchData(currentURL).then(() => {
    showAll();
});