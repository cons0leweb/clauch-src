const { ipcRenderer } = require('electron');

// Объект с переводами
const lang = {
    en: {
        builds: 'Builds',
        createNewBuild: 'Create New Build',
        name: 'Name',
        version: 'Version',
        description: 'Description',
        addBuild: 'Add Build',
        settings: 'Settings',
        language: 'Language',
        theme: 'Theme',
        notifications: 'Notifications',
        autoUpdate: 'Auto Update',
        saveSettings: 'Save Settings',
        openLauncherFolder: 'Open Launcher Folder',
        download: 'Download',
        launch: 'Launch'
    },
    ru: {
        builds: 'Сборки',
        createNewBuild: 'Создать новую сборку',
        name: 'Имя',
        version: 'Версия',
        description: 'Описание',
        addBuild: 'Добавить сборку',
        settings: 'Настройки',
        language: 'Язык',
        theme: 'Тема',
        notifications: 'Уведомления',
        autoUpdate: 'Автоматическое обновление',
        saveSettings: 'Сохранить настройки',
        openLauncherFolder: 'Открыть папку лаунчера',
        download: 'Скачать',
        launch: 'Запустить'
    }
};

// Функция для установки языка
function setLanguage(language) {
    const translations = lang[language];
    if (!translations) return;

    // Локализация заголовков и текстов
    document.getElementById('builds-title').innerText = translations.builds;
    document.getElementById('newBuildModal').querySelector('h2').innerText = translations.createNewBuild;
    document.getElementById('settingsModal').querySelector('h2').innerText = translations.settings;

    // Локализация формы создания новой сборки
    document.getElementById('build-name-label').innerText = translations.name;
    document.getElementById('build-version-label').innerText = translations.version;

    document.getElementById('add-build-button').innerText = translations.addBuild;

    // Локализация формы настроек
    document.getElementById('language-label').innerText = translations.language;
    document.getElementById('theme-label').innerText = translations.theme;
    document.getElementById('notifications-label').innerText = translations.notifications;
    document.getElementById('auto-update-label').innerText = translations.autoUpdate;
    document.getElementById('save-settings-button').innerText = translations.saveSettings;
    document.getElementById('open-folder-button').innerText = translations.openLauncherFolder;

    // Локализация кнопок скачивания и запуска
    document.querySelectorAll('.download-button').forEach(button => {
        button.innerText = translations.download;
    });
    document.querySelectorAll('.launch-button').forEach(button => {
        button.innerText = translations.launch;
    });
}

// Установка языка по умолчанию
setLanguage('en');

// Применение языка при изменении выбора в настройках
document.getElementById('language').addEventListener('change', (event) => {
    setLanguage(event.target.value);
});

// Load builds from the database
ipcRenderer.send('load-builds');
ipcRenderer.on('builds-loaded', (event, builds) => {
    const buildsContainer = document.getElementById('builds');
    buildsContainer.innerHTML = '';
    builds.forEach(build => {
        const buildElement = document.createElement('div');
        buildElement.className = 'build';
        buildElement.innerHTML = `
            <h3>${build.name}</h3>
            <p>Version: ${build.version}</p>
            <button class="btn btn-primary download-button" data-version="${build.version}">
                <i class="fas fa-download"></i> Download
            </button>
            <button class="btn btn-secondary launch-button" data-version="${build.version}">
                <i class="fas fa-play"></i> Launch
            </button>
        `;
        buildsContainer.appendChild(buildElement);
    });

    // Add event listeners for download and launch buttons
    document.querySelectorAll('.download-button').forEach(button => {
        button.addEventListener('click', () => {
            const version = button.getAttribute('data-version');
            const buildName = button.closest('.build').querySelector('h3').innerText;
            ipcRenderer.send('download-build', buildName, version);
        });
    });

    document.querySelectorAll('.launch-button').forEach(button => {
        button.addEventListener('click', () => {
            const buildName = button.closest('.build').querySelector('h3').innerText;
            ipcRenderer.send('launch-build', buildName);
        });
    });
});

// Add new build
document.getElementById('new-build-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const build = {
        name: document.getElementById('build-name').value,
        version: document.getElementById('build-version').value,
    };
    ipcRenderer.send('add-build', build);
    document.getElementById('new-build-form').reset();
    closeModal('newBuildModal');
});

ipcRenderer.on('build-added', () => {
    ipcRenderer.send('load-builds');
});
// Функция для очистки экрана
function clear() {
    const gl = canvas.getContext('webgl');
    if (gl) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
}

// Функция для скрытия и отображения canvas
function toggleCanvasVisibility(visible) {
    canvas.style.display = visible ? 'block' : 'none';
}

// Load settings from the database
ipcRenderer.send('load-settings');
ipcRenderer.on('settings-loaded', (event, settings) => {
    if (settings.length > 0) {
        document.getElementById('language').value = settings[0].language;
        document.getElementById('theme').value = settings[0].theme;
        document.getElementById('notifications').value = settings[0].notifications;
        document.getElementById('auto-update').value = settings[0].auto_update;

        // Применение темы сразу после загрузки настроек
        const theme = settings[0].theme;
        if (theme === 'dark') {
            document.body.classList.remove('theme-lsd');
            document.body.classList.add('dark-theme');
            
        }
        if (theme === 'lsd') {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('theme-lsd');
            
        }
        
        if (theme === 'shader_three') {
            clear()
        }else {
            document.body.classList.remove('dark-theme');
            document.body.classList.remove('theme-expensive');
            toggleCanvasVisibility(false);
            clear();
        }

        // Установка языка из настроек
        setLanguage(settings[0].language);
    }
});

// Save settings
document.getElementById('settings-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const settings = {
        language: document.getElementById('language').value,
        theme: document.getElementById('theme').value,
        notifications: document.getElementById('notifications').value,
        auto_update: document.getElementById('auto-update').value
    };
    ipcRenderer.send('save-settings', settings);
    closeModal('settingsModal');
    
});

ipcRenderer.on('settings-saved', () => {
    alert('Settings saved successfully!');
});

document.getElementById('open-folder-button').addEventListener('click', () => {
    ipcRenderer.send('open-launcher-folder');
});

document.getElementById('theme').addEventListener('change', (event) => {
    const theme = event.target.value;
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
});

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

document.getElementById('createNewBuildButton').addEventListener('click', () => openModal('newBuildModal'));
document.getElementById('settingsButton').addEventListener('click', () => openModal('settingsModal'));
document.getElementById('newBuildModalClose').addEventListener('click', () => closeModal('newBuildModal'));
document.getElementById('settingsModalClose').addEventListener('click', () => closeModal('settingsModal'));

window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
});