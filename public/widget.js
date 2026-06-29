(function () {
  var VERSION = 1;
  var SITE = 'https://persiantoolbox.ir';
  var API = SITE + '/api/widget/tools';
  var STORAGE_KEY = '__pt_widget_cache';

  var PT = document.currentScript;
  var THEME = PT ? PT.getAttribute('data-theme') || 'auto' : 'auto';
  var POSITION = PT ? PT.getAttribute('data-position') || 'bl' : 'bl';

  var ns = '__PTWidget';
  if (window[ns]) return;
  window[ns] = {};

  var state = { tools: [], cats: [], loading: true, panelOpen: false };

  function css() {
    return (
      '\n' +
      '#ptw-fab {' +
      '  position:fixed;z-index:999999;' +
      (POSITION === 'br' ? 'bottom:20px;right:20px;' : 'bottom:20px;left:20px;') +
      '  width:56px;height:56px;border-radius:28px;border:none;' +
      '  background:#1e40af;color:#fff;font-size:24px;cursor:pointer;' +
      '  box-shadow:0 4px 12px rgba(0,0,0,0.25);' +
      '  transition:transform 0.2s,box-shadow 0.2s;' +
      '  display:flex;align-items:center;justify-content:center;' +
      '}\n' +
      '#ptw-fab:hover{transform:scale(1.1);box-shadow:0 6px 16px rgba(0,0,0,0.35);}\n' +
      '#ptw-panel{' +
      '  position:fixed;z-index:999998;' +
      (POSITION === 'br' ? 'bottom:86px;right:10px;' : 'bottom:86px;left:10px;') +
      '  width:360px;max-width:calc(100vw - 20px);' +
      '  max-height:560px;background:#fff;border-radius:12px;' +
      '  box-shadow:0 8px 32px rgba(0,0,0,0.2);overflow:hidden;' +
      '  display:none;flex-direction:column;direction:rtl;font-family:system-ui,sans-serif;' +
      '}\n' +
      '@media(prefers-color-scheme:dark){' +
      '#ptw-panel{background:#1e1e2e;color:#e0e0e0}' +
      '#ptw-search{background:#2a2a3e;color:#e0e0e0;border-color:#3a3a4e}' +
      '#ptw-search::placeholder{color:#888}' +
      '#ptw-tool:hover{background:#2a2a3e}' +
      '}\n' +
      '#ptw-header{' +
      '  padding:12px 16px;font-size:16px;font-weight:700;' +
      '  border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:8px;' +
      '}\n' +
      '#ptw-close{' +
      '  margin-right:auto;background:none;border:none;cursor:pointer;' +
      '  font-size:18px;color:#666;padding:4px;' +
      '}\n' +
      '#ptw-search{' +
      '  margin:8px 12px;padding:8px 12px;border:1px solid #d1d5db;' +
      '  border-radius:8px;font-size:14px;outline:none;width:calc(100% - 24px);' +
      '  box-sizing:border-box;direction:rtl;font-family:system-ui,sans-serif;' +
      '}\n' +
      '#ptw-search:focus{border-color:#1e40af;box-shadow:0 0 0 2px rgba(30,64,175,0.2)}\n' +
      '#ptw-body{overflow-y:auto;flex:1;padding:4px 0}\n' +
      '#ptw-cats{display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px;border-bottom:1px solid #e5e7eb}\n' +
      '#ptw-cat{font-size:12px;padding:4px 10px;border-radius:12px;background:#eef2ff;color:#1e40af;cursor:pointer;border:none}\n' +
      '#ptw-cat.active{background:#1e40af;color:#fff}\n' +
      '#ptw-tool{' +
      '  display:flex;align-items:center;gap:10px;padding:8px 16px;' +
      '  cursor:pointer;text-decoration:none;color:inherit;font-size:14px;' +
      '  transition:background 0.15s;' +
      '}\n' +
      '#ptw-tool:hover{background:#f3f4f6}\n' +
      '#ptw-ticon{font-size:18px;width:24px;text-align:center;flex-shrink:0}\n' +
      '#ptw-tname{flex:1}\n' +
      '#ptw-tcat{font-size:11px;color:#888;flex-shrink:0}\n' +
      '#ptw-empty{padding:24px;text-align:center;color:#888;font-size:14px}\n' +
      ''
    );
  }

  function getIcon(path) {
    if (path.includes('/pdf')) return '\uD83D\uDCC4';
    if (path.includes('/image')) return '\uD83D\uDDBC\uFE0F';
    if (
      path.includes('/salary') ||
      path.includes('/loan') ||
      path.includes('/interest') ||
      path.includes('/tools') ||
      path.includes('/market')
    )
      return '\uD83D\uDCB0';
    if (path.includes('/date') || path.includes('/calendar')) return '\uD83D\uDCC5';
    if (path.includes('/text') || path.includes('/json') || path.includes('/base64'))
      return '\uD83D\uDCDD';
    if (
      path.includes('/validation') ||
      path.includes('/national') ||
      path.includes('/qr') ||
      path.includes('/sheba') ||
      path.includes('/password')
    )
      return '\u2705';
    if (path.includes('/contract')) return '\uD83D\uDCCB';
    if (path.includes('/business') || path.includes('/document')) return '\uD83D\uDCC6';
    if (path.includes('/career') || path.includes('/resume')) return '\uD83D\uDCBC';
    if (path.includes('/writing') || path.includes('/persian')) return '\u270F\uFE0F';
    return '\uD83D\uDD27';
  }

  function render() {
    var p = document.getElementById('ptw-panel');
    if (!p) return;
    var cats = document.getElementById('ptw-cats');
    var body = document.getElementById('ptw-body');
    if (!cats || !body) return;
    var q = (document.getElementById('ptw-search') || {}).value || '';
    var activeCat = cats.getAttribute('data-active') || '';
    var filtered = state.tools.filter(function (t) {
      if (q && !t.title.includes(q) && !t.category.includes(q)) return false;
      if (activeCat && t.catId !== activeCat) return false;
      return true;
    });
    cats.innerHTML =
      '<button id="ptw-cat" class="' + (!activeCat ? 'active' : '') + '" data-cat="">همه</button>';
    state.cats.forEach(function (c) {
      cats.innerHTML +=
        '<button id="ptw-cat" class="' +
        (activeCat === c.id ? 'active' : '') +
        '" data-cat="' +
        c.id +
        '">' +
        c.name +
        '</button>';
    });
    if (filtered.length === 0) {
      body.innerHTML =
        '<div id="ptw-empty">' +
        (q
          ? '\u0646\u062A\u06CC\u062C\u0647\u200C\u0627\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F'
          : '\u0627\u0628\u0632\u0627\u0631\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F') +
        '</div>';
      return;
    }
    body.innerHTML = '';
    filtered.forEach(function (t) {
      var a = document.createElement('a');
      a.id = 'ptw-tool';
      a.href = SITE + t.path;
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML =
        '<span id="ptw-ticon">' +
        getIcon(t.path) +
        '</span><span id="ptw-tname">' +
        t.title +
        '</span><span id="ptw-tcat">' +
        t.category +
        '</span>';
      body.appendChild(a);
    });
    Array.from(document.querySelectorAll('#ptw-cat')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        cats.setAttribute('data-active', btn.getAttribute('data-cat'));
        render();
      });
    });
  }

  function toggle() {
    var fab = document.getElementById('ptw-fab');
    var panel = document.getElementById('ptw-panel');
    if (!fab || !panel) return;
    state.panelOpen = !state.panelOpen;
    panel.style.display = state.panelOpen ? 'flex' : 'none';
    fab.textContent = state.panelOpen ? '\u2716' : '\uD83E\uDDF0';
    if (state.panelOpen && state.loading) load();
    if (state.panelOpen) {
      setTimeout(function () {
        var inp = document.getElementById('ptw-search');
        if (inp) inp.focus();
      }, 200);
    }
  }

  function load() {
    var cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        var d = JSON.parse(cached);
        if (d.v === VERSION) {
          state.tools = d.items;
          state.cats = d.cats;
          state.loading = false;
          render();
          return;
        }
      } catch (_) {}
    }
    var x = new XMLHttpRequest();
    x.open('GET', API);
    x.onload = function () {
      if (x.status === 200) {
        try {
          var d = JSON.parse(x.responseText);
          state.tools = d.items || [];
          state.cats = d.cats || [];
          state.loading = false;
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ items: state.tools, cats: state.cats, v: VERSION }),
          );
          render();
        } catch (_) {}
      }
    };
    x.send();
  }

  function init() {
    var s = document.createElement('style');
    s.textContent = css();
    document.head.appendChild(s);

    var fab = document.createElement('button');
    fab.id = 'ptw-fab';
    fab.textContent = '\uD83E\uDDF0';
    fab.setAttribute(
      'aria-label',
      '\u062C\u0639\u0628\u0647 \u0627\u0628\u0632\u0627\u0631 \u0641\u0627\u0631\u0633\u06CC',
    );
    fab.addEventListener('click', toggle);
    document.body.appendChild(fab);

    var panel = document.createElement('div');
    panel.id = 'ptw-panel';
    panel.innerHTML =
      '<div id="ptw-header"><span>\uD83E\uDDF0 \u062C\u0639\u0628\u0647 \u0627\u0628\u0632\u0627\u0631 \u0641\u0627\u0631\u0633\u06CC</span><button id="ptw-close" aria-label="\u0628\u0633\u062A\u0646">\u2716</button></div>' +
      '<input id="ptw-search" type="text" placeholder="\u062C\u0633\u062A\u062C\u0648\u06CC \u0627\u0628\u0632\u0627\u0631..." autocomplete="off">' +
      '<div id="ptw-cats" data-active=""></div>' +
      '<div id="ptw-body"><div id="ptw-empty">\u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0631\u06AF\u06CC\u0631\u06CC...</div></div>';
    document.body.appendChild(panel);

    document.getElementById('ptw-close').addEventListener('click', toggle);

    document.getElementById('ptw-search').addEventListener('input', function () {
      render();
    });

    state.loading = true;
    load();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
