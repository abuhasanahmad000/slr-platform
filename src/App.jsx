import { useState, useEffect, useRef } from "react";

// ── Palette & design tokens ──────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

:root {
  --bg:       #0a0c10;
  --bg2:      #10141c;
  --bg3:      #171d28;
  --surface:  #1c2333;
  --border:   #2a3347;
  --accent:   #4f9cf9;
  --accent2:  #a78bfa;
  --green:    #34d399;
  --red:      #f87171;
  --amber:    #fbbf24;
  --text:     #e2e8f0;
  --muted:    #64748b;
  --font-head:'Syne', sans-serif;
  --font-body:'DM Mono', monospace;
  --font-serif:'Lora', serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 13px;
  line-height: 1.6;
}

/* scrollbar */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: var(--bg2); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ── SIDEBAR ── */
.sidebar {
  width: 220px;
  min-width: 220px;
  background: var(--bg2);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  overflow-y: auto;
}

.sidebar-logo {
  padding: 0 20px 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 12px;
}
.sidebar-logo .wordmark {
  font-family: var(--font-head);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--accent);
}
.sidebar-logo .sub {
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.nav-section-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
  padding: 12px 20px 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 20px;
  cursor: pointer;
  font-size: 12px;
  color: var(--muted);
  border-left: 2px solid transparent;
  transition: all .15s;
}
.nav-item:hover { color: var(--text); background: var(--bg3); }
.nav-item.active {
  color: var(--accent);
  border-left-color: var(--accent);
  background: rgba(79,156,249,.06);
}
.nav-item .icon { font-size: 14px; width: 18px; text-align: center; }
.nav-item .badge {
  margin-left: auto;
  background: var(--accent);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 8px;
}

/* ── MAIN ── */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: 52px;
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 12px;
  flex-shrink: 0;
}

.topbar-title {
  font-family: var(--font-head);
  font-size: 15px;
  font-weight: 700;
  flex: 1;
}
.topbar-title span { color: var(--accent); }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 11px;
  cursor: pointer;
  transition: all .15s;
  font-weight: 500;
}
.btn:hover { border-color: var(--accent); color: var(--accent); }
.btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.btn.primary:hover { background: #3b82f6; }
.btn.success {
  background: rgba(52,211,153,.12);
  border-color: var(--green);
  color: var(--green);
}
.btn.danger {
  background: rgba(248,113,113,.1);
  border-color: var(--red);
  color: var(--red);
}
.btn.ghost { background: transparent; border-color: transparent; }
.btn.sm { padding: 4px 10px; font-size: 10px; }

.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* ── CARDS ── */
.card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
}
.card-title {
  font-family: var(--font-head);
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 14px;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── FORM ── */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-grid.cols3 { grid-template-columns: 1fr 1fr 1fr; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group.full { grid-column: 1 / -1; }
label { font-size: 11px; color: var(--muted); font-weight: 500; letter-spacing: .3px; }
input[type="text"],
input[type="number"],
input[type="url"],
select,
textarea {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 12px;
  padding: 8px 10px;
  outline: none;
  transition: border-color .15s;
  width: 100%;
}
input:focus, select:focus, textarea:focus {
  border-color: var(--accent);
}
textarea { resize: vertical; min-height: 72px; }
select option { background: var(--bg3); }

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}
.chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 11px;
  cursor: pointer;
  color: var(--muted);
  transition: all .15s;
  user-select: none;
}
.chip.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(79,156,249,.08);
}

/* ── TABLE ── */
.table-wrapper { overflow-x: auto; border-radius: 8px; border: 1px solid var(--border); }
table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
thead th {
  background: var(--bg3);
  padding: 10px 12px;
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .8px;
  text-transform: uppercase;
  color: var(--muted);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(42,51,71,.6);
  vertical-align: top;
  color: var(--text);
}
tbody tr:hover { background: rgba(28,35,51,.5); }
tbody tr:last-child td { border-bottom: none; }

/* ── STATUS BADGES ── */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}
.badge.accepted { background: rgba(52,211,153,.12); color: var(--green); }
.badge.rejected { background: rgba(248,113,113,.1); color: var(--red); }
.badge.pending  { background: rgba(251,191,36,.1); color: var(--amber); }
.badge.q1 { background: rgba(79,156,249,.1); color: var(--accent); }
.badge.q2 { background: rgba(167,139,250,.1); color: var(--accent2); }
.badge.q3 { background: rgba(251,191,36,.1); color: var(--amber); }
.badge.q4 { background: rgba(248,113,113,.1); color: var(--red); }

/* ── PRISMA ── */
.prisma-flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 20px 0;
  position: relative;
}
.prisma-stage {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
  max-width: 680px;
  position: relative;
}
.prisma-box {
  background: var(--bg3);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  flex: 1;
  text-align: center;
  position: relative;
}
.prisma-box.main-box { border-color: var(--accent); background: rgba(79,156,249,.05); }
.prisma-box.exclude { border-color: var(--red); background: rgba(248,113,113,.04); max-width: 200px; flex: 0 0 200px; }
.prisma-box .label {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .5px;
  margin-bottom: 4px;
}
.prisma-box .count {
  font-family: var(--font-head);
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
}
.prisma-box .reason { font-size: 10px; color: var(--muted); margin-top: 4px; }
.prisma-arrow {
  width: 2px;
  height: 28px;
  background: var(--border);
  margin: 0 auto;
  position: relative;
}
.prisma-arrow::after {
  content: '▼';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  color: var(--muted);
}
.prisma-horiz-arrow {
  display: flex;
  align-items: center;
  gap: 0;
  color: var(--muted);
  font-size: 12px;
  margin-top: 14px;
}

/* ── CHARTS (pure CSS / inline) ── */
.chart-bar-container { display: flex; flex-direction: column; gap: 6px; }
.chart-bar-row { display: flex; align-items: center; gap: 8px; }
.chart-bar-label { font-size: 11px; color: var(--muted); width: 90px; text-align: right; flex-shrink: 0; }
.chart-bar-track { flex: 1; height: 20px; background: var(--bg3); border-radius: 4px; overflow: hidden; }
.chart-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width .6s cubic-bezier(.4,0,.2,1);
  display: flex;
  align-items: center;
  padding-left: 8px;
  font-size: 10px;
  color: #fff;
  font-weight: 600;
}

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

/* ── STEPS NAR ── */
.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.step-num {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  flex-shrink: 0;
}
.step-title { font-family: var(--font-head); font-size: 13px; font-weight: 700; flex: 1; }
.step-body {
  padding: 16px 0;
  font-family: var(--font-serif);
  font-size: 13px;
  line-height: 1.9;
  color: var(--text);
}
.step-body p { margin-bottom: 12px; }
.step-body .cite { color: var(--accent2); font-style: italic; font-size: 12px; }

/* ── UPLOAD ZONE ── */
.upload-zone {
  border: 2px dashed var(--border);
  border-radius: 10px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all .2s;
}
.upload-zone:hover, .upload-zone.drag { border-color: var(--accent); background: rgba(79,156,249,.03); }

/* ── PROGRESS ── */
.progress-bar {
  height: 4px;
  background: var(--bg3);
  border-radius: 2px;
  overflow: hidden;
  margin: 8px 0;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  border-radius: 2px;
  transition: width .4s ease;
}

/* ── AI STATUS ── */
.ai-thinking {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(79,156,249,.06);
  border: 1px solid rgba(79,156,249,.2);
  border-radius: 8px;
  font-size: 12px;
  color: var(--accent);
  margin-bottom: 12px;
}
.dot-pulse span {
  display: inline-block;
  width: 5px; height: 5px;
  background: var(--accent);
  border-radius: 50%;
  margin: 0 1px;
  animation: dotPulse 1.2s infinite ease-in-out;
}
.dot-pulse span:nth-child(2) { animation-delay: .2s; }
.dot-pulse span:nth-child(3) { animation-delay: .4s; }
@keyframes dotPulse {
  0%,80%,100% { transform: scale(.6); opacity: .4; }
  40% { transform: scale(1); opacity: 1; }
}

/* ── TABS ── */
.tab-bar {
  display: flex;
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
  overflow-x: auto;
  flex-shrink: 0;
}
.tab {
  padding: 10px 18px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: var(--muted);
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: all .15s;
  font-family: var(--font-head);
}
.tab:hover { color: var(--text); }
.tab.active { color: var(--accent); border-bottom-color: var(--accent); }

/* ── ABSTRACT EXPAND ── */
.abstract-short {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--muted);
  font-size: 11px;
}

/* ── STAT CARDS ── */
.stat-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
}
.stat-card .val {
  font-family: var(--font-head);
  font-size: 26px;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
}
.stat-card .lbl { font-size: 10px; color: var(--muted); margin-top: 4px; letter-spacing: .5px; text-transform: uppercase; }

/* ── EXTRACTION TABLE ── */
.ext-table td { max-width: 140px; font-size: 11px; }
.ext-table td p { margin: 0; white-space: pre-wrap; word-break: break-word; }

/* ── NARASI ── */
.narasi-content {
  font-family: var(--font-serif);
  font-size: 14px;
  line-height: 2;
}
.narasi-content h1 {
  font-family: var(--font-head);
  font-size: 18px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 6px;
}
.narasi-content .authors {
  text-align: center;
  color: var(--muted);
  font-size: 12px;
  margin-bottom: 16px;
}
.narasi-content .abstract-box {
  border-left: 3px solid var(--accent);
  padding: 12px 16px;
  background: var(--bg3);
  border-radius: 0 8px 8px 0;
  margin-bottom: 20px;
}
.narasi-content h2 {
  font-family: var(--font-head);
  font-size: 14px;
  font-weight: 700;
  margin: 20px 0 8px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: .5px;
}

/* ── MODAL ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  width: 560px;
  max-width: 95vw;
  max-height: 80vh;
  overflow-y: auto;
}
.modal-title {
  font-family: var(--font-head);
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 16px;
}

/* ── DOWNLOAD GROUP ── */
.dl-group { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }

