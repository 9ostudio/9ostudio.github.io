/* shared site data: data/site.json + localStorage overlay + IndexedDB videos */
(function (global) {
  var STORAGE_KEY = "9o_site_data_v1";
  var DB_NAME = "9o_media_v1";
  var DB_STORE = "videos";
  var JSON_URL = "data/site.json";

  var cache = null;

  function defaults() {
    return {
      news: [],
      vods: [],
      repos: [],
      live: { src: "", type: "iframe" }
    };
  }

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  function clone(o) {
    return JSON.parse(JSON.stringify(o));
  }

  function normalize(data) {
    data = data || {};
    return {
      news: Array.isArray(data.news) ? data.news : [],
      vods: Array.isArray(data.vods) ? data.vods : [],
      repos: Array.isArray(data.repos) ? data.repos : [],
      live: data.live && typeof data.live === "object"
        ? { src: data.live.src || "", type: data.live.type === "video" ? "video" : "iframe" }
        : { src: "", type: "iframe" }
    };
  }

  function readLocal() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return normalize(JSON.parse(raw));
    } catch (e) {
      return null;
    }
  }

  function writeLocal(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(data)));
    cache = normalize(data);
  }

  function clearLocal() {
    localStorage.removeItem(STORAGE_KEY);
    cache = null;
  }

  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function idbPut(id, blob, meta) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).put({
          id: id,
          blob: blob,
          name: (meta && meta.name) || "",
          type: (meta && meta.type) || blob.type || "application/octet-stream",
          size: blob.size || 0,
          updated: Date.now()
        });
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function idbGet(id) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, "readonly");
        var req = tx.objectStore(DB_STORE).get(id);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function idbDelete(id) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, "readwrite");
        tx.objectStore(DB_STORE).delete(id);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function resolveVodSrc(item) {
    if (!item) return Promise.resolve(null);
    if (item.fileId) {
      return idbGet(item.fileId).then(function (row) {
        if (row && row.blob) return URL.createObjectURL(row.blob);
        return item.src || null;
      });
    }
    return Promise.resolve(item.src || null);
  }

  function load() {
    if (cache) return Promise.resolve(clone(cache));

    var local = readLocal();
    if (local) {
      cache = local;
      return Promise.resolve(clone(cache));
    }

    return fetch(JSON_URL, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (json) {
        cache = normalize(json);
        return clone(cache);
      })
      .catch(function () {
        cache = defaults();
        return clone(cache);
      });
  }

  function getSync() {
    return clone(cache || readLocal() || defaults());
  }

  function save(data) {
    writeLocal(data);
    return clone(cache);
  }

  function sourceLabel() {
    if (readLocal()) return "localStorage（未公開の下書きあり）";
    return "data/site.json";
  }

  global.SiteData = {
    STORAGE_KEY: STORAGE_KEY,
    uid: uid,
    load: load,
    get: getSync,
    save: save,
    clearLocal: clearLocal,
    normalize: normalize,
    sourceLabel: sourceLabel,
    resolveVodSrc: resolveVodSrc,
    media: {
      put: idbPut,
      get: idbGet,
      remove: idbDelete
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
