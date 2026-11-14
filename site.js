(function () {
  const STR = {
    ja: {
      feeds: 'つぶやき', works: '作品', art: 'アート', video: '動画', music: '音楽', blog: 'ブログ', archive: '過去ログ',
      soon: '準備中', back: '戻る', title: 'タイトル', system: '機種', version: 'Ver.',
      prev: '前へ', next: '次へ',
      play: 'を再生', videoSoon: '動画 準備中', viewer: '表示', links: 'リンク', language: '言語'
    },
    en: {
      feeds: 'Feed', works: 'Works', art: 'Art', video: 'Video', music: 'Music', blog: 'Blog', archive: 'Archive',
      soon: 'Coming soon', back: 'Back', title: 'Title', system: 'System', version: 'Version',
      prev: 'Previous',
      next: 'Next', play: 'Play ', videoSoon: 'Video coming soon', viewer: 'Viewer', links: 'Links', language: 'Language'
    }
  };
  let lang = (() => {
    const asked = new URLSearchParams(location.search).get('lang');
    if (asked === 'en' || asked === 'ja') return asked;
    try { return localStorage.getItem('lang') === 'en' ? 'en' : 'ja'; } catch (e) { return 'ja'; }
  })();
  const t = key => STR[lang][key] ?? STR.ja[key] ?? key;
  const pick = (item, field) => (lang === 'en' && item[field + '_en']) || item[field] || '';
  const el = (tag, value, cls) => {
    const e = document.createElement(tag);
    if (value) e.textContent = value;
    if (cls) e.className = cls;
    return e;
  };

  function translate(root) {
    document.documentElement.lang = lang;
    for (const e of root.querySelectorAll('[data-t]')) e.textContent = t(e.dataset.t);
    for (const e of root.querySelectorAll('[data-ja]')) e.textContent = lang === 'en' ? e.dataset.en || e.dataset.ja : e.dataset.ja;
    for (const e of root.querySelectorAll('[data-t-label]')) e.setAttribute('aria-label', t(e.dataset.tLabel));
    const articles = root.querySelectorAll('article[lang]');
    if (articles.length > 1) {
      const wanted = [...articles].some(a => a.lang === lang) ? lang : 'ja';
      for (const a of articles) a.hidden = a.lang !== wanted;
    }
  }

  let redrawAll = null, switches = [];
  function sync() {
    let stored;
    try { stored = localStorage.getItem('lang') === 'en' ? 'en' : 'ja'; } catch (e) { return; }
    if (stored === lang) return;
    lang = stored;
    for (const b of switches) b.setAttribute('aria-pressed', b.lang === lang);
    translate(document);
    if (redrawAll) redrawAll();
  }
  addEventListener('pageshow', sync);
  addEventListener('storage', sync);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });

  function switcher(redraw) {
    redrawAll = redraw;
    const nav = el('nav', '', 'lang');
    nav.setAttribute('aria-label', t('language'));
    const buttons = [['ja', '日本語'], ['en', 'English']].map(([code, label]) => {
      const b = el('button', label);
      b.type = 'button';
      b.lang = code;
      b.addEventListener('click', () => {
        if (lang === code) return;
        lang = code;
        try { localStorage.setItem('lang', code); } catch (e) {}
        for (const other of buttons) other.setAttribute('aria-pressed', other.lang === lang);
        translate(document);
        redraw();
      });
      b.setAttribute('aria-pressed', code === lang);
      nav.append(b);
      return b;
    });
    switches = buttons;
    const bar = document.querySelector('.bar-top');
    if (bar) {
      nav.classList.add('under');
      bar.after(nav);
    } else document.body.append(nav);
  }

  let viewer, shown;
  function view(item, kind, prefix) {
    if (!viewer) {
      viewer = el('dialog', '', 'viewer');
      const figure = el('figure');
      shown = el('div', '', 'shown');
      const caption = el('figcaption');
      caption.append(el('span', '', 'cap'), el('time'));
      figure.append(shown, caption);
      viewer.append(figure);
      document.body.append(viewer);
      viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
      viewer.addEventListener('close', () => shown.replaceChildren());
    }
    viewer.setAttribute('aria-label', t('viewer'));
    viewer.querySelector('.cap').textContent = pick(item, 'title');
    viewer.querySelector('figcaption time').textContent = item.date || '';
    viewer.querySelector('figcaption').hidden = kind === 'blog';
    if (kind === 'blog') {
      const post = el('div', '', 'post');
      post.append(el('h2', pick(item, 'title')), el('time', item.date));
      shown.replaceChildren(post);
      fetch(prefix + item.link).then(r => r.ok ? r.text() : '').then(page => {
        const doc = new DOMParser().parseFromString(page, 'text/html');
        const article = doc.querySelector('article[lang="' + lang + '"]') || doc.querySelector('article');
        if (!article) return;
        for (const part of article.children) if (part.tagName !== 'TIME') post.append(document.importNode(part, true));
      });
    } else if (kind === 'art') {
      const img = el('img');
      img.alt = pick(item, 'title');
      img.addEventListener('load', () => {
        const fit = Math.min(innerWidth * 0.9 / img.naturalWidth, innerHeight * 0.8 / img.naturalHeight);
        img.style.width = Math.round(img.naturalWidth * (fit >= 1 ? Math.floor(fit) : fit)) + 'px';
      });
      img.src = prefix + item.src;
      shown.replaceChildren(img);
    } else if (item.youtube) {
      const frame = el('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(item.youtube) + '?autoplay=1';
      frame.allow = 'autoplay; fullscreen; picture-in-picture';
      frame.allowFullscreen = true;
      shown.replaceChildren(frame);
    } else if (item.src) {
      const video = el('video');
      video.src = prefix + item.src;
      video.controls = true;
      video.autoplay = true;
      shown.replaceChildren(video);
    } else shown.replaceChildren(el('div', t('videoSoon'), 'wait'));
    viewer.showModal();
  }

  const soon = box => box.replaceChildren(el('p', t('soon'), 'soon'));

  function feed(box, items, limit, kind, prefix) {
    if (!items || !items.length) return soon(box);
    const list = el('ul', '', 'feed');
    for (const item of items.slice(0, limit)) {
      const li = el('li');
      const label = pick(item, kind === 'blog' ? 'title' : 'text');
      const what = el(item.link ? 'a' : 'span', label, 'text');
      if (item.link) {
        what.href = prefix + item.link;
        if (kind === 'blog') what.addEventListener('click', event => { event.preventDefault(); view(item, 'blog', prefix); });
      }
      li.append(el('time', item.date), what);
      list.append(li);
    }
    box.replaceChildren(list);
  }

  function works(box, items, limit, prefix) {
    if (!items || !items.length) return soon(box);
    const table = el('table', '', 'works');
    const head = table.insertRow();
    for (const key of ['title', 'system', 'version']) head.append(el('th', t(key)));
    for (const w of items.slice(0, limit)) {
      const row = table.insertRow();
      const title = row.insertCell();
      title.className = 'title';
      if (w.link) {
        const a = el('a', pick(w, 'title'));
        a.href = prefix + w.link;
        title.append(a);
      } else title.textContent = pick(w, 'title');
      row.insertCell().textContent = w.console || '';
      row.insertCell().textContent = w.version || '';
    }
    box.replaceChildren(table);
  }

  function thumb(item, kind, prefix) {
    const frame = el('span', '', 'frame');
    const src = item.thumb ? prefix + item.thumb : kind === 'art' ? prefix + item.src
      : item.youtube ? 'https://i.ytimg.com/vi/' + item.youtube + '/hqdefault.jpg' : '';
    if (src) {
      const img = el('img');
      img.src = src;
      img.alt = pick(item, 'title');
      img.loading = 'lazy';
      frame.append(img);
    } else frame.append(el('span', '[ > ]', 'play-mark'));
    return frame;
  }

  function tile(item, kind, prefix, cls) {
    const a = el('a', '', cls);
    a.href = item.src ? prefix + item.src : item.youtube ? 'https://www.youtube.com/watch?v=' + item.youtube : '#';
    a.append(thumb(item, kind, prefix), el('span', pick(item, 'title'), 'cap'), el('time', item.date));
    a.addEventListener('click', event => { event.preventDefault(); view(item, kind, prefix); });
    return a;
  }

  function strip(box, items, kind, limit, prefix) {
    if (!items || !items.length) return soon(box);
    const row = el('div', '', kind === 'video' ? 'strip wide' : 'strip');
    for (const item of items.slice(0, limit)) row.append(tile(item, kind, prefix, 'slide'));
    const nav = el('div', '', 'slides');
    const prev = el('button', '«'), next = el('button', '»'), where = el('output');
    prev.type = next.type = 'button';
    prev.setAttribute('aria-label', t('prev'));
    next.setAttribute('aria-label', t('next'));
    nav.append(prev, where, next);
    const step = () => row.firstChild.getBoundingClientRect().width + 12;
    const update = () => {
      const count = row.children.length, first = Math.round(row.scrollLeft / step());
      const seen = Math.max(1, Math.floor((row.clientWidth + 12) / step()));
      where.textContent = (first + 1) + '-' + Math.min(count, first + seen) + ' / ' + count;
      prev.disabled = row.scrollLeft <= 1;
      next.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 1;
    };
    prev.addEventListener('click', () => row.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => row.scrollBy({ left: step(), behavior: 'smooth' }));
    row.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(row);
    box.replaceChildren(row, nav);
    update();
  }

  function grid(box, items, kind, prefix) {
    if (!items || !items.length) return soon(box);
    const all = el('div', '', kind === 'video' ? 'grid wide' : 'grid');
    for (const item of items) all.append(tile(item, kind, prefix, 'cell'));
    box.replaceChildren(all);
  }

  const audio = new Audio();
  let current = null;
  const clock = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '-:--';
  const cells = 14;
  function draw(track, part) {
    const full = Math.round(part * cells);
    track.bar.replaceChildren('[', el('b', '='.repeat(full)), '-'.repeat(cells - full), ']');
  }
  function rest(track) {
    track.li.classList.remove('on');
    track.play.textContent = '>';
    draw(track, 0);
    track.time.textContent = clock(track.length());
  }
  function toggle(track) {
    if (current === track) {
      if (audio.paused) audio.play(); else audio.pause();
      return;
    }
    if (current) rest(current);
    current = track;
    track.li.classList.add('on');
    audio.src = track.src;
    audio.play();
  }
  audio.addEventListener('play', () => { if (current) current.play.textContent = '||'; });
  audio.addEventListener('pause', () => { if (current) current.play.textContent = '>'; });
  audio.addEventListener('timeupdate', () => {
    if (!current) return;
    draw(current, audio.duration ? audio.currentTime / audio.duration : 0);
    current.time.textContent = clock(audio.currentTime);
  });
  audio.addEventListener('ended', () => {
    if (current) rest(current);
    current = null;
  });

  function music(box, items, limit, prefix) {
    if (!items || !items.length) return soon(box);
    if (current) { audio.pause(); current = null; }
    const list = el('ul', '', 'tracks');
    for (const m of items.slice(0, limit)) {
      const li = el('li', '', 'track');
      const play = el('button', '>', 'play');
      play.type = 'button';
      play.setAttribute('aria-label', lang === 'en' ? t('play') + pick(m, 'title') : pick(m, 'title') + t('play'));
      const bar = el('span', '', 'bar');
      const time = el('span', '-:--', 'time');
      li.append(play, el('span', pick(m, 'title'), 'name'), bar, time);
      list.append(li);
      const probe = new Audio();
      probe.preload = 'metadata';
      probe.src = prefix + m.src;
      const track = { li, play, bar, time, src: prefix + m.src, length: () => probe.duration };
      probe.addEventListener('loadedmetadata', () => { if (current !== track) time.textContent = clock(probe.duration); });
      play.addEventListener('click', () => toggle(track));
      bar.addEventListener('click', event => {
        if (current !== track) { toggle(track); return; }
        const r = bar.getBoundingClientRect();
        audio.currentTime = Math.max(0, Math.min(1, (event.clientX - r.left) / r.width)) * (audio.duration || 0);
      });
      draw(track, 0);
    }
    box.replaceChildren(list);
  }

  function back(link, fallback, from) {
    const referrer = from === undefined ? document.referrer : from;
    link.href = fallback;
    link.addEventListener('click', event => {
      if (referrer && new URL(referrer).origin === location.origin && history.length > 1) {
        event.preventDefault();
        history.back();
      }
    });
  }

  window.Site = {
    lang: () => lang, t, translate, switcher, view, feed, works, strip, grid, music, back,
    data: prefix => fetch(prefix + 'data.json').then(r => r.ok ? r.json() : null).catch(() => null)
  };
  translate(document);
})();