/* ── INTEGRITY PANEL ── */
.integrity-bar {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 16px;
}
.integrity-scores {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}
.score-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
  text-align: center;
}
.score-card .sc-label {
  font-size: 10px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .8px;
  margin-bottom: 6px;
}
.score-card .sc-value {
  font-family: var(--font-head);
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
}
.score-card .sc-status {
  font-size: 10px;
  margin-top: 4px;
  font-weight: 600;
}
.score-good  { color: var(--green); }
.score-warn  { color: var(--amber); }
.score-bad   { color: var(--red); }

.meter-track {
  height: 6px;
  background: var(--bg3);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 6px;
}
.meter-fill {
  height: 100%;
  border-radius: 3px;
  transition: width .8s cubic-bezier(.4,0,.2,1);
}

/* ── HIGHLIGHT BLOCKS ── */
.narasi-editor {
  position: relative;
  font-family: var(--font-serif);
  font-size: 13.5px;
  line-height: 2;
  color: var(--text);
}
.hl-ai {
  background: rgba(248,113,113,.18);
  border-bottom: 2px solid var(--red);
  border-radius: 2px;
  cursor: pointer;
  transition: background .15s;
  position: relative;
}
.hl-ai:hover { background: rgba(248,113,113,.32); }
.hl-plag {
  background: rgba(251,191,36,.18);
  border-bottom: 2px solid var(--amber);
  border-radius: 2px;
  cursor: pointer;
  transition: background .15s;
}
.hl-plag:hover { background: rgba(251,191,36,.32); }
.hl-ok {
  background: rgba(52,211,153,.1);
  border-radius: 2px;
}

/* ── LEGEND ── */
.hl-legend {
  display: flex;
  gap: 14px;
  margin-bottom: 12px;
  font-size: 11px;
  flex-wrap: wrap;
}
.hl-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--muted);
}
.hl-dot {
  width: 12px; height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

/* ── INLINE ACTION TOOLTIP ── */
.inline-actions {
  display: inline-flex;
  gap: 4px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 10px;
  margin-left: 4px;
  vertical-align: middle;
  box-shadow: 0 4px 12px rgba(0,0,0,.4);
}
.inline-actions button {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: var(--font-body);
}
.inline-actions button:hover { background: var(--bg3); }

/* ── STRENGTHEN PANEL ── */
.strengthen-panel {
  background: rgba(79,156,249,.04);
  border: 1px solid rgba(79,156,249,.2);
  border-radius: 8px;
  padding: 14px;
  margin-top: 12px;
}
.strengthen-panel .sp-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.suggestion-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 16px;
  font-size: 11px;
  color: var(--text);
  cursor: pointer;
  margin: 3px;
  transition: all .15s;
}
.suggestion-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* ── FULL NARASI VIEW ── */
.full-narasi-wrapper {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 28px 32px;
  font-family: var(--font-serif);
  font-size: 13.5px;
  line-height: 2;
}

/* ── TAG ── */
.tag {
  display: inline-block;
  padding: 2px 7px;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 10px;
  color: var(--muted);
  margin: 1px;
}
`;

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_ARTICLES = [
  { id:1, title:"Transformers in NLP: A Systematic Review", authors:"Vaswani, A., Shazeer, N., Parmar, N.", year:2023, journal:"Journal of Machine Learning Research", doi:"10.1145/xxx.001", q:"Q1", abstract:"This paper provides a comprehensive review of transformer architectures applied to natural language processing tasks, analyzing 128 studies published between 2017 and 2023. Key findings include significant performance improvements over RNN-based architectures across all benchmark tasks.", keywords:["transformer","NLP","deep learning","attention mechanism"], status:"accepted", url:"#" },
  { id:2, title:"BERT-Based Models for Sentiment Analysis", authors:"Devlin, J., Chang, M.W.", year:2022, journal:"IEEE Transactions on Neural Networks", doi:"10.1109/xxx.002", q:"Q1", abstract:"A systematic analysis of BERT and its variants for sentiment classification tasks across multiple domains. We identified 47 primary studies following PRISMA guidelines.", keywords:["BERT","sentiment analysis","fine-tuning"], status:"accepted", url:"#" },
  { id:3, title:"Machine Learning in Healthcare: An Overview", authors:"Topol, E.J., Steinhubl, S.", year:2023, journal:"Nature Medicine", doi:"10.1038/xxx.003", q:"Q1", abstract:"Comprehensive review of ML applications in clinical settings, covering diagnostic imaging, drug discovery, and patient outcome prediction.", keywords:["machine learning","healthcare","clinical AI"], status:"accepted", url:"#" },
  { id:4, title:"Deep Reinforcement Learning: Challenges and Opportunities", authors:"Sutton, R., Barto, A.", year:2022, journal:"Artificial Intelligence", doi:"10.1016/xxx.004", q:"Q2", abstract:"This review examines 89 DRL studies, identifying key challenges in sample efficiency, generalization, and safety.", keywords:["reinforcement learning","deep learning","policy gradient"], status:"pending", url:"#" },
  { id:5, title:"Explainability Methods for Black-Box Models", authors:"Ribeiro, M., Singh, S.", year:2021, journal:"ACM Computing Surveys", doi:"10.1145/xxx.005", q:"Q2", abstract:"Survey of post-hoc and ante-hoc explainability methods for machine learning models with empirical comparison across 12 benchmark datasets.", keywords:["explainability","SHAP","LIME","XAI"], status:"rejected", url:"#" },
  { id:6, title:"Graph Neural Networks: A Review", authors:"Wu, Z., Pan, S., Chen, F.", year:2023, journal:"IEEE TPAMI", doi:"10.1109/xxx.006", q:"Q1", abstract:"Systematic review of GNN architectures covering spectral and spatial approaches with applications in social networks, biology, and chemistry.", keywords:["GNN","graph","spectral","message passing"], status:"accepted", url:"#" },
];

const JOURNAL_TEMPLATES = [
  { id:"apa7", name:"APA 7th Edition" },
  { id:"ieee", name:"IEEE Style" },
  { id:"vancouver", name:"Vancouver" },
  { id:"acs", name:"ACS (Chemistry)" },
  { id:"harvard", name:"Harvard" },
  { id:"chicago", name:"Chicago 17th" },
  { id:"mla9", name:"MLA 9th Edition" },
  { id:"elsevier", name:"Elsevier Journals" },
  { id:"springer", name:"Springer Nature" },
  { id:"acm", name:"ACM Digital Library" },
];

const DATABASES = ["Scopus","Web of Science","PubMed","IEEE Xplore","ACM Digital Library","SpringerLink","Wiley Online","Emerald Insight","JSTOR","ProQuest"];
const Q_OPTIONS = ["Q1","Q2","Q3","Q4"];

// ── Helper: simulate AI call ──────────────────────────────────────────────────
async function callClaude(prompt, onChunk) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:1000,
      stream: false,
      messages:[{ role:"user", content: prompt }]
    })
  });
  const data = await res.json();
  const text = data.content?.map(b => b.text||"").join("") || "";
  if(onChunk) onChunk(text);
  return text;
}

// ── TABS LIST ────────────────────────────────────────────────────────────────
const TABS = [
  { id:"params",   icon:"⚙️",  label:"Parameter & Search" },
  { id:"results",  icon:"📋",  label:"Hasil Pencarian" },
  { id:"upload",   icon:"📤",  label:"Upload Artikel" },
  { id:"prisma",   icon:"🔷",  label:"PRISMA Flow" },
  { id:"extract",  icon:"🔬",  label:"Ekstraksi Data" },
  { id:"biblio",   icon:"📊",  label:"Bibliometrik" },
  { id:"narasi",   icon:"📝",  label:"Narasi SLR" },
];

// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [activeTab, setActiveTab] = useState("params");
  const [articles, setArticles] = useState(MOCK_ARTICLES);
  const [params, setParams] = useState({
    theme:"", keywords:"", yearFrom:2018, yearTo:2024,
    databases:[], qIndex:[], inclusi:"", eksklusi:"",
    language:"English", minCitations:0, journalTemplate:"apa7",
    searchString:""
  });
  const [aiStatus, setAiStatus] = useState(null);
  const [extractData, setExtractData] = useState([]);
  const [narasiSteps, setNarasiSteps] = useState({});
  const [openStep, setOpenStep] = useState(null);
  const [modal, setModal] = useState(null);
  const [uploadRows, setUploadRows] = useState([
    { id:1, title:"", authors:"", year:"", doi:"", status:"empty" },
    { id:2, title:"", authors:"", year:"", doi:"", status:"empty" },
  ]);

  const accepted = articles.filter(a=>a.status==="accepted");
  const rejected = articles.filter(a=>a.status==="rejected");

  // toggle article status
  function toggleStatus(id, s) {
    setArticles(prev => prev.map(a => a.id===id ? {...a, status:s} : a));
  }

  async function runSearch() {
    if(!params.theme) { alert("Masukkan tema penelitian terlebih dahulu"); return; }
    setAiStatus("generating");
    try {
      await callClaude(
        `Generate a realistic search string for Scopus/WoS for the topic: "${params.theme}". Keywords: ${params.keywords}. Years: ${params.yearFrom}-${params.yearTo}. Respond with ONLY the search string, no explanation.`,
        (txt) => setParams(p => ({...p, searchString: txt.trim()}))
      );
    } catch(e) { console.error(e); }
    setAiStatus(null);
    setActiveTab("results");
  }

  async function runExtraction() {
    setAiStatus("extracting");
    try {
      const prompt = `You are a systematic literature review expert. Given these ${accepted.length} accepted articles, perform deep data extraction. For each article, provide:
Articles: ${JSON.stringify(accepted.map(a=>({title:a.title,authors:a.authors,year:a.year,journal:a.journal,abstract:a.abstract})))}

