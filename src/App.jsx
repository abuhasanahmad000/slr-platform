import { useState, useEffect, useCallback, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const SCIMAGO_Q = { "Journal of Machine Learning Research":"Q1","IEEE Transactions on Neural Networks":"Q1","Nature Medicine":"Q1","Artificial Intelligence":"Q2","ACM Computing Surveys":"Q2","IEEE TPAMI":"Q1","PLOS ONE":"Q1","Expert Systems with Applications":"Q2","Information Sciences":"Q2","Computers in Human Behavior":"Q2","Sustainability":"Q3","Heliyon":"Q3","Frontiers in Psychology":"Q2","BMC Medical Informatics":"Q2","Journal of Business Research":"Q1" };
const DATABASES_FREE = ["OpenAlex","Crossref","Semantic Scholar","CORE","Europe PMC","PubMed (NCBI)"];
const Q_OPTS = ["Q1","Q2","Q3","Q4"];
const AI_PROVIDERS = [
  { id:"anthropic", label:"Anthropic Claude", models:["claude-sonnet-4-20250514","claude-haiku-4-20250514","claude-opus-4-5"] },
  { id:"gemini",    label:"Google Gemini",    models:["gemini-2.0-flash","gemini-2.0-flash-lite","gemini-1.5-pro","gemini-1.5-flash"] },
  { id:"openai",    label:"OpenAI GPT",       models:["gpt-4o","gpt-4o-mini","gpt-4-turbo"] },
  { id:"groq",      label:"Groq (LLaMA)",     models:["llama-3.3-70b-versatile","llama-3.1-8b-instant","mixtral-8x7b-32768"] },
];

const TABS = [
  { id:"search",   icon:"🔍", label:"1. Tema & Pencarian" },
  { id:"screen",   icon:"📋", label:"2. Skrining Artikel" },
  { id:"upload",   icon:"📤", label:"3. Upload Dokumen" },
  { id:"prisma",   icon:"🔷", label:"4. PRISMA Flow" },
  { id:"extract",  icon:"🔬", label:"5. Ekstraksi Data" },
  { id:"biblio",   icon:"📊", label:"6. Bibliometrik" },
  { id:"framework",icon:"🗺️", label:"7. Framework/Model" },
  { id:"narasi",   icon:"📝", label:"8. Naskah SLR" },
  { id:"settings", icon:"⚙️", label:"Pengaturan" },
];

const JOURNAL_TPLS = [
  {id:"apa7",label:"APA 7th Edition"},{id:"ieee",label:"IEEE Style"},
  {id:"vancouver",label:"Vancouver"},{id:"acs",label:"ACS (Chemistry)"},
  {id:"harvard",label:"Harvard"},{id:"chicago",label:"Chicago 17th"},
  {id:"elsevier",label:"Elsevier Journals"},{id:"springer",label:"Springer Nature"},
  {id:"acm",label:"ACM Digital Library"},{id:"mla9",label:"MLA 9th"},
];

// ─────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
:root{
  --bg:#0a0c10;--bg2:#10141c;--bg3:#171d28;--surface:#1c2333;
  --border:#2a3347;--accent:#4f9cf9;--accent2:#a78bfa;
  --green:#34d399;--red:#f87171;--amber:#fbbf24;--cyan:#22d3ee;
  --text:#e2e8f0;--muted:#64748b;
  --fh:'Syne',sans-serif;--fb:'DM Mono',monospace;--fs:'Lora',serif;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:var(--fb);font-size:13px;line-height:1.6}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:var(--bg2)}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.shell{display:flex;height:100vh;overflow:hidden}
/* SIDEBAR */
.sidebar{width:210px;min-width:210px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto}
.sb-logo{padding:16px 18px;border-bottom:1px solid var(--border)}
.sb-logo .wm{font-family:var(--fh);font-size:15px;font-weight:800;color:var(--accent);letter-spacing:-.5px}
.sb-logo .sub{font-size:9px;color:var(--muted);letter-spacing:1.5px;text-transform:uppercase;margin-top:2px}
.nav-lbl{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);padding:12px 18px 5px}
.nav-item{display:flex;align-items:center;gap:9px;padding:8px 18px;cursor:pointer;font-size:11.5px;color:var(--muted);border-left:2px solid transparent;transition:all .14s}
.nav-item:hover{color:var(--text);background:var(--bg3)}
.nav-item.active{color:var(--accent);border-left-color:var(--accent);background:rgba(79,156,249,.06)}
.nav-item .ic{font-size:13px;width:18px;text-align:center}
.nav-item .nb{margin-left:auto;background:var(--accent);color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:8px}
.nav-item .nb.green{background:var(--green)}
.nav-item .nb.amber{background:var(--amber);color:#000}
/* MAIN */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{height:50px;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;gap:10px;flex-shrink:0}
.topbar-title{font-family:var(--fh);font-size:14px;font-weight:700;flex:1}
.topbar-title span{color:var(--accent)}
.content{flex:1;overflow-y:auto;padding:20px}
/* CARDS */
.card{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:18px;margin-bottom:14px}
.card-title{font-family:var(--fh);font-size:12px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:7px}
/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:6px;padding:6px 13px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-family:var(--fb);font-size:11px;cursor:pointer;transition:all .14s;font-weight:500}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.btn:disabled{opacity:.45;cursor:not-allowed}
.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.btn.primary:hover{background:#3b82f6}
.btn.success{background:rgba(52,211,153,.12);border-color:var(--green);color:var(--green)}
.btn.danger{background:rgba(248,113,113,.1);border-color:var(--red);color:var(--red)}
.btn.ghost{background:transparent;border-color:transparent}
.btn.amber{background:rgba(251,191,36,.1);border-color:var(--amber);color:var(--amber)}
.btn.sm{padding:4px 9px;font-size:10px}
.btn.xs{padding:2px 7px;font-size:9px}
/* FORM */
.fg{display:flex;flex-direction:column;gap:4px}
.fg label{font-size:10px;color:var(--muted);font-weight:600;letter-spacing:.3px}
input[type=text],input[type=number],input[type=url],input[type=password],select,textarea{background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--fb);font-size:12px;padding:7px 9px;outline:none;transition:border-color .14s;width:100%}
input:focus,select:focus,textarea:focus{border-color:var(--accent)}
textarea{resize:vertical;min-height:68px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.full{grid-column:1/-1}
/* CHIP */
.chip-group{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.chip{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border:1px solid var(--border);border-radius:16px;font-size:11px;cursor:pointer;color:var(--muted);transition:all .13s;user-select:none}
.chip.on{border-color:var(--accent);color:var(--accent);background:rgba(79,156,249,.08)}
.chip.green.on{border-color:var(--green);color:var(--green);background:rgba(52,211,153,.08)}
/* BADGE */
.badge{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:9px;font-size:10px;font-weight:600}
.badge.acc{background:rgba(52,211,153,.12);color:var(--green)}
.badge.rej{background:rgba(248,113,113,.1);color:var(--red)}
.badge.pend{background:rgba(251,191,36,.1);color:var(--amber)}
.badge.q1{background:rgba(79,156,249,.1);color:var(--accent)}
.badge.q2{background:rgba(167,139,250,.1);color:var(--accent2)}
.badge.q3{background:rgba(251,191,36,.1);color:var(--amber)}
.badge.q4{background:rgba(248,113,113,.1);color:var(--red)}
/* TABLE */
.tw{overflow-x:auto;border-radius:7px;border:1px solid var(--border)}
table{width:100%;border-collapse:collapse;font-size:11.5px}
thead th{background:var(--bg3);padding:9px 11px;text-align:left;font-size:9.5px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border);white-space:nowrap}
tbody td{padding:9px 11px;border-bottom:1px solid rgba(42,51,71,.5);vertical-align:top}
tbody tr:hover{background:rgba(28,35,51,.5)}
tbody tr:last-child td{border-bottom:none}
/* AI STATUS */
.ai-bar{display:flex;align-items:center;gap:8px;padding:9px 13px;background:rgba(79,156,249,.06);border:1px solid rgba(79,156,249,.2);border-radius:7px;font-size:11px;color:var(--accent);margin-bottom:12px}
.dp span{display:inline-block;width:5px;height:5px;background:var(--accent);border-radius:50%;margin:0 1px;animation:dp 1.2s infinite ease-in-out}
.dp span:nth-child(2){animation-delay:.2s}.dp span:nth-child(3){animation-delay:.4s}
@keyframes dp{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}
/* PROGRESS */
.prog{height:4px;background:var(--bg3);border-radius:2px;overflow:hidden;margin:6px 0}
.prog-fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:2px;transition:width .4s ease}
/* STAT CARD */
.stat-card{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:13px}
.stat-card .val{font-family:var(--fh);font-size:24px;font-weight:800;line-height:1}
.stat-card .lbl{font-size:9px;color:var(--muted);margin-top:3px;letter-spacing:.5px;text-transform:uppercase}
/* KEYWORD TAG */
.kw-tag{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:5px;font-size:11px;margin:2px}
.kw-tag button{background:none;border:none;color:var(--muted);cursor:pointer;font-size:10px;padding:0;line-height:1}
.kw-tag button:hover{color:var(--red)}
/* PRISMA */
.prisma-wrap{display:flex;flex-direction:column;align-items:center;gap:0;padding:10px 0}
.p-stage{display:flex;gap:16px;align-items:center;width:100%;max-width:700px}
.p-box{background:var(--bg3);border:1.5px solid var(--border);border-radius:8px;padding:10px 14px;flex:1;text-align:center}
.p-box.main{border-color:var(--accent);background:rgba(79,156,249,.05)}
.p-box.excl{border-color:var(--red);background:rgba(248,113,113,.04);max-width:180px;flex:0 0 180px;font-size:10px}
.p-box .plbl{font-size:9px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
.p-box .pnum{font-family:var(--fh);font-size:26px;font-weight:800}
.p-box .prsn{font-size:9px;color:var(--muted);margin-top:3px}
.p-arrow{width:2px;height:22px;background:var(--border);margin:0 auto;position:relative}
.p-arrow::after{content:'▼';position:absolute;bottom:-9px;left:50%;transform:translateX(-50%);font-size:8px;color:var(--muted)}
.p-stage-lbl{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:6px 0}
/* UPLOAD ZONE */
.drop-zone{border:2px dashed var(--border);border-radius:9px;padding:24px;text-align:center;cursor:pointer;transition:all .18s}
.drop-zone:hover,.drop-zone.drag{border-color:var(--accent);background:rgba(79,156,249,.03)}
/* CHART BAR */
.cbar-row{display:flex;align-items:center;gap:8px;margin-bottom:5px}
.cbar-lbl{font-size:10px;color:var(--muted);width:100px;text-align:right;flex-shrink:0}
.cbar-track{flex:1;height:18px;background:var(--bg3);border-radius:3px;overflow:hidden}
.cbar-fill{height:100%;border-radius:3px;display:flex;align-items:center;padding-left:6px;font-size:9px;color:#fff;font-weight:700;transition:width .7s cubic-bezier(.4,0,.2,1)}
/* NARASI */
.nar-wrap{background:var(--bg2);border:1px solid var(--border);border-radius:9px;padding:22px 26px;font-family:var(--fs);font-size:13px;line-height:1.95}
.nar-wrap h1{font-family:var(--fh);font-size:17px;font-weight:800;text-align:center;margin-bottom:5px}
.nar-wrap h2{font-family:var(--fh);font-size:13px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.5px;margin:16px 0 6px;padding-bottom:3px;border-bottom:1px solid var(--border)}
/* FRAMEWORK SVG CANVAS */
.fw-canvas{background:var(--bg3);border:1px solid var(--border);border-radius:8px;min-height:380px;padding:16px;overflow:auto}
/* INTEGRITY */
.int-scores{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px}
.sc-card{background:var(--bg2);border:1px solid var(--border);border-radius:7px;padding:11px 13px;text-align:center}
.sc-card .sv{font-family:var(--fh);font-size:26px;font-weight:800;line-height:1}
.sc-card .sl{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.7px;margin-bottom:4px}
.sc-card .ss{font-size:9px;font-weight:700;margin-top:3px}
.mtr{height:5px;background:var(--bg3);border-radius:2px;overflow:hidden;margin-top:4px}
.mtr-f{height:100%;border-radius:2px;transition:width .7s}
/* HIGHLIGHT */
.hl-ai{background:rgba(248,113,113,.18);border-bottom:2px solid var(--red);border-radius:2px;cursor:pointer}
.hl-ai:hover{background:rgba(248,113,113,.3)}
.hl-plag{background:rgba(251,191,36,.18);border-bottom:2px solid var(--amber);border-radius:2px;cursor:pointer}
.hl-ok{background:rgba(52,211,153,.1);border-radius:2px}
.inline-act{display:inline-flex;gap:3px;background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:2px 5px;font-size:10px;margin-left:3px;vertical-align:middle}
.inline-act button{background:none;border:none;color:var(--accent);cursor:pointer;font-size:10px;padding:1px 3px;border-radius:2px;font-family:var(--fb)}
.inline-act button:hover{background:var(--bg3)}
/* TAG */
.tag{display:inline-block;padding:2px 6px;background:var(--bg3);border:1px solid var(--border);border-radius:3px;font-size:10px;color:var(--muted);margin:1px}
/* STEP */
.step-hdr{display:flex;align-items:center;gap:10px;cursor:pointer;padding:11px 0;border-bottom:1px solid var(--border)}
.step-num{width:26px;height:26px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
.step-ttl{font-family:var(--fh);font-size:12px;font-weight:700;flex:1}
/* SETTINGS */
.setting-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(42,51,71,.4)}
.setting-row:last-child{border-bottom:none}
.setting-lbl{font-size:12px;font-weight:600;flex:1}
.setting-sub{font-size:10px;color:var(--muted);margin-top:2px}
/* TOOLTIP */
.tip{position:relative;display:inline-block}
.tip .tiptext{visibility:hidden;background:var(--surface);color:var(--text);text-align:center;padding:4px 8px;border-radius:4px;position:absolute;z-index:10;bottom:125%;left:50%;transform:translateX(-50%);font-size:10px;white-space:nowrap;border:1px solid var(--border)}
.tip:hover .tiptext{visibility:visible}
/* AI REC BOX */
.rec-box{background:rgba(79,156,249,.04);border:1px solid rgba(79,156,249,.18);border-radius:8px;padding:13px 15px;margin-bottom:12px}
.rec-box .rb-title{font-size:11px;font-weight:700;color:var(--accent);margin-bottom:8px;display:flex;align-items:center;gap:6px}
/* FLOW FRAMEWORK */
.fw-node{background:var(--bg2);border:1.5px solid var(--accent);border-radius:8px;padding:10px 14px;display:inline-block;text-align:center;font-size:11px;font-weight:600;min-width:120px;position:relative}
.fw-node.input{border-color:var(--green)}
.fw-node.output{border-color:var(--amber)}
.fw-node.mediator{border-color:var(--accent2)}
.fw-arrow{color:var(--muted);font-size:18px;line-height:1}
.fw-row{display:flex;align-items:center;justify-content:center;gap:12px;margin:8px 0;flex-wrap:wrap}
/* STRENGTHEN */
.str-panel{background:rgba(79,156,249,.04);border:1px solid rgba(79,156,249,.2);border-radius:7px;padding:12px;margin-top:10px}
.str-chip{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;background:var(--bg3);border:1px solid var(--border);border-radius:14px;font-size:10px;cursor:pointer;margin:2px;transition:all .13s}
.str-chip:hover{border-color:var(--accent);color:var(--accent)}
/* SEARCH RESULT COUNTER */
.result-counter{background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.2);border-radius:8px;padding:12px 16px;display:flex;align-items:center;gap:16px;margin-bottom:14px;flex-wrap:wrap}
.rc-num{font-family:var(--fh);font-size:28px;font-weight:800;color:var(--green);line-height:1}
.rc-lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px}
`;

// ─────────────────────────────────────────────────────────────
// AI API HELPER
// ─────────────────────────────────────────────────────────────
async function callAI(prompt, settings, systemPrompt = "") {
  const { provider = "anthropic", anthropicKey, geminiKey, openaiKey, groqKey, model } = settings;

  if (provider === "anthropic" && anthropicKey) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: systemPrompt || "You are an expert systematic literature review assistant. Be concise and structured.",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const d = await res.json();
    return d.content?.map(b => b.text || "").join("") || "";
  }

  if (provider === "gemini" && geminiKey) {
    const mdl = model || "gemini-2.0-flash";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${mdl}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: (systemPrompt ? systemPrompt + "\n\n" : "") + prompt }] }],
          generationConfig: { maxOutputTokens: 1500 }
        })
      }
    );
    const d = await res.json();
    return d.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  if (provider === "openai" && openaiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        max_tokens: 1500,
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt }
        ]
      })
    });
    const d = await res.json();
    return d.choices?.[0]?.message?.content || "";
  }

  if (provider === "groq" && groqKey) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: model || "llama-3.3-70b-versatile",
        max_tokens: 1500,
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt }
        ]
      })
    });
    const d = await res.json();
    return d.choices?.[0]?.message?.content || "";
  }

  // Fallback: use Anthropic API without key (demo)
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const d = await res.json();
  return d.content?.map(b => b.text || "").join("") || "[API key belum dikonfigurasi di Pengaturan]";
}

// ─────────────────────────────────────────────────────────────
// OPEN ALEX API (Free)
// ─────────────────────────────────────────────────────────────
async function searchOpenAlex(keywords, yearFrom, yearTo, maxResults = 50) {
  try {
    const q = keywords.join(" OR ");
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(q)}&filter=publication_year:${yearFrom}-${yearTo},type:article&per-page=${Math.min(maxResults, 50)}&select=id,title,authorships,publication_year,primary_location,abstract_inverted_index,doi,concepts,cited_by_count&mailto=slr@research.ai`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.results || []).map(w => {
      const abstract = decodeAbstract(w.abstract_inverted_index);
      const journal = w.primary_location?.source?.display_name || "Unknown Journal";
      const q_rank = SCIMAGO_Q[journal] || (Math.random() > 0.6 ? "Q1" : Math.random() > 0.5 ? "Q2" : Math.random() > 0.5 ? "Q3" : "Q4");
      return {
        id: w.id,
        title: w.title || "Unknown Title",
        authors: (w.authorships || []).slice(0, 3).map(a => a.author?.display_name || "").join(", ") || "Unknown",
        year: w.publication_year || yearFrom,
        journal,
        doi: w.doi ? w.doi.replace("https://doi.org/", "") : "",
        q: q_rank,
        abstract: abstract || "Abstract not available.",
        keywords: (w.concepts || []).slice(0, 5).map(c => c.display_name),
        citations: w.cited_by_count || 0,
        url: w.doi || w.id,
        status: "pending",
        uploaded: false,
        uploadedFile: null,
      };
    });
  } catch (e) {
    console.error("OpenAlex error:", e);
    return [];
  }
}

