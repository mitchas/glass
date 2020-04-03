global.$ = $;

const { remote } = require('electron');
const { Menu, BrowserWindow, MenuItem, shell } = remote;
const fs = require("fs");

function getWebViewWindow() {
  let actualWindows = remote.BrowserWindow.getAllWindows();
  if(actualWindows.length !== 2) {
    console.warn("This method only supports only two opened windows.");
    return undefined;
  }
  for (let win in actualWindows){
    if(actualWindows[win] !== remote.getCurrentWindow()){
      return actualWindows[win];
    }
  }
  console.warn("Duplicated elements on the window stack.");
  return undefined;
}

function sendToWebViewDocument(functionString) {
  let webviewWindow = getWebViewWindow();
  if(webviewWindow === undefined){
    console.error("Cannot find the webview window!");
    return;
  }
  webviewWindow.webContents.executeJavaScript(functionString);
}

$(document).ready(function () {

    // Address bar form
    $("#addressBar").submit(function(e) {
      e.preventDefault();
      loadURL();
    });

    // Opacity Slider
    $("#transparencyRange").change(function(){
        var opacityValue = $(this).val();
        changeOpacity(opacityValue);
    });

    // Select all text when changing URL
    $("input[type='text']").click(function () {
       $(this).select();
    });

});


// Change window Opacity
// Change window Opacity
// Change window Opacity
// Wrapper for the webview window
function changeOpacity(opacity) {
  sendToWebViewDocument('changeOpacity(' + opacity + ')');
}


// App Controls
// App Controls
// App Controls
function loadURL(){
    let url = $("#urlField").val();

    if(url.indexOf("http") >= 0){
        loadPage(url);

    }else{
        url = "http://" + url;
        loadPage(url);
    }
}

function loadPage(url) {
  sendToWebViewDocument('loadPage(' + url + ')');
}




// Go back
function browserBack() {
  sendToWebViewDocument('browserBack()');
}


function enableClickThrough() {
  if ($(clickthroughButton).children('img').hasClass('set-background-color')) {
    $(clickthroughButton).children('img').removeClass('set-background-color');
    sendToWebViewDocument('enableClickThrough(false)');
  } else {
    $(clickthroughButton).children('img').addClass('set-background-color');
    sendToWebViewDocument('enableClickThrough(true)');
  }
}


// Window Controls
// Window Controls
// Window Controls

function openWebsite() {
  sendToWebViewDocument('openWebsite()');
}

function minimizeWindow() {
  let window = remote.getCurrentWindow();
  window.minimize();
}

let windowIsMaximized = false;

function maximizeWindow() {
  let window = remote.getCurrentWindow();
  if (windowIsMaximized) {
    window.unmaximize();
    windowIsMaximized = false;
  } else {
    window.maximize();
    windowIsMaximized = true;
  }
  let x = window.getBounds().x;
  let y = window.getBounds().y + window.getBounds().height;
  let w = window.getBounds().width;
  sendToWebViewDocument('maximizeWindow(' + x + ',' + y + ',' + w + ')');
}

function closeWindow() {
  let webViewWindow = getWebViewWindow();
  if(webViewWindow !== undefined) webViewWindow.close();
  let window = remote.getCurrentWindow();
  window.close();
}