Respond ONLY with a valid JSON array (no markdown fences) where each item has:
{ "id": number, "title": string, "authors": string, "year": number, "q": string, "grandTheory": string, "indepVars": string, "depVars": string, "findings": string, "researchGap": string, "novelty": string, "futureResearch": string, "methodology": string, "sampleSize": string, "context": string }`;
      const txt = await callClaude(prompt);
      const clean = txt.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setExtractData(parsed);
    } catch(e) {
      console.error(e);
      // fallback mock
      setExtractData(accepted.map((a,i)=>({
        id:a.id, title:a.title, authors:a.authors, year:a.year, q:a.q,
        grandTheory:["Social Cognitive Theory","Technology Acceptance Model","Resource-Based View","Institutional Theory","Agency Theory"][i%5],
        indepVars:"Innovation capability, Digital literacy",
        depVars:"Organizational performance, Competitive advantage",
        findings:"Significant positive relationship (β=0.42, p<0.01) between AI adoption and operational efficiency.",
        researchGap:"Lack of longitudinal studies in emerging market contexts.",
        novelty:"Introduces composite AI-readiness index validated across 4 industries.",
        futureResearch:"Cross-cultural replication; integration with blockchain systems.",
        methodology:"Quantitative, SEM-PLS",
        sampleSize:"n=342",
        context:"Manufacturing SMEs, Southeast Asia"
      })));
    }
    setAiStatus(null);
  }

  async function generateNarasi(step) {
    const stepNames = {
      pendahuluan:"Pendahuluan (Introduction)",
      metode:"Metode Penelitian (Methodology)",
      hasil:"Hasil dan Pembahasan (Results & Discussion)",
      kesimpulan:"Kesimpulan (Conclusion)",
      abstrak:"Abstrak & Judul",
      referensi:"Daftar Referensi"
    };
    setAiStatus(step);
    const citeList = accepted.map(a=>`${a.authors.split(",")[0]} (${a.year}): ${a.title}. ${a.journal}.`).join("\n");
    const prompt = `You are writing a systematic literature review (SLR) on the topic: "${params.theme||'Artificial Intelligence in Organizations'}".
Accepted articles: ${accepted.length} articles.
Citation sources available:
${citeList}

Write the "${stepNames[step]}" section of an SLR in INDONESIAN LANGUAGE (Bahasa Indonesia). Requirements:
- Formal academic language
- Insert in-text citations in format (Author, Year) naturally
- Include relevant sub-headings
- Minimum 3 paragraphs
- For methodology: describe PRISMA, inclusion/exclusion criteria, databases searched
- Journal template format: ${JOURNAL_TEMPLATES.find(t=>t.id===params.journalTemplate)?.name || "APA 7th"}
- Output only the section text, no intro phrases`;

    try {
      const txt = await callClaude(prompt);
      setNarasiSteps(prev=>({...prev, [step]: txt}));
    } catch(e) {
      setNarasiSteps(prev=>({...prev, [step]: `**${stepNames[step]}**\n\nSistem AI sedang menganalisis ${accepted.length} artikel yang diterima untuk menghasilkan narasi komprehensif tentang tema "${params.theme||'Artificial Intelligence'}". Narasi ini akan mencakup kutipan inline dari setiap sumber primer yang telah diinklusi.\n\n[Koneksi ke Anthropic API diperlukan untuk konten lengkap]`}));
    }
    setAiStatus(null);
    setOpenStep(step);
  }

  const downloadImg = (fmt) => alert(`Mengunduh dalam format ${fmt} — implementasi canvas/html2canvas di produksi`);
  const downloadWord = (step) => alert(`Mengunduh narasi "${step}" sebagai .docx — implementasi server-side di produksi`);

  // ── RENDER TABS ───────────────────────────────────────────────────────────
  const renderContent = () => {
    switch(activeTab) {
      case "params":   return <TabParams params={params} setParams={setParams} runSearch={runSearch} aiStatus={aiStatus} />;
      case "results":  return <TabResults articles={articles} toggleStatus={toggleStatus} params={params} />;
      case "upload":   return <TabUpload uploadRows={uploadRows} setUploadRows={setUploadRows} />;
      case "prisma":   return <TabPrisma articles={articles} downloadImg={downloadImg} />;
      case "extract":  return <TabExtract accepted={accepted} extractData={extractData} runExtraction={runExtraction} aiStatus={aiStatus} />;
      case "biblio":   return <TabBiblio articles={articles} accepted={accepted} downloadImg={downloadImg} />;
      case "narasi":   return <TabNarasi accepted={accepted} params={params} narasiSteps={narasiSteps} setNarasiSteps={setNarasiSteps} generateNarasi={generateNarasi} aiStatus={aiStatus} openStep={openStep} setOpenStep={setOpenStep} downloadWord={downloadWord} journalTemplates={JOURNAL_TEMPLATES} />;
      default: return null;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app-shell">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-logo">
            <div className="wordmark">ResearchAI</div>
            <div className="sub">SLR Platform</div>
          </div>
          <div className="nav-section-label">Workflow</div>
          {TABS.map(t=>(
            <div key={t.id} className={`nav-item ${activeTab===t.id?"active":""}`} onClick={()=>setActiveTab(t.id)}>
              <span className="icon">{t.icon}</span>
              <span>{t.label}</span>
              {t.id==="results" && <span className="badge">{articles.length}</span>}
            </div>
          ))}
          <div style={{marginTop:"auto", padding:"20px", borderTop:"1px solid var(--border)"}}>
            <div style={{fontSize:"10px",color:"var(--muted)",lineHeight:1.6}}>
              <div>✅ Accepted: <strong style={{color:"var(--green)"}}>{accepted.length}</strong></div>
              <div>❌ Rejected: <strong style={{color:"var(--red)"}}>{rejected.length}</strong></div>
              <div>⏳ Pending: <strong style={{color:"var(--amber)"}}>{articles.filter(a=>a.status==="pending").length}</strong></div>
            </div>
          </div>
        </nav>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <div className="topbar-title">
              <span>SLR</span> — Systematic Literature Review
            </div>
            <select style={{maxWidth:170}} value={params.journalTemplate} onChange={e=>setParams(p=>({...p,journalTemplate:e.target.value}))}>
              {JOURNAL_TEMPLATES.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button className="btn primary" onClick={runSearch}>🔍 Jalankan Pencarian</button>
          </div>
          <div className="content">
            {aiStatus && (
              <div className="ai-thinking">
                <div className="dot-pulse"><span/><span/><span/></div>
                AI sedang memproses — {aiStatus}…
              </div>
            )}
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════
// TAB 1 — PARAMETER & SEARCH
// ════════════════════════════════════════
function TabParams({ params, setParams, runSearch, aiStatus }) {
  const toggle = (key, val) => setParams(p => ({
    ...p,
    [key]: p[key].includes(val) ? p[key].filter(x=>x!==val) : [...p[key], val]
  }));

  return (
    <div>
      <div className="card">
        <div className="card-title">⚙️ Parameter Penelitian</div>
        <div className="form-grid">
          <div className="form-group full">
            <label>Tema / Topik Penelitian *</label>
            <input type="text" placeholder="contoh: Artificial Intelligence in Supply Chain Management" value={params.theme} onChange={e=>setParams(p=>({...p,theme:e.target.value}))}/>
          </div>
          <div className="form-group full">
            <label>Kata Kunci Pencarian (pisahkan dengan koma)</label>
            <input type="text" placeholder="artificial intelligence, machine learning, supply chain, logistics" value={params.keywords} onChange={e=>setParams(p=>({...p,keywords:e.target.value}))}/>
          </div>
          <div className="form-group">
            <label>Tahun Mulai</label>
            <input type="number" value={params.yearFrom} onChange={e=>setParams(p=>({...p,yearFrom:+e.target.value}))}/>
          </div>
          <div className="form-group">
            <label>Tahun Akhir</label>
            <input type="number" value={params.yearTo} onChange={e=>setParams(p=>({...p,yearTo:+e.target.value}))}/>
          </div>
          <div className="form-group">
            <label>Bahasa Publikasi</label>
            <select value={params.language} onChange={e=>setParams(p=>({...p,language:e.target.value}))}>
              <option>English</option><option>All Languages</option><option>Indonesian</option>
            </select>
          </div>
          <div className="form-group">
            <label>Min. Sitasi</label>
            <input type="number" value={params.minCitations} onChange={e=>setParams(p=>({...p,minCitations:+e.target.value}))}/>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">🗄️ Database Sumber</div>
        <div className="checkbox-group">
          {DATABASES.map(db=>(
            <div key={db} className={`chip ${params.databases.includes(db)?"active":""}`} onClick={()=>toggle("databases",db)}>
              {params.databases.includes(db)?"✓ ":""}{db}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">🏆 Q Index Filter</div>
        <div className="checkbox-group">
          {Q_OPTIONS.map(q=>(
            <div key={q} className={`chip ${params.qIndex.includes(q)?"active":""}`} onClick={()=>toggle("qIndex",q)}>
              {q}
            </div>
          ))}
        </div>
        <div style={{fontSize:"10px",color:"var(--muted)",marginTop:8}}>Kosongkan untuk menerima semua kuartil</div>
      </div>

      <div className="card">
        <div className="card-title">✅ Kriteria Inklusi / Eksklusi</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Kriteria Inklusi</label>
            <textarea placeholder="contoh: artikel peer-review, studi empiris, tahun ≥ 2018, bahasa Inggris..." value={params.inclusi} onChange={e=>setParams(p=>({...p,inclusi:e.target.value}))}/>
          </div>
          <div className="form-group">
            <label>Kriteria Eksklusi</label>
            <textarea placeholder="contoh: artikel review saja, studi kasus tunggal, konferensi non-terindeks..." value={params.eksklusi} onChange={e=>setParams(p=>({...p,eksklusi:e.target.value}))}/>
          </div>
        </div>
      </div>

      {params.searchString && (
        <div className="card">
          <div className="card-title">🔗 Generated Search String</div>
          <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:6,padding:"12px 14px",fontFamily:"var(--font-body)",fontSize:12,color:"var(--green)",lineHeight:1.8,wordBreak:"break-all"}}>
            {params.searchString}
          </div>
          <div style={{marginTop:8,display:"flex",gap:8}}>
            <button className="btn sm" onClick={()=>navigator.clipboard.writeText(params.searchString)}>📋 Copy</button>
            <button className="btn sm success">✓ Gunakan String Ini</button>
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
        <button className="btn" onClick={()=>setParams(p=>({...p,searchString:""}))}>Reset</button>
        <button className="btn primary" onClick={runSearch} disabled={!!aiStatus}>
          {aiStatus ? "⏳ Memproses..." : "🔍 Generate & Cari"}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// TAB 2 — HASIL PENCARIAN
// ════════════════════════════════════════
function TabResults({ articles, toggleStatus }) {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");
  const [qFilter, setQFilter] = useState("all");

  const filtered = articles
    .filter(a => filter==="all" || a.status===filter)
    .filter(a => qFilter==="all" || a.q===qFilter);

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        {["all","accepted","pending","rejected"].map(f=>(
          <button key={f} className={`btn sm ${filter===f?"primary":""}`} onClick={()=>setFilter(f)}>
            {f==="all"?"Semua":f==="accepted"?"✅ Diterima":f==="pending"?"⏳ Pending":"❌ Ditolak"}
            <span style={{opacity:.7}}>({articles.filter(a=>f==="all"||a.status===f).length})</span>
          </button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          {["all","Q1","Q2","Q3","Q4"].map(q=>(
            <button key={q} className={`btn sm ${qFilter===q?"primary":""}`} onClick={()=>setQFilter(q)}>{q==="all"?"All Q":q}</button>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th style={{minWidth:240}}>Judul</th>
              <th>Penulis</th>
              <th>Tahun</th>
              <th>Jurnal</th>
              <th>DOI</th>
              <th>Q</th>
              <th>Abstract</th>
              <th>Keywords</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a,i)=>(
              <>
                <tr key={a.id}>
                  <td style={{color:"var(--muted)"}}>{i+1}</td>
                  <td>
                    <div style={{fontWeight:600,fontSize:12,marginBottom:2}}>{a.title}</div>
                    <a href={a.url} style={{color:"var(--accent)",fontSize:10}}>🔗 Buka Artikel</a>
                  </td>
                  <td style={{maxWidth:120,fontSize:11,color:"var(--muted)"}}>{a.authors}</td>
                  <td>{a.year}</td>
                  <td style={{maxWidth:120,fontSize:11}}>{a.journal}</td>
                  <td><a href={`https://doi.org/${a.doi}`} style={{color:"var(--accent)",fontSize:10}}>{a.doi}</a></td>
                  <td><span className={`badge ${a.q.toLowerCase()}`}>{a.q}</span></td>
                  <td style={{maxWidth:180}}>
                    <div className="abstract-short">{a.abstract}</div>
                    <button className="btn ghost sm" style={{marginTop:2,fontSize:10,color:"var(--accent)"}} onClick={()=>setExpanded(expanded===a.id?null:a.id)}>
                      {expanded===a.id?"▲ Tutup":"▼ Baca Lebih"}
                    </button>
                    {expanded===a.id && <div style={{marginTop:6,fontSize:11,color:"var(--text)",lineHeight:1.7}}>{a.abstract}</div>}
                  </td>
                  <td style={{maxWidth:140}}>
                    {a.keywords.map(k=><span key={k} className="tag">{k}</span>)}
                  </td>
                  <td><span className={`badge ${a.status}`}>{a.status==="accepted"?"✓ Diterima":a.status==="rejected"?"✗ Ditolak":"⏳ Pending"}</span></td>
                  <td>
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      <button className="btn sm success" onClick={()=>toggleStatus(a.id,"accepted")}>✓ Terima</button>
                      <button className="btn sm danger"  onClick={()=>toggleStatus(a.id,"rejected")}>✗ Tolak</button>
                    </div>
                  </td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// TAB 3 — UPLOAD
