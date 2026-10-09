// Comportements communs à toutes les pages :
// thème clair/sombre, feux à rythme animés, signaux sonores.
(function () {
  'use strict';

  // ------------------------------------------------------------ thème
  var btn = document.querySelector('.theme');
  if (btn) {
    btn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      if (!cur) cur = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('pe-theme', next);
      } catch (e) {}
    });
  }


  // ------------------------------------------------------- menu (téléphone)
  var menu = document.querySelector('.menu-btn');
  if (menu) {
    menu.addEventListener('click', function () {
      var open = document.documentElement.classList.toggle('menu-open');
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!document.documentElement.classList.contains('menu-open')) return;
      if (e.target.closest('.menu-btn') || e.target.closest('.mainnav') || e.target.closest('.acct')) return;
      document.documentElement.classList.remove('menu-open');
      menu.setAttribute('aria-expanded', 'false');
    });
  }

  // ------------------------------------- application installable, hors ligne
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    var root = document.body.getAttribute('data-root') || '';
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(root + 'sw.js').catch(function () {});
    });
  }
  var installBox = document.getElementById('install');
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    if (!installBox) return;
    installBox.hidden = false;
    installBox.querySelector('button').onclick = function () {
      e.prompt();
      installBox.hidden = true;
    };
  });

  // ------------------------------------------------------------ feux
  // Rythmes : F, Fl, Fl(2), Fl(2+1), LFl, Oc, Oc(2), Iso, Q, Q(3), Q(6)+LFl,
  // VQ, VQ(3), VQ(6)+LFl, Mo(A), Al (couleurs alternées : c="W,R")
  var COL = { W: '#fff6d8', R: '#ff4b3a', G: '#3fe08a', Y: '#ffd338', Bu: '#5aa8ff' };

  function seq(r, period, colors) {
    var s = []; // [allumé?, durée en s, indice couleur]
    var m;
    var on = function (d, k) { s.push([1, d, k || 0]); };
    var off = function (d) { s.push([0, d, 0]); };
    r = r.replace(/\s/g, '');
    if (r === 'F') return [[1, 1, 0]];
    if ((m = r.match(/^(Q|VQ)(?:\((\d+)\))?(\+LFl)?$/))) {
      var fast = m[1] === 'VQ';
      var a = fast ? 0.17 : 0.3;
      var b = fast ? 0.33 : 0.7;
      var n = m[2] ? +m[2] : 0;
      if (!n) return [[1, a, 0], [0, b, 0]];
      for (var i = 0; i < n; i++) { on(a); off(b); }
      if (m[3]) { on(2); off(0.5); }
    } else if ((m = r.match(/^LFl(?:\((\d+)\))?$/))) {
      var k = m[1] ? +m[1] : 1;
      for (var j = 0; j < k; j++) { on(2); off(1.2); }
    } else if ((m = r.match(/^Fl(?:\(([\d+]+)\))?$/))) {
      var groups = (m[1] || '1').split('+').map(Number);
      groups.forEach(function (g, gi) {
        for (var i = 0; i < g; i++) { on(0.5); off(i < g - 1 ? 0.8 : 1.6); }
      });
    } else if ((m = r.match(/^Oc(?:\(([\d+]+)\))?$/))) {
      var gs = (m[1] || '1').split('+').map(Number);
      gs.forEach(function (g) {
        for (var i = 0; i < g; i++) { off(0.8); on(i < g - 1 ? 0.9 : 1.6); }
      });
      // le reste de la période est allumé
      var used = s.reduce(function (t, x) { return t + x[1]; }, 0);
      if (period > used) s.push([1, period - used, 0]);
      return s;
    } else if (r === 'Iso') {
      var hp = (period || 4) / 2;
      return [[1, hp, 0], [0, hp, 0]];
    } else if ((m = r.match(/^Mo\(([A-Z])\)$/))) {
      var MORSE = { A: '.-', U: '..-', D: '-..', R: '.-.', N: '-.', K: '-.-' };
      (MORSE[m[1]] || '.').split('').forEach(function (c) { on(c === '.' ? 0.5 : 1.5); off(0.5); });
    } else if (r === 'Al') {
      var hp2 = (period || 4) / colors.length;
      colors.forEach(function (c, i) { s.push([1, hp2 * 0.7, i]); s.push([0, hp2 * 0.3, 0]); });
      return s;
    } else {
      on(0.5); off(1);
    }
    var tot = s.reduce(function (t, x) { return t + x[1]; }, 0);
    if (period && period > tot) s.push([0, period - tot, 0]);
    return s;
  }

  function animate(el) {
    var r = el.getAttribute('data-r');
    var colors = (el.getAttribute('data-c') || 'W').split(',');
    var p = parseFloat(el.getAttribute('data-p')) || 0;
    var steps = seq(r, p, colors);
    var total = steps.reduce(function (t, x) { return t + x[1]; }, 0);
    var dot = el.querySelector('.lamp i');
    var t0 = performance.now();
    var last = -1;
    function frame(now) {
      var t = ((now - t0) / 1000) % total;
      var acc = 0;
      for (var i = 0; i < steps.length; i++) {
        acc += steps[i][1];
        if (t < acc) break;
      }
      if (i !== last) {
        last = i;
        var st = steps[Math.min(i, steps.length - 1)];
        dot.style.setProperty('--c', COL[colors[st[2]]] || COL.W);
        dot.classList.toggle('on', !!st[0]);
      }
      el._raf = requestAnimationFrame(frame);
    }
    el._raf = requestAnimationFrame(frame);
  }

  window.PE = window.PE || {};
  window.PE.animateFeux = function (root) {
    (root || document).querySelectorAll('.feu').forEach(function (el) {
      if (el._raf) cancelAnimationFrame(el._raf);
      animate(el);
    });
  };
  window.PE.animateFeux();

  // ------------------------------------------------------------ sons
  var ctx = null;
  function blast(t, d) {
    var o1 = ctx.createOscillator();
    var o2 = ctx.createOscillator();
    var g = ctx.createGain();
    var f = ctx.createBiquadFilter();
    o1.type = 'sawtooth';
    o2.type = 'sawtooth';
    o1.frequency.value = 165;
    o2.frequency.value = 248;
    f.type = 'lowpass';
    f.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.06);
    g.gain.setValueAtTime(0.18, t + d - 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o1.connect(f);
    o2.connect(f);
    f.connect(g);
    g.connect(ctx.destination);
    o1.start(t);
    o2.start(t);
    o1.stop(t + d + 0.05);
    o2.stop(t + d + 0.05);
  }
  function ring(t, d, freq) {
    // cloche ou gong : coups rapides pendant d secondes
    for (var x = 0; x < d; x += freq > 500 ? 0.22 : 0.6) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.25, t + x);
      g.gain.exponentialRampToValueAtTime(0.0001, t + x + (freq > 500 ? 0.4 : 1.2));
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t + x);
      o.stop(t + x + 1.3);
    }
  }
  function play(pattern, done) {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    var t = ctx.currentTime + 0.05;
    pattern.split('').forEach(function (c) {
      if (c === '.') { blast(t, 1); t += 2; }
      else if (c === '-') { blast(t, 4.5); t += 5.5; }
      else if (c === 'b') { ring(t, 5, 880); t += 5.5; }
      else if (c === 'g') { ring(t, 5, 160); t += 5.5; }
      else t += 1;
    });
    setTimeout(done, (t - ctx.currentTime) * 1000);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.son button');
    if (!b || b.classList.contains('playing')) return;
    b.classList.add('playing');
    play(b.parentNode.getAttribute('data-s'), function () { b.classList.remove('playing'); });
  });
})();
