// Runs synchronously before any CSS — sets popup vs tab mode and dark bg
(function() {
  var html = document.documentElement;
  var isFullTab = window.outerWidth > 1000;
  html.setAttribute("data-mode", isFullTab ? "tab" : "popup");
  html.style.background = "#111113";
  document.write(
    "<style>" +
      "html,body,#root{background:#111113;overflow:hidden;margin:0;padding:0;}" +
      'html[data-mode="popup"],html[data-mode="popup"] body,html[data-mode="popup"] #root{' +
      "width:800px!important;height:600px!important;" +
      "max-width:100%!important;min-width:0!important;overflow-x:hidden!important;}" +
      'html[data-mode="tab"],html[data-mode="tab"] body,html[data-mode="tab"] #root{' +
      "width:100vw!important;height:100vh!important;}" +
      "</style>"
  );
})();
