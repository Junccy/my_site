(async function () {
  const indexURL = window.searchIndexURL || "/my_site/index.json";

  // 1) 拉取索引
  let docs = [];
  try {
    const res = await fetch(indexURL);
    docs = await res.json();
  } catch (e) {
    console.error("Failed to load search index:", e);
    return;
  }

  // 2) 建 lunr 索引
  const idx = lunr(function () {
    // 如果 lunr.zh 插件存在就启用（不会报错）
    if (this.use && lunr.zh) this.use(lunr.zh);

    this.ref("uri");
    this.field("title");
    this.field("content");

    docs.forEach(d => this.add(d));
  });

  const input = document.getElementById("search");
  const resultsEl = document.getElementById("search-results");

  function renderResults(results) {
    if (!results.length) {
      resultsEl.innerHTML = "<p>没有找到结果</p>";
      return;
    }

    resultsEl.innerHTML = results.map(r => {
      const doc = docs.find(d => d.uri === r.ref) || {};
      const title = doc.title || r.ref;
      const uri = doc.uri || r.ref;
      const snippet = (doc.content || "").replace(/\s+/g, " ").slice(0, 120) + "...";
      return `
        <div class="search-result" style="margin-bottom:1rem;">
          <a href="${uri}" style="font-weight:600;">${title}</a>
          <p style="opacity:.8;margin:.3rem 0 0;">${snippet}</p>
        </div>
      `;
    }).join("");
  }

  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (!q) {
      resultsEl.innerHTML = "";
      return;
    }
    renderResults(idx.search(q));
  });
})();