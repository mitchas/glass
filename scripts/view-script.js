global.$ = $;

const {remote, ipcRenderer} = require('electron');
const {Menu, BrowserWindow, MenuItem, shell} = remote;
const fs = require("fs");

$(document).ready(function () {

  var webview = document.getElementById('browserView');
  webview.addEventListener('dom-ready', function () {
    webview.insertCSS('*::-webkit-scrollbar { width: 0 !important }')
  });

});

ipcRenderer.on('css', (event, data) => {
  $("html").css(data.key, data.value)
})

function changeOpacity(opacity) {
  $("body").css('opacity', opacity);
}

function loadPage(url) {
  console.log("Loading " + url);
  if (url.toLowerCase().indexOf("youtube.com/watch") >= 0) {
    let youtubeID = url.substring(url.indexOf("v=") + 2);
    youtubeID = youtubeID.split('&')[0];
    let youtubeURL = "https://www.youtube.com/embed/" + youtubeID;

    $("#urlField").val(youtubeURL);
    let webview = document.getElementById('browserView');
    webview.loadURL(youtubeURL);
  } else {
    let webview = document.getElementById('browserView');
    webview.loadURL(url);
  }
}

let windowIsMaximized = false;
let lastHeight = 600

function maximizeWindow(x, y, w) {
  if(windowIsMaximized){
    remote.getCurrentWindow().setBounds({
      x: x,
      y: y,
      width: w,
      height: lastHeight,
    });
  } else {
    lastHeight = remote.getCurrentWindow().getBounds().height;
    remote.getCurrentWindow().setBounds({
      x: x,
      y: y,
      width: w,
      height: remote.screen.getPrimaryDisplay().bounds.height - y,
    });
  }
  windowIsMaximized = !windowIsMaximized;
}

// Go back
function browserBack() {
  let webview = document.getElementById('browserView');
  webview.back;
}

function enableClickThrough(activation) {
  console.log("Clickthrough change.")
  let window = remote.getCurrentWindow();
  window.setIgnoreMouseEvents(activation);
}

function openWebsite() {
  shell.openExternal("http://mitch.works/apps/glass");
}