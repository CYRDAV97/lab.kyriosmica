"use client";
import { useState, useRef, useEffect, useMemo, createContext, useContext } from "react";
import * as THREE from "three";

const API = "https://api.kyriosmica.com";
const T3 = [-1, 0, 1], TL = { "-1": "−1", "0": " 0", "1": "+1" };
const TC = { "-1": "#e85454", "0": "#6366f1", "1": "#22d3ee" };
const P = { bg: "#020609", sf: "#0a0f18", cd: "#0d1320", gold: "#C9972A", gd: "#8B6914", gg: "#C9972A20", cy: "#22d3ee", cd2: "#0891b2", cg: "#22d3ee15", tx: "#d4dce8", td: "#6b7a8d", tf: "#2d3a4a", red: "#e85454", grn: "#34d399", amb: "#f59e0b", pur: "#a78bfa", org: "#fb923c", brd: "#ffffff08", ba: "#ffffff15" };

// ═══ i18n ═════════════════════════════════════════════════════════
const L = {
  fr: { analyze:"Analyser", encrypt:"Chiffrer", decrypt:"Déchiffrer", report:"Rapport", modeC:"Mode Codon", modeS:"Mode Séquence", seq:"Séquence ADN", codonIn:"Codon (3 nucléotides)", env:"Environnement cellulaire", epi:"Épigénétique · Modifications", temp:"Température", ionic:"Force ionique", super:"Superenroulement σ", methFmt:"Format: position:type (5mC, 5hmC, m6A, m4C)", mc:"Monte Carlo collapse", go:"ANALYSER · 4 POSTULATS", going:"ANALYSE EN COURS...", payload:"Payload API", ov:"4 Postulats", codons:"Codons", mut:"Mutabilité", off:"hors ligne", on:"connecté", noHigh:"Aucun site HIGH détecté", msg:"Message", encBtn:"CHIFFRER · C = P ⊕₃ K", decBtn:"DÉCHIFFRER · M = C ⊖₃ K", decrypted:"Déchiffré", cipherIn:"Texte chiffré (blocs séparés par |)", keyIn:"Clé secrète K (blocs séparés par |)", space:"Espace codon MICA-OTP", repTitle:"Rapport scientifique", repEmpty:"Lancez une analyse séquence.", copyRep:"COPIER LE RAPPORT", copied:"✓ COPIÉ", dlTex:"TÉLÉCHARGER .TEX", key:"Clé secrète", copyKey:"Copier la clé", copyCipher:"Copier le chiffré", keyCopied:"✓ Clé copiée", cipherCopied:"✓ Chiffré copié", genKey:"Clé générée aléatoirement", defineKey:"Définir une clé personnalisée", useCustomKey:"Utiliser clé personnalisée", bell:"Filtre Bell/GHZ · MPS actifs", rank:"Rang", risk:"Risque", postI:"Indétermination", postII:"Cohérence", postIII:"Résonance", postIV:"Mutabilité", sodium:"Sodium Na⁺", potassium:"Potassium K⁺", magnesium:"Magnésium Mg²⁺", perBond:"Per-bond Z_j" },
  en: { analyze:"Analyze", encrypt:"Encrypt", decrypt:"Decrypt", report:"Report", modeC:"Codon Mode", modeS:"Sequence Mode", seq:"DNA Sequence", codonIn:"Codon (3 nucleotides)", env:"Cellular environment", epi:"Epigenetics · Modifications", temp:"Temperature", ionic:"Ionic strength", super:"Supercoiling σ", methFmt:"Format: position:type (5mC, 5hmC, m6A, m4C)", mc:"Monte Carlo collapse", go:"ANALYZE · 4 POSTULATES", going:"ANALYZING...", payload:"API Payload", ov:"4 Postulates", codons:"Codons", mut:"Mutability", off:"offline", on:"connected", noHigh:"No HIGH-risk sites", msg:"Message", encBtn:"ENCRYPT · C = P ⊕₃ K", decBtn:"DECRYPT · M = C ⊖₃ K", decrypted:"Decrypted", cipherIn:"Ciphertext (blocks separated by |)", keyIn:"Secret key K (blocks separated by |)", space:"MICA-OTP codon space", repTitle:"Scientific report", repEmpty:"Run a sequence analysis first.", copyRep:"COPY REPORT", copied:"✓ COPIED", dlTex:"DOWNLOAD .TEX", key:"Secret key", copyKey:"Copy key", copyCipher:"Copy cipher", keyCopied:"✓ Key copied", cipherCopied:"✓ Cipher copied", genKey:"Randomly generated key", defineKey:"Define custom key", useCustomKey:"Use custom key", bell:"Bell/GHZ · MPS active", rank:"Rank", risk:"Risk", postI:"Indetermination", postII:"Coherence", postIII:"Resonance", postIV:"Mutability", sodium:"Sodium Na⁺", potassium:"Potassium K⁺", magnesium:"Magnesium Mg²⁺", perBond:"Per-bond Z_j" }
};
function t(lang, k) { return L[lang]?.[k] || L.fr[k] || k; }

