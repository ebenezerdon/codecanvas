(function(window){
  'use strict';
  window.App = window.App || {};

  // Simple namespaced storage and helpers to avoid collisions with web APIs
  const STORAGE_KEY = 'codecanvas-state';

  function safeParse(json, fallback){
    try { return JSON.parse(json); } catch(e){ return fallback; }
  }

  function saveState(state){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch(e){ console.warn('LocalStorage save failed', e); }
  }

  function loadState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? safeParse(raw, {}) : {};
    } catch(e){ console.warn('LocalStorage load failed', e); return {}; }
  }

  function clearState(){
    try { localStorage.removeItem(STORAGE_KEY); } catch(e){ /* noop */ }
  }

  function debounce(fn, wait){
    let t; return function(){
      const ctx = this, args = arguments; clearTimeout(t);
      t = setTimeout(function(){ fn.apply(ctx, args); }, wait);
    };
  }

  function throttle(fn, limit){
    let inThrottle = false, lastArgs, lastContext;
    return function(){
      if (!inThrottle){
        fn.apply(this, arguments); inThrottle = true;
        setTimeout(function(){ inThrottle = false; if (lastArgs){ fn.apply(lastContext, lastArgs); lastArgs = lastContext = null; } }, limit);
      } else {
        lastArgs = arguments; lastContext = this;
      }
    };
  }

  function clamp(value, min, max){ return Math.min(Math.max(value, min), max); }

  function nowStamp(){
    const d = new Date();
    const pad = (n)=>String(n).padStart(2,'0');
    return d.getFullYear().toString() + pad(d.getMonth()+1) + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
  }

  function safeFileName(base){
    return String(base || 'codecanvas').replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g,'').toLowerCase();
  }

  function downloadDataUrl(dataUrl, fileName){
    const a = document.createElement('a');
    a.href = dataUrl; a.download = fileName || 'image.png';
    document.body.appendChild(a); a.click(); a.remove();
  }

  function hexToRgb(hex){
    if (!hex) return { r: 0, g: 0, b: 0 };
    const c = hex.replace('#','');
    const bigint = parseInt(c.length === 3 ? c.split('').map(x=>x+x).join('') : c, 16);
    return { r: (bigint>>16)&255, g: (bigint>>8)&255, b: bigint&255 };
  }

  window.App.Storage = { saveState, loadState, clearState };
  window.App.Utils = { debounce, throttle, clamp, nowStamp, safeFileName, downloadDataUrl, hexToRgb };
})(window);
