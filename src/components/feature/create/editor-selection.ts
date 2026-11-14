export const editorSelectionScript = `
(function () {
  window.__dailyNotesSelectedImageKey = '';
  var send = function () {
    var selection = window.getSelection();
    var text = selection ? selection.toString().trim() : '';
    if (text) window.__dailyNotesSelectedImageKey = '';
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'APP_SELECTION_CHANGE',
      data: { text: text, imageKey: window.__dailyNotesSelectedImageKey }
    }));
  };
  document.addEventListener('selectionchange', send);
  document.addEventListener('click', function (event) {
    var target = event.target;
    var image = target && target.closest ? target.closest('img') : null;
    window.__dailyNotesSelectedImageKey = image
      ? image.getAttribute('data-object-key') || ''
      : '';
    send();
  }, true);
})();
true;
`;
