/* client-side BBS store: seed data/forum.json + localStorage writes */
(function (global) {
  var KEY = "9o_forum_v1";
  var NAME_KEY = "9o_forum_name";
  var cache = null;

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function now() {
    return Date.now();
  }

  function defaults() {
    return { boards: [], threads: [], version: 1 };
  }

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function readLocal() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || typeof d !== "object") return null;
      d.boards = Array.isArray(d.boards) ? d.boards : [];
      d.threads = Array.isArray(d.threads) ? d.threads : [];
      return d;
    } catch (e) {
      return null;
    }
  }

  function writeLocal(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
    cache = data;
  }

  function mergeSeed(seed, local) {
    seed = seed || defaults();
    local = local || defaults();

    var boardsById = {};
    (seed.boards || []).forEach(function (b) { boardsById[b.id] = b; });
    (local.boards || []).forEach(function (b) {
      if (b && b.id) boardsById[b.id] = b;
    });

    var threadsById = {};
    (seed.threads || []).forEach(function (t) {
      threadsById[t.id] = normalizeThread(t);
    });
    (local.threads || []).forEach(function (t) {
      if (!t || !t.id) return;
      // local wins for same id (user edits), else add
      threadsById[t.id] = normalizeThread(t);
    });

    return {
      version: 1,
      boards: Object.keys(boardsById).map(function (k) { return boardsById[k]; }),
      threads: Object.keys(threadsById).map(function (k) { return threadsById[k]; })
    };
  }

  function normalizeThread(t) {
    t = t || {};
    return {
      id: t.id || uid("t"),
      boardId: t.boardId || "general",
      title: t.title || "(no title)",
      sticky: !!t.sticky,
      closed: !!t.closed,
      createdAt: t.createdAt || 0,
      bumpedAt: t.bumpedAt || t.createdAt || 0,
      posts: Array.isArray(t.posts) ? t.posts.map(normalizePost) : []
    };
  }

  function normalizePost(p) {
    p = p || {};
    return {
      id: p.id || uid("p"),
      name: (p.name || "").trim() || "名無しさん",
      body: p.body || "",
      createdAt: p.createdAt || 0,
      local: !!p.local
    };
  }

  function load() {
    if (cache) return Promise.resolve(clone(cache));
    var local = readLocal();

    return fetch("data/forum.json", { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (seed) {
        cache = mergeSeed(seed, local);
        // if first visit, persist merge so sticky exists even offline later
        if (!local) writeLocal(cache);
        return clone(cache);
      })
      .catch(function () {
        cache = local || defaults();
        return clone(cache);
      });
  }

  function get() {
    return clone(cache || readLocal() || defaults());
  }

  function save(data) {
    writeLocal(data);
    return clone(cache);
  }

  function listBoards() {
    return get().boards.slice();
  }

  function getBoard(id) {
    return listBoards().find(function (b) { return b.id === id; }) || null;
  }

  function listThreads(boardId) {
    var threads = get().threads.filter(function (t) {
      return !boardId || t.boardId === boardId;
    });
    threads.sort(function (a, b) {
      if (!!a.sticky !== !!b.sticky) return a.sticky ? -1 : 1;
      return (b.bumpedAt || 0) - (a.bumpedAt || 0);
    });
    return threads;
  }

  function getThread(id) {
    return get().threads.find(function (t) { return t.id === id; }) || null;
  }

  function createThread(boardId, title, name, body) {
    var data = get();
    var ts = now();
    var thread = {
      id: uid("t"),
      boardId: boardId,
      title: (title || "").trim() || "(no title)",
      sticky: false,
      closed: false,
      createdAt: ts,
      bumpedAt: ts,
      posts: [
        {
          id: uid("p"),
          name: (name || "").trim() || "名無しさん",
          body: (body || "").trim(),
          createdAt: ts,
          local: true
        }
      ]
    };
    if (!thread.posts[0].body) throw new Error("empty body");
    data.threads.push(thread);
    save(data);
    return clone(thread);
  }

  function reply(threadId, name, body) {
    var data = get();
    var t = data.threads.find(function (x) { return x.id === threadId; });
    if (!t) throw new Error("thread not found");
    if (t.closed) throw new Error("thread closed");
    var text = (body || "").trim();
    if (!text) throw new Error("empty body");
    var ts = now();
    var post = {
      id: uid("p"),
      name: (name || "").trim() || "名無しさん",
      body: text,
      createdAt: ts,
      local: true
    };
    t.posts.push(post);
    t.bumpedAt = ts;
    save(data);
    return clone(post);
  }

  function deleteThread(threadId) {
    var data = get();
    data.threads = data.threads.filter(function (t) { return t.id !== threadId; });
    save(data);
  }

  function deletePost(threadId, postId) {
    var data = get();
    var t = data.threads.find(function (x) { return x.id === threadId; });
    if (!t) return;
    // keep at least one post or delete thread
    t.posts = t.posts.filter(function (p) { return p.id !== postId; });
    if (!t.posts.length) {
      data.threads = data.threads.filter(function (x) { return x.id !== threadId; });
    } else {
      t.bumpedAt = t.posts[t.posts.length - 1].createdAt;
    }
    save(data);
  }

  function clearAll() {
    localStorage.removeItem(KEY);
    cache = null;
  }

  function getName() {
    try { return localStorage.getItem(NAME_KEY) || ""; } catch (e) { return ""; }
  }

  function setName(name) {
    try { localStorage.setItem(NAME_KEY, name || ""); } catch (e) {}
  }

  function exportJson() {
    return JSON.stringify(get(), null, 2) + "\n";
  }

  function importJson(raw) {
    var d = JSON.parse(raw);
    var data = {
      version: 1,
      boards: Array.isArray(d.boards) ? d.boards : listBoards(),
      threads: Array.isArray(d.threads) ? d.threads.map(normalizeThread) : []
    };
    save(data);
    return clone(cache);
  }

  global.ForumStore = {
    load: load,
    get: get,
    listBoards: listBoards,
    getBoard: getBoard,
    listThreads: listThreads,
    getThread: getThread,
    createThread: createThread,
    reply: reply,
    deleteThread: deleteThread,
    deletePost: deletePost,
    clearAll: clearAll,
    getName: getName,
    setName: setName,
    exportJson: exportJson,
    importJson: importJson,
    uid: uid
  };
})(typeof window !== "undefined" ? window : globalThis);