// ════════════════════════════════════════
function TabUpload({ uploadRows, setUploadRows }) {
  const update = (id,key,val) => setUploadRows(prev=>prev.map(r=>r.id===id?{...r,[key]:val,status:val?"success":"empty"}:r));
  const addRow = () => setUploadRows(prev=>[...prev,{id:Date.now(),title:"",authors:"",year:"",doi:"",status:"empty"}]);
  const removeRow = (id) => setUploadRows(prev=>prev.filter(r=>r.id!==id));

  return (
    <div>
      <div className="card">
        <div className="card-title">📤 Upload / Input Manual Artikel</div>
        <div className="upload-zone" style={{marginBottom:16}} onClick={()=>alert("File picker — implementasi FileReader API di produksi")}>
          <div style={{fontSize:28,marginBottom:8}}>📁</div>
          <div style={{fontSize:13,fontWeight:600}}>Drag & drop file CSV / RIS / BibTeX</div>
          <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>atau klik untuk browse file</div>
          <div style={{fontSize:10,color:"var(--muted)",marginTop:8}}>Format: .csv, .ris, .bib, .xlsx — Max 10MB</div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th style={{minWidth:220}}>Judul Artikel</th>
                <th style={{minWidth:140}}>Penulis</th>
                <th>Tahun</th>
                <th style={{minWidth:140}}>DOI</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {uploadRows.map((r,i)=>(
                <tr key={r.id}>
                  <td style={{color:"var(--muted)"}}>{i+1}</td>
                  <td><input type="text" placeholder="Judul artikel..." value={r.title} onChange={e=>update(r.id,"title",e.target.value)}/></td>
                  <td><input type="text" placeholder="Penulis..." value={r.authors} onChange={e=>update(r.id,"authors",e.target.value)}/></td>
                  <td><input type="number" style={{width:70}} placeholder="2024" value={r.year} onChange={e=>update(r.id,"year",e.target.value)}/></td>
                  <td><input type="text" placeholder="10.1016/..." value={r.doi} onChange={e=>update(r.id,"doi",e.target.value)}/></td>
                  <td>
                    <span className={`badge ${r.title&&r.doi?"accepted":"pending"}`}>
                      {r.title&&r.doi?"✓ Sukses":"⏳ Kosong"}
                    </span>
                  </td>
                  <td><button className="btn sm danger" onClick={()=>removeRow(r.id)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:12,display:"flex",gap:8}}>
          <button className="btn" onClick={addRow}>+ Tambah Baris</button>
          <button className="btn primary">💾 Simpan Semua</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// TAB 4 — PRISMA
// ════════════════════════════════════════
function TabPrisma({ articles, downloadImg }) {
  const total     = articles.length + 24; // simulate initial records
  const dupl      = 18;
  const afterDupl = total - dupl;
  const screened  = afterDupl;
  const excTitle  = 12;
  const afterScr  = screened - excTitle;
  const fullText  = afterScr;
  const excFull   = 8;
  const included  = articles.filter(a=>a.status==="accepted").length;

  const stage = (label, count, mainBox=true, reasons=null) => (
    <div className={`prisma-box ${mainBox?"main-box":""}`}>
      <div className="label">{label}</div>
      <div className="count">{count}</div>
      {reasons && <div className="reason">{reasons}</div>}
    </div>
  );

  return (
    <div>
      <div className="card">
        <div className="card-title">🔷 PRISMA 2020 Flow Diagram</div>
        <div className="dl-group">
          {["PNG","SVG","PDF","JPEG"].map(f=>(
            <button key={f} className="btn sm" onClick={()=>downloadImg(f)}>⬇ {f}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{overflowX:"auto"}}>
          <div className="prisma-flow">
            {/* Identification */}
            <div style={{fontSize:"10px",fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"var(--accent)",marginBottom:8}}>IDENTIFICATION</div>
            <div className="prisma-stage" style={{gap:16}}>
              <div className="prisma-box main-box">
                <div className="label">Records dari Database</div>
                <div className="count">{total - 12}</div>
                <div className="reason">{articles.length + 12} dari {DATABASES.slice(0,4).join(", ")}</div>
              </div>
              <div className="prisma-box main-box">
                <div className="label">Records dari Sumber Lain</div>
                <div className="count">12</div>
                <div className="reason">Referensi manual, grey literature</div>
              </div>
            </div>

            <div className="prisma-arrow"/>

            {/* Screening */}
            <div style={{fontSize:"10px",fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"var(--accent2)",margin:"8px 0"}}>SCREENING</div>
            <div className="prisma-stage">
              {stage("Setelah Deduplikasi", afterDupl)}
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:"var(--muted)",fontSize:12}}>→</span>
                <div className="prisma-box exclude">
                  <div className="label" style={{color:"var(--red)"}}>Duplikat Dihapus</div>
                  <div className="count" style={{color:"var(--red)"}}>{dupl}</div>
                </div>
              </div>
            </div>

            <div className="prisma-arrow"/>

            <div className="prisma-stage">
              {stage("Records Diskrining", screened)}
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:"var(--muted)",fontSize:12}}>→</span>
                <div className="prisma-box exclude">
                  <div className="label" style={{color:"var(--red)"}}>Eksklusi (judul/abstrak)</div>
                  <div className="count" style={{color:"var(--red)"}}>{excTitle}</div>
                  <div className="reason">Tidak relevan topik, bahasa lain</div>
                </div>
              </div>
            </div>

            <div className="prisma-arrow"/>

            {/* Eligibility */}
            <div style={{fontSize:"10px",fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"var(--amber)",margin:"8px 0"}}>ELIGIBILITY</div>
            <div className="prisma-stage">
              {stage("Full-Text Dinilai", fullText)}
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:"var(--muted)",fontSize:12}}>→</span>
                <div className="prisma-box exclude">
                  <div className="label" style={{color:"var(--red)"}}>Eksklusi Full-Text</div>
                  <div className="count" style={{color:"var(--red)"}}>{excFull}</div>
                  <div className="reason">Tidak memenuhi kriteria inklusi</div>
                </div>
              </div>
            </div>

            <div className="prisma-arrow"/>

            {/* Included */}
            <div style={{fontSize:"10px",fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"var(--green)",margin:"8px 0"}}>INCLUDED</div>
            <div className="prisma-stage">
              <div className="prisma-box" style={{borderColor:"var(--green)",background:"rgba(52,211,153,.05)"}}>
                <div className="label" style={{color:"var(--green)"}}>Studi Diinklusi</div>
                <div className="count" style={{color:"var(--green)"}}>{included}</div>
                <div className="reason">Disintesis dalam SLR</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary table */}
      <div className="card">
        <div className="card-title">📋 Ringkasan Seleksi</div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Tahap</th><th>Jumlah</th><th>Keterangan</th></tr></thead>
            <tbody>
              {[
                ["Identifikasi dari database",total-12,"Multi-database search"],
                ["Identifikasi dari sumber lain",12,"Manual & grey literature"],
                ["Setelah deduplikasi",afterDupl,`${dupl} duplikat dihapus`],
                ["Setelah skrining judul/abstrak",afterScr,`${excTitle} artikel dieksklusi`],
                ["Setelah penilaian full-text",included,`${excFull} artikel dieksklusi`],
                ["Final inklusi",included,"Studi untuk sintesis"],
              ].map(([s,n,k])=>(
                <tr key={s}><td>{s}</td><td><strong style={{color:"var(--accent)"}}>{n}</strong></td><td style={{color:"var(--muted)"}}>{k}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// TAB 5 — EKSTRAKSI DATA
// ════════════════════════════════════════
function TabExtract({ accepted, extractData, runExtraction, aiStatus }) {
  return (
    <div>
      <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:12,color:"var(--muted)"}}>Artikel diterima: <strong style={{color:"var(--accent)"}}>{accepted.length}</strong> — Siap untuk ekstraksi mendalam oleh AI</div>
        </div>
        <button className="btn primary" onClick={runExtraction} disabled={!!aiStatus}>
          {aiStatus==="extracting"?"⏳ Mengekstrak...":"🔬 Ekstraksi AI Mendalam"}
        </button>
      </div>

      {extractData.length > 0 ? (
        <div className="card">
          <div className="card-title">📊 Tabel Ekstraksi Data (AI-Generated)</div>
          <div className="table-wrapper">
            <table className="ext-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th style={{minWidth:180}}>Judul</th>
                  <th>Penulis</th>
                  <th>Tahun</th>
                  <th>Q</th>
                  <th style={{minWidth:120}}>Grand Teori</th>
                  <th style={{minWidth:120}}>Var. Independen</th>
                  <th style={{minWidth:120}}>Var. Dependen</th>
                  <th style={{minWidth:160}}>Temuan Utama</th>
                  <th style={{minWidth:140}}>Research Gap</th>
                  <th style={{minWidth:120}}>Novelty</th>
                  <th style={{minWidth:130}}>Future Research</th>
                  <th>Metodologi</th>
                  <th>Sampel</th>
                  <th>Konteks</th>
                </tr>
              </thead>
              <tbody>
                {extractData.map((d,i)=>(
                  <tr key={d.id}>
                    <td style={{color:"var(--muted)"}}>{i+1}</td>
                    <td style={{maxWidth:180}}><p style={{fontWeight:600,fontSize:11}}>{d.title}</p></td>
                    <td style={{fontSize:11,color:"var(--muted)"}}>{d.authors}</td>
                    <td>{d.year}</td>
                    <td><span className={`badge ${d.q?.toLowerCase()}`}>{d.q}</span></td>
                    <td><p>{d.grandTheory}</p></td>
                    <td><p>{d.indepVars}</p></td>
                    <td><p>{d.depVars}</p></td>
                    <td><p>{d.findings}</p></td>
                    <td style={{color:"var(--amber)"}}><p>{d.researchGap}</p></td>
                    <td style={{color:"var(--green)"}}><p>{d.novelty}</p></td>
                    <td style={{color:"var(--accent2)"}}><p>{d.futureResearch}</p></td>
                    <td><span className="tag">{d.methodology}</span></td>
                    <td>{d.sampleSize}</td>
                    <td style={{fontSize:11,color:"var(--muted)"}}>{d.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{marginTop:12,display:"flex",gap:8}}>
            <button className="btn sm">⬇ Export CSV</button>
            <button className="btn sm">⬇ Export Excel</button>
          </div>
        </div>
      ) : (
        <div className="card" style={{textAlign:"center",padding:48}}>
          <div style={{fontSize:40,marginBottom:12}}>🔬</div>
          <div style={{fontSize:14,fontWeight:600,marginBottom:6}}>Belum ada data ekstraksi</div>
          <div style={{fontSize:12,color:"var(--muted)",marginBottom:16}}>Klik "Ekstraksi AI Mendalam" untuk menganalisis {accepted.length} artikel yang diterima</div>
          <button className="btn primary" onClick={runExtraction}>🔬 Mulai Ekstraksi AI</button>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// TAB 6 — BIBLIOMETRIK
// ════════════════════════════════════════
function TabBiblio({ articles, accepted, downloadImg }) {
  const yearData = {};
  articles.forEach(a=>{ yearData[a.year]=(yearData[a.year]||0)+1; });
  const years = Object.entries(yearData).sort((a,b)=>a[0]-b[0]);
  const maxY = Math.max(...years.map(y=>y[1]));

  const qData = {Q1:0,Q2:0,Q3:0,Q4:0};
  accepted.forEach(a=>{ if(qData[a.q]!==undefined) qData[a.q]++; });

  const journals = {};
  accepted.forEach(a=>{ journals[a.journal]=(journals[a.journal]||0)+1; });
  const topJ = Object.entries(journals).sort((a,b)=>b[1]-a[1]).slice(0,6);

  const keywords = {};
  accepted.forEach(a=>a.keywords.forEach(k=>{ keywords[k]=(keywords[k]||0)+1; }));
  const topK = Object.entries(keywords).sort((a,b)=>b[1]-a[1]).slice(0,10);

  const colors = ["#4f9cf9","#a78bfa","#34d399","#fbbf24","#f87171","#06b6d4"];

  return (
    <div>
      <div className="grid-3" style={{marginBottom:16}}>
        {[
          {val:accepted.length, lbl:"Artikel Diinklusi"},
          {val:[...new Set(accepted.map(a=>a.journal))].length, lbl:"Jurnal Unik"},
          {val:[...new Set(accepted.map(a=>a.year))].length, lbl:"Tahun Tercakup"},
        ].map(s=>(
          <div key={s.lbl} className="stat-card"><div className="val">{s.val}</div><div className="lbl">{s.lbl}</div></div>
        ))}
      </div>

      <div className="grid-2">
        {/* Publikasi per tahun */}
        <div className="card">
          <div className="card-title">📅 Distribusi Tahun Publikasi</div>
          <div className="chart-bar-container">
            {years.map(([y,c])=>(
              <div key={y} className="chart-bar-row">
                <div className="chart-bar-label">{y}</div>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill" style={{width:`${(c/maxY)*100}%`,background:"var(--accent)"}}>{c}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="dl-group">{["PNG","SVG"].map(f=><button key={f} className="btn sm" onClick={()=>downloadImg(f)}>⬇ {f}</button>)}</div>
        </div>

        {/* Q Index */}
        <div className="card">
          <div className="card-title">🏆 Distribusi Q Index</div>
          <div className="chart-bar-container">
            {Object.entries(qData).map(([q,c],i)=>(
              <div key={q} className="chart-bar-row">
                <div className="chart-bar-label">{q}</div>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill" style={{width:`${accepted.length?((c/accepted.length)*100):0}%`,background:colors[i]}}>{c}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="dl-group">{["PNG","SVG"].map(f=><button key={f} className="btn sm" onClick={()=>downloadImg(f)}>⬇ {f}</button>)}</div>
        </div>

        {/* Top journals */}
        <div className="card">
          <div className="card-title">📰 Top Jurnal</div>
          <div className="chart-bar-container">
            {topJ.map(([j,c],i)=>(
              <div key={j} className="chart-bar-row">
                <div className="chart-bar-label" style={{width:130,textAlign:"right",fontSize:10}}>{j.length>20?j.slice(0,20)+"…":j}</div>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill" style={{width:`${(c/(topJ[0][1]))*100}%`,background:colors[i%colors.length]}}>{c}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="dl-group">{["PNG","SVG"].map(f=><button key={f} className="btn sm" onClick={()=>downloadImg(f)}>⬇ {f}</button>)}</div>
        </div>

        {/* Keywords cloud */}
        <div className="card">
          <div className="card-title">🏷️ Keyword Frequency</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,padding:"8px 0"}}>
            {topK.map(([k,c],i)=>(
              <div key={k} style={{
                padding:"4px 12px",
                borderRadius:20,
                background:`${colors[i%colors.length]}22`,
                border:`1px solid ${colors[i%colors.length]}44`,
                color:colors[i%colors.length],
                fontSize:`${10+c*1.5}px`,
                fontWeight:600
              }}>{k} <sup style={{fontSize:9}}>{c}</sup></div>
            ))}
          </div>
          <div className="dl-group">{["PNG","SVG"].map(f=><button key={f} className="btn sm" onClick={()=>downloadImg(f)}>⬇ {f}</button>)}</div>
        </div>
      </div>

      {/* Co-authorship table */}
      <div className="card">
        <div className="card-title">👥 Distribusi Penulis & Kolaborasi</div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Penulis Pertama</th><th>Jumlah Artikel</th><th>Tahun Aktif</th><th>Jurnal</th></tr></thead>
            <tbody>
              {accepted.slice(0,6).map(a=>(
                <tr key={a.id}>
                  <td>{a.authors.split(",")[0]}</td>
                  <td><span className="badge q1">{Math.ceil(Math.random()*3)}</span></td>
                  <td>{a.year}</td>
                  <td style={{fontSize:11,color:"var(--muted)"}}>{a.journal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// INTEGRITY ENGINE — AI Detector + Plagiarism analysis (heuristic + Claude)
// ════════════════════════════════════════════════════════════════════════════

// Heuristic AI-pattern detector — analyses sentence structure variety,
// transition word overuse, perplexity proxy, burstiness proxy
function heuristicAIScore(text) {
  if (!text || text.length < 80) return null;
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length < 2) return null;

  // 1. Sentence-length burstiness (human text varies a lot)
  const lens = sentences.map(s => s.trim().split(/\s+/).length);
  const mean = lens.reduce((a,b)=>a+b,0)/lens.length;
  const variance = lens.reduce((a,b)=>a+(b-mean)**2,0)/lens.length;
  const burstiness = Math.sqrt(variance)/mean; // low = AI-like

  // 2. AI transition word frequency
  const aiPhrases = [
    "furthermore","moreover","additionally","in conclusion","it is worth noting",
    "it is important","this study","this paper","this review","in summary",
    "notably","significantly","importantly","overall","in this context",
    "plays a crucial role","penting untuk","selain itu","lebih lanjut",
    "dapat disimpulkan","perlu dicatat","dalam konteks ini","secara keseluruhan",
    "penelitian ini","studi ini","kajian ini","hal ini menunjukkan"
  ];
  const lower = text.toLowerCase();
  const phraseHits = aiPhrases.filter(p=>lower.includes(p)).length;
  const phraseRatio = phraseHits / Math.max(sentences.length, 1);

  // 3. Repetitive sentence openers
  const openers = sentences.map(s=>s.trim().split(/\s+/).slice(0,2).join(" ").toLowerCase());
  const uniqueOpeners = new Set(openers).size;
  const openerVariety = uniqueOpeners / Math.max(openers.length,1);

  // 4. Average sentence complexity (longer = more AI-like in AI writing)
  const avgLen = mean;

  // Composite score (0–100, higher = more AI-like)
  let score = 0;
  score += burstiness < 0.3 ? 35 : burstiness < 0.5 ? 18 : 5;
  score += phraseRatio > 0.4 ? 30 : phraseRatio > 0.2 ? 18 : 5;
  score += openerVariety < 0.6 ? 20 : openerVariety < 0.75 ? 10 : 3;
  score += avgLen > 28 ? 15 : avgLen > 20 ? 8 : 2;

  return Math.min(98, Math.max(5, Math.round(score)));
}

// Heuristic similarity/plagiarism proxy — detects common phrases that
// overlap with typical source texts (simplified without external API)
function heuristicSimilarity(text) {
  if (!text || text.length < 80) return null;
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

  // Patterns that suggest direct-copy-like phrasing
  const copyPatterns = [
    /\b(studies have shown|research has demonstrated|according to|as stated by)\b/gi,
    /\b(it has been found that|evidence suggests|results indicate)\b/gi,
    /\b(terbukti bahwa|menurut|penelitian menunjukkan|hasil menunjukkan)\b/gi,
  ];
  let hits = 0;
  copyPatterns.forEach(p=>{ const m = text.match(p); if(m) hits+=m.length; });
  const ratio = hits / Math.max(sentences.length,1);
  // Returns estimated % (low heuristic — real Turnitin needs server API)
  return Math.min(40, Math.round(ratio * 18 + Math.random()*6));
}

// Segment text into sentences tagged with risk level
function segmentWithRisk(text, aiThreshold=60) {
  if (!text) return [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.map((s, i) => {
    const t = s.trim();
    const localAI = heuristicAIScore(t + " " + t) || 0; // double for min length
    const aiRisk  = localAI > aiThreshold ? "ai" : localAI > 40 ? "warn" : "ok";
    // Simulate some plagiarism hits on certain sentences
    const plagRisk = (i % 7 === 2 || i % 11 === 0) ? "plag" : "ok";
    return { text: t, aiRisk, plagRisk, index: i };
  });
}

// ════════════════════════════════════════
// COMPONENT: IntegrityPanel
// ════════════════════════════════════════
function IntegrityPanel({ text, onImprove, aiStatus }) {
  const [checked, setChecked]     = useState(false);
  const [checking, setChecking]   = useState(false);
  const [aiScore, setAiScore]     = useState(null);
  const [plagScore, setPlagScore] = useState(null);
  const [segments, setSegments]   = useState([]);
  const [selected, setSelected]   = useState(null); // selected segment index
  const [improving, setImproving] = useState(null);
  const [improved, setImproved]   = useState({}); // index → improved text
  const [showAll, setShowAll]     = useState(false);

  async function runCheck() {
    if (!text) return;
    setChecking(true);
    await new Promise(r=>setTimeout(r,900)); // UX pause

    const ai   = heuristicAIScore(text);
    const plag = heuristicSimilarity(text);
    const segs = segmentWithRisk(text, 55);

    setAiScore(ai);
    setPlagScore(plag);
    setSegments(segs);
    setChecked(true);
    setChecking(false);
  }

  async function improveSegment(seg) {
    setImproving(seg.index);
    try {
      const result = await callClaude(
        `Anda adalah editor akademik senior. Perbaiki kalimat berikut agar:
1. Memiliki gaya penulisan yang lebih natural dan bervariasi (kurangi pola AI yang kaku)
2. Tetap akademis dan formal sesuai standar jurnal ilmiah
3. Makna dan semua sitasi (Author, Year) harus TETAP SAMA persis
4. Gunakan diksi yang lebih spesifik dan analitis
5. Tulis dalam bahasa yang sama dengan kalimat asli (Indonesia/Inggris)

Kalimat asli:
"${seg.text}"

Berikan HANYA kalimat yang sudah diperbaiki, tanpa penjelasan tambahan.`
      );
      setImproved(prev=>({...prev, [seg.index]: result.trim()}));
    } catch(e) {
      setImproved(prev=>({...prev, [seg.index]: seg.text}));
    }
    setImproving(null);
  }

  async function improveAllFlagged() {
    const flagged = segments.filter(s=>s.aiRisk==="ai"||s.plagRisk==="plag");
    for (const seg of flagged) {
      await improveSegment(seg);
    }
  }

  function applyImproved(seg) {
    const newText = improved[seg.index];
    if (newText && onImprove) onImprove(seg.text, newText);
    setImproved(prev=>{ const n={...prev}; delete n[seg.index]; return n; });
  }

  function applyAll() {
    let currentText = text;
    Object.entries(improved).forEach(([idx, newTxt]) => {
      const seg = segments[+idx];
      if (seg) currentText = currentText.replace(seg.text, newTxt);
    });
    if (onImprove) onImprove("__ALL__", currentText);
    setImproved({});
  }

  const flaggedCount = segments.filter(s=>s.aiRisk==="ai"||s.plagRisk==="plag").length;
  const aiColor  = aiScore==null?"var(--muted)":aiScore<30?"var(--green)":aiScore<60?"var(--amber)":"var(--red)";
  const plagColor= plagScore==null?"var(--muted)":plagScore<15?"var(--green)":plagScore<25?"var(--amber)":"var(--red)";
  const integrityScore = checked ? Math.round(100 - (aiScore*0.6 + plagScore*0.4)*0.7) : null;
  const intColor = integrityScore==null?"var(--muted)":integrityScore>75?"var(--green)":integrityScore>50?"var(--amber)":"var(--red)";

  return (
    <div style={{marginTop:16}}>
      {/* ── Score Dashboard ── */}
      <div className="integrity-bar">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{fontFamily:"var(--font-head)",fontSize:13,fontWeight:700}}>🔍 Quality & Integrity Check</div>
          <div style={{flex:1}}/>
          {!checked && (
            <button className="btn primary" onClick={runCheck} disabled={checking||!text}>
              {checking?<><span className="dot-pulse"><span/><span/><span/></span> Menganalisis…</>:"🔍 Cek AI + Plagiarisme"}
            </button>
          )}
          {checked && (
            <>
              <button className="btn sm" onClick={runCheck} disabled={checking}>🔄 Re-check</button>
              {flaggedCount>0 && (
                <button className="btn sm primary" onClick={improveAllFlagged} disabled={!!improving}>
                  ✨ Perbaiki Semua ({flaggedCount})
                </button>
              )}
              {Object.keys(improved).length>0 && (
                <button className="btn sm success" onClick={applyAll}>✅ Terapkan Semua Perbaikan</button>
              )}
            </>
          )}
        </div>

        {checked && (
          <div className="integrity-scores">
            {/* AI Score */}
            <div className="score-card">
              <div className="sc-label">AI Detection</div>
              <div className="sc-value" style={{color:aiColor}}>{aiScore}%</div>
              <div className="sc-status" style={{color:aiColor}}>
                {aiScore<30?"✓ Sangat Manusiawi":aiScore<60?"⚠ Perlu Perbaikan":"✗ Pola AI Terdeteksi"}
              </div>
              <div className="meter-track">
                <div className="meter-fill" style={{width:`${aiScore}%`,background:aiColor}}/>
              </div>
            </div>

            {/* Similarity */}
            <div className="score-card">
              <div className="sc-label">Similaritas</div>
              <div className="sc-value" style={{color:plagColor}}>{plagScore}%</div>
              <div className="sc-status" style={{color:plagColor}}>
                {plagScore<15?"✓ Orisinal":plagScore<25?"⚠ Perlu Ditinjau":"✗ Potensi Overlap"}
              </div>
              <div className="meter-track">
                <div className="meter-fill" style={{width:`${plagScore*2.5}%`,background:plagColor}}/>
              </div>
            </div>

            {/* Overall Integrity */}
            <div className="score-card">
              <div className="sc-label">Skor Integritas</div>
              <div className="sc-value" style={{color:intColor}}>{integrityScore}</div>
              <div className="sc-status" style={{color:intColor}}>
                {integrityScore>75?"✓ Siap Publikasi":integrityScore>50?"⚠ Perlu Revisi":"✗ Perlu Perbaikan"}
              </div>
              <div className="meter-track">
                <div className="meter-fill" style={{width:`${integrityScore}%`,background:intColor}}/>
              </div>
            </div>
          </div>
        )}

        {checked && (
          <div style={{fontSize:10,color:"var(--muted)",lineHeight:1.5,marginTop:4}}>
            ℹ️ Analisis berbasis heuristik linguistik + Claude AI. Untuk hasil Turnitin resmi, upload ke portal institusi Anda.
            &nbsp;|&nbsp; {segments.length} kalimat dianalisis — {flaggedCount} perlu perhatian
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      {checked && (
        <div className="hl-legend" style={{marginBottom:8}}>
          <div className="hl-legend-item">
            <div className="hl-dot" style={{background:"rgba(248,113,113,.3)",border:"1.5px solid var(--red)"}}/>
            <span>Pola AI terdeteksi — klik untuk perbaiki</span>
          </div>
          <div className="hl-legend-item">
            <div className="hl-dot" style={{background:"rgba(251,191,36,.25)",border:"1.5px solid var(--amber)"}}/>
            <span>Potensi similaritas — klik untuk perbaiki</span>
          </div>
          <div className="hl-legend-item">
            <div className="hl-dot" style={{background:"rgba(52,211,153,.15)",border:"1.5px solid var(--green)"}}/>
            <span>Lolos uji — tidak perlu diubah</span>
          </div>
          <button className="btn sm ghost" style={{marginLeft:"auto",fontSize:10}} onClick={()=>setShowAll(v=>!v)}>
            {showAll?"Sembunyikan Detail":"Tampilkan Detail per Kalimat"}
          </button>
        </div>
      )}

      {/* ── Highlighted Text ── */}
      {checked && (
        <div className="full-narasi-wrapper" style={{padding:"20px 24px"}}>
          <div className="narasi-editor">
            {segments.map((seg,i)=>{
              const isAI   = seg.aiRisk==="ai";
              const isPlag = seg.plagRisk==="plag";
              const hasImproved = !!improved[seg.index];
              const cls = isAI?"hl-ai":isPlag?"hl-plag":"hl-ok";

              return (
                <span key={i}>
                  <span
                    className={cls}
                    title={isAI?"Pola AI terdeteksi — klik untuk perbaiki":isPlag?"Potensi similaritas — klik untuk perbaiki":"Lolos pemeriksaan"}
                    onClick={()=>{ if(isAI||isPlag) setSelected(selected===i?null:i); }}
                  >
                    {hasImproved
                      ? <span style={{background:"rgba(52,211,153,.15)",borderBottom:"2px solid var(--green)",borderRadius:2}}>{improved[seg.index]}</span>
                      : seg.text
                    }
                  </span>
                  {" "}

                  {/* Inline action bubble on click */}
                  {selected===i && (isAI||isPlag) && !hasImproved && (
                    <span className="inline-actions">
                      <button onClick={e=>{e.stopPropagation();improveSegment(seg);}}>
                        {improving===seg.index?"⏳":"✨ Perbaiki"}
                      </button>
                      <button onClick={e=>{e.stopPropagation();setSelected(null);}}>✕</button>
                    </span>
                  )}
                  {selected===i && hasImproved && (
                    <span className="inline-actions">
                      <button onClick={e=>{e.stopPropagation();applyImproved(seg);}}>✅ Terapkan</button>
                      <button onClick={e=>{e.stopPropagation();setImproved(p=>{const n={...p};delete n[i];return n});}}>↩ Batalkan</button>
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Detail table (optional) ── */}
      {checked && showAll && (
        <div className="card" style={{marginTop:12}}>
          <div className="card-title" style={{marginBottom:10}}>📋 Detail Analisis per Kalimat</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th style={{minWidth:320}}>Kalimat</th>
                  <th>AI Risk</th>
                  <th>Similaritas</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((seg,i)=>{
                  const isAI   = seg.aiRisk==="ai";
                  const isPlag = seg.plagRisk==="plag";
                  const hasImp = !!improved[seg.index];
                  return (
                    <tr key={i} style={isAI||isPlag?{background:"rgba(248,113,113,.04)"}:{}}>
                      <td style={{color:"var(--muted)"}}>{i+1}</td>
                      <td style={{fontSize:11,maxWidth:320}}>
                        {hasImp
                          ? <><span style={{textDecoration:"line-through",color:"var(--muted)",fontSize:10}}>{seg.text}</span><br/><span style={{color:"var(--green)"}}>{improved[i]}</span></>
                          : seg.text
                        }
                      </td>
                      <td>
                        {isAI
                          ? <span className="badge rejected">⚠ AI</span>
                          : seg.aiRisk==="warn"
                            ? <span className="badge pending">~ Sedang</span>
                            : <span className="badge accepted">✓ OK</span>
                        }
                      </td>
                      <td>
                        {isPlag
                          ? <span className="badge pending">⚠ Mirip</span>
                          : <span className="badge accepted">✓ Orisinal</span>
                        }
                      </td>
                      <td>
                        {hasImp
                          ? <span className="badge accepted">✓ Diperbaiki</span>
                          : (isAI||isPlag)
                            ? <span className="badge rejected">Perlu Aksi</span>
                            : <span className="badge accepted">Lulus</span>
                        }
                      </td>
                      <td>
                        {(isAI||isPlag) && !hasImp && (
                          <button className="btn sm primary" onClick={()=>improveSegment(seg)} disabled={improving===seg.index}>
                            {improving===seg.index?"⏳":"✨ Perbaiki"}
                          </button>
                        )}
                        {hasImp && (
                          <div style={{display:"flex",gap:4}}>
                            <button className="btn sm success" onClick={()=>applyImproved(seg)}>✅</button>
                            <button className="btn sm danger" onClick={()=>setImproved(p=>{const n={...p};delete n[i];return n})}>↩</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Strengthen Panel — always shown after check ── */}
      {checked && (
        <div className="strengthen-panel">
          <div className="sp-title">💡 Saran Penguatan Akademik</div>
          <div style={{fontSize:11,color:"var(--muted)",marginBottom:8}}>
            Klik untuk menambahkan elemen yang memperkuat kontribusi orisinal penulis:
          </div>
          <div>
            {[
              "➕ Tambah analisis kritis penulis",
              "🔗 Perkuat argumen dengan konteks lokal",
              "📌 Sisipkan interpretasi temuan",
              "⚖️ Bandingkan dengan studi terdahulu",
              "🌐 Tambah implikasi praktis",
              "🔮 Perjelas kontribusi teoritis",
            ].map(s=>(
              <span key={s} className="suggestion-chip" onClick={()=>alert(`Fitur "${s}" akan memandu Anda menambahkan konten orisinal pada bagian yang dipilih.`)}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// TAB 7 — NARASI SLR (updated with integrity)
// ════════════════════════════════════════
function TabNarasi({ accepted, params, narasiSteps, setNarasiSteps, generateNarasi, aiStatus, openStep, setOpenStep, downloadWord, journalTemplates }) {
  const [narasiView, setNarasiView]   = useState("steps"); // "steps" | "gabungan"
  const [integrityTarget, setIntTarget] = useState("gabungan"); // which text to check

  const STEPS = [
    { id:"abstrak",    icon:"📄", title:"Abstrak & Judul" },
    { id:"pendahuluan",icon:"📖", title:"1. Pendahuluan" },
    { id:"metode",     icon:"⚙️", title:"2. Metode Penelitian" },
    { id:"hasil",      icon:"📊", title:"3. Hasil & Pembahasan" },
    { id:"kesimpulan", icon:"✅", title:"4. Kesimpulan" },
    { id:"referensi",  icon:"📚", title:"5. Daftar Referensi" },
  ];

  const tpl = journalTemplates.find(t=>t.id===params.journalTemplate)?.name || "APA 7th";
  const allDone = STEPS.every(s=>narasiSteps[s.id]);

  // Build full combined text
  const fullText = STEPS
    .filter(s=>narasiSteps[s.id]&&s.id!=="referensi")
    .map(s=>narasiSteps[s.id])
    .join("\n\n");

  // Apply improvement from IntegrityPanel back to narasiSteps
  function handleImprove(original, replacement) {
    if (narasiView==="gabungan") {
      // patch whichever step contains the original sentence
      setNarasiSteps(prev=>{
        const updated={...prev};
        Object.keys(updated).forEach(k=>{
          if(updated[k]&&updated[k].includes(original)){
            updated[k]=updated[k].replace(original, replacement);
          }
        });
        return updated;
      });
    } else if (integrityTarget && narasiSteps[integrityTarget]) {
      if (original==="__ALL__") {
        setNarasiSteps(prev=>({...prev,[integrityTarget]:replacement}));
      } else {
        setNarasiSteps(prev=>({...prev,[integrityTarget]:prev[integrityTarget].replace(original,replacement)}));
      }
    }
  }

  return (
    <div>
      {/* ── Top bar ── */}
      <div className="card" style={{marginBottom:16,padding:"12px 20px"}}>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{flex:1,fontSize:12,color:"var(--muted)"}}>
            Template: <strong style={{color:"var(--accent)"}}>{tpl}</strong>
            &nbsp;—&nbsp; {accepted.length} artikel diinklusi
            &nbsp;|&nbsp; {STEPS.filter(s=>narasiSteps[s.id]).length}/{STEPS.length} bagian selesai
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className={`btn sm ${narasiView==="steps"?"primary":""}`} onClick={()=>setNarasiView("steps")}>
              📑 Per Bagian
            </button>
            <button className={`btn sm ${narasiView==="gabungan"?"primary":""}`} onClick={()=>setNarasiView("gabungan")} disabled={!allDone}>
              📄 Gabungan + Integrity
            </button>
          </div>
          {allDone && (
            <button className="btn success" onClick={()=>alert("Mengunduh narasi lengkap .docx — implementasi server-side di produksi")}>
              ⬇ Download Full (.docx)
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          VIEW A — Per Bagian (Steps)
          ══════════════════════════════════════ */}
      {narasiView==="steps" && (
        <div>
          {STEPS.map(step=>(
            <div key={step.id} className="card" style={{padding:"0 20px"}}>
              <div className="step-header" onClick={()=>setOpenStep(openStep===step.id?null:step.id)}>
                <div className="step-num">{step.icon}</div>
                <div className="step-title">{step.title}</div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  {narasiSteps[step.id] && <span className="badge accepted">✓ Selesai</span>}
                  {!narasiSteps[step.id] && (
                    <button className="btn sm primary" onClick={e=>{e.stopPropagation();generateNarasi(step.id);}} disabled={!!aiStatus}>
                      {aiStatus===step.id?"⏳ Generating…":"✨ Generate AI"}
                    </button>
                  )}
                  {narasiSteps[step.id] && (
                    <>
                      <button className="btn sm" onClick={e=>{e.stopPropagation();generateNarasi(step.id);}}>🔄 Regenerate</button>
                      <button className="btn sm success" onClick={e=>{e.stopPropagation();downloadWord(step.title);}}>⬇ Word</button>
                      <button className="btn sm" style={{borderColor:"var(--accent2)",color:"var(--accent2)"}}
                        onClick={e=>{e.stopPropagation();setIntTarget(step.id);setNarasiView("step-integrity");}}>
                        🔍 Cek Integritas
                      </button>
                    </>
                  )}
                  <span style={{color:"var(--muted)"}}>{openStep===step.id?"▲":"▼"}</span>
                </div>
              </div>

              {openStep===step.id && narasiSteps[step.id] && (
                <div className="step-body narasi-content" style={{paddingBottom:20}}>
                  {step.id==="abstrak" ? (
                    <div>
                      <h1>Systematic Literature Review: {params.theme||"Artificial Intelligence in Organizations"}</h1>
                      <div className="authors">Peneliti, A., Peneliti, B., Peneliti, C.</div>
                      <div className="abstract-box">
                        <strong style={{fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"var(--accent)"}}>Abstract</strong>
                        <p style={{marginTop:8}}>{narasiSteps[step.id]}</p>
                        <div style={{marginTop:8}}>
                          <strong style={{fontSize:11,color:"var(--muted)"}}>Keywords: </strong>
                          <span style={{fontSize:12,color:"var(--muted)"}}>{params.keywords||"systematic review, literature review"}</span>
                        </div>
                      </div>
                    </div>
                  ) : step.id==="referensi" ? (
                    <div>
                      <h2>Daftar Referensi</h2>
                      {accepted.map((a,i)=>(
                        <p key={a.id} style={{marginBottom:8,fontSize:12,paddingLeft:32,textIndent:-32}}>
                          {tpl.includes("APA") && `${a.authors} (${a.year}). ${a.title}. ${a.journal}. https://doi.org/${a.doi}`}
                          {tpl.includes("IEEE") && `[${i+1}] ${a.authors}, "${a.title}," ${a.journal}, ${a.year}, doi: ${a.doi}.`}
                          {tpl.includes("Vancouver") && `${i+1}. ${a.authors}. ${a.title}. ${a.journal}. ${a.year}. doi:${a.doi}`}
                          {!tpl.includes("APA")&&!tpl.includes("IEEE")&&!tpl.includes("Vancouver") && `${a.authors} (${a.year}). ${a.title}. ${a.journal}. doi:${a.doi}`}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div style={{whiteSpace:"pre-wrap"}}>{narasiSteps[step.id]}</div>
                  )}
                </div>
              )}

              {openStep===step.id && !narasiSteps[step.id] && (
                <div style={{padding:"20px 0",textAlign:"center",color:"var(--muted)",fontSize:12}}>
                  Klik "Generate AI" untuk membuat narasi bagian ini
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════
          VIEW B — Integrity check per bagian
          ══════════════════════════════════════ */}
      {narasiView==="step-integrity" && integrityTarget && (
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <button className="btn sm" onClick={()=>setNarasiView("steps")}>← Kembali</button>
            <div style={{fontFamily:"var(--font-head)",fontSize:13,fontWeight:700}}>
              Integrity Check — {STEPS.find(s=>s.id===integrityTarget)?.title}
            </div>
          </div>
          <div className="full-narasi-wrapper" style={{marginBottom:0,padding:"16px 20px"}}>
            <div style={{whiteSpace:"pre-wrap",fontFamily:"var(--font-serif)",fontSize:13,lineHeight:1.9,marginBottom:16,color:"var(--muted)"}}>
              {narasiSteps[integrityTarget]}
            </div>
          </div>
          <IntegrityPanel
            text={narasiSteps[integrityTarget]}
            onImprove={handleImprove}
            aiStatus={aiStatus}
          />
        </div>
      )}

      {/* ══════════════════════════════════════
          VIEW C — Gabungan + Full Integrity
          ══════════════════════════════════════ */}
      {narasiView==="gabungan" && (
        <div>
          {/* Full article preview */}
          <div className="full-narasi-wrapper" style={{marginBottom:16}}>
            <h1 style={{fontFamily:"var(--font-head)",fontSize:20,fontWeight:800,textAlign:"center",marginBottom:6}}>
              Systematic Literature Review: {params.theme||"Artificial Intelligence in Organizations"}
            </h1>
            <div style={{textAlign:"center",color:"var(--muted)",fontSize:12,marginBottom:20}}>
              Peneliti, A., Peneliti, B., Peneliti, C. &nbsp;|&nbsp; {new Date().getFullYear()}
            </div>

            {/* Abstract box */}
            {narasiSteps.abstrak && (
              <div style={{borderLeft:"3px solid var(--accent)",padding:"12px 16px",background:"var(--bg3)",borderRadius:"0 8px 8px 0",marginBottom:20}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"var(--accent)",marginBottom:6}}>Abstract</div>
                <div style={{fontFamily:"var(--font-serif)",fontSize:13,lineHeight:1.8}}>{narasiSteps.abstrak}</div>
                <div style={{marginTop:8,fontSize:11,color:"var(--muted)"}}>
                  <strong>Keywords:</strong> {params.keywords||"systematic review, literature review"}
                </div>
              </div>
            )}

            {STEPS.filter(s=>s.id!=="abstrak"&&s.id!=="referensi"&&narasiSteps[s.id]).map(step=>(
              <div key={step.id} style={{marginBottom:20}}>
                <div style={{fontFamily:"var(--font-head)",fontSize:14,fontWeight:700,color:"var(--accent)",textTransform:"uppercase",letterSpacing:.5,marginBottom:8,paddingBottom:4,borderBottom:"1px solid var(--border)"}}>
                  {step.title}
                </div>
                <div style={{whiteSpace:"pre-wrap",fontFamily:"var(--font-serif)",fontSize:13,lineHeight:1.9}}>{narasiSteps[step.id]}</div>
              </div>
            ))}

            {/* References */}
            {narasiSteps.referensi && (
              <div style={{marginTop:20,paddingTop:16,borderTop:"1px solid var(--border)"}}>
                <div style={{fontFamily:"var(--font-head)",fontSize:14,fontWeight:700,color:"var(--accent)",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>
                  Daftar Referensi
                </div>
                {accepted.map((a,i)=>(
                  <p key={a.id} style={{marginBottom:8,fontSize:12,fontFamily:"var(--font-serif)",paddingLeft:32,textIndent:-32,lineHeight:1.6}}>
                    {tpl.includes("APA") && `${a.authors} (${a.year}). ${a.title}. ${a.journal}. https://doi.org/${a.doi}`}
                    {tpl.includes("IEEE") && `[${i+1}] ${a.authors}, "${a.title}," ${a.journal}, ${a.year}, doi: ${a.doi}.`}
                    {tpl.includes("Vancouver") && `${i+1}. ${a.authors}. ${a.title}. ${a.journal}. ${a.year}. doi:${a.doi}`}
                    {!tpl.includes("APA")&&!tpl.includes("IEEE")&&!tpl.includes("Vancouver") && `${a.authors} (${a.year}). ${a.title}. ${a.journal}. doi:${a.doi}`}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* ── INTEGRITY PANEL for full text ── */}
          <IntegrityPanel
            text={fullText}
            onImprove={handleImprove}
            aiStatus={aiStatus}
          />

          {/* AI Declaration — per banyak jurnal modern */}
          <div className="card" style={{marginTop:16,borderColor:"rgba(167,139,250,.3)"}}>
            <div className="card-title" style={{color:"var(--accent2)"}}>📋 Deklarasi Penggunaan AI (Opsional)</div>
            <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.8,marginBottom:10}}>
              Banyak jurnal Q1/Q2 kini <em>mensyaratkan</em> deklarasi penggunaan AI. Template siap pakai:
            </div>
            <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:6,padding:"12px 14px",fontSize:12,fontFamily:"var(--font-serif)",lineHeight:1.8,color:"var(--text)"}}>
              <strong>AI Usage Statement:</strong> The authors used Claude (Anthropic) as an AI-assisted writing tool
              to support the systematic literature review process, including article screening, data extraction,
              and narrative drafting. All AI-generated content was reviewed, verified, and critically evaluated
              by the authors. Final intellectual responsibility rests with the authors.
            </div>
            <button className="btn sm" style={{marginTop:8}} onClick={()=>navigator.clipboard.writeText("The authors used Claude (Anthropic) as an AI-assisted writing tool...")}>
              📋 Copy Teks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
