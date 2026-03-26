export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  const origin = new URL(request.url).origin;

  if (!wallet) {
    return new Response("// BagsProof embed: missing ?wallet= param", {
      headers: { "Content-Type": "application/javascript", "Access-Control-Allow-Origin": "*" },
    });
  }

  const script = `
(function() {
  var wallet = ${JSON.stringify(wallet)};
  var baseUrl = ${JSON.stringify(origin)};
  var el = document.currentScript;
  var container = document.createElement("a");
  container.href = baseUrl + "/score/" + wallet;
  container.target = "_blank";
  container.rel = "noopener noreferrer";
  container.style.cssText = "display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:8px;background:#0d1117;border:1px solid rgba(255,255,255,0.1);text-decoration:none;font-family:monospace;transition:border-color 0.2s;cursor:pointer;";
  container.innerHTML = '<span style="color:rgba(255,255,255,0.3);font-size:11px">BagsProof</span><span class="bp-score" style="font-size:13px;font-weight:700;color:rgba(255,255,255,0.4)">...</span>';
  container.onmouseenter = function() { this.style.borderColor = "rgba(0,255,136,0.3)"; };
  container.onmouseleave = function() { this.style.borderColor = "rgba(255,255,255,0.1)"; };
  if (el && el.parentNode) el.parentNode.insertBefore(container, el);

  fetch(baseUrl + "/api/score/" + wallet)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var tier = data.tier || "?";
      var score = data.score || 0;
      var color = tier === "AAA" ? "#00ff88" : tier === "AA" ? "#7fffb0" : tier === "A" ? "#f0e060" : tier === "BBB" ? "#ffa040" : "#ff4444";
      var badge = container.querySelector(".bp-score");
      if (badge) {
        badge.style.color = color;
        badge.textContent = tier + " " + score + "/100";
      }
      container.style.borderColor = color + "40";
    })
    .catch(function() {
      var badge = container.querySelector(".bp-score");
      if (badge) { badge.textContent = "Score unavailable"; }
    });
})();
`;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
    },
  });
}
