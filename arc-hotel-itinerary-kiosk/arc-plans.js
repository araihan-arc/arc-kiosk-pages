/* ============================================================
   ARC Smart Itinerary — shared plan catalogue, demo popularity
   and recommendation ranking.

   Loaded by BOTH the kiosk (index.html) and the guest phone page
   (mobile.html) so the two never drift apart.

   There is no backend. Selection counts live in this browser's
   localStorage only: a phone and a kiosk do not share them, and
   they are NOT hotel-wide analytics. See README notes.
   ============================================================ */
(function (root) {
  "use strict";

  var CFG_KEY = "arcPlanCfg.v1";   /* per-plan on / weight / label override */
  var HIT_KEY = "arcPlanHits.v1";  /* explicit selections, by plan id        */

  var CAT = { plans: {}, stops: {}, ids: [], loaded: false };

  /* ---------- storage (never throws) ---------------------- */
  function get(k, fb) {
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; }
    catch (e) { return fb; }
  }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* ---------- catalogue ----------------------------------- */
  function adopt(j) {
    CAT.plans = (j && j.plans) || {};
    CAT.stops = (j && j.stops) || {};
    CAT.ids = Object.keys(CAT.plans);
    CAT.loaded = CAT.ids.length > 0;
    return CAT;
  }
  function load(url) {
    return fetch(url || "catalog.json")
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(adopt);
  }
  function plan(id) { return CAT.plans[id] || null; }
  function stop(id) { return CAT.stops[id] || null; }
  function exists(id) { return !!CAT.plans[id]; }

  /* ---------- demo configuration -------------------------- */
  /* Catalogue ships the defaults. Saved config may override
     `on`, `w` and the display label — nothing else, so a catalogue
     update can never be silently overwritten by stale localStorage. */
  function cfg() {
    var saved = get(CFG_KEY, null), by = {};
    if (saved && typeof saved === "object" && !Array.isArray(saved)) by = saved;
    return CAT.ids.map(function (id) {
      var p = CAT.plans[id], o = by[id] || {};
      return {
        id: id,
        label: typeof o.label === "string" && o.label.trim() ? o.label.trim() : p.t,
        title: p.t,
        on: typeof o.on === "boolean" ? o.on : !!p.on,
        w: Number.isFinite(+o.w) ? Math.max(1, Math.min(20, +o.w)) : (+p.w || 1)
      };
    });
  }
  function cfgSave(list) {
    var o = {};
    (list || []).forEach(function (s) {
      if (!s || !s.id || !CAT.plans[s.id]) return;
      o[s.id] = { on: !!s.on, w: Math.max(1, Math.min(20, +s.w || 1)) };
      if (s.label && s.label !== CAT.plans[s.id].t) o[s.id].label = String(s.label).slice(0, 60);
    });
    set(CFG_KEY, o);
  }
  function cfgReset() { try { localStorage.removeItem(CFG_KEY); } catch (e) {} }

  /* ---------- demo popularity ----------------------------- */
  /* Incremented ONLY on an explicit guest choice:
       - tapping a named itinerary shortcut on the kiosk
       - choosing a plan from "Change plan" on the phone
     Never on page open, reload, restore or share.            */
  function hits() { var h = get(HIT_KEY, {}); return (h && typeof h === "object") ? h : {}; }
  function hit(id) {
    if (!exists(id)) return 0;
    var h = hits(); h[id] = (h[id] || 0) + 1; set(HIT_KEY, h); return h[id];
  }
  function hitsReset() { set(HIT_KEY, {}); }

  /* ---------- ranking + rotation --------------------------- */
  /* 1. eligible  = enabled, present in the catalogue, not the active plan
     2. pop slots = highest selection count; ties by weight, then random
     3. rest      = weighted random draw, no duplicates
     4. no counts = weight order, i.e. the configured default ranking   */
  function pick(opt) {
    opt = opt || {};
    var n = opt.n || 4,
        pop = (opt.pop == null ? 2 : opt.pop),
        skip = opt.exclude,
        rnd = opt.rnd || Math.random,
        only = opt.filter;

    var poolAll = cfg().filter(function (s) {
      return s.on && exists(s.id) && s.id !== skip && (!only || only(CAT.plans[s.id], s.id));
    });
    if (!poolAll.length) return [];

    var H = hits(), out = [], used = {};
    var seeded = poolAll.some(function (s) { return (H[s.id] || 0) > 0; });

    var head = poolAll.slice().sort(seeded
      ? function (a, b) { return (H[b.id] || 0) - (H[a.id] || 0) || b.w - a.w || (rnd() - 0.5); }
      : function (a, b) { return b.w - a.w || (a.id < b.id ? -1 : 1); });

    head.slice(0, Math.min(pop, n)).forEach(function (s) { out.push(s); used[s.id] = 1; });

    var rest = poolAll.filter(function (s) { return !used[s.id]; });
    while (out.length < n && rest.length) {
      var tot = 0, i = 0;
      rest.forEach(function (s) { tot += Math.max(1, s.w); });
      var r = rnd() * tot;
      for (; i < rest.length; i++) { r -= Math.max(1, rest[i].w); if (r <= 0) break; }
      if (i >= rest.length) i = rest.length - 1;
      var p = rest.splice(i, 1)[0];
      if (!used[p.id]) { out.push(p); used[p.id] = 1; }
    }
    return out;
  }

  /* which of the returned entries earned their slot from counts */
  function isPopular(id) { return (hits()[id] || 0) > 0; }

  root.ARC = {
    CFG_KEY: CFG_KEY, HIT_KEY: HIT_KEY,
    catalogue: CAT, load: load, adopt: adopt,
    plan: plan, stop: stop, exists: exists,
    cfg: cfg, cfgSave: cfgSave, cfgReset: cfgReset,
    hits: hits, hit: hit, hitsReset: hitsReset,
    pick: pick, isPopular: isPopular
  };
})(typeof window !== "undefined" ? window : this);