// ═══ Design ══════════════════════════════════════════════════════
const cs = {
  card: a => ({ background: P.cd, borderRadius: 12, padding: 14, border: `1px solid ${a || P.brd}`, borderLeft: a ? `3px solid ${a}` : undefined, marginBottom: 12 }),
  input: { width: "100%", background: P.bg, border: `1px solid ${P.ba}`, borderRadius: 8, padding: "10px 14px", color: P.tx, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "'JetBrains Mono','Courier New',monospace" },
  btn: (c, bg) => ({ padding: "9px 18px", borderRadius: 8, border: `1px solid ${c}40`, background: bg || `${c}10`, color: c, fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", transition: "all .15s" }),
  lbl: c => ({ color: c || P.td, fontSize: 9, letterSpacing: 2.5, marginBottom: 6, fontFamily: "'JetBrains Mono',monospace", textTransform: "uppercase", fontWeight: 500 }),
  fn: { fontFamily: "'JetBrains Mono','Courier New',monospace" },
};
function Stat({ label, value, color, sub }) { return <div style={{ ...cs.card(color + "25"), padding: 12 }}><div style={cs.lbl()}>{label}</div><div style={{ color, fontSize: 17, fontWeight: 700, ...cs.fn }}>{value}</div>{sub && <div style={{ color: P.tf, fontSize: 8, marginTop: 2, ...cs.fn }}>{sub}</div>}</div>; }
function TritBadge({ value, sm }) { const v = String(value); return <span style={{ fontSize: sm ? 8 : 10, padding: sm ? "1px 4px" : "2px 6px", borderRadius: 4, ...cs.fn, fontWeight: 700, background: TC[v] + "15", color: TC[v], border: `1px solid ${TC[v]}20`, display: "inline-block", minWidth: sm ? 16 : 22, textAlign: "center" }}>{TL[v]}</span>; }
function CopyBtn({ text, label, doneLbl }) { const [d, setD] = useState(false); return <button onClick={() => { navigator.clipboard.writeText(text).then(() => { setD(true); setTimeout(() => setD(false), 2000); }); }} style={{ ...cs.btn(d ? P.grn : P.gold), padding: "5px 12px", fontSize: 10 }}>{d ? doneLbl : label}</button>; }

// ═══ API ═════════════════════════════════════════════════════════
async function apiCall(ep, body) {
  try {
    const r = await fetch(`${API}${ep}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) {
      let detail = `HTTP ${r.status}`;
      try { const e = await r.json(); detail = e.detail || JSON.stringify(e).slice(0, 200); } catch {}
      throw new Error(`API ${r.status}: ${detail}`);
    }
    return await r.json();
  } catch (err) {
    if (err.message.includes("fetch") || err.message.includes("Network") || err.message.includes("Failed")) return { _offline: true, _error: `${API} unreachable` };
    throw err;
  }
}

// ═══ Crypto ══════════════════════════════════════════════════════
function t3add(a, b) { const s = a + b; return s > 1 ? s - 3 : s < -1 ? s + 3 : s; }
function i2v(n, l) { const v = []; let x = ((n % 3 ** l) + 3 ** l) % 3 ** l; for (let i = 0; i < l; i++) { v.unshift((x % 3) - 1); x = Math.floor(x / 3); } return v; }
function v2i(v) { return v.reduce((a, tt) => a * 3 + (tt + 1), 0); }
function serVec(vecs) { return vecs.map(v => v.join(",")).join("|"); }
function parseVec(s) { return s.trim().split("|").map(b => b.split(",").map(Number)); }

// ═══ 3D DNA — Adaptive helix with risk coloring ══════════════════
function DNA3D({ codons, sigma, h: H }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const W = ref.current.clientWidth, Hh = H || 260;
    const sc = new THREE.Scene(); sc.background = new THREE.Color(parseInt(P.bg.slice(1), 16));
    const cam = new THREE.PerspectiveCamera(40, W / Hh, 0.1, 2000);
    const ren = new THREE.WebGLRenderer({ antialias: true, alpha: true }); ren.setSize(W, Hh); ren.setPixelRatio(Math.min(devicePixelRatio, 2));
    ref.current.innerHTML = ""; ref.current.appendChild(ren.domElement);

    // Lighting — professional 3-point
    sc.add(new THREE.AmbientLight(0x1a2840, 1.0));
    const key = new THREE.DirectionalLight(0xffffff, 0.8); key.position.set(10, 15, 12); sc.add(key);
    const fill = new THREE.DirectionalLight(0x22d3ee, 0.2); fill.position.set(-8, 5, -10); sc.add(fill);
    const rim = new THREE.PointLight(0xC9972A, 0.3, 100); rim.position.set(0, -10, 15); sc.add(rim);

    const grp = new THREE.Group(); sc.add(grp);

    // Extract bases and risk info from codons
    const codonList = codons && codons.length > 0 ? codons : null;
    let bases = [], riskColors = [];
    if (codonList) {
      codonList.forEach(c => {
        const codonStr = (c.codon || c || "").toString();
        const risk = c.risk_level || "LOW";
        const col = risk === "HIGH" ? 0xe85454 : risk === "MEDIUM" ? 0xf59e0b : null;
        codonStr.split("").forEach(b => { bases.push(b); riskColors.push(col); });
      });
    } else {
      bases = "ATCGATCGATCGATCGATCG".split("");
      riskColors = bases.map(() => null);
    }

    // Adaptive: show all bases up to 600, then sample evenly
    const totalBases = bases.length;
    const maxDisplay = 600;
    let displayBases = bases, displayRisk = riskColors;
    if (totalBases > maxDisplay) {
      const step = Math.ceil(totalBases / maxDisplay);
      displayBases = []; displayRisk = [];
      for (let i = 0; i < totalBases; i += step) { displayBases.push(bases[i]); displayRisk.push(riskColors[i]); }
    }
    const nb = displayBases.length;

    // Adaptive geometry — smaller spheres for longer sequences
    const sphereR = nb > 200 ? 0.25 : nb > 80 ? 0.35 : 0.45;
    const sg = new THREE.SphereGeometry(sphereR, nb > 200 ? 6 : 10, nb > 200 ? 6 : 10);

    // Materials
    const mAT = new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.25, metalness: 0.1 });
    const mCG = new THREE.MeshStandardMaterial({ color: 0x22d3ee, roughness: 0.25, metalness: 0.1 });
    const mHIGH = new THREE.MeshStandardMaterial({ color: 0xe85454, roughness: 0.15, metalness: 0.2, emissive: 0xe85454, emissiveIntensity: 0.3 });
    const mMED = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.15, emissive: 0xf59e0b, emissiveIntensity: 0.15 });
    const mBond = new THREE.MeshStandardMaterial({ color: 0xC9972A, transparent: true, opacity: 0.3, roughness: 0.5 });
    const mBack = new THREE.MeshStandardMaterial({ color: 0x2a3a50, roughness: 0.7, metalness: 0.05 });

    // Helix parameters — adaptive pitch
    const rd = nb > 200 ? 3.5 : 5;
    const pit = nb > 200 ? 0.5 : nb > 80 ? 0.7 : 0.9;
    const sig = sigma || -0.06;
    const turnsPerBase = 1 / 10.5;

    for (let i = 0; i < nb; i++) {
      const angle = i * turnsPerBase * Math.PI * 2 * (1 + sig * 0.5);
      const y = (i - nb / 2) * pit;
      const x1 = rd * Math.cos(angle), z1 = rd * Math.sin(angle);
      const x2 = rd * Math.cos(angle + Math.PI), z2 = rd * Math.sin(angle + Math.PI);
      const isCG = "CG".includes(displayBases[i]);

      // Pick material — risk color overrides base color
      let mat;
      if (displayRisk[i] === 0xe85454) mat = mHIGH;
      else if (displayRisk[i] === 0xf59e0b) mat = mMED;
      else mat = isCG ? mCG : mAT;

      const m1 = new THREE.Mesh(sg, mat); m1.position.set(x1, y, z1); grp.add(m1);
      const m2 = new THREE.Mesh(sg, isCG ? mCG : mAT); m2.position.set(x2, y, z2); grp.add(m2);

      // H-bond between pair
      const len = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
      const bondR = nb > 200 ? 0.03 : 0.05;
      const bd = new THREE.Mesh(new THREE.CylinderGeometry(bondR, bondR, len * 0.55, 4), mBond);
      bd.position.set((x1 + x2) / 2, y, (z1 + z2) / 2); bd.lookAt(x2, y, z2); bd.rotateX(Math.PI / 2); grp.add(bd);

      // Backbone
      if (i > 0) {
        const pa = (i - 1) * turnsPerBase * Math.PI * 2 * (1 + sig * 0.5);
        const py = (i - 1 - nb / 2) * pit;
        const backR = nb > 200 ? 0.05 : 0.09;
        [[Math.cos(pa) * rd, Math.sin(pa) * rd, x1, z1], [Math.cos(pa + Math.PI) * rd, Math.sin(pa + Math.PI) * rd, x2, z2]].forEach(([px2, pz, cx, cz]) => {
          const l = Math.sqrt((cx - px2) ** 2 + pit ** 2 + (cz - pz) ** 2);
          const bb = new THREE.Mesh(new THREE.CylinderGeometry(backR, backR, l, 4), mBack);
          bb.position.set((px2 + cx) / 2, (py + y) / 2, (pz + cz) / 2); bb.lookAt(cx, y, cz); bb.rotateX(Math.PI / 2); grp.add(bb);
        });
      }
    }

    // Adaptive camera position
    const helixHeight = nb * pit;
    const camDist = Math.max(helixHeight * 0.4, 30);
    cam.position.set(0, 0, camDist);

    // Interaction — drag rotate + scroll zoom
    let drag = false, px2 = 0, ry = 0, zoom = camDist;
    ren.domElement.onmousedown = e => { drag = true; px2 = e.clientX; };
    ren.domElement.onmousemove = e => { if (drag) { ry += (e.clientX - px2) * .006; px2 = e.clientX; } };
    ren.domElement.onmouseup = ren.domElement.onmouseleave = () => drag = false;
    ren.domElement.onwheel = e => { zoom = Math.max(15, Math.min(camDist * 3, zoom + e.deltaY * 0.05)); e.preventDefault(); };
    ren.domElement.ontouchstart = e => { if (e.touches.length === 1) { drag = true; px2 = e.touches[0].clientX; } };
    ren.domElement.ontouchmove = e => { if (drag && e.touches.length === 1) { ry += (e.touches[0].clientX - px2) * .006; px2 = e.touches[0].clientX; } };
    ren.domElement.ontouchend = () => drag = false;

    let f; const anim = () => { f = requestAnimationFrame(anim); if (!drag) ry += .002; grp.rotation.y = ry; grp.rotation.x = 0.12; cam.position.z = zoom; ren.render(sc, cam); }; anim();
    return () => { cancelAnimationFrame(f); ren.dispose(); };
  }, [codons, sigma, H]);
  return <div ref={ref} style={{ width: "100%", height: H || 260, borderRadius: 14, overflow: "hidden", border: `1px solid ${P.brd}`, cursor: "grab" }}>
    <div style={{ position: "absolute", bottom: 6, right: 10, fontSize: 7, color: P.tf, ...cs.fn, pointerEvents: "none" }}>
      {codons?.length ? `${codons.length} codons` : ""} · drag · scroll
    </div>
  </div>;
}

// ═══ Environment Panel (Na⁺/K⁺/Mg²⁺ separate) ══════════════════
function EnvPanel({ env, setEnv, lang }) {
  const s = (k, v) => setEnv(e => ({ ...e, [k]: v }));
  return <div style={cs.card(P.cy + "15")}>
    <div style={cs.lbl(P.cd2)}>{t(lang, "env")} · MICA-Kernel v3</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {[["temperature_K", t(lang, "temp"), "K", 273, 373, 0.5, P.red], ["pH", "pH", "", 4, 10, 0.1, P.grn]].map(([k, l, u, mn, mx, st, c]) => <div key={k}><div style={{ color: c, fontSize: 9, ...cs.fn }}>{l}: <b>{env[k]}{u}</b></div><input type="range" min={mn} max={mx} step={st} value={env[k]} onChange={e => s(k, +e.target.value)} style={{ width: "100%", accentColor: c }} /></div>)}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8 }}>
      {[["sodium_mM", t(lang, "sodium"), "mM", 0, 300, 5, P.pur], ["potassium_mM", t(lang, "potassium"), "mM", 0, 50, 1, P.pur], ["magnesium_mM", t(lang, "magnesium"), "mM", 0, 20, 0.5, P.gold]].map(([k, l, u, mn, mx, st, c]) => <div key={k}><div style={{ color: c, fontSize: 8, ...cs.fn }}>{l}: <b>{env[k]}{u}</b></div><input type="range" min={mn} max={mx} step={st} value={env[k]} onChange={e => s(k, +e.target.value)} style={{ width: "100%", accentColor: c }} /></div>)}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginTop: 8 }}>
      <div><div style={{ color: P.pur, fontSize: 8, ...cs.fn }}>{t(lang, "super")}: <b>{env.supercoiling_density}</b></div><input type="range" min={-0.12} max={0.06} step={0.005} value={env.supercoiling_density} onChange={e => s("supercoiling_density", +e.target.value)} style={{ width: "100%", accentColor: P.pur }} /></div>
    </div>
  </div>;
}

function parseMeth(s) { if (!s.trim()) return []; return s.split(",").map(p => { const [pos, type] = p.trim().split(":"); return { position: parseInt(pos), type: (type || "5mC").trim(), base: "C", strand: "sense" }; }).filter(m => !isNaN(m.position)); }
const defEnv = () => ({ temperature_K: 310.15, pH: 7.4, sodium_mM: 140, potassium_mM: 5, magnesium_mM: 2.5, pressure_atm: 1.0, supercoiling_density: -0.06 });
const NR3C1 = "ATGGACTCCAAAGAATCATTAACTCCTGGTAGAGAAGAAAACCCCAGCAGTGTGCTTGCTCAGGAGAGGGGAACTCAACAGCAACAAACTGATTTGTACTGTGGATGAAAACTTACACCTGGATGACCAAATGACCCTACTGCAGTACTCCTGGATGTTTCTTAAAAGAGCAGTGAAATTAGGAGATTCAGACCACAATATTTATCAAGAGCTAGGAAATCTATTGCAATGACCT";

// ═══ ANALYSEUR ════════════════════════════════════════════════════
function Analyseur({ onResults, lang, seqName, setSeqName }) {
  const [mode, setMode] = useState("sequence");
  const [seq, setSeq] = useState("");
  const [codon, setCodon] = useState("CGC");
  const [env, setEnv] = useState(defEnv());
  const [methStr, setMethStr] = useState("");
  const [runMC, setRunMC] = useState(false);
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");
  useEffect(() => { fetch(`${API}/health`).then(r => r.ok ? setOnline(true) : setOnline(false)).catch(() => setOnline(false)); }, []);
  const mods = parseMeth(methStr);
  // Auto-clean: strip FASTA headers, whitespace, numbers, newlines → only ATCG
  const cleanSeq = seq.split("\n").filter(l => !l.startsWith(">")).join("").replace(/[^ATCGatcg]/g, "").toUpperCase();
  const nNt = cleanSeq.length, nCodons = Math.floor(nNt / 3);
  const payload = mode === "codon"
    ? { codon, conditions: env, topology: { supercoiling_density: env.supercoiling_density, form: "B-DNA" }, epigenetics: mods.length ? mods : undefined, mc_samples: runMC ? 500 : 100 }
    : { sequence: cleanSeq, conditions: env, topology: { supercoiling_density: env.supercoiling_density, form: "B-DNA" }, epigenetics: mods.length ? mods : undefined, analysis: { force_field: "CHARMM36", run_mc: runMC, mc_samples: 500 } };
  async function run() {
    setLoading(true); setError(null); setData(null);
    try {
      const r = await apiCall(mode === "codon" ? "/codon" : "/analyze", payload);
      if (r._offline) { setError(r._error || t(lang, "off")); }
      else { setData(r); if (onResults && mode === "sequence") onResults(r); }
    } catch (e) { setError(`${e.message}`); }
    setLoading(false);
  }
  const summary = data?.summary, codons = data?.codons || [], cd = mode === "codon" ? data : null;
  return <div>
    <div style={{ display: "flex", gap: 6, marginBottom: 12, alignItems: "center" }}>
      {[["codon", t(lang, "modeC")], ["sequence", t(lang, "modeS")]].map(([id, l]) => <button key={id} onClick={() => { setMode(id); setData(null); }} style={{ ...cs.btn(mode === id ? P.cy : P.td), background: mode === id ? P.cg : "transparent" }}>{l}</button>)}
      <div style={{ flex: 1 }} /><div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: P.td, ...cs.fn }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: online ? P.grn : online === false ? P.red : P.tf, display: "inline-block" }} /> {online ? t(lang, "on") : t(lang, "off")}</div>
    </div>
    {mode === "codon" ? <div style={cs.card()}><div style={cs.lbl()}>{t(lang, "codonIn")}</div><input value={codon} onChange={e => { setCodon(e.target.value.toUpperCase().slice(0, 3)); setData(null); }} maxLength={3} style={{ ...cs.input, fontSize: 28, fontWeight: 700, textAlign: "center", letterSpacing: 12, padding: "14px 20px" }} /></div>
      : <><div style={cs.card()}><div style={cs.lbl()}>{lang === "en" ? "Sequence name (gene / protein)" : "Nom de la séquence (gène / protéine)"}</div><input value={seqName} onChange={e => setSeqName(e.target.value)} placeholder="NR3C1, BRCA1, TP53, SARS-CoV-2 Spike..." style={{ ...cs.input, fontSize: 14, fontWeight: 600, color: P.gold }} /></div><div style={cs.card()}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={cs.lbl()}>{t(lang, "seq")}</div><div style={{ ...cs.fn, fontSize: 10, color: nCodons >= 1 ? P.cy : P.tf, fontWeight: nCodons >= 100 ? 700 : 400 }}>{nNt} nt · {nCodons} codons</div></div><textarea value={seq} onChange={e => { setSeq(e.target.value); setData(null); }} rows={5} placeholder={lang === "en" ? "Paste the complete CDS here (FASTA or raw nucleotides)...\nThe engine analyzes ALL codons without any limit." : "Collez le CDS complet ici (FASTA ou nucléotides bruts)...\nLe moteur analyse TOUS les codons sans aucune limite."} style={{ ...cs.input, resize: "vertical", lineHeight: 1.5 }} /></div></>}
    <EnvPanel env={env} setEnv={setEnv} lang={lang} />
    <div style={cs.card(P.red + "12")}><div style={cs.lbl(P.red)}>{t(lang, "epi")}</div><input value={methStr} onChange={e => setMethStr(e.target.value)} placeholder="1:5mC, 5:m6A, 12:5hmC" style={cs.input} /><div style={{ color: P.tf, fontSize: 8, marginTop: 3, ...cs.fn }}>{t(lang, "methFmt")}</div></div>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}><label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: P.td, cursor: "pointer", ...cs.fn }}><input type="checkbox" checked={runMC} onChange={e => setRunMC(e.target.checked)} style={{ accentColor: P.gold }} /> {t(lang, "mc")}</label><div style={{ fontSize: 9, color: P.tf, ...cs.fn }}>{t(lang, "bell")}</div></div>
    <details style={{ marginBottom: 10 }}><summary style={{ color: P.td, fontSize: 10, cursor: "pointer", ...cs.fn }}>{t(lang, "payload")} → {mode === "codon" ? "POST /codon" : "POST /analyze"}</summary><pre style={{ background: P.bg, padding: 10, borderRadius: 8, fontSize: 9, color: P.tf, overflow: "auto", maxHeight: 120, border: `1px solid ${P.brd}` }}>{JSON.stringify(payload, null, 2)}</pre></details>
    <button onClick={run} disabled={loading || (mode === "sequence" && nCodons < 1)} style={{ width: "100%", marginBottom: 14, padding: "13px 0", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${P.gold},${P.cd2})`, color: P.bg, fontWeight: 800, fontSize: 13, cursor: loading ? "wait" : "pointer", ...cs.fn, letterSpacing: 1.5, opacity: loading ? .7 : (mode === "sequence" && nCodons < 1) ? .4 : 1 }}>{loading ? t(lang, "going") : mode === "sequence" && nCodons > 0 ? `${t(lang, "go")} · ${nCodons} CODONS` : t(lang, "go")}</button>
    {error && <div style={{ ...cs.card(P.red + "30"), color: P.red, fontSize: 11, ...cs.fn }}>{error}</div>}
    {/* CODON */}
    {mode === "codon" && cd && cd.evk && <><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 6, marginBottom: 10 }}><Stat label="EVK" value={`T₃${cd.evk.dim}`} color={P.pur} sub={cd.evk.label} /><Stat label={t(lang, "rank")} value={cd.mrk_invariants?.rank} color={P.gold} sub={cd.mrk_invariants?.risk_level} /><Stat label="ν_TIV" value={`${cd.mrk_invariants?.nu_TIV_THz}THz`} color={P.pur} /><Stat label="E_res" value={cd.mrk_invariants?.E_res} color={P.org} sub="kcal/mol" /><Stat label="P(mut)" value={`${cd.mutability?.P_mut_pct}%`} color={P.red} /><Stat label="MPS n_eff" value={cd.mps?.n_eff_conformations} color={P.cy} sub="conformations" /></div>
      {cd.per_bond_boltzmann && <div style={cs.card(P.pur + "12")}><div style={cs.lbl(P.pur)}>{t(lang, "postI")} · {t(lang, "perBond")}</div>{cd.per_bond_boltzmann.map((b, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}><span style={{ color: "CG".includes(b.base) ? P.cy : P.org, fontSize: 9, width: 24, ...cs.fn, fontWeight: 600 }}>{b.base}/H{b.bond_index + 1}</span>{[[-1, b.P_minus1], [0, b.P_0], [1, b.P_plus1]].map(([s, p]) => <div key={s} style={{ flex: 1, display: "flex", alignItems: "center", gap: 3 }}><div style={{ flex: 1, height: 4, background: P.tf + "40", borderRadius: 2 }}><div style={{ width: `${p * 100}%`, height: "100%", background: TC[String(s)], borderRadius: 2 }} /></div><span style={{ fontSize: 8, color: TC[String(s)], width: 28, ...cs.fn }}>{(p * 100).toFixed(1)}%</span></div>)}<span style={{ fontSize: 8, color: P.tf, width: 32, ...cs.fn }}>Z={b.Z}</span></div>)}</div>}
      <div style={cs.card(P.gold + "12")}><div style={cs.lbl(P.gold)}>MRK eigenvalues</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 6 }}><Stat label="Tr" value={cd.mrk_invariants?.trace} color={P.gold} /><Stat label="‖M‖" value={cd.mrk_invariants?.frobenius} color={P.pur} /><Stat label="ρ" value={cd.mrk_invariants?.spectral_radius} color={P.org} /><Stat label="det" value={cd.mrk_invariants?.det} color={P.cy} /></div><div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{(cd.mrk_invariants?.eigenvalues || []).map((v, i) => <span key={i} style={{ padding: "2px 6px", borderRadius: 4, background: v > 0 ? P.grn + "12" : P.red + "12", color: v > 0 ? P.grn : P.red, fontSize: 9, ...cs.fn }}>λ{i}={v}</span>)}</div></div>
      {cd.monte_carlo && <div style={cs.card(P.org + "12")}><div style={cs.lbl(P.org)}>Monte Carlo · {cd.monte_carlo.N_simulations} · Bell/GHZ={String(cd.monte_carlo.bell_ghz_filter)}</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}><Stat label="Rang MC" value={`${cd.monte_carlo.rank_mean}±${cd.monte_carlo.rank_std}`} color={P.org} /><Stat label="H(rank)" value={`${cd.monte_carlo.H_rank_bits}b`} color={P.pur} /><Stat label="n_eff" value={cd.monte_carlo.n_eff_conformations} color={P.cy} /></div></div>}
    </>}
    {/* SEQUENCE */}
    {mode === "sequence" && summary && <><DNA3D codons={codons} sigma={env.supercoiling_density} h={300} /><div style={{ display: "flex", justifyContent: "center", gap: 14, padding: "4px 0 8px", ...cs.fn, fontSize: 8 }}><span><span style={{ color: "#fb923c" }}>●</span> AT</span><span><span style={{ color: "#22d3ee" }}>●</span> CG</span><span><span style={{ color: "#e85454" }}>●</span> HIGH</span><span><span style={{ color: "#f59e0b" }}>●</span> MED</span></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 6, margin: "4px 0 10px" }}><Stat label={t(lang, "codons")} value={summary.n_codons || 0} color={P.cy} /><Stat label="MRK" value={summary.mrk_rank_mean || "—"} color={P.gold} sub={summary.mrk_rank_std ? `±${summary.mrk_rank_std}` : ""} /><Stat label="ν_TIV" value={summary.nu_TIV_mean ? `${summary.nu_TIV_mean}THz` : "—"} color={P.pur} /><Stat label="GC%" value={summary.gc_content_pct != null ? `${summary.gc_content_pct}%` : "—"} color={P.grn} /><Stat label="HIGH" value={summary.high_risk_sites ?? 0} color={P.red} /><Stat label="MIH-21" value={summary.n_mih21_windows ?? 0} color={P.org} /><Stat label="I (mol/L)" value={summary.conditions?.ionic_strength_mol_L || summary.conditions?.ionic_strength || "—"} color={P.pur} sub={`Na⁺=${summary.conditions?.sodium_mM ?? "?"} K⁺=${summary.conditions?.potassium_mM ?? "?"}`} />{data.compute_time_s && <Stat label="API" value={`${data.compute_time_s}s`} color={P.td} />}</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>{[["overview", t(lang, "ov")], ["codons", t(lang, "codons")], ["risk", t(lang, "mut")], ["mih21", "MIH-21"]].map(([id, l]) => <button key={id} onClick={() => setTab(id)} style={{ ...cs.btn(tab === id ? P.cy : P.td), fontSize: 10, background: tab === id ? P.cg : "transparent" }}>{l}</button>)}</div>
      {tab === "overview" && <div style={cs.card(P.grn + "10")}><div style={cs.lbl(P.grn)}>TQIM-Davoh v3 · Bell/GHZ · MPS</div><div style={{ ...cs.fn, fontSize: 11, lineHeight: 2.2, color: P.tx }}><div><span style={{ color: P.red, fontWeight: 600 }}>{t(lang, "postI")}</span> · α(−1)={summary.amplitudes?.alpha_minus1 ?? "—"} α(0)={summary.amplitudes?.alpha_0 ?? "—"} α(+1)={summary.amplitudes?.alpha_plus1 ?? "—"}</div><div><span style={{ color: P.org, fontWeight: 600 }}>{t(lang, "postII")}</span> · {summary.n_mih21_windows ?? 0} MIH-21 · L=71.4Å</div><div><span style={{ color: P.pur, fontWeight: 600 }}>{t(lang, "postIII")}</span> · ν_TIV={summary.nu_TIV_mean ?? "—"}THz · E_res={summary.E_res_mean ?? "—"}kcal/mol</div><div><span style={{ color: P.red, fontWeight: 600 }}>{t(lang, "postIV")}</span> · {summary.high_risk_sites ?? 0} HIGH · {summary.medium_risk_sites ?? 0} MED · {summary.low_risk_sites ?? 0} LOW</div><div style={{ marginTop: 6, color: P.tf, fontSize: 9 }}>T={summary.conditions?.T_K ?? "?"}K pH={summary.conditions?.pH ?? "?"} Na⁺={summary.conditions?.sodium_mM ?? "?"}mM K⁺={summary.conditions?.potassium_mM ?? "?"}mM Mg²⁺={summary.conditions?.magnesium_mM ?? "?"}mM σ={summary.conditions?.supercoiling ?? "?"} {summary.conditions?.force_field || "CHARMM36"}</div></div></div>}
      {tab === "codons" && <div style={{ ...cs.card(), overflow: "auto", maxHeight: 400 }}><table style={{ width: "100%", borderCollapse: "collapse", ...cs.fn, fontSize: 10 }}><thead><tr style={{ borderBottom: `1px solid ${P.ba}` }}>{["#", "Cod", "AA", "EVK", "Rk", "ν_TIV", "ERK", "Thermo", "Risk", "P%", "MPS"].map(h => <th key={h} style={{ padding: "3px 4px", color: P.td, textAlign: "left", fontSize: 8 }}>{h}</th>)}</tr></thead><tbody>{codons.map((c, i) => <tr key={i} style={{ borderBottom: `1px solid ${P.brd}` }}><td style={{ padding: "2px 4px", color: P.tf }}>{c.position}</td><td style={{ padding: "2px 4px", color: P.tx, fontWeight: 600 }}>{c.codon}</td><td style={{ padding: "2px 4px", color: P.pur }}>{c.amino_acid}</td><td style={{ padding: "2px 4px", color: P.td }}>{c.evk_label}</td><td style={{ padding: "2px 4px", color: P.gold, fontWeight: 600 }}>{c.rank}</td><td style={{ padding: "2px 4px", color: P.pur }}>{c.nu_TIV_THz}</td><td style={{ padding: "2px 4px", color: P.pur }}>{c.erk_energy}</td><td style={{ padding: "2px 4px", color: c.thermo_class === "tendu" ? P.red : c.thermo_class === "perturbé" ? P.amb : P.grn }}>{c.thermo_class}</td><td style={{ padding: "2px 4px", color: c.risk_level === "HIGH" ? P.red : c.risk_level === "MEDIUM" ? P.amb : P.grn, fontWeight: 600 }}>{c.risk_level}</td><td style={{ padding: "2px 4px", color: P.red }}>{c.P_mut_pct}</td><td style={{ padding: "2px 4px", color: P.cy }}>{c.mps_entropy != null ? `${c.mps_entropy}b` : "—"}</td></tr>)}</tbody></table></div>}
      {tab === "risk" && <div style={cs.card(P.red + "10")}><div style={cs.lbl(P.red)}>{t(lang, "postIV")} · {data.predictions?.rule}</div>{(data.high_risk_sites || []).length > 0 ? <div style={{ maxHeight: 180, overflow: "auto" }}>{data.high_risk_sites.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: `1px solid ${P.brd}` }}><span style={{ color: P.red, fontWeight: 700, width: 35, ...cs.fn }}>#{s.pos}</span><span style={{ color: P.tx, fontWeight: 600, width: 30 }}>{s.codon}</span><span style={{ color: P.pur, width: 30 }}>{s.amino_acid}</span><span style={{ color: P.td, fontSize: 10, ...cs.fn }}>r={s.rank} E={s.E_res} ν={s.nu_TIV_THz}THz</span></div>)}</div> : <div style={{ color: P.td, padding: 16 }}>{t(lang, "noHigh")}</div>}</div>}
      {tab === "mih21" && <div style={cs.card(P.org + "10")}><div style={cs.lbl(P.org)}>{t(lang, "postII")} · MIH-21 · L=71.4Å · Bell/GHZ · MPS</div><div style={{ maxHeight: 180, overflow: "auto" }}>{(data.mih21_windows || []).map((w, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", borderBottom: `1px solid ${P.brd}` }}><span style={{ color: P.tf, fontSize: 9, width: 55, ...cs.fn }}>{w.window_start}–{w.window_end}</span><div style={{ flex: 1, height: 4, background: P.tf + "30", borderRadius: 2 }}><div style={{ width: `${Math.min((w.mean_rank || 4) / 9 * 100, 100)}%`, height: "100%", background: P.org, borderRadius: 2 }} /></div><span style={{ color: P.org, fontSize: 9, width: 45, ...cs.fn }}>r={w.mean_rank}</span><span style={{ color: P.pur, fontSize: 8, width: 55, ...cs.fn }}>ν={w.nu_TIV_THz}THz</span><span style={{ color: w.cavity_stability === "STABLE" ? P.grn : w.cavity_stability === "UNSTABLE" ? P.red : P.amb, fontSize: 8, fontWeight: 600, ...cs.fn }}>{w.cavity_stability}</span></div>)}</div></div>}
    </>}
  </div>;
}

// ═══ CHIFFREMENT (with key management) ═══════════════════════════
function Chiffrement({ lang }) {
  const [tpl, setTpl] = useState(["CG", "CG", "CG"]);
  const [msg, setMsg] = useState("kyriosMICA");
  const [customKey, setCustomKey] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [res, setRes] = useState(null);
  const d = tpl.reduce((s, tt) => s + (tt === "CG" ? 3 : 2), 0), st = tpl.reduce((s, tt) => s * (tt === "CG" ? 27 : 9), 1);
  function enc() {
    let key;
    if (useCustom && customKey.trim()) {
      try { key = parseVec(customKey); if (key.length < msg.length) { while (key.length < msg.length) key.push(key[key.length % key.length]); } } catch { key = null; }
    }
    if (!key) key = Array.from({ length: msg.length }, () => Array.from({ length: d }, () => T3[Math.floor(Math.random() * 3)]));
    const e = msg.split("").map((ch, i) => { const p = i2v(ch.charCodeAt(0), d); const k = key[i % key.length]; return { char: ch, plain: p, key: k, cipher: p.map((x, j) => t3add(x, k[j])) }; });
    setRes({ enc: e, key, cipherStr: serVec(e.map(x => x.cipher)), keyStr: serVec(key) });
  }
  return <div>
    <div style={cs.card()}><div style={cs.lbl()}>{t(lang, "space")} · T₃{d} · {st.toLocaleString()} · I(M;C)=0</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>{tpl.map((tp, i) => <div key={i} style={{ display: "flex", gap: 3 }}>{["AT", "CG"].map(bt => <button key={bt} onClick={() => { const n = [...tpl]; n[i] = bt; setTpl(n); setRes(null); }} style={{ ...cs.btn(tp === bt ? (bt === "CG" ? P.cy : P.org) : P.tf), padding: "3px 10px", fontSize: 10, background: tp === bt ? (bt === "CG" ? P.cg : P.org + "15") : "transparent" }}>{bt}</button>)}</div>)}</div>
    </div>
    <div style={cs.card()}><div style={cs.lbl()}>{t(lang, "msg")}</div><input value={msg} onChange={e => { setMsg(e.target.value); setRes(null); }} style={cs.input} /></div>
    {/* Custom key option */}
    <div style={cs.card(P.gold + "10")}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: P.td, cursor: "pointer", ...cs.fn }}><input type="checkbox" checked={useCustom} onChange={e => setUseCustom(e.target.checked)} style={{ accentColor: P.gold }} /> {t(lang, "useCustomKey")}</label>
      </div>
      {useCustom && <><div style={cs.lbl(P.gold)}>{t(lang, "key")} (blocs séparés par |)</div><textarea value={customKey} onChange={e => setCustomKey(e.target.value)} rows={2} style={{ ...cs.input, resize: "vertical" }} placeholder="1,0,-1,0,1,0,-1,1,0|..." /></>}
      {!useCustom && <div style={{ color: P.tf, fontSize: 9, ...cs.fn }}>{t(lang, "genKey")}</div>}
    </div>
    <button onClick={enc} style={{ width: "100%", marginBottom: 14, padding: "12px 0", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${P.gold},${P.cd2})`, color: P.bg, fontWeight: 800, fontSize: 13, cursor: "pointer", ...cs.fn, letterSpacing: 1.5 }}>{t(lang, "encBtn")}</button>
    {res && <>
      <div style={cs.card(P.cy + "15")}><div style={cs.lbl(P.cd2)}>"{res.enc[0].char}" → T₃{d}</div>{[["P", res.enc[0].plain, P.td], ["K", res.enc[0].key, P.td], ["C", res.enc[0].cipher, P.cy]].map(([l, v, c], i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}><span style={{ color: c, width: 14, fontSize: 10, ...cs.fn, fontWeight: 600 }}>{l}</span>{v.map((tt, j) => <TritBadge key={j} value={tt} sm />)}</div>)}</div>
      <div style={{ ...cs.card(P.gold + "10") }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><div style={cs.lbl(P.gd)}>Cipher · {res.enc.length} blocs</div><CopyBtn text={res.cipherStr} label={t(lang, "copyCipher")} doneLbl={t(lang, "cipherCopied")} /></div><div style={{ ...cs.fn, fontSize: 8, color: P.tf, wordBreak: "break-all", maxHeight: 60, overflow: "auto", userSelect: "all" }}>{res.cipherStr}</div></div>
      <div style={{ ...cs.card(P.red + "10") }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><div style={cs.lbl(P.red)}>{t(lang, "key")} K (SECRET)</div><CopyBtn text={res.keyStr} label={t(lang, "copyKey")} doneLbl={t(lang, "keyCopied")} /></div><div style={{ ...cs.fn, fontSize: 8, color: P.tf, wordBreak: "break-all", maxHeight: 60, overflow: "auto", userSelect: "all" }}>{res.keyStr}</div></div>
    </>}
  </div>;
}

// ═══ DÉCHIFFREMENT ════════════════════════════════════════════════
function Dechiffrement({ lang }) {
  const [tpl, setTpl] = useState(["CG", "CG", "CG"]);
  const [cipherStr, setCipherStr] = useState("");
  const [keyStr, setKeyStr] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const d = tpl.reduce((s, tt) => s + (tt === "CG" ? 3 : 2), 0);
  function dec() {
    try { setError(null);
      const cB = parseVec(cipherStr), kB = parseVec(keyStr);
      if (cB.length === 0 || kB.length === 0) throw new Error("Empty input");
      const plain = cB.map((cb, i) => { const kb = kB[i % kB.length]; const pv = cb.map((x, j) => t3add(x, -(kb[j] || 0))); const code = v2i(pv); return code >= 32 && code < 127 ? String.fromCharCode(code) : "?"; }).join("");
      setResult(plain);
    } catch (e) { setError(e.message); setResult(null); }
  }
  return <div>
    <div style={cs.card()}><div style={cs.lbl()}>T₃{d} · {t(lang, "space")}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>{tpl.map((tp, i) => <div key={i} style={{ display: "flex", gap: 3 }}>{["AT", "CG"].map(bt => <button key={bt} onClick={() => { const n = [...tpl]; n[i] = bt; setTpl(n); setResult(null); }} style={{ ...cs.btn(tp === bt ? (bt === "CG" ? P.cy : P.org) : P.tf), padding: "3px 10px", fontSize: 10, background: tp === bt ? (bt === "CG" ? P.cg : P.org + "15") : "transparent" }}>{bt}</button>)}</div>)}</div>
    </div>
    <div style={cs.card(P.cy + "10")}><div style={cs.lbl(P.cd2)}>{t(lang, "cipherIn")}</div><textarea value={cipherStr} onChange={e => { setCipherStr(e.target.value); setResult(null); }} rows={3} style={{ ...cs.input, resize: "vertical" }} placeholder="0,1,-1,0,1,0,-1,1,0|1,-1,0,1,0,0,-1,0,1|..." /></div>
    <div style={cs.card(P.red + "10")}><div style={cs.lbl(P.red)}>{t(lang, "keyIn")}</div><textarea value={keyStr} onChange={e => { setKeyStr(e.target.value); setResult(null); }} rows={3} style={{ ...cs.input, resize: "vertical" }} placeholder="1,0,-1,1,0,0,1,-1,0|0,1,0,-1,1,0,0,1,-1|..." /></div>
    <button onClick={dec} style={{ width: "100%", marginBottom: 14, padding: "12px 0", borderRadius: 10, border: `1px solid ${P.pur}40`, background: P.pur + "10", color: P.pur, fontWeight: 800, fontSize: 13, cursor: "pointer", ...cs.fn, letterSpacing: 1.5 }}>{t(lang, "decBtn")}</button>
    {error && <div style={{ ...cs.card(P.red + "20"), color: P.red, fontSize: 11 }}>{error}</div>}
    {result && <div style={cs.card(P.grn + "15")}><div style={cs.lbl(P.grn)}>{t(lang, "decrypted")}</div><div style={{ color: P.grn, ...cs.fn, fontSize: 20, fontWeight: 700 }}>{result}</div><div style={{ color: P.tf, fontSize: 9, marginTop: 4, ...cs.fn }}>D(C, K) = C ⊖₃ K · Shannon 1949 · I(M;C) = 0</div></div>}
  </div>;
}

// ═══ RAPPORT (8 sections — sequence-specific) ═══════════════════
function Rapports({ data, lang, seqName }) {
  const [cp, setCp] = useState(false);
  if (!data?.summary) return <div style={{ ...cs.card(), textAlign: "center", padding: 30, color: P.td, ...cs.fn }}>{t(lang, "repEmpty")}</div>;
  const s = data.summary, c = s.conditions || {}, now = new Date().toISOString().split("T")[0];
  const pred = data.predictions || {};
  const meth = data.methodology || {};
  const cl = data.classification || {};
  const isEN = lang === "en";
  const name = seqName || (isEN ? "Unnamed sequence" : "Séquence non nommée");

  const tex = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}\\usepackage[T1]{fontenc}
\\usepackage{amsmath,amssymb,booktabs,geometry,xcolor,longtable,fancyhdr}
\\geometry{margin=2.5cm}
\\definecolor{KGold}{HTML}{C9972A}\\definecolor{KCyan}{HTML}{22D3EE}
\\definecolor{KNavy}{HTML}{0A1628}\\definecolor{KTerre}{HTML}{8B4513}
\\definecolor{KRed}{HTML}{E85454}\\definecolor{KGreen}{HTML}{34D399}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{\\footnotesize\\textcolor{KGold}{kyriosMICA}}
\\fancyhead[R]{\\footnotesize\\textcolor{KTerre}{TQIM-Davoh v3 $\\cdot$ ${now}}}
\\fancyfoot[C]{\\footnotesize\\thepage}
\\fancyfoot[R]{\\footnotesize\\textcolor{KTerre}{Matrice d'Intrication Coordonn\\'ee par les Amplitudes}}

\\title{
  {\\color{KGold}\\rule{\\linewidth}{1pt}}\\\\[0.4cm]
  \\textcolor{KNavy}{\\textbf{Rapport d'Analyse TQIM-Davoh}}\\\\[0.2cm]
  \\large\\textcolor{KGold}{\\textbf{${name.replace(/[&%$#_{}~^\\]/g, '')}}}\\\\[0.2cm]
  \\normalsize\\textcolor{KTerre}{Matrice d'Intrication Coordonn\\'ee par les Amplitudes}\\\\[0.1cm]
  \\normalsize\\textcolor{KCyan}{MICA-Kernel v3.0 $\\cdot$ Qudits-36}\\\\[0.2cm]
  {\\color{KGold}\\rule{\\linewidth}{1pt}}
}
\\author{\\textbf{kyriosMICA} $\\cdot$ Institut de Recherche\\\\
B\\'{e}nin, Afrique de l'Ouest\\\\
\\texttt{direction@kyriosmica.com}}
\\date{${now}}

\\begin{document}
\\maketitle
\\thispagestyle{fancy}

% ═══════════════════════════════════════════════
% SECTION 1 — IDENTIFICATION
% ═══════════════════════════════════════════════
\\section{Identification de la s\\'{e}quence}

\\begin{tabular}{ll}\\toprule
S\\'{e}quence & \\textbf{${name.replace(/[&%$#_{}~^\\]/g, '')}} \\\\
Longueur & ${s.n_nucleotides || "?"} nucl\\'{e}otides \\\\
Codons analys\\'{e}s & ${s.n_codons || "?"} \\\\
Contenu GC & ${s.gc_content_pct || "?"}\\% \\\\
M\\'{e}thylations & ${s.n_methylated || 0} modification(s) \\\\
Date d'analyse & ${now} \\\\
Moteur & MICA-Kernel v3.0 \\\\
\\bottomrule\\end{tabular}

% ═══════════════════════════════════════════════
% SECTION 2 — CONDITIONS EXPÉRIMENTALES
% ═══════════════════════════════════════════════
\\section{Conditions exp\\'{e}rimentales}

\\begin{tabular}{lll}\\toprule
\\textbf{Paramètre} & \\textbf{Valeur} & \\textbf{Unit\\'{e}} \\\\\\midrule
Temp\\'{e}rature & ${c.T_K || "?"} & K \\\\
pH & ${c.pH || "?"} & --- \\\\
Sodium Na$^+$ & ${c.sodium_mM ?? "?"} & mM \\\\
Potassium K$^+$ & ${c.potassium_mM ?? "?"} & mM \\\\
Magn\\'{e}sium Mg$^{2+}$ & ${c.magnesium_mM ?? "?"} & mM \\\\
Force ionique $I$ & ${c.ionic_strength_mol_L || "?"} & mol/L \\\\
Couplage $\\lambda_{\\text{eff}}$ & ${c.lambda_eff || "?"} & --- \\\\
Superenroulement $\\sigma$ & ${c.supercoiling ?? "?"} & --- \\\\
Champ de force & ${c.force_field || "CHARMM36"} & Phase 1 \\\\
\\bottomrule\\end{tabular}

% ═══════════════════════════════════════════════
% SECTION 3 — SIGNATURE QUANTIQUE GLOBALE
% ═══════════════════════════════════════════════
\\section{Signature quantique globale}

\\subsection{Postulat I --- Ind\\'{e}termination}
Chaque liaison hydrogène est d\\'{e}crite par un \\'{e}tat quantique :
$$|\\psi_j\\rangle = \\sqrt{P(-1)}\\,|-1\\rangle + \\sqrt{P(0)}\\,|0\\rangle + \\sqrt{P(+1)}\\,|+1\\rangle$$

\\begin{tabular}{lccc}\\toprule
& $|-1\\rangle$ (comprim\\'{e}) & $|0\\rangle$ (\\'{e}quilibre) & $|+1\\rangle$ (\\'{e}tir\\'{e}) \\\\\\midrule
Amplitude $\\alpha(s)$ & ${s.amplitudes?.alpha_minus1 ?? "?"} & ${s.amplitudes?.alpha_0 ?? "?"} & ${s.amplitudes?.alpha_plus1 ?? "?"} \\\\
Probabilit\\'{e} $P(s)$ & ${s.amplitudes?.P_minus1 ?? "?"} & ${s.amplitudes?.P_0 ?? "?"} & ${s.amplitudes?.P_plus1 ?? "?"} \\\\
\\bottomrule\\end{tabular}

\\subsection{Postulat II --- Coh\\'{e}rence (MIH-21)}
${s.n_mih21_windows ?? 0} fen\\^{e}tres MIH-21 d\\'{e}tect\\'{e}es $\\cdot$ Cavit\\'{e} r\\'{e}sonante $L = 71.4$ \\AA\\ (21 pb = 2 tours B-DNA).

\\subsection{Postulat III --- R\\'{e}sonance}
\\begin{tabular}{ll}\\toprule
Rang MRK moyen & $${s.mrk_rank_mean ?? "?"} \\pm ${s.mrk_rank_std ?? "?"}$ \\\\
Fr\\'{e}quence $\\nu_{\\text{TIV}}$ moyenne & ${s.nu_TIV_mean ?? "?"} THz \\\\
\\'{E}nergie $E_{\\text{res}}$ moyenne & ${s.E_res_mean ?? "?"} kcal/mol \\\\
\\'{E}nergie ERK moyenne & ${s.erk_mean ?? "?"} kcal/mol \\\\
\\bottomrule\\end{tabular}

\\subsection{Postulat IV --- Mutabilit\\'{e}}
\\begin{tabular}{lcc}\\toprule
Niveau de risque & Nombre de codons & Pourcentage \\\\\\midrule
\\textcolor{KRed}{HIGH (rang $\\leq 3$)} & \\textcolor{KRed}{\\textbf{${s.high_risk_sites ?? 0}}} & ${s.n_codons ? ((s.high_risk_sites||0)/s.n_codons*100).toFixed(1) : "?"}\\% \\\\
MEDIUM (rang = 4) & ${s.medium_risk_sites ?? 0} & ${s.n_codons ? ((s.medium_risk_sites||0)/s.n_codons*100).toFixed(1) : "?"}\\% \\\\
\\textcolor{KGreen}{LOW (rang $\\geq 5$)} & ${s.low_risk_sites ?? 0} & ${s.n_codons ? ((s.low_risk_sites||0)/s.n_codons*100).toFixed(1) : "?"}\\% \\\\
\\bottomrule\\end{tabular}

\\subsection{Classification conformationnelle}
Forme : \\textbf{${cl.form || "?"}} $\\cdot$ Confiance : ${cl.confidence || "?"}

% ═══════════════════════════════════════════════
% SECTION 4 — CARTE DE MUTABILITÉ
% ═══════════════════════════════════════════════
\\section{Carte de mutabilit\\'{e}}

${(data.high_risk_sites||[]).length > 0 ? `\\subsection{Sites à haut risque (rang MRK $\\leq 3$)}
\\begin{tabular}{rllrrrl}\\toprule
\\# & Codon & AA & Rang & $\\nu_{\\text{TIV}}$ (THz) & $E_{\\text{res}}$ & Risque \\\\\\midrule
${(data.high_risk_sites||[]).map(h => `${h.pos} & ${h.codon} & ${h.amino_acid||"?"} & ${h.rank} & ${h.nu_TIV_THz} & ${h.E_res} & \\textcolor{KRed}{HIGH} \\\\`).join("\n")}
\\bottomrule\\end{tabular}` : "Aucun site à haut risque d\\'{e}tect\\'{e}."}

${pred.clusters?.length > 0 ? `\\subsection{Clusters de mutations}
${pred.clusters.length} cluster(s) de codons HIGH cons\\'{e}cutifs d\\'{e}tect\\'{e}(s) :
${pred.clusters.map((cl2,i) => `Cluster ${i+1} : positions \\#${cl2.join(", \\#")}`).join(" $\\cdot$ ")}` : ""}

\\subsection{Table complète --- ${s.n_codons || "?"} codons}
\\begin{longtable}{rllrrrrll}\\toprule
\\# & Cod & AA & Dim & Rang & $\\nu_{\\text{TIV}}$ & ERK & Thermo & Risque \\\\\\midrule\\endhead
${(data.codons || []).map(co => `${co.position} & ${co.codon} & ${co.amino_acid || "?"} & ${co.evk_dim} & ${co.rank} & ${co.nu_TIV_THz} & ${co.erk_energy} & ${co.thermo_class || ""} & ${co.risk_level} \\\\`).join("\n")}
\\bottomrule\\end{longtable}

% ═══════════════════════════════════════════════
% SECTION 5 — ANALYSE MIH-21
% ═══════════════════════════════════════════════
\\section{Analyse MIH-21 (Postulat de la Coh\\'{e}rence)}

${(data.mih21_windows||[]).length > 0 ? `${(data.mih21_windows||[]).length} fen\\^{e}tres analys\\'{e}es $\\cdot$ $L = 71.4$ \\AA\\ $\\cdot$ $\\lambda_{\\text{fond}} = 142.8$ \\AA

\\begin{tabular}{rrrrl}\\toprule
Codons & Rang moyen & $\\nu_{\\text{TIV}}$ (THz) & Entropie MPS & Stabilit\\'{e} \\\\\\midrule
${(data.mih21_windows||[]).map(w => `${w.window_start}--${w.window_end} & ${w.mean_rank} & ${w.nu_TIV_THz} & ${w.avg_mps_entropy || "?"} & ${w.cavity_stability} \\\\`).join("\n")}
\\bottomrule\\end{tabular}` : "S\\'{e}quence trop courte pour l'analyse MIH-21 ($< 21$ pb)."}

% ═══════════════════════════════════════════════
% SECTION 6 — CONCLUSIONS SPÉCIFIQUES
% ═══════════════════════════════════════════════
\\section{Conclusions}

${isEN ? (pred.conclusion_en || "No conclusions available.") : (pred.conclusion_fr || "Aucune conclusion disponible.")}

${pred.thermo_distribution ? `\\\\[0.3cm]
Distribution thermodynamique : ${Object.entries(pred.thermo_distribution||{}).map(([k,v]) => `${k} = ${v}`).join(", ")}.` : ""}

% ═══════════════════════════════════════════════
% SECTION 7 — MÉTHODOLOGIE
% ═══════════════════════════════════════════════
\\section{M\\'{e}thodologie}

\\textbf{Moteur :} ${meth.engine || "MICA-Kernel v3.0"}

\\textbf{4 Postulats :} ${(meth.postulates||[]).join(", ") || "Ind\\'{e}termination, Coh\\'{e}rence, R\\'{e}sonance, Mutabilit\\'{e}"}

\\textbf{Filtres :} ${(meth.filters||[]).join(", ") || "Bell/GHZ, MPS L1+L2"}

\\textbf{Validation de r\\'{e}f\\'{e}rence :} ${meth.reference_validation || "SARS-CoV-2 Spike: 100\\% rank-3 = known hotspots (p=0.0002)"}

% ═══════════════════════════════════════════════
% SECTION 8 — LIMITES
% ═══════════════════════════════════════════════
\\section{Limites et perspectives}

\\begin{itemize}
${(meth.limitations||["Phase 1 : CHARMM36 additif"]).map(l => `\\item ${l}`).join("\n")}
\\end{itemize}

% ═══════════════════════════════════════════════
% FOOTER
% ═══════════════════════════════════════════════
\\vfill
\\begin{center}
{\\color{KGold}\\rule{0.6\\linewidth}{1pt}}\\\\[0.4cm]
{\\Large\\textbf{\\textcolor{KNavy}{kyrios}\\textcolor{KGold}{MICA}}}\\\\[0.15cm]
{\\textcolor{KTerre}{Matrice d'Intrication Coordonn\\'{e}e par les Amplitudes}}\\\\[0.1cm]
{\\small\\textit{\\textcolor{KCyan}{Decoding Life. Encoding the Future.}}}\\\\[0.3cm]
{\\footnotesize \\textcopyright\\ 2026 Cyrille Egnon Davoh $\\cdot$ B\\'{e}nin, Afrique de l'Ouest}\\\\
{\\footnotesize\\texttt{direction@kyriosmica.com} $\\cdot$ \\texttt{kyriosmica.com}}
\\end{center}
\\end{document}`;

  function downloadTex() {
    const blob = new Blob([tex], { type: "text/x-tex" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `rapport_tqim_${(seqName || "sequence").replace(/[^a-zA-Z0-9]/g, "_")}_${now}.tex`; a.click();
    URL.revokeObjectURL(url);
  }

  return <div>
    {/* Sequence name banner */}
    <div style={{ ...cs.card(P.gold + "20"), padding: 12, marginBottom: 8 }}>
      <div style={{ ...cs.fn, fontSize: 16, fontWeight: 700, color: P.gold }}>{name}</div>
      <div style={{ ...cs.fn, fontSize: 10, color: P.td, marginTop: 2 }}>{s.n_nucleotides} nt · {s.n_codons} codons · GC={s.gc_content_pct}% · {now}</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: 6, marginBottom: 10 }}>
      <Stat label={t(lang, "codons")} value={s.n_codons} color={P.cy} />
      <Stat label="MRK" value={s.mrk_rank_mean} color={P.gold} />
      <Stat label="ν_TIV" value={`${s.nu_TIV_mean}THz`} color={P.pur} />
      <Stat label="HIGH" value={s.high_risk_sites} color={P.red} />
      <Stat label="MIH-21" value={s.n_mih21_windows} color={P.org} />
      <Stat label={lang === "en" ? "Form" : "Forme"} value={cl.form || "?"} color={P.grn} />
    </div>
    <div style={{ ...cs.card(), maxHeight: 400, overflow: "auto" }}>
      <pre style={{ ...cs.fn, fontSize: 8, color: P.td, lineHeight: 1.5, whiteSpace: "pre-wrap", margin: 0 }}>{tex}</pre>
    </div>
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
      <button onClick={() => { navigator.clipboard.writeText(tex).then(() => { setCp(true); setTimeout(() => setCp(false), 2000); }); }} style={{ flex: 1, ...cs.btn(cp ? P.grn : P.gold), padding: "11px 0", background: cp ? P.grn + "12" : P.gg }}>{cp ? t(lang, "copied") : t(lang, "copyRep")}</button>
      <button onClick={downloadTex} style={{ flex: 1, ...cs.btn(P.cy), padding: "11px 0", background: P.cg }}>{t(lang, "dlTex")}</button>
    </div>
  </div>;
}

// ═══ APP SHELL ════════════════════════════════════════════════════
const MODS = [{ id: "analyze", icon: "⌬", label: "analyze" }, { id: "encrypt", icon: "⊕", label: "encrypt" }, { id: "decrypt", icon: "⊖", label: "decrypt" }, { id: "report", icon: "◧", label: "report" }];
const MICA_DEF = { fr: "Matrice d'Intrication Coordonnée par les Amplitudes", en: "Matrix of Intrication Coordinated by Amplitudes" };
const SLOGAN1 = "Decoding Life.", SLOGAN2 = "Encoding the Future.";

export default function App() {
  const [mod, setMod] = useState("analyze");
  const [lang, setLang] = useState(() => (navigator.language || "fr").startsWith("en") ? "en" : "fr");
  const [ad, setAd] = useState(null);
  const [seqName, setSeqName] = useState("");
  return <div style={{ height: "100vh", display: "flex", background: P.bg, color: P.tx, fontFamily: "'JetBrains Mono','Courier New',monospace", overflow: "hidden" }}>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: `radial-gradient(circle at 50% 0%,${P.gold}04 0%,transparent 50%),linear-gradient(${P.brd} 1px,transparent 1px),linear-gradient(90deg,${P.brd} 1px,transparent 1px)`, backgroundSize: "100% 100%,60px 60px,60px 60px", zIndex: 0 }} />
    {/* Sidebar */}
    <div style={{ width: 58, background: P.sf, borderRight: `1px solid ${P.brd}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, gap: 5, flexShrink: 0, zIndex: 2 }}>
      {/* Logo H — Sceau évolué */}
      <svg width="32" height="32" viewBox="0 0 200 200" style={{ marginBottom: 10 }}>
        <defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#E8B84B" /><stop offset="100%" stopColor="#C9972A" /></linearGradient></defs>
        {/* Hexagram: triangle up (gold) + triangle down (terre) */}
        <polygon points="100,18 170,135 30,135" fill="#C9972A08" stroke="#C9972A" strokeWidth="3" />
        <polygon points="100,182 170,65 30,65" fill="#8B451308" stroke="#8B4513" strokeWidth="3" />
        {/* Inner hexagon (cyan) */}
        <polygon points="100,55 140,78 140,122 100,145 60,122 60,78" fill="none" stroke="#22D3EE" strokeWidth="1.5" opacity="0.4" />
        {/* DNA helix through center */}
        <path d="M97,42 C108,58 92,74 103,90 C92,106 108,122 97,138 C108,154 97,158 103,158" fill="none" stroke="#C9972A" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M103,42 C92,58 108,74 97,90 C108,106 92,122 103,138 C92,154 103,158 97,158" fill="none" stroke="#8B4513" strokeWidth="3.5" strokeLinecap="round" />
        {/* H-bonds */}
        <line x1="95" y1="58" x2="105" y2="58" stroke="#22D3EE" strokeWidth="2" opacity="0.6" />
        <line x1="105" y1="74" x2="95" y2="74" stroke="#22D3EE" strokeWidth="2" opacity="0.6" />
        <line x1="95" y1="90" x2="105" y2="90" stroke="#22D3EE" strokeWidth="2" opacity="0.6" />
        <line x1="105" y1="106" x2="95" y2="106" stroke="#22D3EE" strokeWidth="2" opacity="0.6" />
        <line x1="95" y1="122" x2="105" y2="122" stroke="#22D3EE" strokeWidth="2" opacity="0.6" />
        <line x1="105" y1="138" x2="95" y2="138" stroke="#22D3EE" strokeWidth="2" opacity="0.6" />
        {/* 3 state markers */}
        <circle cx="100" cy="55" r="6" fill="#E8B84B" />
        <circle cx="140" cy="122" r="6" fill="#22D3EE" />
        <circle cx="60" cy="122" r="6" fill="#8B4513" />
        {/* Center */}
        <circle cx="100" cy="100" r="9" fill="#C9972A" />
        <circle cx="100" cy="100" r="5" fill="#22D3EE" />
        <circle cx="100" cy="100" r="2" fill="#fff" opacity="0.95" />
      </svg>
      {MODS.map(m => <button key={m.id} onClick={() => setMod(m.id)} style={{ width: 44, height: 44, borderRadius: 10, border: "none", background: mod === m.id ? P.cg : "transparent", color: mod === m.id ? P.cy : P.td, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, fontSize: 16, transition: "all .15s" }}><span style={{ fontSize: 16 }}>{m.icon}</span><span style={{ fontSize: 7, ...cs.fn, fontWeight: 500 }}>{t(lang, m.label)}</span></button>)}
      <div style={{ flex: 1 }} />
      <button onClick={() => setLang(l => l === "fr" ? "en" : "fr")} style={{ width: 32, height: 20, borderRadius: 5, border: `1px solid ${P.ba}`, background: "transparent", color: P.gold, cursor: "pointer", fontSize: 9, ...cs.fn, fontWeight: 700, marginBottom: 12 }}>{lang.toUpperCase()}</button>
    </div>
    {/* Main */}
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, zIndex: 1 }}>
      {/* Topbar */}
      <div style={{ height: 48, borderBottom: `1px solid ${P.brd}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", background: P.sf + "ee", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1, color: P.cy }}>{t(lang, MODS.find(m => m.id === mod)?.label).toUpperCase()}</span>
          <span style={{ color: P.tf, fontWeight: 400, fontSize: 11 }}>· TQIM-DAVOH v3.1</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
          <div><span style={{ color: "#F1F5F9", fontSize: 11, fontWeight: 500, letterSpacing: 1.5 }}>kyrios</span><span style={{ color: P.gold, fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>MICA</span></div>
          <div style={{ fontSize: 7, color: "#8B4513", letterSpacing: 1, ...cs.fn, opacity: 0.8 }}>{MICA_DEF[lang]}</div>
        </div>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}><div style={{ maxWidth: 920, margin: "0 auto" }}>
        {mod === "analyze" && <Analyseur onResults={setAd} lang={lang} seqName={seqName} setSeqName={setSeqName} />}
        {mod === "encrypt" && <Chiffrement lang={lang} />}
        {mod === "decrypt" && <Dechiffrement lang={lang} />}
        {mod === "report" && <Rapports data={ad} lang={lang} seqName={seqName} />}
      </div></div>
      {/* Footer */}
      <div style={{ padding: "6px 18px", borderTop: `1px solid ${P.brd}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 7, ...cs.fn }}>
          <span style={{ color: P.tf + "50" }}>TQIM-Davoh v3 · Bell/GHZ · MPS · T₃-Net</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 8, ...cs.fn }}><span style={{ color: P.gold, opacity: 0.6 }}>{SLOGAN1}</span> <span style={{ color: P.cy, opacity: 0.5 }}>{SLOGAN2}</span></span>
          <span style={{ color: P.tf + "40", fontSize: 7, ...cs.fn }}>© 2026</span>
          <span style={{ fontSize: 7, ...cs.fn }}><span style={{ color: "#F1F5F9", opacity: 0.3 }}>kyrios</span><span style={{ color: P.gold, opacity: 0.4 }}>MICA</span></span>
          <span style={{ color: P.tf + "30", fontSize: 7, ...cs.fn }}>· Bénin</span>
        </div>
      </div>
    </div>
  </div>;
}