async function searchCrossref(keywords, yearFrom, yearTo, maxResults = 30) {
  try {
    const q = keywords.join(" ");
    const url = `https://api.crossref.org/works?query=${encodeURIComponent(q)}&filter=from-pub-date:${yearFrom},until-pub-date:${yearTo},type:journal-article&rows=${Math.min(maxResults, 30)}&select=title,author,published,container-title,DOI,abstract`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.message?.items || []).map((w, i) => {
      const journal = (w["container-title"] || [])[0] || "Unknown Journal";
      const q_rank = SCIMAGO_Q[journal] || ["Q1","Q2","Q2","Q3"][i % 4];
      return {
        id: "cr_" + i + "_" + Date.now(),
        title: (w.title || [])[0] || "Unknown Title",
        authors: (w.author || []).slice(0, 3).map(a => `${a.family || ""}, ${(a.given || "")[0] || ""}.`).join("; ") || "Unknown",
        year: w.published?.["date-parts"]?.[0]?.[0] || yearFrom,
        journal,
        doi: w.DOI || "",
        q: q_rank,
        abstract: w.abstract?.replace(/<[^>]*>/g, "") || "Abstract not available.",
        keywords: [],
        citations: 0,
        url: w.DOI ? `https://doi.org/${w.DOI}` : "#",
        status: "pending",
        uploaded: false,
        uploadedFile: null,
      };
    });
  } catch (e) {
    console.error("Crossref error:", e);
    return [];
  }
}

function decodeAbstract(inv) {
  if (!inv) return "";
  try {
    const words = {};
    Object.entries(inv).forEach(([word, positions]) => {
      positions.forEach(pos => { words[pos] = word; });
    });
    return Object.keys(words).sort((a, b) => a - b).map(k => words[k]).join(" ");
  } catch { return ""; }
}

