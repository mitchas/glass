// Issues with node package? Rebuild
// .\node_modules\.bin\electron-rebuild.cmd

const electron = require('electron')
// Module to control application life.
const app = electron.app
const ipcMain = electron.ipcMain
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const initialHeight = 600
const initialWidth = 900
const toolbarHeight = 82

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindowToolbar
let mainWindowView

function init(){
  mainWindowToolbar = createToolbarWindow()
}

function createToolbarWindow(){
  // Create the browser window.
  mainWindowToolbar = new BrowserWindow({ titleBarStyle: 'hidden', frame: false, width: initialWidth, height: toolbarHeight, transparent: true }); //900x600 was initial parameter
  mainWindowToolbar.setMaximumSize(mainWindowToolbar.getMaximumSize()[0], mainWindowToolbar.getBounds().height)
  mainWindowToolbar.setMinimumSize(mainWindowToolbar.getMinimumSize()[0], mainWindowToolbar.getBounds().height)

  mainWindowToolbar.setPosition(mainWindowToolbar.getBounds().x, mainWindowToolbar.getBounds().y - (600/2))
  mainWindowToolbar.__id = 'mainWindowToolbar'


  // and load the index.html of the app.
  mainWindowToolbar.loadURL(url.format({
    pathname: path.join(__dirname, 'index-toolbar.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindowToolbar.setAlwaysOnTop(true)


  // Open the DevTools.
  // mainWindowToolbar.webContents.openDevTools()

  mainWindowToolbar.on('close', function () {
    clearTimeout(positioningTimeout)
    app.quit()
  })


  mainWindowView = createViewWindow(initialHeight - toolbarHeight)
}

function createViewWindow(height){
  mainWindowView = new BrowserWindow({ titleBarStyle: 'hidden', frame: false, width: initialWidth, height: height, transparent: true });

  // and load the index.html of the app.
  mainWindowView.loadURL(url.format({
    pathname: path.join(__dirname, 'index-view.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindowView.setAlwaysOnTop(true)
  mainWindowView.__id = 'mainWindowView'
  lastHeight = mainWindowView.getBounds().height
  // mainWindowView.setSkipTaskbar(skipTaskbar)
  // mainWindowView.setIgnoreMouseEvents(true);


  // Open the DevTools. Warning, if dev tools are open, than the transparent window is disabled.
  // mainWindowView.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindowView.on('closed', function () {
    app.quit()
  })

  try {
    addListener(mainWindowView, 'resize')
    addListener(mainWindowView, 'move')
    addListener(mainWindowToolbar, 'resize')
    addListener(mainWindowToolbar, 'move')
  } catch(e){
    console.log(e)
  }
}

function addListener(brWindow, name){
  if(name === 'resize'){
    brWindow.on(name, handleResizeEvent)
  } else if(name === 'move'){
    brWindow.on(name, handleMoveEvent)
  }
}

function removeListener(brWindow, name){
  if(name === 'resize'){
    brWindow.removeListener(name, handleResizeEvent)
  } else if(name === 'move'){
    brWindow.removeListener(name, handleMoveEvent)
  }
}

let lastHeight = 0

function handleResizeEvent(event){
  let name = 'resize'
  let focusedWindow = BrowserWindow.getFocusedWindow();
  let eventBounds = focusedWindow.getBounds()
  let notFocusedWindow = getNotFocusedWindow()
  removeListener(notFocusedWindow, name)

  try {
    // and load the index.html of the app.
    const {height} = notFocusedWindow.getBounds()
    if (height- 3 > lastHeight || height + 3 < lastHeight) {
      notFocusedWindow.setSize(eventBounds.width, notFocusedWindow.getBounds().height)
      lastHeight = notFocusedWindow.getBounds().height
    } else {
      notFocusedWindow.setSize(eventBounds.width, lastHeight)
    }
    executePositioning(focusedWindow, eventBounds, notFocusedWindow)
    addListener(notFocusedWindow, name)
  } catch (e) {
    console.log("Error " + e.message);
  }
}

let moveTimeout = null

function handleMoveEvent(event){
  let name = 'move'
  let focusedWindow = BrowserWindow.getFocusedWindow();
  let eventBounds = focusedWindow.getBounds()
  let notFocusedWindow = getNotFocusedWindow();
  clearTimeout(moveTimeout)
  removeListener(notFocusedWindow, name)

  try {
    executePositioning(focusedWindow, eventBounds, notFocusedWindow)
    moveTimeout = setTimeout(() => addListener(notFocusedWindow, name), 10)
  } catch (e) {
    console.log("Error " + e.message);
  }
}

let positioningTimeout = null

function executePositioning(focusedWindow, eventBounds, notFocusedWindow){
  clearTimeout(positioningTimeout)
  notFocusedWindow.webContents.send('css', {key: 'display', value: 'none'});
  let notFocusedWindowBounds = getNotFocusedWindow().getBounds()
  let newY
  if(isToolbar(focusedWindow)){
    newY = eventBounds.y + eventBounds.height
  } else {
    newY = notFocusedWindowBounds.y
  }
  positioningTimeout = setTimeout(() => {
    notFocusedWindow.setPosition(eventBounds.x, newY)
    notFocusedWindow.webContents.send('css', {key: 'display', value: ''});
  }, 150);
}

function getNotFocusedWindow() {
  let actualWindows = electron.BrowserWindow.getAllWindows();
  if(actualWindows.length !== 2) {
    console.warn("This method only supports only two opened windows.");
    return undefined;
  }
  for (let win in actualWindows){
    if(actualWindows[win] !== electron.BrowserWindow.getFocusedWindow()){
      return actualWindows[win];
    }
  }
  console.warn("Duplicated elements on the window stack.");
  return undefined;
}

function isToolbar(browserWindow){
  return browserWindow.__id === 'mainWindowToolbar'
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', init)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindowView === null || mainWindowToolbar === null) {
        init()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
