/* JP / EN switcher — localStorage 9o_lang = "ja" | "en" */
(function (global) {
  var KEY = "9o_lang";
  var dict = {
    /* nav */
    "nav.top": { ja: "トップ", en: "Top" },
    "nav.news": { ja: "ニュース", en: "News" },
    "nav.work": { ja: "作品", en: "Works" },
    "nav.vod": { ja: "VOD", en: "VOD" },
    "nav.live": { ja: "LIVE", en: "LIVE" },
    "nav.git": { ja: "Git", en: "Git" },
    "nav.forum": { ja: "掲示板", en: "Forum" },
    "nav.admin": { ja: "admin", en: "admin" },

    /* index */
    "index.desc": {
      ja: "ASM / C · ひとり開発 · 更新は気まぐれです",
      en: "ASM / C · solo dev · updates when I feel like it"
    },
    "index.profile": { ja: "プロフィール", en: "Profile" },
    "index.name": { ja: "なまえ", en: "Name" },
    "index.job": { ja: "しごと", en: "Work" },
    "index.job.val": {
      ja: "ASM / C プログラマー　／　インディーゲーム",
      en: "ASM / C programmer / indie games"
    },
    "index.blurb": { ja: "ひとこと", en: "Note" },
    "index.blurb.val": {
      ja: "ひとりでちまちま作っています。連絡は各SNSまで。",
      en: "Building things alone, bit by bit. Contact me on socials."
    },
    "index.likes": { ja: "すき", en: "Likes" },
    "index.likes.val": {
      ja: "低レベル、古いハード、夜更かし",
      en: "Low-level, old hardware, late nights"
    },
    "index.links": { ja: "リンク集", en: "Links" },
    "index.social": { ja: "【 ソーシャル 】", en: "[ Social ]" },
    "index.support": { ja: "【 応援する 】", en: "[ Support ]" },
    "index.games": { ja: "【 ゲーム 】", en: "[ Games ]" },
    "index.x": { ja: "… つぶやき", en: "… posts" },
    "index.gh": { ja: "… ソースとか", en: "… source etc." },
    "index.dc": { ja: "… 雑談所", en: "… chat" },
    "index.footer1": {
      ja: "◆ リンクフリーです ◆ 相互リンク歓迎 ◆",
      en: "◆ Free to link ◆ Mutual links welcome ◆"
    },
    "index.footer2": {
      ja: "このページはひとりでコツコツ更新しています",
      en: "Updated alone, little by little"
    },

    /* news */
    "news.title": { ja: "9ostudio ニュース", en: "9ostudio News" },
    "news.desc": { ja: "更新は気まぐれです", en: "Updates when I feel like it" },
    "news.sect": { ja: "最新ニュース", en: "Latest news" },
    "news.note": { ja: "※ admin から追加できます。", en: "※ Add entries from admin." },
    "news.empty": { ja: "まだニュースがありません", en: "No news yet" },
    "news.loading": { ja: "読み込み中…", en: "Loading…" },

    /* work */
    "work.title": { ja: "9ostudio 作品", en: "9ostudio Works" },
    "work.desc": { ja: "art / music / game", en: "art / music / game" },
    "work.cat": { ja: "カテゴリ：", en: "Category:" },
    "work.empty": { ja: "まだありません。準備中…", en: "Nothing yet. Coming soon…" },

    /* vod */
    "vod.title": { ja: "9ostudio VOD", en: "9ostudio VOD" },
    "vod.desc": { ja: "録画アーカイブ", en: "Video archive" },
    "vod.sect": { ja: "一覧", en: "List" },
    "vod.note": {
      ja: "※ 動画を追加したらここに並びます。",
      en: "※ Videos appear here when added."
    },
    "vod.empty": {
      ja: "まだ VOD はありません。admin から追加できます。",
      en: "No VODs yet. Add them from admin."
    },
    "vod.placeholder": {
      ja: "下の一覧から選んでください\n（まだ動画がありません）",
      en: "Pick one from the list below\n(no videos yet)"
    },

    /* live */
    "live.title": { ja: "9ostudio LIVE", en: "9ostudio LIVE" },
    "live.desc": { ja: "配信 + チャット", en: "Stream + chat" },
    "live.chat": { ja: "チャット", en: "Chat" },
    "live.offline": {
      ja: "いまは配信していません\n（配信URLを設定するとここに表示されます）",
      en: "Offline right now\n(set a stream URL to show it here)"
    },
    "live.note": {
      ja: "※ このチャットはあなたのブラウザ内だけです（他の人には見えません）。本番用は後から接続できます。",
      en: "※ Chat is local to your browser only (not shared). Real multiplayer can be wired later."
    },
    "live.name": { ja: "名前", en: "Name" },
    "live.msg": { ja: "メッセージ…", en: "Message…" },
    "live.send": { ja: "送信", en: "Send" },
    "live.joined": { ja: "— チャットに入りました —", en: "— Joined chat —" },
    "live.offsys": { ja: "（配信オフライン）", en: "(stream offline)" },
    "live.anon": { ja: "名無しさん", en: "Anonymous" },

    /* git */
    "git.title": { ja: "9ostudio Git", en: "9ostudio Git" },
    "git.desc": {
      ja: "pure git · isomorphic-git（clone / branch / ls / cat）",
      en: "pure git · isomorphic-git (clone / branch / ls / cat)"
    },
    "git.files": { ja: "ファイル一覧", en: "Files" },
    "git.file": { ja: "ファイル", en: "File" },
    "git.log": { ja: "git log", en: "git log" },
    "git.note": {
      ja: "※ GitHub REST API は使いません。ブラウザ上の isomorphic-git で clone / fetch / checkout / log します。GitHub など CORS のないホストへは git 用 CORS プロキシ経由になります。",
      en: "※ No GitHub REST API. Uses isomorphic-git in the browser for clone / fetch / checkout / log. Hosts without CORS (e.g. GitHub) go through a git CORS proxy."
    },
    "git.back": { ja: "← 戻る", en: "← Back" },
    "git.logclose": { ja: "← ファイル一覧へ", en: "← Back to files" },
    "git.clone": { ja: "clone", en: "clone" },
    "git.fetch": { ja: "fetch", en: "fetch" },
    "git.checkout": { ja: "checkout", en: "checkout" },
    "git.refresh": { ja: "更新", en: "Refresh" },

    /* common footer */
    "footer.solo": {
      ja: "このページはひとりでコツコツ更新しています",
      en: "Updated alone, little by little"
    },

    /* forum */
    "forum.title": { ja: "9ostudio 掲示板", en: "9ostudio Forum" },
    "forum.desc": {
      ja: "簡易 BBS · 書き込みはこのブラウザに保存",
      en: "Lightweight BBS · posts saved in this browser"
    },
    "forum.note": {
      ja: "※ この掲示板は静的サイト用です。投稿はあなたのブラウザ（localStorage）に保存され、他の訪問者とは共有されません。",
      en: "※ This board is for a static site. Posts are stored in your browser (localStorage) and are not shared with other visitors."
    },
    "forum.boards": { ja: "板一覧", en: "Boards" },
    "forum.board": { ja: "板", en: "Board" },
    "forum.threads": { ja: "スレ", en: "Threads" },
    "forum.noboards": { ja: "板がありません", en: "No boards" },
    "forum.hint.boards": { ja: "板を選んでください", en: "Pick a board" },
    "forum.export": { ja: "データ出力", en: "Export data" },
    "forum.import": { ja: "データ読込", en: "Import data" },
    "forum.clear": { ja: "全削除", en: "Clear all" },
    "forum.exported": { ja: "バックアップをダウンロードしました", en: "Backup downloaded" },
    "forum.imported": { ja: "読み込みました", en: "Imported" },
    "forum.importfail": { ja: "読込失敗", en: "Import failed" },
    "forum.clearconfirm": {
      ja: "掲示板データを全部消します。よろしいですか？",
      en: "Delete all forum data on this browser?"
    },
    "forum.cleared": { ja: "削除しました", en: "Cleared" },
    "forum.boardmissing": { ja: "板が見つかりません", en: "Board not found" },
    "forum.backboards": { ja: "« 板一覧", en: "« Boards" },
    "forum.newthread": { ja: "新規スレッド", en: "New thread" },
    "forum.nothreads": {
      ja: "スレッドがありません。最初のスレを立てよう。",
      en: "No threads yet. Start the first one."
    },
    "forum.subject": { ja: "タイトル", en: "Subject" },
    "forum.updated": { ja: "更新", en: "Updated" },
    "forum.res": { ja: "レス", en: "Replies" },
    "forum.sticky": { ja: "固定", en: "Pin" },
    "forum.closed": { ja: "閉", en: "Closed" },
    "forum.backlist": { ja: "« スレ一覧", en: "« Thread list" },
    "forum.name": { ja: "名前", en: "Name" },
    "forum.body": { ja: "本文", en: "Body" },
    "forum.submit": { ja: "書き込む", en: "Post" },
    "forum.hint.new": {
      ja: "タイトルと本文を書いて書き込み",
      en: "Write a title and body, then post"
    },
    "forum.posted": { ja: "書き込みました", en: "Posted" },
    "forum.postfail": { ja: "書き込み失敗", en: "Post failed" },
    "forum.threadmissing": { ja: "スレッドが見つかりません", en: "Thread not found" },
    "forum.delthread": { ja: "スレ削除", en: "Delete thread" },
    "forum.delpost": { ja: "削除", en: "Delete" },
    "forum.delthreadconfirm": {
      ja: "このスレッドを削除しますか？",
      en: "Delete this thread?"
    },
    "forum.delpostconfirm": {
      ja: "このレスを削除しますか？",
      en: "Delete this reply?"
    },
    "forum.threadclosed": {
      ja: "このスレッドは閉じられています",
      en: "This thread is closed"
    },
    "forum.reply": { ja: "レスを書く", en: "Write a reply" }
  };

  function getLang() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === "en" || v === "ja") return v;
    } catch (e) {}
    return "ja";
  }

  function setLang(lang) {
    if (lang !== "en" && lang !== "ja") lang = "ja";
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    apply(lang);
    return lang;
  }

  function t(key, lang) {
    lang = lang || getLang();
    var row = dict[key];
    if (!row) return null;
    return row[lang] != null ? row[lang] : row.ja;
  }

  function apply(lang) {
    lang = lang || getLang();
    document.documentElement.lang = lang === "en" ? "en" : "ja";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = t(key, lang);
      if (val == null) return;
      if (el.getAttribute("data-i18n-attr")) {
        el.setAttribute(el.getAttribute("data-i18n-attr"), val);
        return;
      }
      if (el.getAttribute("data-i18n-html") === "1") {
        el.innerHTML = val.replace(/\n/g, "<br>");
        return;
      }
      el.textContent = val;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      var val = t(key, lang);
      if (val != null) el.setAttribute("placeholder", val);
    });

    document.querySelectorAll(".lang [data-lang]").forEach(function (a) {
      var on = a.getAttribute("data-lang") === lang;
      a.classList.toggle("on", on);
      a.setAttribute("aria-current", on ? "true" : "false");
    });

    try {
      document.dispatchEvent(new CustomEvent("i18n:change", { detail: { lang: lang } }));
    } catch (e) {}
  }

  function bind() {
    document.querySelectorAll(".lang [data-lang]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        setLang(a.getAttribute("data-lang"));
      });
    });
    apply(getLang());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }

  global.I18n = {
    getLang: getLang,
    setLang: setLang,
    t: t,
    apply: apply,
    dict: dict
  };
})(typeof window !== "undefined" ? window : globalThis);
