const { app, BrowserWindow, ipcMain, shell, Menu, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');
const db = require('./database');
const axios = require('axios');
const os = require('os');
const AdmZip = require('adm-zip');
const { autoUpdater } = require('electron-updater');
const { electron } = require('process');

let mainWindow;

function createWindow() {
    // Создаем сплеш-скрин
    

    // Создаем главное окно браузера
    mainWindow = new BrowserWindow({
        width: 1150,
        height: 720,
        icon: path.join(__dirname, 'path/to/your/icon.ico'), // Укажите путь к вашей иконке
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            
        }
    });

    // Загружаем HTML-файл
    mainWindow.loadFile(path.join(__dirname, '../resources/static/index.html'));
    

    // Отключаем DevTools
    //mainWindow.webContents.closeDevTools();

    // Показываем главное окно после загрузки
    mainWindow.once('ready-to-show', () => {

        mainWindow.show();
    });

    // Настройка меню приложения
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open Launcher Folder',
                    click: () => {
                        const launcherFolder = path.join(app.getPath('userData'), '.c', '.claunch');
                        shell.openPath(launcherFolder);
                    }
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        // Показать окно "О программе"
                        showAboutWindow();
                    }
                }
            ]
        },
        {
            label: 'Dev',
            submenu: [
                {
                    label: 'F12',
                    click: () => {
                       mainWindow.webContents.openDevTools()
                    }
                },
                {
                    label: 'Notify',
                    click: () => {
                       showNotification('Хей',`${os.platform()}`)
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // Обработка IPC-сообщений
    ipcMain.on('load-builds', (event) => {
        db.all('SELECT * FROM data', (err, rows) => {
            if (err) {
                console.error(err);
                event.sender.send('builds-loaded', []);
            } else {
                event.sender.send('builds-loaded', rows);
            }
        });
    });

    ipcMain.on('add-build', (event, build) => {
        db.run('INSERT INTO data (name, version) VALUES (?, ?)', [build.name, build.version], (err) => {
            if (err) {
                console.error(err);
            } else {
                event.sender.send('build-added');
            }
        });
    });

    ipcMain.on('load-settings', (event) => {
        db.all('SELECT * FROM settings', (err, rows) => {
            if (err) {
                console.error(err);
                event.sender.send('settings-loaded', []);
            } else {
                event.sender.send('settings-loaded', rows);
            }
        });
    });

    ipcMain.on('save-settings', (event, settings) => {
        db.run('INSERT OR REPLACE INTO settings (id, language, theme, notifications, auto_update) VALUES (1, ?, ?, ?, ?)', [settings.language, settings.theme, settings.notifications, settings.auto_update], (err) => {
            if (err) {
                console.error(err);
            } else {
                event.sender.send('settings-saved');
            }
        });
    });

    ipcMain.on('download-build', async (event, buildName, version) => {
        try {
            const releaseUrl = `https://api.github.com/repos/MihailRis/VoxelEngine-Cpp/releases/tags/v${version}`;
            console.log(`Fetching release from: ${releaseUrl}`);
            const response = await axios.get(releaseUrl);
            const assets = response.data.assets;

            let asset;
            if (os.platform() === 'win32') {
                asset = assets.find(asset => asset.name.endsWith('_win64.zip'));
            } else if (os.platform() === 'darwin') {
                asset = assets.find(asset => asset.name.endsWith('_macos.dmg'));
            } else if (os.platform() === 'linux') {
                asset = assets.find(asset => asset.name.endsWith('_x86_64.AppImage'));
            }

            if (!asset) {
                showNotification(`No asset found`, `for version ${version} on ${os.platform()}`);
                console.error(`No asset found for version ${version} on ${os.platform()}`);
                event.sender.send('build-download-failed', buildName);
                return;
            }

            const downloadUrl = asset.browser_download_url;
            const downloadPath = path.join(app.getPath('userData'), '.c', '.claunch', 'data');

            if (!fs.existsSync(downloadPath)) {
                fs.mkdirSync(downloadPath, { recursive: true });
            }

            const fileName = `${buildName}.zip`; 
            const filePath = path.join(downloadPath, fileName);

            const writer = fs.createWriteStream(filePath);

            const downloadResponse = await axios({
                url: downloadUrl,
                method: 'GET',
                responseType: 'stream'
            });

            downloadResponse.data.pipe(writer);

            writer.on('finish', () => {
                console.log(`Build ${version} downloaded successfully`);
                if (fileName.endsWith('.zip')) {
                    const zip = new AdmZip(filePath);
                    const extractPath = path.join(downloadPath, buildName);
                    if (!fs.existsSync(extractPath)) {
                        fs.mkdirSync(extractPath, { recursive: true });
                    }

                    // Распаковываем архив напрямую в папку buildName
                    zip.extractAllTo(extractPath, true);
                    fs.unlinkSync(filePath); // Удаляем zip файл после распаковки

                    // Перемещаем файлы из временной папки в папку buildName
                    const tempFolder = path.join(extractPath, zip.getEntries()[0].entryName.split('/')[0]);
                    fs.readdirSync(tempFolder).forEach(file => {
                        fs.renameSync(path.join(tempFolder, file), path.join(extractPath, file));
                    });

                    // Удаляем временную папку
                    fs.rmdirSync(tempFolder, { recursive: true });
                }
                event.sender.send('build-downloaded', buildName);
            });

            writer.on('error', err => {
                console.error(`Error downloading build ${version}:`, err);
                event.sender.send('build-download-failed', buildName);
            });

        } catch (error) {
            console.error(`Error fetching release for version ${version}:`, error);
            event.sender.send('build-download-failed', buildName);
        }
    });

    ipcMain.on('launch-build', (event, buildName) => {
        const buildPath = path.join(app.getPath('userData'), '.c', '.claunch', 'data', buildName);
        let executableName;

        if (os.platform() === 'win32') {
            executableName = 'VoxelCore.exe';
        } else if (os.platform() === 'darwin') {
            executableName = 'VoxelCore';
        } else if (os.platform() === 'linux') {
            executableName = 'VoxelCore';
        }

        const voxelCorePath = path.join(buildPath, executableName);

        console.log(`Checking if executable exists at: ${voxelCorePath}`);

        if (fs.existsSync(voxelCorePath)) {
            console.log(`Launching executable: ${voxelCorePath}`);

            // Создаем команду для запуска файла через консоль с параметрами совместимости
            const command = `start "" /d "${buildPath}" "${executableName}"`;

            // Выполняем команду
            exec(command, (err, stdout, stderr) => {
                if (err) {
                    console.error(`Error launching executable: ${err.message}`);
                    event.sender.send('build-launch-failed', buildName);
                } else {
                    event.sender.send('build-launched', buildName);
                }
            });
        } else {
            console.error(`Executable not found at: ${voxelCorePath}`);
            event.sender.send('build-not-found', buildName);
        }
    });

    ipcMain.on('open-launcher-folder', () => {
        const launcherFolder = path.join(app.getPath('userData'), '.c', '.claunch');
        shell.openPath(launcherFolder);
    });

    // Настройка автообновлений
    autoUpdater.on('update-available', () => {
        new Notification({
            title: 'Update Available',
            body: 'A new version of the application is available. Click to download.'
        }).show();
    });

    autoUpdater.on('update-downloaded', () => {
        new Notification({
            title: 'Update Downloaded',
            body: 'The update has been downloaded and will be installed on restart.'
        }).show();
    });

    autoUpdater.checkForUpdatesAndNotify();
}

// Функция для показа окна "О программе"
function showAboutWindow() {
    const aboutWindow = new BrowserWindow({
        width: 400,
        height: 300,
        resizable: false,
        title: 'About',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    aboutWindow.loadFile(path.join(__dirname, '../resources/static/about.html'));
}

// Этот метод будет вызван, когда Electron закончит инициализацию
// и будет готов к созданию окон браузера.
// Некоторые API могут использоваться только после этого события.
app.whenReady().then(createWindow);

// Выйти, когда все окна будут закрыты
app.on('window-all-closed', () => {
    // На macOS приложения и их строка меню обычно остаются активными до тех пор,
    // пока пользователь не выйдет явно с помощью Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // На macOS приложения обычно пересоздают окно в приложении,
    // после того как пользователь кликает на значок приложения в доке.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

/**служебные утилиты
 * 
 */
/*Notify*/
function showNotification(title, body) {
    const notification = new Notification({
        title: title,
        body: body,
        icon: path.join(__dirname, 'path/to/your/icon.ico') // Опционально: путь к иконке
    });

    notification.show();

    // Обработка события клика по уведомлению
    notification.on('click', () => {
        console.log('Notification clicked');
        // Здесь можно добавить логику, которая будет выполняться при клике на уведомление
    });

    // Обработка события закрытия уведомления
    notification.on('close', () => {
        console.log('Notification closed');
        // Здесь можно добавить логику, которая будет выполняться при закрытии уведомления
    });
}

// Функция для показа окна обновления
function showUpdateWindow() {
    const updateWindow = new BrowserWindow({
        width: 400,
        height: 300,
        resizable: false,
        title: 'Update Available',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    updateWindow.loadFile(path.join(__dirname, '../resources/static/update.html'));
}

// Обработка события обновления
autoUpdater.on('update-available', () => {
    showUpdateWindow();
});

ipcMain.on('start-update', () => {
    autoUpdater.downloadUpdate();
});

autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
});