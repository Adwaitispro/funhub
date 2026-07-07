const Leaderboard = (() => {
  function ready() {
    return (
      window.SUPABASE_URL &&
      window.SUPABASE_ANON_KEY &&
      !window.SUPABASE_URL.includes("YOUR-PROJECT")
    );
  }

  function headers() {
    return {
      "Content-Type": "application/json",
      apikey: window.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${window.SUPABASE_ANON_KEY}`,
    };
  }

  function getStoredName() {
    return localStorage.getItem("funhub_name") || "";
  }
  function setStoredName(name) {
    localStorage.setItem("funhub_name", name);
  }

  async function submitScore(game, name, score, meta = "") {
    if (!ready()) {
      return { ok: false, offline: true };
    }
    try {
      const res = await fetch(`${window.SUPABASE_URL}/rest/v1/scores`, {
        method: "POST",
        headers: { ...headers(), Prefer: "return=representation" },
        body: JSON.stringify([{ game, name, score, meta }]),
      });
      if (!res.ok) throw new Error(await res.text());
      return { ok: true };
    } catch (e) {
      console.error("Leaderboard submit failed:", e);
      return { ok: false, error: e.message };
    }
  }

  async function getTop(game, limit = 10, ascending = false) {
    if (!ready()) return { ok: false, offline: true, rows: [] };
    try {
      const order = `score.${ascending ? "asc" : "desc"}`;
      const res = await fetch(
        `${window.SUPABASE_URL}/rest/v1/scores?game=eq.${encodeURIComponent(
          game
        )}&select=name,score,meta,created_at&order=${order}&limit=${limit}`,
        { headers: headers() }
      );
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      return { ok: true, rows };
    } catch (e) {
      console.error("Leaderboard fetch failed:", e);
      return { ok: false, error: e.message, rows: [] };
    }
  }

  async function render(containerEl, game, options = {}) {
    const { limit = 10, ascending = false, unit = "" } = options;
    containerEl.innerHTML = `<p class="mono" style="color:var(--muted)">Loading leaderboard…</p>`;
    const { ok, offline, rows } = await getTop(game, limit, ascending);

    if (offline) {
      containerEl.innerHTML = `<p class="mono" style="color:var(--muted)">
        ⚠️ Shared leaderboard isn't connected yet. Add your Supabase keys in config.js to turn this on for everyone.
      </p>`;
      return;
    }
    if (!ok || rows.length === 0) {
      containerEl.innerHTML = `<p class="mono" style="color:var(--muted)">No scores yet. Be the first legend. 🏆</p>`;
      return;
    }
    const medal = (i) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`);
    const rowsHtml = rows
      .map(
        (r, i) => `<tr class="${i < 3 ? "rank-" + (i + 1) : ""}">
          <td>${medal(i)}</td>
          <td>${escapeHtml(r.name)}</td>
          <td>${r.score}${unit}</td>
        </tr>`
      )
      .join("");
    containerEl.innerHTML = `
      <table>
        <thead><tr><th>#</th><th>Player</th><th>Score</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  return { submitScore, getTop, render, getStoredName, setStoredName, ready };
})();