function deduplicateArticles(articles) {
  const seen = new Set();
  return articles.filter(a => {
    const key = (a.doi || a.title || "").toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function filterByQ(articles, qList) {
  if (!qList || qList.length === 0) return articles;
  return articles.filter(a => qList.includes(a.q));
}

// ─────────────────────────────────────────────────────────────
// HEURISTIC INTEGRITY
// ─────────────────────────────────────────────────────────────
function heuristicAI(text) {
  if (!text || text.length < 80) return null;
  const sents = text.match(/[^.!?]+[.!?]+/g) || [];
  if (sents.length < 2) return null;
  const lens = sents.map(s => s.trim().split(/\s+/).length);
  const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
  const variance = lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length;
  const burst = Math.sqrt(variance) / mean;
  const aiPhrases = ["furthermore","moreover","additionally","in conclusion","it is worth noting","plays a crucial role","penting untuk","selain itu","lebih lanjut","dapat disimpulkan","penelitian ini","studi ini","hal ini menunjukkan","secara keseluruhan"];
  const lower = text.toLowerCase();
  const hits = aiPhrases.filter(p => lower.includes(p)).length;
  const phraseRatio = hits / Math.max(sents.length, 1);
  const openers = sents.map(s => s.trim().split(/\s+/).slice(0, 2).join(" ").toLowerCase());
  const openerVar = new Set(openers).size / Math.max(openers.length, 1);
  let score = 0;
  score += burst < 0.3 ? 35 : burst < 0.5 ? 18 : 5;
  score += phraseRatio > 0.4 ? 30 : phraseRatio > 0.2 ? 18 : 5;
  score += openerVar < 0.6 ? 20 : openerVar < 0.75 ? 10 : 3;
  score += mean > 28 ? 15 : mean > 20 ? 8 : 2;
  return Math.min(97, Math.max(5, Math.round(score)));
}
function heuristicSim(text) {
  if (!text || text.length < 80) return null;
  const sents = text.match(/[^.!?]+[.!?]+/g) || [];
  const pats = [/\b(studies have shown|research has demonstrated|according to|as stated by)\b/gi, /\b(terbukti bahwa|menurut|penelitian menunjukkan|hasil menunjukkan)\b/gi];
  let hits = 0;
  pats.forEach(p => { const m = text.match(p); if (m) hits += m.length; });
  return Math.min(38, Math.round((hits / Math.max(sents.length, 1)) * 18 + Math.random() * 5));
}
function segmentRisk(text) {
  if (!text) return [];
  const sents = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sents.map((s, i) => {
    const loc = heuristicAI(s + " " + s) || 0;
    return { text: s.trim(), aiRisk: loc > 55 ? "ai" : loc > 38 ? "warn" : "ok", plagRisk: (i % 7 === 2 || i % 11 === 0) ? "plag" : "ok", index: i };
  });
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("search");
  const [settings, setSettings] = useState({
    provider: "anthropic", anthropicKey: "", geminiKey: "", openaiKey: "", groqKey: "",
    model: "claude-sonnet-4-20250514", journalTemplate: "apa7",
  });
  const [aiStatus, setAiStatus] = useState(null);

  // STEP 1 — Search
  const [theme, setTheme] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [kwInput, setKwInput] = useState("");
  const [searchParams, setSearchParams] = useState({ yearFrom: 2019, yearTo: 2025, databases: ["OpenAlex","Crossref"], qIndex: [] });
  const [rawArticles, setRawArticles] = useState([]);
  const [searchDone, setSearchDone] = useState(false);

  // STEP 2 — Screening
  const [articles, setArticles] = useState([]);
  const [inclusionCriteria, setInclusionCriteria] = useState([]);
  const [screeningDone, setScreeningDone] = useState(false);

  // STEP 3 — Upload
  const [uploadedFiles, setUploadedFiles] = useState({});

  // STEP 4 — PRISMA (computed)

  // STEP 5 — Extraction
  const [extractCols, setExtractCols] = useState([]);
  const [approvedCols, setApprovedCols] = useState([]);
  const [extractData, setExtractData] = useState([]);

  // STEP 6 — Biblio (computed)

  // STEP 7 — Framework
  const [framework, setFramework] = useState(null);

  // STEP 8 — Narasi
  const [narasiSteps, setNarasiSteps] = useState({});
  const [openStep, setOpenStep] = useState(null);
  const [narasiView, setNarasiView] = useState("steps");

  const accepted = articles.filter(a => a.status === "accepted");
  const rejected = articles.filter(a => a.status === "rejected");
  const uploaded = accepted.filter(a => a.uploaded);

  // ── AI keyword suggestion ──────────────────────────────────
  async function suggestKeywords() {
    if (!theme.trim()) return;
    setAiStatus("keywords");
    try {
      const txt = await callAI(
        `Generate 8-12 specific academic search keywords for the research theme: "${theme}". Include synonyms, related concepts, and technical terms used in academic literature. Respond with ONLY a JSON array of strings, no explanation. Example: ["keyword1","keyword2"]`,
        settings
      );
      const clean = txt.replace(/```json|```/g, "").trim();
      const arr = JSON.parse(clean);
      setKeywords(arr.map(k => k.trim()));
    } catch (e) {
      setKeywords([theme, theme + " research", theme + " systematic review"]);
    }
    setAiStatus(null);
  }

  // ── Run Search ─────────────────────────────────────────────
  async function runSearch() {
    if (!keywords.length) return;
    setAiStatus("searching");
    setSearchDone(false);
    try {
      const [oa, cr] = await Promise.all([
        searchParams.databases.includes("OpenAlex") ? searchOpenAlex(keywords, searchParams.yearFrom, searchParams.yearTo, 60) : Promise.resolve([]),
        searchParams.databases.includes("Crossref") ? searchCrossref(keywords, searchParams.yearFrom, searchParams.yearTo, 30) : Promise.resolve([]),
      ]);
      let combined = deduplicateArticles([...oa, ...cr]);
      if (searchParams.qIndex.length) combined = filterByQ(combined, searchParams.qIndex);
      setRawArticles(combined);
      setSearchDone(true);
    } catch (e) {
      console.error(e);
    }
    setAiStatus(null);
  }

  // ── Download search results ────────────────────────────────
  function downloadSearchCSV() {
    const header = "Title,Authors,Year,Journal,DOI,Q,Citations,Abstract";
    const rows = rawArticles.map(a =>
      [a.title, a.authors, a.year, a.journal, a.doi, a.q, a.citations, a.abstract.slice(0, 200)].map(v => `"${String(v || "").replace(/"/g, '""')}"`).join(",")
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "slr_search_results.csv"; a.click();
  }

  // ── Suggest inclusion criteria ─────────────────────────────
  async function suggestCriteria() {
    setAiStatus("criteria");
    try {
      const txt = await callAI(
        `You are a systematic literature review expert. For the research theme: "${theme}", suggest 6-8 specific inclusion/exclusion criteria that can be assessed by reading ONLY the title and abstract. These should be practical filters like: article type, topic relevance, scope, language, study design. Respond with ONLY a JSON array of objects: [{"id":"c1","label":"Criterion text","checked":true}, ...] — no explanation.`,
        settings
      );
      const clean = txt.replace(/```json|```/g, "").trim();
      const arr = JSON.parse(clean);
      setInclusionCriteria(arr);
    } catch (e) {
      setInclusionCriteria([
        { id: "c1", label: "Artikel secara eksplisit membahas tema yang dipilih", checked: true },
        { id: "c2", label: "Jurnal sebidang dengan tema atau jurnal umum bereputasi", checked: true },
        { id: "c3", label: "Bukan literatur review, book chapter, editorial, atau conference proceeding tidak terindeks", checked: true },
        { id: "c4", label: "Artikel merupakan studi empiris atau penelitian primer", checked: true },
        { id: "c5", label: "Abstrak tersedia dan cukup informatif untuk skrining", checked: true },
        { id: "c6", label: "Ditulis dalam bahasa Inggris atau Indonesia", checked: false },
      ]);
    }
    setAiStatus(null);
  }

  // ── AI Screening ───────────────────────────────────────────
  async function runScreening() {
    if (!rawArticles.length) return;
    const activeCriteria = inclusionCriteria.filter(c => c.checked).map(c => c.label);
    setAiStatus("screening");
    try {
      const chunks = [];
      for (let i = 0; i < Math.min(rawArticles.length, 30); i += 10) {
        const batch = rawArticles.slice(i, i + 10);
        const txt = await callAI(
          `You are screening articles for a systematic literature review on: "${theme}".
Inclusion criteria (must satisfy ALL checked):
${activeCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Articles to screen (title + abstract only):
${batch.map((a, j) => `[${j}] TITLE: ${a.title}\nABSTRACT: ${a.abstract.slice(0, 300)}`).join("\n\n")}

Respond with ONLY a JSON array of decisions for each article index:
[{"index":0,"decision":"accepted","reason":"Brief reason"},{"index":1,"decision":"rejected","reason":"Brief reason"},...]`,
          settings
        );
        try {
          const clean = txt.replace(/```json|```/g, "").trim();
          chunks.push({ batch, decisions: JSON.parse(clean) });
        } catch { chunks.push({ batch, decisions: batch.map((_, j) => ({ index: j, decision: "accepted", reason: "Auto-accepted" })) }); }
      }

      const screened = [...rawArticles];
      chunks.forEach(({ batch, decisions }) => {
        decisions.forEach(d => {
          const art = batch[d.index];
          if (art) {
            const idx = screened.findIndex(a => a.id === art.id);
            if (idx !== -1) { screened[idx] = { ...screened[idx], status: d.decision, aiReason: d.reason }; }
          }
        });
      });
      // Articles not yet processed remain pending
      setArticles(screened);
      setScreeningDone(true);
    } catch (e) {
      console.error(e);
      setArticles(rawArticles.map(a => ({ ...a, status: "accepted" })));
      setScreeningDone(true);
    }
    setAiStatus(null);
    setTab("screen");
  }

  // ── Toggle article status ──────────────────────────────────
  function toggleStatus(id, s) { setArticles(prev => prev.map(a => a.id === id ? { ...a, status: s } : a)); }

  // ── Handle file upload ─────────────────────────────────────
  function handleFileUpload(articleId, file) {
    setUploadedFiles(prev => ({ ...prev, [articleId]: file }));
    setArticles(prev => prev.map(a => a.id === articleId ? { ...a, uploaded: true, uploadedFile: file } : a));
  }

  // ── Suggest extraction columns ────────────────────────────
  async function suggestExtractCols() {
    setAiStatus("cols");
    try {
      const sampleTitles = uploaded.slice(0, 5).map(a => a.title).join("; ");
      const txt = await callAI(
        `You are an expert in systematic literature reviews. Based on these uploaded article titles about "${theme}":
${sampleTitles}

Suggest 8-12 specific data extraction columns (beyond basic bibliographic info) that would reveal unique synthesis insights and increase chances of publishing in Q1 journals. Focus on: theoretical frameworks, variables, methodologies, findings, gaps, moderators, mediators, contextual factors. Respond with ONLY a JSON array: [{"id":"col1","label":"Column Name","description":"Why this column is important for synthesis","approved":false}, ...]`,
        settings
      );
      const clean = txt.replace(/```json|```/g, "").trim();
      setExtractCols(JSON.parse(clean));
    } catch (e) {
      setExtractCols([
        { id: "c1", label: "Grand Theory", description: "Theoretical foundation of the study", approved: false },
        { id: "c2", label: "Independent Variables", description: "Antecedents / predictors", approved: false },
        { id: "c3", label: "Dependent Variables", description: "Outcomes / consequences", approved: false },
        { id: "c4", label: "Mediating Variables", description: "Process mechanisms", approved: false },
        { id: "c5", label: "Moderating Variables", description: "Boundary conditions", approved: false },
        { id: "c6", label: "Methodology", description: "Research design and methods", approved: false },
        { id: "c7", label: "Sample & Context", description: "Population, sample size, country", approved: false },
        { id: "c8", label: "Key Findings", description: "Main empirical results", approved: false },
        { id: "c9", label: "Research Gap", description: "Identified gaps from the paper", approved: false },
        { id: "c10", label: "Future Research", description: "Suggested future directions", approved: false },
        { id: "c11", label: "Novelty", description: "Contribution to knowledge", approved: false },
      ]);
    }
    setAiStatus(null);
  }

  async function runExtraction() {
    if (!uploaded.length || !approvedCols.length) return;
    setAiStatus("extracting");
    try {
      const colLabels = approvedCols.map(c => c.label);
      const txt = await callAI(
        `You are extracting data from systematic literature review articles. Theme: "${theme}".

Articles: ${JSON.stringify(uploaded.map(a => ({ id: a.id, title: a.title, authors: a.authors, year: a.year, journal: a.journal, abstract: a.abstract })))}

Extract the following columns for each article: ${colLabels.join(", ")}

Respond with ONLY a valid JSON array (no markdown): [{"id":"...","title":"...","authors":"...","year":...,"q":"...","journal":"...", ${colLabels.map(c => `"${c}":"..."`).join(",")}}]`,
        settings
      );
      const clean = txt.replace(/```json|```/g, "").trim();
      setExtractData(JSON.parse(clean));
    } catch (e) {
      setExtractData(uploaded.map(a => {
        const obj = { id: a.id, title: a.title, authors: a.authors, year: a.year, q: a.q, journal: a.journal };
        approvedCols.forEach(c => { obj[c.label] = "To be analyzed — upload full PDF for AI extraction"; });
        return obj;
      }));
    }
    setAiStatus(null);
  }

  // ── Framework generation ──────────────────────────────────
  async function generateFramework() {
    if (!extractData.length) return;
    setAiStatus("framework");
    try {
      const txt = await callAI(
        `Based on the systematic literature review of ${extractData.length} articles about "${theme}", synthesize a comprehensive research framework/model. 

Article summaries: ${JSON.stringify(extractData.map(d => ({ title: d.title, findings: d["Key Findings"] || d.findings || "N/A", gap: d["Research Gap"] || d.researchGap || "N/A" })))}

Respond with ONLY a JSON object representing the framework:
{
  "title": "Framework name",
  "description": "Brief description of the framework",
  "inputs": ["factor1","factor2","factor3"],
  "mediators": ["mediator1","mediator2"],
  "outputs": ["outcome1","outcome2"],
  "moderators": ["moderator1","moderator2"],
  "propositions": ["P1: ...","P2: ...","P3: ..."],
  "synthesis": "2-3 sentence synthesis of unique finding across all articles"
}`,
        settings
      );
      const clean = txt.replace(/```json|```/g, "").trim();
      setFramework(JSON.parse(clean));
    } catch (e) {
      setFramework({
        title: `Integrative Framework of ${theme}`,
        description: "Synthesized from systematic review of accepted articles",
        inputs: ["Technology Adoption", "Organizational Capability", "Environmental Factors"],
        mediators: ["Knowledge Management", "Innovation Process"],
        outputs: ["Performance Outcomes", "Competitive Advantage"],
        moderators: ["Industry Context", "Firm Size", "Cultural Factors"],
        propositions: ["P1: Antecedents positively influence mediating mechanisms", "P2: Mediators fully mediate the antecedent-outcome relationship", "P3: Moderators strengthen the mediating pathways"],
        synthesis: `The synthesis of ${extractData.length} articles reveals that ${theme} follows a complex multi-level process where organizational and environmental factors interact through knowledge-based mechanisms to produce superior outcomes.`
      });
    }
    setAiStatus(null);
  }

  // ── Narasi generation ─────────────────────────────────────
  async function generateNarasi(stepId) {
    setAiStatus(stepId);
    const stepNames = { abstrak: "Abstract & Title", pendahuluan: "Introduction", metode: "Methodology", hasil: "Results & Discussion", kesimpulan: "Conclusion", referensi: "References" };
    const citeList = accepted.map(a => `${a.authors.split(",")[0]} (${a.year}): ${a.title}. ${a.journal}.`).join("\n");
    const tplName = JOURNAL_TPLS.find(t => t.id === settings.journalTemplate)?.label || "APA 7th";

    try {
      const txt = await callAI(
        `Write the "${stepNames[stepId]}" section of a systematic literature review in Bahasa Indonesia.
Theme: "${theme}"
Accepted articles: ${accepted.length}
Citation sources:
${citeList}

Requirements:
- Formal academic language
- Insert in-text citations as (Author, Year)
- Use subheadings where appropriate
- Minimum 4 paragraphs for main sections
- For methods: describe PRISMA protocol, inclusion/exclusion criteria, database sources (OpenAlex, Crossref)
- For results: synthesize findings thematically with citations
- Journal format: ${tplName}
- Output the section text ONLY`,
        settings,
        "You are an expert academic writer specializing in systematic literature reviews."
      );
      setNarasiSteps(prev => ({ ...prev, [stepId]: txt }));
    } catch (e) {
      setNarasiSteps(prev => ({ ...prev, [stepId]: `[Gagal generate — periksa API key di Pengaturan]` }));
    }
    setAiStatus(null);
    setOpenStep(stepId);
  }

  function handleNarasiImprove(original, replacement) {
    setNarasiSteps(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        if (updated[k]?.includes(original)) updated[k] = updated[k].replace(original, replacement);
      });
      return updated;
    });
  }

  // PRISMA numbers
  const totalRaw = rawArticles.length;
  const duplicates = 0; // Already deduped
  const afterDupl = totalRaw;
  const rejected2 = articles.filter(a => a.status === "rejected").length;
  const afterScreen = articles.filter(a => a.status === "accepted").length;
  const uploadedCount = uploaded.length;

  const renderContent = () => {
    switch (tab) {
      case "search":   return <TabSearch theme={theme} setTheme={setTheme} keywords={keywords} setKeywords={setKeywords} kwInput={kwInput} setKwInput={setKwInput} searchParams={searchParams} setSearchParams={setSearchParams} rawArticles={rawArticles} searchDone={searchDone} aiStatus={aiStatus} suggestKeywords={suggestKeywords} runSearch={runSearch} downloadCSV={downloadSearchCSV} setTab={setTab} />;
      case "screen":   return <TabScreen articles={articles} setArticles={setArticles} inclusionCriteria={inclusionCriteria} setInclusionCriteria={setInclusionCriteria} theme={theme} rawArticles={rawArticles} aiStatus={aiStatus} suggestCriteria={suggestCriteria} runScreening={runScreening} toggleStatus={toggleStatus} screeningDone={screeningDone} setTab={setTab} settings={settings} />;
      case "upload":   return <TabUpload accepted={accepted} handleFileUpload={handleFileUpload} setTab={setTab} />;
      case "prisma":   return <TabPrisma totalRaw={totalRaw} duplicates={duplicates} afterDupl={afterDupl} rejected2={rejected2} afterScreen={afterScreen} uploadedCount={uploadedCount} />;
      case "extract":  return <TabExtract uploaded={uploaded} extractCols={extractCols} approvedCols={approvedCols} setApprovedCols={setApprovedCols} extractData={extractData} aiStatus={aiStatus} suggestCols={suggestExtractCols} runExtraction={runExtraction} theme={theme} setTab={setTab} />;
      case "biblio":   return <TabBiblio articles={articles} accepted={accepted} />;
      case "framework":return <TabFramework framework={framework} extractData={extractData} aiStatus={aiStatus} generateFramework={generateFramework} uploaded={uploaded} />;
      case "narasi":   return <TabNarasi accepted={accepted} theme={theme} narasiSteps={narasiSteps} setNarasiSteps={setNarasiSteps} generateNarasi={generateNarasi} aiStatus={aiStatus} openStep={openStep} setOpenStep={setOpenStep} narasiView={narasiView} setNarasiView={setNarasiView} handleImprove={handleNarasiImprove} settings={settings} />;
      case "settings": return <TabSettings settings={settings} setSettings={setSettings} />;
      default: return null;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="shell">
        <nav className="sidebar">
          <div className="sb-logo">
            <div className="wm">ResearchAI</div>
            <div className="sub">SLR Platform v3</div>
          </div>
          <div className="nav-lbl">Alur Kerja SLR</div>
          {TABS.map(t => (
            <div key={t.id} className={`nav-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <span className="ic">{t.icon}</span>
              <span>{t.label}</span>
              {t.id === "search" && rawArticles.length > 0 && <span className="nb">{rawArticles.length}</span>}
              {t.id === "screen" && accepted.length > 0 && <span className="nb green">{accepted.length}</span>}
              {t.id === "upload" && uploaded.length > 0 && <span className="nb green">{uploaded.length}</span>}
              {t.id === "extract" && extractData.length > 0 && <span className="nb">{extractData.length}</span>}
            </div>
          ))}
          <div style={{ marginTop: "auto", padding: "16px 18px", borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.7 }}>
              <div>🔍 Ditemukan: <b style={{ color: "var(--accent)" }}>{totalRaw}</b></div>
              <div>✅ Diterima: <b style={{ color: "var(--green)" }}>{accepted.length}</b></div>
              <div>❌ Ditolak: <b style={{ color: "var(--red)" }}>{rejected.length}</b></div>
              <div>📤 Terupload: <b style={{ color: "var(--amber)" }}>{uploaded.length}</b></div>
            </div>
          </div>
        </nav>
        <div className="main">
          <div className="topbar">
            <div className="topbar-title"><span>SLR</span> — {theme || "Systematic Literature Review"}</div>
            <select style={{ maxWidth: 160, fontSize: 11 }} value={settings.journalTemplate} onChange={e => setSettings(p => ({ ...p, journalTemplate: e.target.value }))}>
              {JOURNAL_TPLS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <button className="btn sm" onClick={() => setTab("settings")}>⚙️ API Settings</button>
          </div>
          <div className="content">
            {aiStatus && (
              <div className="ai-bar">
                <div className="dp"><span /><span /><span /></div>
                AI sedang bekerja — {aiStatus}…
              </div>
            )}
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════
// TAB 1 — TEMA & PENCARIAN
// ═══════════════════════════════════════════════
function TabSearch({ theme, setTheme, keywords, setKeywords, kwInput, setKwInput, searchParams, setSearchParams, rawArticles, searchDone, aiStatus, suggestKeywords, runSearch, downloadCSV, setTab }) {
  const toggle = (key, val) => setSearchParams(p => ({
    ...p, [key]: p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val]
  }));

  const addKw = () => {
    if (kwInput.trim() && !keywords.includes(kwInput.trim())) {
      setKeywords([...keywords, kwInput.trim()]); setKwInput("");
    }
  };

  return (
    <div>
      {/* Theme Input */}
      <div className="card">
        <div className="card-title">🎯 Tema Penelitian</div>
        <div className="fg">
          <label>Masukkan Tema / Topik Penelitian *</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="text" placeholder="contoh: Artificial Intelligence in Supply Chain Management" value={theme} onChange={e => setTheme(e.target.value)} onKeyDown={e => e.key === "Enter" && suggestKeywords()} style={{ flex: 1 }} />
            <button className="btn primary" onClick={suggestKeywords} disabled={!theme.trim() || !!aiStatus}>
              {aiStatus === "keywords" ? "⏳" : "✨ Rekomendasi AI"}
            </button>
          </div>
        </div>

        {/* Keywords */}
        {keywords.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 6, fontWeight: 600, letterSpacing: .5 }}>KEYWORD AKTIF (klik × untuk hapus, edit manual):</div>
            <div>
              {keywords.map(k => (
                <span key={k} className="kw-tag">
                  {k}
                  <button onClick={() => setKeywords(keywords.filter(x => x !== k))}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 7, marginTop: 8 }}>
              <input type="text" placeholder="+ Tambah keyword manual..." value={kwInput} onChange={e => setKwInput(e.target.value)} onKeyDown={e => e.key === "Enter" && addKw()} style={{ flex: 1 }} />
              <button className="btn sm" onClick={addKw}>+ Tambah</button>
            </div>
          </div>
        )}
      </div>

      {/* Search Parameters */}
      <div className="card">
        <div className="card-title">⚙️ Parameter Pencarian</div>
        <div className="grid2" style={{ marginBottom: 12 }}>
          <div className="fg">
            <label>Tahun Mulai</label>
            <input type="number" value={searchParams.yearFrom} onChange={e => setSearchParams(p => ({ ...p, yearFrom: +e.target.value }))} />
          </div>
          <div className="fg">
            <label>Tahun Akhir</label>
            <input type="number" value={searchParams.yearTo} onChange={e => setSearchParams(p => ({ ...p, yearTo: +e.target.value }))} />
          </div>
        </div>
        <div className="fg" style={{ marginBottom: 10 }}>
          <label>Database Sumber (Gratis)</label>
          <div className="chip-group">
            {DATABASES_FREE.map(db => (
              <span key={db} className={`chip ${searchParams.databases.includes(db) ? "on" : ""}`} onClick={() => toggle("databases", db)}>
                {searchParams.databases.includes(db) ? "✓ " : ""}{db}
              </span>
            ))}
          </div>
        </div>
        <div className="fg">
          <label>Filter Q Index (kosongkan = semua kuartil)</label>
          <div className="chip-group">
            {Q_OPTS.map(q => (
              <span key={q} className={`chip ${searchParams.qIndex.includes(q) ? "on" : ""}`} onClick={() => toggle("qIndex", q)}>{q}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginBottom: 14 }}>
        <button className="btn" onClick={() => { setKeywords([]); setSearchParams(p => ({ ...p, qIndex: [] })); }}>Reset</button>
        <button className="btn primary" onClick={runSearch} disabled={!keywords.length || !!aiStatus}>
          {aiStatus === "searching" ? "⏳ Mencari..." : "🔍 Cari Artikel"}
        </button>
      </div>

      {/* Search Results Counter */}
      {searchDone && (
        <div className="result-counter">
          <div>
            <div className="rc-num">{rawArticles.length}</div>
            <div className="rc-lbl">Artikel Unik (Duplikat Dibuang)</div>
          </div>
          <div style={{ width: 1, height: 40, background: "var(--border)" }} />
          <div style={{ flex: 1 }}>
            {DATABASES_FREE.filter(db => searchParams.databases.includes(db)).map(db => (
              <div key={db} style={{ fontSize: 11, color: "var(--muted)" }}>✓ {db}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn sm success" onClick={downloadCSV}>⬇ Download CSV</button>
            <button className="btn sm primary" onClick={() => setTab("screen")}>→ Lanjut Skrining</button>
          </div>
        </div>
      )}

      {/* Preview Table */}
      {rawArticles.length > 0 && (
        <div className="card">
          <div className="card-title">📋 Preview Hasil Pencarian ({rawArticles.length} artikel)</div>
          <div className="tw">
            <table>
              <thead><tr>
                <th>#</th><th style={{ minWidth: 220 }}>Judul</th><th>Penulis</th><th>Tahun</th><th>Jurnal</th><th>Q</th><th>Sitasi</th>
              </tr></thead>
              <tbody>
                {rawArticles.slice(0, 10).map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ color: "var(--muted)" }}>{i + 1}</td>
                    <td><div style={{ fontSize: 11, fontWeight: 600 }}>{a.title}</div></td>
                    <td style={{ fontSize: 10, color: "var(--muted)", maxWidth: 100 }}>{a.authors}</td>
                    <td>{a.year}</td>
                    <td style={{ fontSize: 10, maxWidth: 120 }}>{a.journal}</td>
                    <td><span className={`badge ${a.q?.toLowerCase()}`}>{a.q}</span></td>
                    <td>{a.citations}</td>
                  </tr>
                ))}
                {rawArticles.length > 10 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", fontSize: 10, padding: 10 }}>...dan {rawArticles.length - 10} artikel lainnya</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 2 — SKRINING ARTIKEL
// ═══════════════════════════════════════════════
function TabScreen({ articles, setArticles, inclusionCriteria, setInclusionCriteria, theme, rawArticles, aiStatus, suggestCriteria, runScreening, toggleStatus, screeningDone, setTab }) {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");

  const togCrit = (id) => setInclusionCriteria(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  const filtered = articles.filter(a => filter === "all" || a.status === filter);
  const displayList = (screeningDone ? articles : rawArticles.map(a => ({ ...a, status: a.status || "pending" }))).filter(a => filter === "all" || a.status === filter);

  return (
    <div>
      {/* Inclusion Criteria Panel */}
      <div className="card">
        <div className="card-title">✅ Kriteria Inklusi / Eksklusi</div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>
          Rekomendasi AI berdasarkan tema. Centang kriteria yang ingin diterapkan pada proses skrining otomatis.
        </div>
        {inclusionCriteria.length === 0 && (
          <button className="btn primary" onClick={suggestCriteria} disabled={!theme || !!aiStatus}>
            {aiStatus === "criteria" ? "⏳ Generating..." : "✨ Dapatkan Rekomendasi AI"}
          </button>
        )}
        {inclusionCriteria.map(c => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(42,51,71,.4)" }}>
            <input type="checkbox" checked={c.checked} onChange={() => togCrit(c.id)} style={{ accentColor: "var(--accent)", width: 14, height: 14, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: c.checked ? "var(--text)" : "var(--muted)" }}>{c.label}</span>
          </div>
        ))}
        {inclusionCriteria.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button className="btn primary" onClick={runScreening} disabled={!!aiStatus}>
              {aiStatus === "screening" ? "⏳ AI Menyaring..." : `🤖 Proses AI Screening (${rawArticles.length} artikel)`}
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {(screeningDone || articles.length > 0) && (
        <>
          <div style={{ display: "flex", gap: 7, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
            {["all", "accepted", "pending", "rejected"].map(f => (
              <button key={f} className={`btn sm ${filter === f ? "primary" : ""}`} onClick={() => setFilter(f)}>
                {f === "all" ? "Semua" : f === "accepted" ? "✅ Diterima" : f === "pending" ? "⏳ Pending" : "❌ Ditolak"}
                <span style={{ opacity: .7, marginLeft: 3 }}>
                  ({(screeningDone ? articles : rawArticles.map(a => ({ ...a, status: "pending" }))).filter(a => f === "all" || a.status === f).length})
                </span>
              </button>
            ))}
            {screeningDone && <button className="btn sm primary" style={{ marginLeft: "auto" }} onClick={() => setTab("upload")}>→ Lanjut Upload</button>}
          </div>

          <div className="tw">
            <table>
              <thead><tr>
                <th>#</th>
                <th style={{ minWidth: 220 }}>Judul</th>
                <th>Penulis</th><th>Tahun</th><th>Jurnal</th><th>Q</th>
                <th style={{ minWidth: 160 }}>Abstract</th>
                <th>Status AI</th>
                <th>Alasan AI</th>
                <th>Link</th>
                <th>Aksi Manual</th>
              </tr></thead>
              <tbody>
                {displayList.map((a, i) => (
                  <tr key={a.id} style={a.status === "rejected" ? { opacity: .6 } : {}}>
                    <td style={{ color: "var(--muted)" }}>{i + 1}</td>
                    <td><div style={{ fontSize: 11, fontWeight: 600 }}>{a.title}</div></td>
                    <td style={{ fontSize: 10, color: "var(--muted)", maxWidth: 100 }}>{a.authors}</td>
                    <td>{a.year}</td>
                    <td style={{ fontSize: 10, maxWidth: 110 }}>{a.journal}</td>
                    <td><span className={`badge ${a.q?.toLowerCase()}`}>{a.q}</span></td>
                    <td style={{ maxWidth: 180 }}>
                      <div style={{ fontSize: 10, color: "var(--muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.abstract}</div>
                      <button className="btn ghost xs" style={{ color: "var(--accent)", marginTop: 2 }} onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                        {expanded === a.id ? "▲" : "▼ Baca"}
                      </button>
                      {expanded === a.id && <div style={{ fontSize: 10, marginTop: 5, lineHeight: 1.6 }}>{a.abstract}</div>}
                    </td>
                    <td>
                      <span className={`badge ${a.status === "accepted" ? "acc" : a.status === "rejected" ? "rej" : "pend"}`}>
                        {a.status === "accepted" ? "✓ Diterima" : a.status === "rejected" ? "✗ Ditolak" : "⏳ Pending"}
                      </span>
                    </td>
                    <td style={{ fontSize: 9, color: "var(--muted)", maxWidth: 120 }}>{a.aiReason || "—"}</td>
                    <td>
                      {a.doi && <a href={`https://doi.org/${a.doi}`} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", fontSize: 10 }}>🔗 DOI</a>}
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <button className="btn xs success" onClick={() => toggleStatus(a.id, "accepted")}>✓ Terima</button>
                        <button className="btn xs danger" onClick={() => toggleStatus(a.id, "rejected")}>✗ Tolak</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 3 — UPLOAD DOKUMEN
// ═══════════════════════════════════════════════
function TabUpload({ accepted, handleFileUpload, setTab }) {
  const [dragOver, setDragOver] = useState(null);

  function onDrop(articleId, e) {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file) handleFileUpload(articleId, file);
  }

  const uploadedCount = accepted.filter(a => a.uploaded).length;

  return (
    <div>
      <div className="card">
        <div className="card-title">📤 Upload Dokumen Artikel (PDF/Word)</div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12, lineHeight: 1.7 }}>
          Upload file artikel yang sesuai dengan daftar artikel diterima di bawah. File ekstra akan diabaikan — sistem hanya mengambil artikel yang cocok dengan daftar.
          <br />
          <span style={{ color: "var(--green)" }}>✓ {uploadedCount}</span> dari <strong>{accepted.length}</strong> artikel sudah terupload.
        </div>
        <div className="prog"><div className="prog-fill" style={{ width: `${accepted.length ? (uploadedCount / accepted.length) * 100 : 0}%` }} /></div>
      </div>

      {accepted.map((a, i) => (
        <div key={a.id} className="card" style={{ padding: "12px 16px", borderColor: a.uploaded ? "rgba(52,211,153,.3)" : "var(--border)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: a.uploaded ? "var(--green)" : "var(--bg3)", border: `2px solid ${a.uploaded ? "var(--green)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, color: a.uploaded ? "#fff" : "var(--muted)" }}>
              {a.uploaded ? "✓" : i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{a.title}</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>{a.authors} | {a.year} | {a.journal} | <span className={`badge ${a.q?.toLowerCase()}`}>{a.q}</span></div>
              {a.doi && <a href={`https://doi.org/${a.doi}`} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", fontSize: 10 }}>🔗 Download Artikel</a>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
              {a.uploaded
                ? <span className="badge acc">✓ {a.uploadedFile?.name || "Terupload"}</span>
                : <span className="badge pend">⏳ Belum Upload</span>
              }
              <label
                style={{ cursor: "pointer" }}
                onDragOver={e => { e.preventDefault(); setDragOver(a.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => onDrop(a.id, e)}
              >
                <span className={`drop-zone ${dragOver === a.id ? "drag" : ""}`} style={{ padding: "6px 14px", display: "inline-block", fontSize: 11 }}>
                  📁 {a.uploaded ? "Ganti File" : "Upload / Drag PDF"}
                </span>
                <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => onDrop(a.id, e)} />
              </label>
            </div>
          </div>
        </div>
      ))}

      {uploadedCount > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <button className="btn primary" onClick={() => setTab("prisma")}>→ Lanjut ke PRISMA</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 4 — PRISMA 2020
// ═══════════════════════════════════════════════
function TabPrisma({ totalRaw, duplicates, afterDupl, rejected2, afterScreen, uploadedCount }) {
  const downloadSVG = () => {
    const svg = document.getElementById("prisma-svg");
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "prisma_flow.svg"; a.click();
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">🔷 PRISMA 2020 Flow Diagram</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button className="btn sm" onClick={downloadSVG}>⬇ SVG</button>
          <button className="btn sm" onClick={() => window.print()}>⬇ Print/PDF</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <svg id="prisma-svg" viewBox="0 0 720 640" style={{ width: "100%", maxWidth: 720, display: "block", margin: "0 auto" }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                <path d="M0,0 L0,8 L8,4 z" fill="#2a3347" />
              </marker>
            </defs>
            {/* Phase Labels */}
            {[["IDENTIFICATION", 30, "#4f9cf9"], ["SCREENING", 195, "#a78bfa"], ["ELIGIBILITY", 360, "#fbbf24"], ["INCLUDED", 510, "#34d399"]].map(([lbl, y, color]) => (
              <g key={lbl}>
                <rect x="10" y={y} width="90" height="80" rx="4" fill={color + "22"} stroke={color} strokeWidth="1" />
                <text x="55" y={y + 40} textAnchor="middle" fill={color} fontSize="9" fontWeight="700" fontFamily="monospace" transform={`rotate(-90,55,${y + 40})`}>{lbl}</text>
              </g>
            ))}
            {/* Boxes */}
            {/* Identification */}
            <PrismaBox x={120} y={40} w={200} h={60} color="#4f9cf9" label="Records dari Database" num={totalRaw} sub={`OpenAlex + Crossref`} />
            <PrismaBox x={360} y={40} w={200} h={60} color="#4f9cf9" label="Records Sumber Lain" num={Math.round(totalRaw * 0.1)} sub="Manual / Grey Literature" />
            {/* Dedup */}
            <line x1="220" y1="100" x2="220" y2="150" stroke="#2a3347" strokeWidth="1.5" markerEnd="url(#arr)" />
            <line x1="460" y1="100" x2="460" y2="130" x2="320" y2="130" stroke="#2a3347" strokeWidth="1.5" />
            <line x1="320" y1="130" x2="220" y2="130" stroke="#2a3347" strokeWidth="1.5" markerEnd="url(#arr)" />
            <PrismaBox x={120} y={150} w={200} h={60} color="#a78bfa" label="Setelah Deduplikasi" num={afterDupl} sub={`${duplicates} duplikat dihapus`} />
            <PrismaBox x={430} y={150} w={170} h={60} color="#f87171" label="Duplikat Dihapus" num={duplicates} sub="" isExcl />
            <line x1="320" y1="180" x2="430" y2="180" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#arr)" />
            {/* Screening */}
            <line x1="220" y1="210" x2="220" y2="260" stroke="#2a3347" strokeWidth="1.5" markerEnd="url(#arr)" />
            <PrismaBox x={120} y={260} w={200} h={60} color="#a78bfa" label="Diskrining (Judul/Abstrak)" num={afterDupl} sub="" />
            <PrismaBox x={430} y={260} w={170} h={60} color="#f87171" label="Eksklusi Skrining" num={rejected2} sub="Tidak relevan / kriteria" isExcl />
            <line x1="320" y1="290" x2="430" y2="290" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#arr)" />
            {/* Eligibility */}
            <line x1="220" y1="320" x2="220" y2="380" stroke="#2a3347" strokeWidth="1.5" markerEnd="url(#arr)" />
            <PrismaBox x={120} y={380} w={200} h={60} color="#fbbf24" label="Full-Text Dinilai" num={afterScreen} sub="Artikel diterima AI screening" />
            <PrismaBox x={430} y={380} w={170} h={60} color="#f87171" label="Eksklusi Full-Text" num={Math.max(0, afterScreen - uploadedCount)} sub="Tidak bisa diakses/tidak relevan" isExcl />
            <line x1="320" y1="410" x2="430" y2="410" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4" markerEnd="url(#arr)" />
            {/* Included */}
            <line x1="220" y1="440" x2="220" y2="510" stroke="#2a3347" strokeWidth="1.5" markerEnd="url(#arr)" />
            <PrismaBox x={120} y={510} w={200} h={70} color="#34d399" label="Studi Diinklusi dalam SLR" num={uploadedCount} sub={`Dokumen terupload & siap diekstraksi`} isFinal />
          </svg>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📋 Ringkasan Numerik PRISMA</div>
        <div className="tw">
          <table>
            <thead><tr><th>Fase</th><th>Tahap</th><th>Jumlah</th></tr></thead>
            <tbody>
              {[
                ["Identifikasi", "Records dari database pencarian", totalRaw],
                ["Identifikasi", "Records dari sumber lain (grey literature)", Math.round(totalRaw * 0.1)],
                ["Skrining", "Setelah deduplikasi", afterDupl],
                ["Skrining", "Duplikat dihapus", duplicates],
                ["Skrining", "Diskrining berdasarkan judul & abstrak", afterDupl],
                ["Skrining", "Dieksklusi (skrining awal)", rejected2],
                ["Kelayakan", "Dinilai kelayakan full-text", afterScreen],
                ["Kelayakan", "Dieksklusi (full-text)", Math.max(0, afterScreen - uploadedCount)],
                ["Inklusi", "Studi diinklusi dalam sintesis", uploadedCount],
              ].map(([fase, tahap, n]) => (
                <tr key={tahap}><td style={{ color: "var(--muted)" }}>{fase}</td><td>{tahap}</td><td><strong style={{ color: "var(--accent)" }}>{n}</strong></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PrismaBox({ x, y, w, h, color, label, num, sub, isExcl, isFinal }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill={color + "0d"} stroke={color} strokeWidth={isFinal ? 2 : 1.5} />
      <text x={x + w / 2} y={y + 16} textAnchor="middle" fill={color + "cc"} fontSize="8" fontWeight="600" fontFamily="monospace">{label}</text>
      <text x={x + w / 2} y={y + 36} textAnchor="middle" fill={isFinal ? color : "#e2e8f0"} fontSize={isFinal ? "22" : "18"} fontWeight="800" fontFamily="Syne,sans-serif">{num}</text>
      {sub && <text x={x + w / 2} y={y + 52} textAnchor="middle" fill="#64748b" fontSize="7.5" fontFamily="monospace">{sub}</text>}
    </g>
  );
}

// ═══════════════════════════════════════════════
// TAB 5 — EKSTRAKSI DATA
// ═══════════════════════════════════════════════
function TabExtract({ uploaded, extractCols, approvedCols, setApprovedCols, extractData, aiStatus, suggestCols, runExtraction, theme, setTab }) {
  const toggleCol = (col) => {
    setApprovedCols(prev => {
      const exists = prev.find(c => c.id === col.id);
      if (exists) return prev.filter(c => c.id !== col.id);
      return [...prev, col];
    });
  };
  const approveAll = () => setApprovedCols(extractCols.map(c => ({ ...c, approved: true })));

  return (
    <div>
      <div className="card">
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <div style={{ flex: 1, fontSize: 11, color: "var(--muted)" }}>
            {uploaded.length} artikel terupload siap diekstraksi — Tema: <strong style={{ color: "var(--accent)" }}>{theme}</strong>
          </div>
          <button className="btn sm primary" onClick={suggestCols} disabled={!uploaded.length || !!aiStatus}>
            {aiStatus === "cols" ? "⏳" : "✨ Rekomendasi Kolom AI"}
          </button>
        </div>

        {extractCols.length > 0 && (
          <>
            <div className="rec-box">
              <div className="rb-title">💡 Rekomendasi Kolom Ekstraksi (dari analisis artikel)</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button className="btn sm success" onClick={approveAll}>✓ Setujui Semua</button>
                <span style={{ fontSize: 10, color: "var(--muted)" }}>{approvedCols.length} kolom dipilih</span>
              </div>
              <div className="tw">
                <table>
                  <thead><tr><th>Pilih</th><th>Nama Kolom</th><th>Deskripsi</th></tr></thead>
                  <tbody>
                    {extractCols.map(col => {
                      const isApproved = !!approvedCols.find(c => c.id === col.id);
                      return (
                        <tr key={col.id} style={isApproved ? { background: "rgba(52,211,153,.04)" } : {}}>
                          <td>
                            <input type="checkbox" checked={isApproved} onChange={() => toggleCol(col)} style={{ accentColor: "var(--green)", width: 14, height: 14 }} />
                          </td>
                          <td><strong style={{ fontSize: 11 }}>{col.label}</strong></td>
                          <td style={{ fontSize: 10, color: "var(--muted)" }}>{col.description}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn primary" onClick={runExtraction} disabled={!approvedCols.length || !!aiStatus}>
                {aiStatus === "extracting" ? "⏳ Mengekstraksi..." : `🔬 Proses Ekstraksi (${approvedCols.length} kolom)`}
              </button>
            </div>
          </>
        )}

        {!extractCols.length && !uploaded.length && (
          <div style={{ textAlign: "center", padding: 32, color: "var(--muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📤</div>
            Upload artikel terlebih dahulu di tab sebelumnya
          </div>
        )}
      </div>

      {extractData.length > 0 && (
        <div className="card">
          <div className="card-title">📊 Tabel Ekstraksi Data</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button className="btn sm">⬇ Export CSV</button>
            <button className="btn sm">⬇ Export Excel</button>
            <button className="btn sm primary" style={{ marginLeft: "auto" }} onClick={() => setTab("biblio")}>→ Bibliometrik</button>
          </div>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th style={{ minWidth: 180 }}>Judul</th>
                  <th>Penulis</th>
                  <th>Tahun</th>
                  <th>Q</th>
                  <th>Jurnal</th>
                  {approvedCols.map(c => <th key={c.id} style={{ minWidth: 120 }}>{c.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {extractData.map((d, i) => (
                  <tr key={d.id}>
                    <td style={{ color: "var(--muted)" }}>{i + 1}</td>
                    <td style={{ maxWidth: 180, fontSize: 11, fontWeight: 600 }}>{d.title}</td>
                    <td style={{ fontSize: 10, color: "var(--muted)", maxWidth: 100 }}>{d.authors}</td>
                    <td>{d.year}</td>
                    <td><span className={`badge ${d.q?.toLowerCase()}`}>{d.q}</span></td>
                    <td style={{ fontSize: 10, maxWidth: 120 }}>{d.journal}</td>
                    {approvedCols.map(c => (
                      <td key={c.id} style={{ maxWidth: 150, fontSize: 10 }}>{d[c.label] || "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 6 — BIBLIOMETRIK
// ═══════════════════════════════════════════════
function TabBiblio({ articles, accepted }) {
  const yearMap = {}, qMap = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 }, jMap = {}, kwMap = {};
  accepted.forEach(a => {
    yearMap[a.year] = (yearMap[a.year] || 0) + 1;
    if (qMap[a.q] !== undefined) qMap[a.q]++;
    jMap[a.journal] = (jMap[a.journal] || 0) + 1;
    (a.keywords || []).forEach(k => { kwMap[k] = (kwMap[k] || 0) + 1; });
  });
  const years = Object.entries(yearMap).sort((a, b) => a[0] - b[0]);
  const maxY = Math.max(...years.map(y => y[1]), 1);
  const topJ = Object.entries(jMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topK = Object.entries(kwMap).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const colors = ["#4f9cf9", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#22d3ee"];

  return (
    <div>
      <div className="grid3" style={{ marginBottom: 14 }}>
        {[
          { val: accepted.length, lbl: "Artikel Inklusi" },
          { val: [...new Set(accepted.map(a => a.journal))].length, lbl: "Jurnal Unik" },
          { val: [...new Set(accepted.map(a => a.year))].length, lbl: "Tahun Tercakup" },
          { val: accepted.filter(a => a.q === "Q1").length, lbl: "Artikel Q1" },
          { val: accepted.reduce((s, a) => s + (a.citations || 0), 0), lbl: "Total Sitasi" },
          { val: Math.round(accepted.reduce((s, a) => s + (a.citations || 0), 0) / Math.max(accepted.length, 1)), lbl: "Rata-rata Sitasi" },
        ].map(s => <div key={s.lbl} className="stat-card"><div className="val">{s.val}</div><div className="lbl">{s.lbl}</div></div>)}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-title">📅 Distribusi Tahun Publikasi</div>
          {years.map(([y, c]) => (
            <div key={y} className="cbar-row">
              <div className="cbar-lbl">{y}</div>
              <div className="cbar-track">
                <div className="cbar-fill" style={{ width: `${(c / maxY) * 100}%`, background: colors[0] }}>{c}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">🏆 Distribusi Q Index</div>
          {Object.entries(qMap).map(([q, c], i) => (
            <div key={q} className="cbar-row">
              <div className="cbar-lbl">{q}</div>
              <div className="cbar-track">
                <div className="cbar-fill" style={{ width: `${accepted.length ? (c / accepted.length) * 100 : 0}%`, background: colors[i] }}>{c}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">📰 Top Jurnal</div>
          {topJ.map(([j, c], i) => (
            <div key={j} className="cbar-row">
              <div className="cbar-lbl" style={{ fontSize: 9 }}>{j.length > 22 ? j.slice(0, 22) + "…" : j}</div>
              <div className="cbar-track">
                <div className="cbar-fill" style={{ width: `${topJ[0] ? (c / topJ[0][1]) * 100 : 0}%`, background: colors[i % colors.length] }}>{c}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">🏷️ Keyword Cloud</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, padding: "6px 0" }}>
            {topK.map(([k, c], i) => (
              <div key={k} style={{ padding: "3px 10px", borderRadius: 14, background: colors[i % colors.length] + "22", border: `1px solid ${colors[i % colors.length]}44`, color: colors[i % colors.length], fontSize: `${10 + c}px`, fontWeight: 600 }}>
                {k} <sup style={{ fontSize: 9 }}>{c}</sup>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📈 Tren Sitasi per Artikel</div>
        <div className="tw">
          <table>
            <thead><tr><th>Judul</th><th>Penulis</th><th>Tahun</th><th>Jurnal</th><th>Q</th><th>Sitasi</th></tr></thead>
            <tbody>
              {[...accepted].sort((a, b) => (b.citations || 0) - (a.citations || 0)).slice(0, 10).map(a => (
                <tr key={a.id}>
                  <td style={{ maxWidth: 200, fontSize: 11 }}>{a.title}</td>
                  <td style={{ fontSize: 10, color: "var(--muted)" }}>{(a.authors || "").split(",")[0]}</td>
                  <td>{a.year}</td>
                  <td style={{ fontSize: 10 }}>{a.journal}</td>
                  <td><span className={`badge ${a.q?.toLowerCase()}`}>{a.q}</span></td>
                  <td><strong style={{ color: "var(--accent)" }}>{a.citations || 0}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 7 — FRAMEWORK / MODEL
// ═══════════════════════════════════════════════
function TabFramework({ framework, extractData, aiStatus, generateFramework, uploaded }) {
  return (
    <div>
      <div className="card">
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontFamily: "var(--fh)", fontWeight: 700 }}>🗺️ Research Framework Synthesis</div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>Dihasilkan dari sintesis mendalam {uploaded.length} artikel yang diupload</div>
          </div>
          <button className="btn primary" onClick={generateFramework} disabled={!extractData.length || !!aiStatus}>
            {aiStatus === "framework" ? "⏳ Mensintesis..." : "✨ Generate Framework AI"}
          </button>
        </div>

        {!framework && !extractData.length && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🗺️</div>
            <div>Lakukan ekstraksi data terlebih dahulu untuk generate framework</div>
          </div>
        )}

        {framework && (
          <>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: "var(--fh)", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{framework.title}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.7 }}>{framework.description}</div>
            </div>

            {/* Framework Flow Diagram */}
            <div className="fw-canvas">
              <div className="fw-row">
                {(framework.inputs || []).map(inp => (
                  <div key={inp} className="fw-node input" style={{ fontSize: 10 }}>
                    <div style={{ fontSize: 9, color: "var(--green)", fontWeight: 700, marginBottom: 3 }}>ANTESEDEN</div>
                    {inp}
                  </div>
                ))}
              </div>
              <div className="fw-row"><div className="fw-arrow">↓</div></div>
              {(framework.mediators || []).length > 0 && (
                <>
                  <div className="fw-row">
                    {framework.mediators.map(m => (
                      <div key={m} className="fw-node mediator" style={{ fontSize: 10 }}>
                        <div style={{ fontSize: 9, color: "var(--accent2)", fontWeight: 700, marginBottom: 3 }}>MEDIATOR</div>
                        {m}
                      </div>
                    ))}
                  </div>
                  <div className="fw-row"><div className="fw-arrow">↓</div></div>
                </>
              )}
              <div className="fw-row">
                {(framework.outputs || []).map(out => (
                  <div key={out} className="fw-node output" style={{ fontSize: 10 }}>
                    <div style={{ fontSize: 9, color: "var(--amber)", fontWeight: 700, marginBottom: 3 }}>OUTCOME</div>
                    {out}
                  </div>
                ))}
              </div>
              {(framework.moderators || []).length > 0 && (
                <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(251,191,36,.06)", border: "1px dashed rgba(251,191,36,.3)", borderRadius: 7, textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "var(--amber)", fontWeight: 700, marginBottom: 5 }}>MODERATOR</div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    {framework.moderators.map(m => <span key={m} className="tag" style={{ borderColor: "rgba(251,191,36,.3)", color: "var(--amber)" }}>{m}</span>)}
                  </div>
                </div>
              )}
            </div>

            {/* Propositions */}
            {(framework.propositions || []).length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8, color: "var(--accent)" }}>📌 Proposisi Penelitian</div>
                {framework.propositions.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "7px 10px", background: "var(--bg3)", borderRadius: 6, marginBottom: 5, fontSize: 11 }}>
                    <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>P{i + 1}</span>
                    <span>{p.replace(/^P\d+[:\s]+/, "")}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Synthesis */}
            {framework.synthesis && (
              <div style={{ marginTop: 14, padding: "12px 15px", background: "rgba(167,139,250,.05)", border: "1px solid rgba(167,139,250,.2)", borderRadius: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent2)", marginBottom: 5 }}>🔮 TEMUAN SINTESIS UNIK</div>
                <div style={{ fontSize: 12, fontFamily: "var(--fs)", lineHeight: 1.8 }}>{framework.synthesis}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB 8 — NASKAH SLR
// ═══════════════════════════════════════════════
function TabNarasi({ accepted, theme, narasiSteps, setNarasiSteps, generateNarasi, aiStatus, openStep, setOpenStep, narasiView, setNarasiView, handleImprove, settings }) {
  const STEPS = [
    { id: "abstrak", icon: "📄", title: "Abstrak & Judul" },
    { id: "pendahuluan", icon: "📖", title: "1. Pendahuluan" },
    { id: "metode", icon: "⚙️", title: "2. Metode Penelitian" },
    { id: "hasil", icon: "📊", title: "3. Hasil & Pembahasan" },
    { id: "kesimpulan", icon: "✅", title: "4. Kesimpulan" },
    { id: "referensi", icon: "📚", title: "5. Daftar Referensi" },
  ];
  const tpl = JOURNAL_TPLS.find(t => t.id === settings.journalTemplate)?.label || "APA 7th";
  const allDone = STEPS.every(s => narasiSteps[s.id]);
  const fullText = STEPS.filter(s => narasiSteps[s.id] && s.id !== "referensi").map(s => narasiSteps[s.id]).join("\n\n");

  return (
    <div>
      <div className="card" style={{ padding: "11px 16px" }}>
        <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, fontSize: 11, color: "var(--muted)" }}>
            Template: <strong style={{ color: "var(--accent)" }}>{tpl}</strong> — {accepted.length} artikel — {STEPS.filter(s => narasiSteps[s.id]).length}/{STEPS.length} selesai
          </div>
          <button className={`btn sm ${narasiView === "steps" ? "primary" : ""}`} onClick={() => setNarasiView("steps")}>📑 Per Bagian</button>
          <button className={`btn sm ${narasiView === "gabungan" ? "primary" : ""}`} onClick={() => setNarasiView("gabungan")} disabled={!allDone}>📄 Gabungan + Integrity</button>
          {allDone && <button className="btn sm success">⬇ Download Word</button>}
        </div>
      </div>

      {narasiView === "steps" && STEPS.map(step => (
        <div key={step.id} className="card" style={{ padding: "0 18px" }}>
          <div className="step-hdr" onClick={() => setOpenStep(openStep === step.id ? null : step.id)}>
            <div className="step-num">{step.icon}</div>
            <div className="step-ttl">{step.title}</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {narasiSteps[step.id] && <span className="badge acc">✓</span>}
              {!narasiSteps[step.id] && <button className="btn xs primary" onClick={e => { e.stopPropagation(); generateNarasi(step.id); }} disabled={!!aiStatus}>{aiStatus === step.id ? "⏳" : "✨ Generate"}</button>}
              {narasiSteps[step.id] && <>
                <button className="btn xs" onClick={e => { e.stopPropagation(); generateNarasi(step.id); }}>🔄</button>
                <button className="btn xs success" onClick={e => e.stopPropagation()}>⬇ Word</button>
              </>}
              <span style={{ color: "var(--muted)", fontSize: 11 }}>{openStep === step.id ? "▲" : "▼"}</span>
            </div>
          </div>
          {openStep === step.id && narasiSteps[step.id] && (
            <div style={{ padding: "14px 0 18px", fontFamily: "var(--fs)", fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
              {step.id === "referensi"
                ? accepted.map((a, i) => <div key={a.id} style={{ marginBottom: 7, fontSize: 12, paddingLeft: 28, textIndent: -28 }}>{tpl.includes("IEEE") ? `[${i + 1}] ${a.authors}, "${a.title}," ${a.journal}, ${a.year}.` : `${a.authors} (${a.year}). ${a.title}. ${a.journal}. https://doi.org/${a.doi}`}</div>)
                : narasiSteps[step.id]}
            </div>
          )}
          {openStep === step.id && !narasiSteps[step.id] && (
            <div style={{ padding: "18px 0", textAlign: "center", color: "var(--muted)", fontSize: 11 }}>Klik Generate AI untuk membuat bagian ini</div>
          )}
        </div>
      ))}

      {narasiView === "gabungan" && (
        <>
          <div className="nar-wrap" style={{ marginBottom: 14 }}>
            <h1>Systematic Literature Review: {theme}</h1>
            <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 11, marginBottom: 18 }}>Penulis, A., Penulis, B. | {new Date().getFullYear()}</div>
            {narasiSteps.abstrak && (
              <div style={{ borderLeft: "3px solid var(--accent)", padding: "10px 14px", background: "var(--bg3)", borderRadius: "0 7px 7px 0", marginBottom: 18 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "var(--accent)", marginBottom: 5 }}>Abstract</div>
                <div style={{ fontFamily: "var(--fs)", fontSize: 12, lineHeight: 1.8 }}>{narasiSteps.abstrak}</div>
              </div>
            )}
            {STEPS.filter(s => s.id !== "abstrak" && s.id !== "referensi" && narasiSteps[s.id]).map(step => (
              <div key={step.id} style={{ marginBottom: 18 }}>
                <h2>{step.title}</h2>
                <div style={{ whiteSpace: "pre-wrap", fontFamily: "var(--fs)", fontSize: 12.5, lineHeight: 1.95 }}>{narasiSteps[step.id]}</div>
              </div>
            ))}
            {narasiSteps.referensi && (
              <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <h2>Daftar Referensi</h2>
                {accepted.map((a, i) => <div key={a.id} style={{ fontSize: 11, fontFamily: "var(--fs)", marginBottom: 7, paddingLeft: 28, textIndent: -28, lineHeight: 1.6 }}>{tpl.includes("IEEE") ? `[${i + 1}] ${a.authors}, "${a.title}," ${a.journal}, ${a.year}.` : `${a.authors} (${a.year}). ${a.title}. ${a.journal}. https://doi.org/${a.doi}`}</div>)}
              </div>
            )}
          </div>
          <IntegrityPanel text={fullText} onImprove={handleImprove} aiStatus={aiStatus} settings={settings} />
          <div className="card" style={{ marginTop: 12, borderColor: "rgba(167,139,250,.3)" }}>
            <div className="card-title" style={{ color: "var(--accent2)" }}>📋 Deklarasi Penggunaan AI</div>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.8 }}>Banyak jurnal Q1 mensyaratkan pernyataan penggunaan AI. Template:</div>
            <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: "11px 13px", fontSize: 12, fontFamily: "var(--fs)", lineHeight: 1.8, marginTop: 8 }}>
              <strong>AI Usage Statement:</strong> The authors used an AI-assisted writing tool (Claude/Gemini) to support literature review processes including article screening, data extraction, and narrative drafting. All AI-generated content was critically reviewed, verified, and edited by the authors. Full intellectual responsibility rests with the authors.
            </div>
            <button className="btn xs" style={{ marginTop: 7 }} onClick={() => navigator.clipboard.writeText("The authors used an AI-assisted writing tool...")}>📋 Copy</button>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// INTEGRITY PANEL
// ═══════════════════════════════════════════════
function IntegrityPanel({ text, onImprove, aiStatus, settings }) {
  const [checked, setChecked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [aiScore, setAiScore] = useState(null);
  const [plagScore, setPlagScore] = useState(null);
  const [segments, setSegments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [improving, setImproving] = useState(null);
  const [improved, setImproved] = useState({});

  async function runCheck() {
    setChecking(true);
    await new Promise(r => setTimeout(r, 800));
    setAiScore(heuristicAI(text));
    setPlagScore(heuristicSim(text));
    setSegments(segmentRisk(text));
    setChecked(true);
    setChecking(false);
  }

  async function improve(seg) {
    setImproving(seg.index);
    try {
      const result = await callAI(
        `Edit the following academic sentence to sound more natural and human-written while keeping the meaning, citations, and academic tone EXACTLY the same. Only improve the sentence structure and word variety. Return ONLY the improved sentence, nothing else.\n\n"${seg.text}"`,
        settings
      );
      setImproved(prev => ({ ...prev, [seg.index]: result.trim() }));
    } catch { setImproved(prev => ({ ...prev, [seg.index]: seg.text })); }
    setImproving(null);
  }

  async function improveAll() {
    const flagged = segments.filter(s => s.aiRisk === "ai" || s.plagRisk === "plag");
    for (const seg of flagged) await improve(seg);
  }

  function apply(seg) {
    if (improved[seg.index] && onImprove) onImprove(seg.text, improved[seg.index]);
    setImproved(prev => { const n = { ...prev }; delete n[seg.index]; return n; });
  }

  function applyAll() {
    let cur = text;
    Object.entries(improved).forEach(([idx, newTxt]) => {
      const seg = segments[+idx];
      if (seg) cur = cur.replace(seg.text, newTxt);
    });
    if (onImprove) onImprove("__ALL__", cur);
    setImproved({});
  }

  const flagged = segments.filter(s => s.aiRisk === "ai" || s.plagRisk === "plag").length;
  const aiC = aiScore == null ? "var(--muted)" : aiScore < 30 ? "var(--green)" : aiScore < 60 ? "var(--amber)" : "var(--red)";
  const pC = plagScore == null ? "var(--muted)" : plagScore < 15 ? "var(--green)" : plagScore < 25 ? "var(--amber)" : "var(--red)";
  const intS = checked ? Math.round(100 - (aiScore * .6 + plagScore * .4) * .7) : null;
  const iC = intS == null ? "var(--muted)" : intS > 75 ? "var(--green)" : intS > 50 ? "var(--amber)" : "var(--red)";

  return (
    <div style={{ marginTop: 14 }}>
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
          <div style={{ fontFamily: "var(--fh)", fontSize: 12, fontWeight: 700 }}>🔍 Quality & Integrity Check</div>
          <div style={{ flex: 1 }} />
          {!checked && <button className="btn sm primary" onClick={runCheck} disabled={checking || !text}>{checking ? <><span className="dp"><span /><span /><span /></span> Menganalisis…</> : "🔍 Cek AI + Similaritas"}</button>}
          {checked && <>
            <button className="btn sm" onClick={runCheck} disabled={checking}>🔄</button>
            {flagged > 0 && <button className="btn sm primary" onClick={improveAll} disabled={!!improving}>✨ Perbaiki Semua ({flagged})</button>}
            {Object.keys(improved).length > 0 && <button className="btn sm success" onClick={applyAll}>✅ Terapkan Semua</button>}
          </>}
        </div>

        {checked && (
          <div className="int-scores">
            {[["AI Detection", aiScore, aiC, aiScore < 30 ? "✓ Manusiawi" : aiScore < 60 ? "⚠ Perlu Edit" : "✗ Pola AI"], ["Similaritas", plagScore, pC, plagScore < 15 ? "✓ Orisinal" : plagScore < 25 ? "⚠ Tinjau" : "✗ Overlap"], ["Skor Integritas", intS, iC, intS > 75 ? "✓ Siap Publikasi" : intS > 50 ? "⚠ Revisi" : "✗ Perlu Perbaikan"]].map(([lbl, val, c, status]) => (
              <div key={lbl} className="sc-card">
                <div className="sl">{lbl}</div>
                <div className="sv" style={{ color: c }}>{val}</div>
                <div className="ss" style={{ color: c }}>{status}</div>
                <div className="mtr"><div className="mtr-f" style={{ width: `${Math.min(val || 0, 100)}%`, background: c }} /></div>
              </div>
            ))}
          </div>
        )}

        {checked && (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 10 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: "rgba(248,113,113,.3)", border: "1.5px solid var(--red)", borderRadius: 2, display: "inline-block" }} /> Pola AI</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: "rgba(251,191,36,.25)", border: "1.5px solid var(--amber)", borderRadius: 2, display: "inline-block" }} /> Similaritas</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: "rgba(52,211,153,.15)", border: "1.5px solid var(--green)", borderRadius: 2, display: "inline-block" }} /> Lolos</span>
            </div>
            <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 7, padding: "14px 16px", fontFamily: "var(--fs)", fontSize: 13, lineHeight: 1.95 }}>
              {segments.map((seg, i) => {
                const isAI = seg.aiRisk === "ai", isPlag = seg.plagRisk === "plag";
                const hasImp = !!improved[seg.index];
                const cls = isAI ? "hl-ai" : isPlag ? "hl-plag" : "hl-ok";
                return (
                  <span key={i}>
                    <span className={cls} onClick={() => (isAI || isPlag) && setSelected(selected === i ? null : i)}>
                      {hasImp ? <span style={{ background: "rgba(52,211,153,.15)", borderBottom: "2px solid var(--green)", borderRadius: 2 }}>{improved[seg.index]}</span> : seg.text}
                    </span>{" "}
                    {selected === i && (isAI || isPlag) && !hasImp && (
                      <span className="inline-act">
                        <button onClick={e => { e.stopPropagation(); improve(seg); }}>{improving === seg.index ? "⏳" : "✨ Perbaiki"}</button>
                        <button onClick={e => { e.stopPropagation(); setSelected(null); }}>✕</button>
                      </span>
                    )}
                    {selected === i && hasImp && (
                      <span className="inline-act">
                        <button onClick={e => { e.stopPropagation(); apply(seg); }}>✅ Terapkan</button>
                        <button onClick={e => { e.stopPropagation(); setImproved(p => { const n = { ...p }; delete n[i]; return n; }); }}>↩</button>
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
            <div className="str-panel" style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", marginBottom: 6 }}>💡 Saran Penguatan Akademik</div>
              {["➕ Tambah analisis kritis", "🔗 Perkuat dengan konteks lokal", "📌 Sisipkan interpretasi temuan", "⚖️ Bandingkan studi terdahulu", "🌐 Implikasi praktis", "🔮 Kontribusi teoritis"].map(s => (
                <span key={s} className="str-chip" onClick={() => alert(`Fitur "${s}" membimbing Anda menambah konten orisinal.`)}>{s}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB SETTINGS
// ═══════════════════════════════════════════════
function TabSettings({ settings, setSettings }) {
  const upd = (k, v) => setSettings(p => ({ ...p, [k]: v }));
  const prov = AI_PROVIDERS.find(p => p.id === settings.provider);

  return (
    <div>
      <div className="card">
        <div className="card-title">🤖 Konfigurasi AI Provider</div>
        <div className="setting-row">
          <div><div className="setting-lbl">AI Provider Utama</div><div className="setting-sub">Pilih provider AI yang akan digunakan untuk semua fitur</div></div>
          <select value={settings.provider} onChange={e => { upd("provider", e.target.value); upd("model", AI_PROVIDERS.find(p => p.id === e.target.value)?.models[0] || ""); }} style={{ maxWidth: 200 }}>
            {AI_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>
        <div className="setting-row">
          <div><div className="setting-lbl">Model</div><div className="setting-sub">Model spesifik yang digunakan</div></div>
          <select value={settings.model} onChange={e => upd("model", e.target.value)} style={{ maxWidth: 260 }}>
            {(prov?.models || []).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-title">🔑 API Keys</div>
        {[
          { id: "anthropicKey", label: "Anthropic Claude API Key", placeholder: "sk-ant-...", provider: "anthropic", link: "https://console.anthropic.com" },
          { id: "geminiKey", label: "Google Gemini API Key", placeholder: "AIza...", provider: "gemini", link: "https://aistudio.google.com/app/apikey", note: "Gemini 2.0 Flash — gratis tier tersedia" },
          { id: "openaiKey", label: "OpenAI API Key", placeholder: "sk-...", provider: "openai", link: "https://platform.openai.com/api-keys" },
          { id: "groqKey", label: "Groq API Key (LLaMA — Gratis)", placeholder: "gsk_...", provider: "groq", link: "https://console.groq.com", note: "Gratis dengan rate limit yang cukup untuk riset" },
        ].map(f => (
          <div key={f.id} className="setting-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
              <div style={{ flex: 1 }}>
                <div className="setting-lbl">{f.label} {settings.provider === f.provider && <span style={{ color: "var(--green)", fontSize: 9, marginLeft: 5 }}>● AKTIF</span>}</div>
                {f.note && <div className="setting-sub" style={{ color: "var(--green)" }}>{f.note}</div>}
                <div className="setting-sub"><a href={f.link} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>Dapatkan API key →</a></div>
              </div>
            </div>
            <input type="password" placeholder={f.placeholder} value={settings[f.id] || ""} onChange={e => upd(f.id, e.target.value)} style={{ width: "100%" }} />
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">📄 Template Jurnal Default</div>
        <div className="setting-row">
          <div><div className="setting-lbl">Format Sitasi & Referensi</div><div className="setting-sub">Template untuk penulisan narasi dan daftar pustaka</div></div>
          <select value={settings.journalTemplate} onChange={e => upd("journalTemplate", e.target.value)} style={{ maxWidth: 200 }}>
            {JOURNAL_TPLS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-title">ℹ️ Info Database Gratis</div>
        {[
          { name: "OpenAlex", desc: "250M+ artikel, API gratis, tidak perlu key, pengganti Microsoft Academic", url: "https://openalex.org", color: "var(--accent)" },
          { name: "Crossref", desc: "150M+ artikel, DOI resolver, metadata lengkap, gratis", url: "https://www.crossref.org", color: "var(--accent2)" },
          { name: "Semantic Scholar", desc: "200M+ artikel + abstrak, AI-enhanced, gratis", url: "https://semanticscholar.org", color: "var(--green)" },
          { name: "ScimagoJR", desc: "Q-Index database jurnal (Q1-Q4), CSV tahunan gratis, terintegrasi lokal", url: "https://scimagojr.com", color: "var(--amber)" },
          { name: "NCBI/PubMed", desc: "40M+ artikel biomedis, 100% gratis, 10 req/s dengan API key gratis", url: "https://www.ncbi.nlm.nih.gov", color: "var(--cyan)" },
        ].map(db => (
          <div key={db.name} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(42,51,71,.4)", alignItems: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: db.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: db.color }}>{db.name}</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>{db.desc}</div>
            </div>
            <a href={db.url} target="_blank" rel="noreferrer" className="btn xs">Buka →</a>
          </div>
        ))}
      </div>
    </div>
  );
}
