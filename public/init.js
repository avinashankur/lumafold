// Runs synchronously before any CSS — sets popup vs tab vs floating mode and dark bg
(function () {
  var html = document.documentElement;
  var params = new URLSearchParams(window.location.search);
  var isFloating = params.get('mode') === 'floating';
  var isFullTab = !isFloating && window.outerWidth > 1000;
  var mode = isFloating ? 'floating' : isFullTab ? 'tab' : 'popup';
  html.setAttribute('data-mode', mode);
  html.style.background = '#111113';
  document.write(
    '<style>' +
      'html,body,#root{background:#111113;overflow:hidden;margin:0;padding:0;}' +
      'html[data-mode="popup"],html[data-mode="popup"] body,html[data-mode="popup"] #root{' +
      'width:800px!important;height:600px!important;' +
      'max-width:100%!important;min-width:0!important;overflow-x:hidden!important;}' +
      'html[data-mode="floating"],html[data-mode="floating"] body,html[data-mode="floating"] #root,' +
      'html[data-mode="tab"],html[data-mode="tab"] body,html[data-mode="tab"] #root{' +
      'width:100vw!important;height:100vh!important;}' +
      '</style>',
  );
})();
