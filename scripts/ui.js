(function(window, $){
  'use strict';
  window.App = window.App || {};

  // UI and state management for CodeCanvas
  const HLJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/';
  const THEMES = {
    'GitHub Dark': 'github-dark.min.css',
    'GitHub Light': 'github.min.css',
    'Monokai': 'monokai.min.css',
    'Atom One Dark': 'atom-one-dark.min.css',
    'Atom One Light': 'atom-one-light.min.css',
    'VS 2015': 'vs2015.min.css',
    'Xcode': 'xcode.min.css',
    'Nord': 'nord.min.css',
    'Solarized Light': 'solarized-light.min.css',
    'Solarized Dark': 'solarized-dark.min.css'
  };

  const LANGUAGES = [
    {id:'auto', label:'Auto detect'},
    {id:'javascript', label:'JavaScript'},
    {id:'typescript', label:'TypeScript'},
    {id:'python', label:'Python'},
    {id:'java', label:'Java'},
    {id:'c', label:'C'},
    {id:'cpp', label:'C++'},
    {id:'csharp', label:'C#'},
    {id:'go', label:'Go'},
    {id:'rust', label:'Rust'},
    {id:'ruby', label:'Ruby'},
    {id:'php', label:'PHP'},
    {id:'swift', label:'Swift'},
    {id:'kotlin', label:'Kotlin'},
    {id:'sql', label:'SQL'},
    {id:'bash', label:'Bash'},
    {id:'json', label:'JSON'},
    {id:'yaml', label:'YAML'},
    {id:'xml', label:'XML'},
    {id:'html', label:'HTML'},
    {id:'css', label:'CSS'},
    {id:'markdown', label:'Markdown'}
  ];

  const DEFAULT_CODE = `// CodeCanvas: from code to crisp PNG\nfunction greet(name){\n  return \`Hello, ${name}!\`;\n}\n\nconsole.log(greet('world'));`;

  const state = {
    code: DEFAULT_CODE,
    language: 'auto',
    theme: 'GitHub Dark',
    bgColor: '#0b1220',
    fontSize: 14,
    padding: 24,
    showLineNumbers: true,
    wrap: false,
    windowChrome: true,
    shadow: true,
    pixelRatio: 2
  };

  // Cache DOM elements
  const els = {};

  function cacheElements(){
    els.language = $('#language');
    els.theme = $('#theme');
    els.bgColor = $('#bgColor');
    els.bgSwatches = $('#bgSwatches');
    els.padding = $('#padding');
    els.fontSize = $('#fontSize');
    els.toggleLineNumbers = $('#toggleLineNumbers');
    els.toggleWrap = $('#toggleWrap');
    els.toggleChrome = $('#toggleChrome');
    els.toggleShadow = $('#toggleShadow');
    els.pixelRatio = $('#pixelRatio');
    els.codeInput = $('#codeInput');
    els.charCount = $('#charCount');
    els.exportBtn = $('#exportBtn');
    els.copyBtn = $('#copyBtn');
    els.clearBtn = $('#clearBtn');
    els.sampleBtn = $('#sampleBtn');
    els.status = $('#status');
    els.hljsThemeLink = $('#hljs-theme');

    els.exportCanvas = $('#exportCanvas');
    els.chromeBar = $('#chromeBar');
    els.codeWrapper = $('#codeWrapper');
    els.codeBlock = $('#codeBlock');
  }

  function populateSelects(){
    // Language select
    els.language.empty();
    LANGUAGES.forEach(function(lang){
      els.language.append(`<option value="${lang.id}">${lang.label}</option>`);
    });

    // Theme select
    els.theme.empty();
    Object.keys(THEMES).forEach(function(name){
      els.theme.append(`<option value="${name}">${name}</option>`);
    });
  }

  function applyStateToControls(){
    els.language.val(state.language);
    els.theme.val(state.theme);
    els.bgColor.val(state.bgColor);
    els.padding.val(state.padding);
    els.fontSize.val(String(state.fontSize));
    setSwitch(els.toggleLineNumbers, state.showLineNumbers);
    setSwitch(els.toggleWrap, state.wrap);
    setSwitch(els.toggleChrome, state.windowChrome);
    setSwitch(els.toggleShadow, state.shadow);
    els.pixelRatio.val(String(state.pixelRatio));
    els.codeInput.val(state.code);
    updateCharCount();
  }

  function loadFromStorage(){
    const saved = window.App.Storage.loadState();
    if (saved && typeof saved === 'object'){
      Object.assign(state, saved);
    }
  }

  function persist(){ window.App.Storage.saveState(state); }

  function setSwitch($btn, on){
    $btn.attr('aria-checked', on ? 'true' : 'false');
  }

  function readSwitch($btn){ return $btn.attr('aria-checked') === 'true'; }

  function toggleSwitch($btn){ setSwitch($btn, !readSwitch($btn)); }

  function status(message){ els.status.text(message || ''); }

  function updateCharCount(){
    const len = (els.codeInput.val() || '').length;
    els.charCount.text(`${len} ${len === 1 ? 'character' : 'characters'}`);
  }

  function setTheme(name){
    const file = THEMES[name] || THEMES['GitHub Dark'];
    const href = HLJS_BASE + file;
    els.hljsThemeLink.attr('href', href);
    state.theme = name;
    persist();
  }

  function setLanguage(id){
    state.language = id;
    persist();
  }

  function setBackground(color){
    state.bgColor = color;
    persist();
  }

  function setPadding(value){ state.padding = window.App.Utils.clamp(parseInt(value||24,10), 8, 64); persist(); }
  function setFontSize(value){ state.fontSize = window.App.Utils.clamp(parseInt(value||14,10), 10, 24); persist(); }

  function attachEvents(){
    els.language.on('change', function(){ setLanguage(this.value); render(); });
    els.theme.on('change', function(){ setTheme(this.value); render(); });
    els.bgColor.on('input change', function(){ setBackground(this.value); render(); });
    els.bgSwatches.on('click', 'button', function(){ const col = $(this).data('color'); els.bgColor.val(col); setBackground(col); render(); });
    els.padding.on('input change', function(){ setPadding(this.value); render(); });
    els.fontSize.on('change', function(){ setFontSize(this.value); render(); });

    els.toggleLineNumbers.on('click keydown', function(e){ if (e.type==='click' || e.key==='Enter' || e.key===' '){ e.preventDefault(); toggleSwitch(els.toggleLineNumbers); state.showLineNumbers = readSwitch(els.toggleLineNumbers); persist(); render(); } });
    els.toggleWrap.on('click keydown', function(e){ if (e.type==='click' || e.key==='Enter' || e.key===' '){ e.preventDefault(); toggleSwitch(els.toggleWrap); state.wrap = readSwitch(els.toggleWrap); persist(); render(); } });
    els.toggleChrome.on('click keydown', function(e){ if (e.type==='click' || e.key==='Enter' || e.key===' '){ e.preventDefault(); toggleSwitch(els.toggleChrome); state.windowChrome = readSwitch(els.toggleChrome); persist(); render(); } });
    els.toggleShadow.on('click keydown', function(e){ if (e.type==='click' || e.key==='Enter' || e.key===' '){ e.preventDefault(); toggleSwitch(els.toggleShadow); state.shadow = readSwitch(els.toggleShadow); persist(); render(); } });

    els.pixelRatio.on('change', function(){ state.pixelRatio = parseInt(this.value,10); persist(); });

    els.codeInput.on('input', window.App.Utils.debounce(function(){ state.code = String(els.codeInput.val() || ''); updateCharCount(); persist(); render(); }, 120));

    els.clearBtn.on('click', function(){ els.codeInput.val(''); state.code=''; updateCharCount(); persist(); render(); });
    els.sampleBtn.on('click', function(){ els.codeInput.val(DEFAULT_CODE); state.code=DEFAULT_CODE; updateCharCount(); persist(); render(); });

    els.exportBtn.on('click', handleExport);
    els.copyBtn.on('click', handleCopy);
  }

  function updateChrome(){
    if (state.windowChrome){ els.chromeBar.removeClass('hidden'); } else { els.chromeBar.addClass('hidden'); }
  }

  function renderPreviewBox(){
    els.exportCanvas.css({ background: state.bgColor });
    const classes = ['rounded-xl'];
    if (state.shadow){ classes.push('shadow-2xl'); } else { /* no shadow */ }
    els.exportCanvas.attr('class', classes.join(' '));

    // Padding
    els.codeWrapper.css('padding', `${state.padding}px`);

    // Font size and wrapping
    els.codeBlock.css('font-size', `${state.fontSize}px`);
    if (state.wrap){
      els.codeBlock.css({ 'white-space': 'pre-wrap', 'word-break': 'break-word' });
    } else {
      els.codeBlock.css({ 'white-space': 'pre', 'word-break': 'normal' });
    }

    updateChrome();
  }

  function highlightNow(){
    // Set code text safely, then highlight
    const code = state.code || '';
    els.codeBlock.text(code);

    // Language handling
    const lang = state.language;
    if (lang && lang !== 'auto'){
      els.codeBlock.attr('class', `hljs language-${lang}`);
      // Clear previous highlight flag so hljs re-highlights on edits
      els.codeBlock.removeAttr('data-highlighted');
    } else {
      els.codeBlock.attr('class', 'hljs');
      // Clear previous highlight flag so hljs re-highlights on edits
      els.codeBlock.removeAttr('data-highlighted');
    }

    try {
      if (window.hljs && typeof window.hljs.highlightElement === 'function'){
        window.hljs.highlightElement(els.codeBlock[0]);
      }
    } catch(e){ console.warn('Highlight failed', e); }

    // Line numbers
    try {
      // Remove previous line numbers markup if present by forcing innerHTML reset
      // Re-highlight already done above; apply line numbers optionally
      if (state.showLineNumbers){
        if (window.hljs && window.hljs.lineNumbersBlock){ window.hljs.lineNumbersBlock(els.codeBlock[0], { singleLine: true }); }
      } else {
        // If previously had ln, rebuild without it by resetting text and re-highlighting
        els.codeBlock.text(code);
        if (window.hljs && typeof window.hljs.highlightElement === 'function'){
          window.hljs.highlightElement(els.codeBlock[0]);
        }
      }
    } catch(e){ console.warn('Line numbers failed', e); }

    // Subtle fade-in
    els.exportCanvas.stop(true, true).css('opacity', 0.97).animate({ opacity: 1 }, 150);
  }

  function render(){
    renderPreviewBox();
    highlightNow();
  }

  async function ensureHtmlToImage(){
    if (window.htmlToImage && typeof window.htmlToImage.toPng === 'function') { return window.htmlToImage; }
    return new Promise(function(resolve, reject){
      var existing = document.querySelector('script[data-lib="html-to-image"],script[src*="html-to-image"]');
      function tryResolve(){
        if (window.htmlToImage && typeof window.htmlToImage.toPng === 'function'){ resolve(window.htmlToImage); return true; }
        return false;
      }
      function onLoad(){ if (!tryResolve()) { reject(new Error('html-to-image not available')); } }
      function onError(){ reject(new Error('html-to-image failed to load')); }
      if (existing){
        if (tryResolve()) return;
        existing.addEventListener('load', onLoad, { once: true });
        existing.addEventListener('error', onError, { once: true });
        // Fallback: poll briefly in case the script already loaded before listeners were attached
        var waited = 0, step = 50, max = 3000;
        var timer = setInterval(function(){
          waited += step;
          if (tryResolve()){ clearInterval(timer); }
          else if (waited >= max){ clearInterval(timer); reject(new Error('html-to-image not available')); }
        }, step);
        return;
      }
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.min.js';
      s.async = true;
      s.setAttribute('data-lib','html-to-image');
      s.onload = onLoad;
      s.onerror = onError;
      document.head.appendChild(s);
    });
  }

  async function silenceCssRulesErrors(run){
    const origErr = console.error;
    const origWarn = console.warn;
    function shouldSilence(args){
      try {
        var arr = Array.prototype.slice.call(args || []);
        for (var i = 0; i < arr.length; i++){
          var a = arr[i];
          if (typeof a === 'string' && /cssRules|CSSStyleSheet|Cannot access rules/i.test(a)) return true;
          if (a && typeof a === 'object'){
            if (a.name === 'SecurityError') return true;
            if (a.message && /cssRules|CSSStyleSheet|Cannot access rules/i.test(String(a.message))) return true;
          }
        }
      } catch(_){}
      return false;
    }
    console.error = function(){ if (!shouldSilence(arguments)) { return origErr.apply(console, arguments); } };
    console.warn = function(){ if (!shouldSilence(arguments)) { return origWarn.apply(console, arguments); } };
    try { return await run(); }
    finally { console.error = origErr; console.warn = origWarn; }
  }
  async function handleExport(){
    const node = els.exportCanvas[0];
    const ratio = window.App.Utils.clamp(parseInt(els.pixelRatio.val(),10) || 1, 1, 3);
    try {
      status('Exporting PNG...');
      els.exportBtn.prop('disabled', true).addClass('opacity-60 cursor-wait');
      const hti = await ensureHtmlToImage();
      const dataUrl = await silenceCssRulesErrors(async () => hti.toPng(node, { pixelRatio: ratio, backgroundColor: state.bgColor, quality: 1 }));
      const name = `${window.App.Utils.safeFileName('codecanvas')}-${window.App.Utils.nowStamp()}.png`;
      window.App.Utils.downloadDataUrl(dataUrl, name);
      status('PNG downloaded');
    } catch(e){
      console.error('Export failed', e);
      status('Export failed. Try a smaller scale or less content.');
    } finally {
      setTimeout(function(){ status(''); }, 2000);
      els.exportBtn.prop('disabled', false).removeClass('opacity-60 cursor-wait');
    }
  }

  async function handleCopy(){
    const node = els.exportCanvas[0];
    const ratio = window.App.Utils.clamp(parseInt(els.pixelRatio.val(),10) || 1, 1, 3);
    try {
      status('Rendering to clipboard...');
      els.copyBtn.prop('disabled', true).addClass('opacity-60 cursor-wait');
      const hti = await ensureHtmlToImage();
      const blob = await silenceCssRulesErrors(async () => hti.toBlob(node, { pixelRatio: ratio, backgroundColor: state.bgColor, quality: 1 }));
      if (navigator.clipboard && window.ClipboardItem && blob){
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        status('Copied to clipboard');
      } else {
        // Fallback: download
        const dataUrl = await silenceCssRulesErrors(async () => hti.toPng(node, { pixelRatio: ratio, backgroundColor: state.bgColor, quality: 1 }));
        const name = `${window.App.Utils.safeFileName('codecanvas')}-${window.App.Utils.nowStamp()}.png`;
        window.App.Utils.downloadDataUrl(dataUrl, name);
        status('Clipboard not available. Downloaded instead.');
      }
    } catch(e){
      console.error('Copy failed', e);
      status('Copy failed. Permissions or browser may not support it.');
    } finally {
      setTimeout(function(){ status(''); }, 2000);
      els.copyBtn.prop('disabled', false).removeClass('opacity-60 cursor-wait');
    }
  }

  // Public API
  window.App.init = function(){
    cacheElements();
    populateSelects();
    loadFromStorage();
    applyStateToControls();
    setTheme(state.theme);
    attachEvents();
  };

  window.App.render = function(){ render(); };

})(window, jQuery);
