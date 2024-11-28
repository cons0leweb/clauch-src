const { ipcRenderer } = require('electron');

// Объект с переводами
const lang = {
    ru: {
        translate: {
            launcher_title: "Clauncher",
            tab_home: "Главная",
            tab_builds: "Сборки",
            tab_settings: "Настройки",
            welcome_message: "Добро пожаловать в Clauncher!",
            launch_game: "Запустить игру",
            available_builds: "Доступные сборки",
            add_new_build: "Добавить новую сборку",
            build_name: "Название сборки",
            build_version: "Версия сборки",
            build_description: "Описание сборки",
            add_build: "Добавить сборку",
            settings: "Настройки",
            language: "Язык",
            language_ru: "Русский",
            language_en: "Английский",
            theme: "Тема",
            theme_light: "Светлая",
            theme_dark: "Темная",
            theme_autumn: "Осень",
            notifications: "Уведомления",
            auto_update: "Автоматическое обновление",
            save_settings: "Сохранить настройки"
        }
    },
    en: {
        translate: {
            launcher_title: "Clauncher",
            tab_home: "Home",
            tab_builds: "Builds",
            tab_settings: "Settings",
            welcome_message: "Welcome to Clauncher!",
            launch_game: "Launch Game",
            available_builds: "Available Builds",
            add_new_build: "Add New Build",
            build_name: "Build Name",
            build_version: "Build Version",
            build_description: "Build Description",
            add_build: "Add Build",
            settings: "Settings",
            language: "Language",
            language_ru: "Russian",
            language_en: "English",
            theme: "Theme",
            theme_light: "Light",
            theme_dark: "Dark",
            theme_autumn: "Autumn",
            notifications: "Notifications",
            auto_update: "Auto Update",
            save_settings: "Save Settings"
        }
    }
};

// Функция для перевода текста
function translateText(langCode) {
    const translations = lang[langCode].translate;
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = translations[key];
    });
}

// Функция для добавления новой сборки
function addNewBuild() {
    const name = document.getElementById('build_name').value;
    const version = document.getElementById('build_version').value;
    const description = document.getElementById('build_description').value;

    if (name && version && description) {
        ipcRenderer.send('add-build', { name, version, description });
    } else {
        alert('Пожалуйста, заполните все поля.');
    }
}

// Обработчик добавления новой сборки
ipcRenderer.on('build-added', () => {
    alert('Сборка успешно добавлена!');
    document.getElementById('build_name').value = '';
    document.getElementById('build_version').value = '';
    document.getElementById('build_description').value = '';
    loadBuilds();
});

// Функция для загрузки сборок
function loadBuilds() {
    ipcRenderer.send('load-builds');
}

// Обработчик загрузки сборок
ipcRenderer.on('builds-loaded', (event, builds) => {
    const buildsContainer = document.getElementById('builds');
    buildsContainer.innerHTML = '';

    builds.forEach(build => {
        const buildElement = document.createElement('div');
        buildElement.className = 'mod-badge';
        buildElement.innerHTML = `
            <div class="ava_mod"></div>
            <div class="mod_info">
                <div class="mod_full_name_ava">${build.name[0].toUpperCase()}</div>
                <div class="Apple">${build.name}</div>

                <div class="Скрины">Скрины</div>
            </div>
            <button class="run_btn"><i class="fas fa-play"></i> Запустить</button>
        `;
        buildsContainer.appendChild(buildElement);
    });
});

// Функция для сохранения настроек
function saveSettings() {
    const settings = {
        language: document.getElementById('language').value,
        theme: document.getElementById('theme').value,
        notifications: document.getElementById('notifications').checked,
        autoUpdate: document.getElementById('auto-update').checked
    };
    ipcRenderer.send('save-settings', settings);
}

// Обработчик сохранения настроек
ipcRenderer.on('settings-saved', () => alert('Настройки успешно сохранены!'));

// Функция для загрузки настроек
function loadSettings() {
    ipcRenderer.send('load-settings');
}

// Обработчик загрузки настроек
ipcRenderer.on('settings-loaded', (event, settings) => {
    if (settings.length > 0) {
        const setting = settings[0];
        document.getElementById('language').value = setting.language;
        document.getElementById('theme').value = setting.theme;
        document.getElementById('notifications').checked = setting.notifications;
        document.getElementById('auto-update').checked = setting.auto_update;
        translateText(setting.language);
        changeTheme(setting.theme);
    }
});

// Функция для изменения темы
function changeTheme(theme) {
    document.body.className = theme;
}

// Обработчик изменения языка
document.getElementById('language').addEventListener('change', function() {
    const selectedLang = this.value;
    translateText(selectedLang);
    saveSettings();
});

// Обработчик изменения темы
document.getElementById('theme').addEventListener('change', function() {
    const selectedTheme = this.value;
    changeTheme(selectedTheme);
    saveSettings();
});

// Загрузка сборок и настроек при загрузке страницы
window.onload = () => {
    loadBuilds();
    loadSettings();
};