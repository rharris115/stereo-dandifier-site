// voice.js — the site's "Language" menu: English (Edwardian) and American (Mid-Century), each with its flag, for the four
// pages of the site (the help is printed in Edwardian only). A page carries its text once for each voice, marked
// data-v="edwardian" or "american"; site.css shows only the voice named on <html data-voice>. The choice is kept in the
// visitor's own browser; without this script, or without storage, the page reads in Edwardian, as written.
// `?voice=edwardian` (or american) on a page's address chooses one.

(function () {
  const voices = {
    edwardian: { name: "English (Edwardian)", flag: "union.svg", lang: "en-GB", label: "Language:" },
    american: { name: "American (Mid-Century)", flag: "us48.svg", lang: "en-US", label: "Language:" },
  };
  const key = "stereo-dandifier-voice";
  const root = document.documentElement;

  function stored() {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function store(voice) {
    try { localStorage.setItem(key, voice); } catch { /* the choice lasts this page only */ }
  }
  function apply(voice) {
    if (!voices[voice]) voice = "edwardian";
    root.dataset.voice = voice;
    root.lang = voices[voice].lang;
    return voice;
  }

  // At once, before the page is drawn, so it never shows in the wrong voice. An address's ?voice= chooses it, as a
  // link may, and is remembered as a choice from the menu is.
  const asked = new URLSearchParams(location.search).get("voice");
  if (voices[asked]) store(asked);
  let current = apply(voices[asked] ? asked : stored());

  document.addEventListener("DOMContentLoaded", () => {
    const menu = document.querySelector(".tongue");
    if (!menu) return;
    const flags = menu.dataset.flags;   // the flags' folder, relative to the page
    const button = menu.querySelector("button");
    const list = menu.querySelector("ul");

    list.innerHTML = Object.entries(voices).map(([id, v]) =>
      `<li role="option" tabindex="-1" data-voice="${id}"><img src="${flags}/${v.flag}" alt="" width="20" height="11">${v.name}</li>`
    ).join("");
    const options = [...list.querySelectorAll("li")];

    function show() {
      const v = voices[current];
      button.querySelector(".label").textContent = v.label;
      button.querySelector(".current").innerHTML = `<img src="${flags}/${v.flag}" alt="" width="20" height="11">${v.name}`;
      button.setAttribute("aria-label", `${v.label} ${v.name}`);
      options.forEach(o => o.setAttribute("aria-selected", String(o.dataset.voice === current)));
    }
    function open(isOpen) {
      list.hidden = !isOpen;
      button.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) (options.find(o => o.dataset.voice === current) || options[0]).focus();
    }
    function choose(voice) {
      current = apply(voice);
      store(current);
      show();
      open(false);
      button.focus();
    }

    button.addEventListener("click", () => open(list.hidden));
    options.forEach((o, i) => {
      o.addEventListener("click", () => choose(o.dataset.voice));
      o.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(o.dataset.voice); }
        else if (e.key === "ArrowDown") { e.preventDefault(); options[(i + 1) % options.length].focus(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); options[(i + options.length - 1) % options.length].focus(); }
        else if (e.key === "Escape") { open(false); button.focus(); }
      });
    });
    document.addEventListener("click", e => { if (!menu.contains(e.target)) open(false); });
    show();
    menu.hidden = false;
  });
})();
