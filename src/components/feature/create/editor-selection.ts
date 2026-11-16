export const editorSelectionScript = `
(function () {
  var root = document.querySelector('.content') || document.body;

  var getSelectedImage = function () {
    var selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    var range = selection.getRangeAt(0);
    if (range.collapsed) return null;
    var images = root.querySelectorAll('img');
    for (var i = 0; i < images.length; i++) {
      if (range.intersectsNode(images[i])) {
        var key = images[i].getAttribute('data-object-key') || '';
        if (key) return { key: key, url: images[i].getAttribute('src') || '' };
      }
    }
    return null;
  };

  var send = function () {
    var selection = window.getSelection();
    var text = selection ? selection.toString().trim() : '';
    var image = getSelectedImage();
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'APP_SELECTION_CHANGE',
      data: {
        text: text,
        imageKey: image ? image.key : '',
        imageUrl: image ? image.url : ''
      }
    }));
  };

  document.addEventListener('selectionchange', send);

  document.addEventListener('click', function (event) {
    var target = event.target;
    var image = target && target.closest ? target.closest('img') : null;
    if (!image) return;
    var range = document.createRange();
    range.selectNode(image);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    send();
  }, true);
  // ---------- Pengukuran tinggi konten (debounce: sekali lompat, tidak bertahap) ----------
  var measureEl =
    document.querySelector('.pell-content') ||
    document.getElementById('editor') ||
    root;
  var lastHeight = 0;
  var timer = null;

  var measure = function () {
    timer = null;
    var height = Math.ceil(measureEl.getBoundingClientRect().height) + 8;
    if (Math.abs(height - lastHeight) < 2) return;
    lastHeight = height;
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'APP_CONTENT_HEIGHT',
      data: { height: height }
    }));
  };

  var sendHeight = function () {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(measure, 120);
  };

  var watchImages = function () {
    var imgs = measureEl.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      if (!imgs[i].complete) {
        imgs[i].addEventListener('load', sendHeight, { once: true });
        imgs[i].addEventListener('error', sendHeight, { once: true });
      }
    }
  };

  if (window.ResizeObserver) new ResizeObserver(sendHeight).observe(measureEl);
  document.addEventListener('input', sendHeight);
  window.addEventListener('load', function () { watchImages(); sendHeight(); });
  watchImages();
  sendHeight();
})();
true;
`;