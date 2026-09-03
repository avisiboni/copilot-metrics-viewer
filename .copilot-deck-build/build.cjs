// GitHub Copilot — Executive deck for Menora (Hebrew / RTL)
const path = require("path");
const ROOT = "/Users/avisiboni/Documents/git/open-source/copilot-metrics-viewer";
const NM = path.join(ROOT, "node_modules");
const pptxgen = require(path.join(NM, "pptxgenjs"));
const React = require(path.join(NM, "react"));
const ReactDOMServer = require(path.join(NM, "react-dom/server"));
const sharp = require(path.join(NM, "sharp"));
const FA = require(path.join(NM, "react-icons/fa"));

// ---------- palette ----------
const C = {
  bg:      "12132E", // deep indigo
  bg2:     "1C1E45",
  card:    "FFFFFF",
  light:   "F5F6FB",
  purple:  "7C5CFF", // copilot violet
  purpleD: "5B3FD6",
  purpleL: "B7A6FF",
  green:   "12B886",
  greenD:  "0E9A72",
  amber:   "F5A623",
  red:     "EF4655",
  ink:     "1E2240",
  muted:   "6B7188",
  line:    "E4E7F2",
  chipbg:  "ECE8FF",
};
const HFONT = "Arial";

// ---------- icon helper ----------
async function icon(IconComp, color = "#FFFFFF", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComp, { color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
  pres.layout = "WIDE";
  pres.author = "Copilot Metrics Viewer";
  pres.title = "GitHub Copilot — דוח מנהלים מנורה";
  const W = 13.333, H = 7.5;

  // pre-render icons
  const ic = {
    seat:   await icon(FA.FaChair, "#7C5CFF"),
    users:  await icon(FA.FaUsers, "#7C5CFF"),
    chart:  await icon(FA.FaChartLine, "#12B886"),
    code:   await icon(FA.FaCode, "#7C5CFF"),
    chat:   await icon(FA.FaCommentDots, "#7C5CFF"),
    check:  await icon(FA.FaCheckCircle, "#12B886"),
    rocket: await icon(FA.FaRocket, "#F5A623"),
    bolt:   await icon(FA.FaBolt, "#F5A623"),
    trophy: await icon(FA.FaTrophy, "#F5A623"),
    warn:   await icon(FA.FaExclamationTriangle, "#F5A623"),
    target: await icon(FA.FaBullseye, "#7C5CFF"),
    gear:   await icon(FA.FaCogs, "#7C5CFF"),
    money:  await icon(FA.FaCoins, "#12B886"),
    lang:   await icon(FA.FaLayerGroup, "#7C5CFF"),
    flag:   await icon(FA.FaFlagCheckered, "#12B886"),
    arrowUp:await icon(FA.FaArrowUp, "#12B886"),
    star:   await icon(FA.FaStar, "#F5A623"),
    shield: await icon(FA.FaShieldAlt, "#7C5CFF"),
    bulb:   await icon(FA.FaLightbulb, "#F5A623"),
    cli:    await icon(FA.FaTerminal, "#7C5CFF"),
    review: await icon(FA.FaCodeBranch, "#7C5CFF"),
    icWhiteRocket: await icon(FA.FaRocket, "#FFFFFF"),
  };

  // ---------- shared helpers ----------
  const R = (s, opts = {}) => ({ text: s, options: { rtlMode: true, ...opts } });
  function he(slide, text, o = {}) {
    slide.addText(text, { rtlMode: true, align: "right", fontFace: HFONT, color: C.ink, ...o });
  }
  function shadow() {
    return { type: "outer", color: "1A1A2E", blur: 9, offset: 3, angle: 90, opacity: 0.12 };
  }
  function pageChrome(slide, n, title, iconData) {
    slide.background = { color: C.light };
    // title row (right aligned, Hebrew)
    if (iconData) {
      slide.addShape(pres.shapes.OVAL, { x: W - 1.18, y: 0.42, w: 0.62, h: 0.62, fill: { color: C.chipbg } });
      slide.addImage({ data: iconData, x: W - 1.05, y: 0.55, w: 0.36, h: 0.36 });
    }
    he(slide, title, { x: 1.0, y: 0.42, w: W - 2.35, h: 0.7, fontSize: 28, bold: true, color: C.ink, valign: "middle" });
    // small kicker
    he(slide, "GitHub Copilot · מנורה", { x: 1.0, y: 0.04, w: W - 2.35, h: 0.34, fontSize: 11, color: C.purple, bold: true });
    // page number
    slide.addText(String(n).padStart(2, "0"), { x: 0.45, y: H - 0.5, w: 0.8, h: 0.3, fontSize: 10, color: C.muted, align: "left", fontFace: HFONT });
    slide.addText("מקור: GitHub Copilot Metrics API · 19/01/2026–31/05/2026 (126 ימים)", {
      x: 2.2, y: H - 0.5, w: W - 2.7, h: 0.3, fontSize: 9, color: C.muted, align: "right", rtlMode: true, fontFace: HFONT,
    });
  }
  // stat card
  function statCard(slide, x, y, w, h, value, label, accent, iconData, sub) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.card }, rectRadius: 0.09, shadow: shadow() });
    slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.09, h, fill: { color: accent } }); // left accent
    if (iconData) {
      slide.addShape(pres.shapes.OVAL, { x: x + w - 0.78, y: y + 0.22, w: 0.5, h: 0.5, fill: { color: C.chipbg } });
      slide.addImage({ data: iconData, x: x + w - 0.67, y: y + 0.33, w: 0.28, h: 0.28 });
    }
    he(slide, String(value), { x: x + 0.22, y: y + 0.18, w: w - 1.0, h: 0.78, fontSize: 38, bold: true, color: accent, align: "right", valign: "middle", margin: 0 });
    he(slide, label, { x: x + 0.22, y: y + h - (sub ? 0.95 : 0.72), w: w - 0.44, h: 0.5, fontSize: 13, bold: true, color: C.ink, align: "right", margin: 0 });
    if (sub) he(slide, sub, { x: x + 0.22, y: y + h - 0.5, w: w - 0.44, h: 0.42, fontSize: 10.5, color: C.muted, align: "right", margin: 0 });
  }

  // ============================================================
  // SLIDE 1 — TITLE
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    // decorative soft circles
    s.addShape(pres.shapes.OVAL, { x: 9.3, y: -1.6, w: 5.2, h: 5.2, fill: { color: C.purpleD, transparency: 78 } });
    s.addShape(pres.shapes.OVAL, { x: 10.8, y: 3.4, w: 4.2, h: 4.2, fill: { color: C.purple, transparency: 84 } });
    s.addShape(pres.shapes.OVAL, { x: -1.4, y: 4.6, w: 3.8, h: 3.8, fill: { color: C.green, transparency: 86 } });

    // copilot chip
    s.addShape(pres.shapes.OVAL, { x: 11.5, y: 0.65, w: 0.95, h: 0.95, fill: { color: "FFFFFF", transparency: 90 } });
    s.addImage({ data: ic.icWhiteRocket, x: 11.74, y: 0.89, w: 0.47, h: 0.47 });

    he(s, "GitHub Copilot", { x: 0.9, y: 1.85, w: 11.5, h: 1.1, fontSize: 54, bold: true, color: "FFFFFF" });
    he(s, "דוח לפגישת מנהלי תחום · אימוץ, שימושיות, עלויות ו-ROI", { x: 0.9, y: 2.95, w: 11.5, h: 0.7, fontSize: 22, color: C.purpleL });

    // divider dots
    s.addShape(pres.shapes.RECTANGLE, { x: 11.0, y: 3.95, w: 1.43, h: 0.04, fill: { color: C.purple } });

    he(s, "אגף מערכות מידע · ארגון menora-copilot · Enterprise menora-insurance", { x: 0.9, y: 4.15, w: 11.5, h: 0.5, fontSize: 15, color: "C9CCEA" });

    // bottom meta row
    const meta = [
      ["35", "מושבים מוקצים"],
      ["97%", "ניצול מושבים"],
      ["×5", "צמיחת DAU במאי"],
      ["11.9K", "סיבובי צ'אט"],
    ];
    let mx = 0.9;
    const mw = 2.7, gap = 0.25;
    meta.forEach(([v, l]) => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: mx, y: 5.45, w: mw, h: 1.25, fill: { color: C.bg2 }, rectRadius: 0.1, line: { color: C.purpleD, width: 1 } });
      he(s, v, { x: mx + 0.15, y: 5.6, w: mw - 0.3, h: 0.6, fontSize: 30, bold: true, color: C.purpleL, align: "center" });
      he(s, l, { x: mx + 0.15, y: 6.18, w: mw - 0.3, h: 0.4, fontSize: 12, color: "C9CCEA", align: "center" });
      mx += mw + gap;
    });

    he(s, "1 ביוני 2026", { x: 0.9, y: 6.95, w: 5, h: 0.35, fontSize: 12, color: "8E93BE" });
    he(s, "Copilot Metrics Viewer", { x: 7.4, y: 6.95, w: 5.0, h: 0.35, fontSize: 12, color: "8E93BE", align: "left" });
  }

  // ============================================================
  // SLIDE 2 — EXECUTIVE SUMMARY (stat grid)
  // ============================================================
  {
    const s = pres.addSlide();
    pageChrome(s, 2, "תקציר מנהלים", ic.star);
    const gx = 0.9, gy = 1.35, gw = (W - 1.8 - 0.6) / 4, gh = 1.55, gp = 0.2;
    const cards = [
      ["35", "מושבים מוקצים", C.purple, ic.seat, "ניצול 97% (34/35 פעילים)"],
      ["9", "ממוצע DAU במאי", C.green, ic.users, "מ-2 בינואר — פי 5"],
      ["4,181", "הצעות קוד מצטבר", C.purple, ic.code, "1,078 קבלות · 25.8%"],
      ["11,909", "סיבובי צ'אט", C.purpleD, ic.chat, "אינטראקציה יומיומית גבוהה"],
    ];
    cards.forEach((c, i) => statCard(s, gx + i * (gw + gp), gy, gw, gh, c[0], c[1], c[2], c[3], c[4]));

    // second row: narrative + highlight
    const ry = gy + gh + 0.35;
    // left big message card
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: gx, y: ry, w: 7.55, h: 2.95, fill: { color: C.card }, rectRadius: 0.09, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: gx, y: ry, w: 0.09, h: 2.95, fill: { color: C.green } });
    he(s, "המסר למנהלים", { x: gx + 0.35, y: ry + 0.28, w: 6.9, h: 0.5, fontSize: 19, bold: true, color: C.ink });
    s.addText([
      R("ההשקה מצליחה. ", { bold: true, color: C.greenD, fontFace: HFONT }),
      R("קצב השימוש מזנק — במיוחד במאי — רוב המושבים בשימוש, והצוות כבר עובד בעיקר במצב ", { color: C.ink, fontFace: HFONT }),
      R("\"קודם קוד\" (IDE + Agent)", { bold: true, color: C.ink, fontFace: HFONT }),
      R(". בשלב ההשקה ה-ROI המדיד עדיין מתחת לעלות — ", { color: C.ink, fontFace: HFONT }),
      R("נורמלי ל-Early Adoption", { italic: true, color: C.muted, fontFace: HFONT }),
      R(" — אך המגמה חיובית ויש מנופים ברורים: CLI, Code Review ומושבים רדומים.", { color: C.ink, fontFace: HFONT }),
    ], { x: gx + 0.35, y: ry + 0.8, w: 6.95, h: 2.0, fontSize: 15.5, align: "right", rtlMode: true, lineSpacingMultiple: 1.15 });

    // right adoption stage card
    const rx = gx + 7.55 + 0.25;
    const rw = W - 0.9 - rx;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y: ry, w: rw, h: 2.95, fill: { color: C.bg }, rectRadius: 0.09, shadow: shadow() });
    he(s, "שלב אימוץ דומיננטי", { x: rx + 0.3, y: ry + 0.28, w: rw - 0.6, h: 0.4, fontSize: 14, bold: true, color: C.purpleL, align: "right" });
    he(s, "Code first", { x: rx + 0.3, y: ry + 0.72, w: rw - 0.6, h: 0.8, fontSize: 40, bold: true, color: "FFFFFF", align: "right" });
    he(s, "54%", { x: rx + 0.3, y: ry + 1.55, w: rw - 0.6, h: 0.6, fontSize: 30, bold: true, color: C.green, align: "right" });
    he(s, "מהמשתמשים בדוח 28 יום עובדים ב-IDE עם השלמות ו-Agent בעורך", { x: rx + 0.3, y: ry + 2.12, w: rw - 0.6, h: 0.7, fontSize: 12, color: "C9CCEA", align: "right" });
  }

  // ============================================================
  // SLIDE 3 — WHY COPILOT / CONTEXT
  // ============================================================
  {
    const s = pres.addSlide();
    pageChrome(s, 3, "הקשר ארגוני — למה Copilot", ic.target);
    // left: why bullets cards (3 value props)
    const props = [
      [ic.bolt, "פרודוקטיביות", "האצת כתיבת קוד, פחות boilerplate, וזמן מהיר יותר ל-PR.", C.amber],
      [ic.chat, "ידע נגיש בזרימה", "צ'אט בתוך העורך מקצר חיפוש בתיעוד וב-Stack Overflow.", C.purple],
      [ic.shield, "ממשל ואבטחה", "הצעות קוד ציבוריות חסומות; שימוש מנוהל ברמת Enterprise.", C.green],
    ];
    const px = 0.9, pw = 6.4, ph = 1.55, pgap = 0.25;
    let py = 1.5;
    props.forEach(([iconData, t, d, ac]) => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px, y: py, w: pw, h: ph, fill: { color: C.card }, rectRadius: 0.09, shadow: shadow() });
      s.addShape(pres.shapes.OVAL, { x: px + pw - 1.0, y: py + 0.45, w: 0.66, h: 0.66, fill: { color: C.chipbg } });
      s.addImage({ data: iconData, x: px + pw - 0.85, y: py + 0.6, w: 0.36, h: 0.36 });
      he(s, t, { x: px + 0.3, y: py + 0.28, w: pw - 1.3, h: 0.5, fontSize: 18, bold: true, color: ac, align: "right" });
      he(s, d, { x: px + 0.3, y: py + 0.78, w: pw - 1.3, h: 0.65, fontSize: 13, color: C.muted, align: "right" });
      py += ph + pgap;
    });

    // right: org facts panel
    const ox = px + pw + 0.3, ow = W - 0.9 - ox;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ox, y: 1.5, w: ow, h: ph * 3 + pgap * 2, fill: { color: C.bg }, rectRadius: 0.09, shadow: shadow() });
    he(s, "תמונת מצב ארגונית", { x: ox + 0.35, y: 1.78, w: ow - 0.7, h: 0.5, fontSize: 18, bold: true, color: "FFFFFF", align: "right" });
    const facts = [
      ["ארגון GitHub", "menora-copilot"],
      ["Enterprise", "menora-insurance"],
      ["תוכנית", "Enterprise"],
      ["מדיניות", "קוד ציבורי חסום · IDE Chat + CLI מופעלים"],
      ["ניהול מושבים", "assign_all · 35 מושבים"],
      ["מחזור חיוב נוכחי", "23 פעילים / 12 לא פעילים"],
      ["היסטוריית API", "מ-19/01/2026 (אין נתונים לפני כן)"],
    ];
    let fy = 2.45;
    facts.forEach(([k, v], i) => {
      if (i > 0) s.addShape(pres.shapes.LINE, { x: ox + 0.35, y: fy - 0.05, w: ow - 0.7, h: 0, line: { color: "33375F", width: 0.75 } });
      he(s, v, { x: ox + 0.35, y: fy, w: ow - 2.7, h: 0.5, fontSize: 12.5, bold: true, color: "FFFFFF", align: "right", valign: "middle" });
      he(s, k, { x: ox + ow - 2.5, y: fy, w: 2.15, h: 0.5, fontSize: 11.5, color: C.purpleL, align: "left", valign: "middle" });
      fy += 0.62;
    });
  }

  // ============================================================
  // SLIDE 4 — SEATS & ADOPTION
  // ============================================================
  {
    const s = pres.addSlide();
    pageChrome(s, 4, "מושבים וניצול", ic.seat);
    // funnel-ish stat strip
    const fx = 0.9, fy = 1.45, fw = (W - 1.8 - 0.9) / 4, fgap = 0.3, fh = 1.5;
    const funnel = [
      ["35", "מושבים מוקצים", C.purple],
      ["34", "פעילים ב-30 יום", C.green],
      ["29", "פעילים ב-7 ימים", C.green],
      ["97%", "ניצול מושבים", C.greenD],
    ];
    funnel.forEach((f, i) => {
      const x = fx + i * (fw + fgap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: fy, w: fw, h: fh, fill: { color: C.card }, rectRadius: 0.09, shadow: shadow() });
      he(s, f[0], { x, y: fy + 0.2, w: fw, h: 0.8, fontSize: 40, bold: true, color: f[2], align: "center", valign: "middle" });
      he(s, f[1], { x, y: fy + fh - 0.55, w: fw, h: 0.45, fontSize: 13, bold: true, color: C.ink, align: "center" });
      if (i < 3) s.addText("‹", { x: x + fw + 0.02, y: fy + 0.35, w: fgap - 0.04, h: fh - 0.7, fontSize: 26, color: C.purpleL, align: "center", valign: "middle", fontFace: HFONT });
    });

    // donut chart of seat status (left/right balanced)
    const cy = fy + fh + 0.45;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.9, y: cy, w: 5.6, h: 3.05, fill: { color: C.card }, rectRadius: 0.09, shadow: shadow() });
    he(s, "סטטוס המושבים", { x: 0.9, y: cy + 0.2, w: 5.3, h: 0.45, fontSize: 16, bold: true, color: C.ink, align: "right" });
    s.addChart(pres.charts.DOUGHNUT, [{
      name: "מושבים", labels: ["פעילים 7 ימים", "פעילים 8–30 יום", "רדום 30+ יום"], values: [29, 5, 1],
    }], {
      x: 0.9, y: cy + 0.55, w: 5.6, h: 2.4, holeSize: 62,
      chartColors: [C.purple, C.purpleL, C.amber],
      showLegend: true, legendPos: "l", legendColor: C.ink, legendFontSize: 11, legendFontFace: HFONT,
      showValue: true, dataLabelColor: "FFFFFF", dataLabelFontSize: 12, dataLabelFontBold: true,
      chartArea: { fill: { color: "FFFFFF" } },
    });

    // right: opportunities list
    const ox = 6.8, ow = W - 0.9 - ox;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ox, y: cy, w: ow, h: 3.05, fill: { color: C.light }, rectRadius: 0.09, line: { color: C.line, width: 1 } });
    he(s, "הזדמנויות לעידוד מחדש", { x: ox + 0.3, y: cy + 0.2, w: ow - 0.6, h: 0.45, fontSize: 16, bold: true, color: C.ink, align: "right" });
    const opp = [
      [ic.warn, "1 מושב רדום", "guyanmen — ללא שימוש 30+ יום. מועמד לביטול/העברה."],
      [ic.users, "6 ללא פעילות 7 יום", "קמפיין \"חזרה ל-Copilot\" ממוקד."],
      [ic.check, "תאריך הקצאה ראשון", "19/01/2026 — ההשקה צעירה, 4.5 חודשים."],
    ];
    let oy = cy + 0.75;
    opp.forEach(([iconData, t, d]) => {
      s.addShape(pres.shapes.OVAL, { x: ox + ow - 0.85, y: oy + 0.05, w: 0.5, h: 0.5, fill: { color: "FFFFFF" }, line: { color: C.line, width: 1 } });
      s.addImage({ data: iconData, x: ox + ow - 0.74, y: oy + 0.16, w: 0.28, h: 0.28 });
      he(s, t, { x: ox + 0.3, y: oy, w: ow - 1.3, h: 0.4, fontSize: 14, bold: true, color: C.ink, align: "right" });
      he(s, d, { x: ox + 0.3, y: oy + 0.38, w: ow - 1.3, h: 0.5, fontSize: 11.5, color: C.muted, align: "right" });
      oy += 0.78;
    });
  }

  // ============================================================
  // SLIDE 5 — MONTHLY TREND (chart)
  // ============================================================
  {
    const s = pres.addSlide();
    pageChrome(s, 5, "מגמת שימוש חודשית", ic.chart);
    const labels = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי"];
    // combo: columns suggestions + line DAU
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.9, y: 1.4, w: 8.3, h: 5.25, fill: { color: C.card }, rectRadius: 0.09, shadow: shadow() });
    he(s, "הצעות קוד (עמודות) מול ממוצע DAU (קו)", { x: 0.9, y: 1.55, w: 8.0, h: 0.4, fontSize: 14, bold: true, color: C.ink, align: "right" });
    s.addChart([
      { type: pres.charts.BAR, data: [{ name: "הצעות קוד", labels, values: [34, 113, 580, 762, 2692] }],
        options: { barDir: "col", chartColors: [C.purple], showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.ink, dataLabelFontSize: 10, dataLabelFontFace: HFONT } },
      { type: pres.charts.LINE, data: [{ name: "ממוצע DAU", labels, values: [2, 2, 3, 5, 9] }],
        options: { secondaryValAxis: true, secondaryCatAxis: true, chartColors: [C.green], lineSize: 3, lineSmooth: true, lineDataSymbol: "circle", lineDataSymbolSize: 7 } },
    ], {
      x: 0.95, y: 2.0, w: 8.2, h: 4.5,
      catAxisLabelColor: C.muted, catAxisLabelFontSize: 12, catAxisLabelFontFace: HFONT,
      valAxisHidden: true, valGridLine: { style: "none" },
      valAxisMaxVal: 3000, valAxisMinVal: 0,
      secondaryValAxis: true, valAxes: [{ valAxisHidden: true, valAxisMaxVal: 3000 }, { valAxisHidden: true, valAxisMaxVal: 10 }],
      catAxes: [{ catAxisLabelColor: C.muted, catAxisLabelFontSize: 12, catAxisLabelFontFace: HFONT }, { catAxisHidden: true }],
      showLegend: true, legendPos: "t", legendColor: C.ink, legendFontSize: 11, legendFontFace: HFONT,
      chartArea: { fill: { color: "FFFFFF" } },
    });

    // right insight column
    const ox = 9.45, ow = W - 0.9 - ox;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ox, y: 1.4, w: ow, h: 5.25, fill: { color: C.bg }, rectRadius: 0.09, shadow: shadow() });
    s.addShape(pres.shapes.OVAL, { x: ox + 0.3, y: 1.65, w: 0.6, h: 0.6, fill: { color: "23264F" } });
    s.addImage({ data: ic.arrowUp, x: ox + 0.43, y: 1.78, w: 0.34, h: 0.34 });
    he(s, "עקומת אימוץ קלאסית", { x: ox + 0.3, y: 2.4, w: ow - 0.6, h: 0.5, fontSize: 18, bold: true, color: "FFFFFF", align: "right" });
    he(s, "התייצבות ואז קפיצה. מאי 2026 — כמעט פי 5 ב-DAU לעומת ינואר.", { x: ox + 0.3, y: 2.95, w: ow - 0.6, h: 0.8, fontSize: 13, color: "C9CCEA", align: "right" });
    // mini may-vs-apr deltas
    const deltas = [["DAU", "×2"], ["צ'אט", "×7"], ["הצעות", "×4"]];
    let dy = 4.0;
    deltas.forEach(([k, v]) => {
      s.addShape(pres.shapes.LINE, { x: ox + 0.3, y: dy - 0.06, w: ow - 0.6, h: 0, line: { color: "33375F", width: 0.75 } });
      he(s, v, { x: ox + 0.3, y: dy, w: 1.4, h: 0.55, fontSize: 22, bold: true, color: C.green, align: "left", valign: "middle" });
      he(s, k + " (מאי מול אפריל)", { x: ox + 1.5, y: dy, w: ow - 1.8, h: 0.55, fontSize: 12.5, color: "FFFFFF", align: "right", valign: "middle" });
      dy += 0.72;
    });
  }

  // ============================================================
  // SLIDE 6 — PRODUCTIVITY KPIs (28 days)
  // ============================================================
  {
    const s = pres.addSlide();
    pageChrome(s, 6, "פרודוקטיביות ואיכות — 28 יום אחרונים", ic.code);
    const gx = 0.9, gy = 1.4, gw = (W - 1.8 - 0.6) / 4, gh = 1.5, gp = 0.2;
    const k1 = [
      ["25.4%", "שיעור קבלה (ספירה)", C.purple, ic.check],
      ["29.7%", "שיעור קבלה (שורות)", C.green, ic.check],
      ["2,616", "הצעות קוד", C.purple, ic.code],
      ["821", "קבלות קוד", C.purpleD, ic.check],
    ];
    k1.forEach((c, i) => statCard(s, gx + i * (gw + gp), gy, gw, gh, c[0], c[1], c[2], c[3]));
    const k2 = [
      ["6,219", "אינטראקציות", C.purple, ic.chat],
      ["9,888", "יצירות קוד", C.green, ic.bolt],
      ["3,118", "שורות שהוצעו", C.purple, ic.code],
      ["72,059", "שורות שנוספו", C.greenD, ic.arrowUp],
    ];
    k2.forEach((c, i) => statCard(s, gx + i * (gw + gp), gy + gh + 0.25, gw, gh, c[0], c[1], c[2], c[3]));

    // note band
    const ny = gy + 2 * gh + 0.6;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: gx, y: ny, w: W - 1.8, h: 1.55, fill: { color: "FFF8E9" }, rectRadius: 0.09, line: { color: "F3D58A", width: 1 } });
    s.addShape(pres.shapes.OVAL, { x: gx + W - 1.8 - 1.0, y: ny + 0.45, w: 0.62, h: 0.62, fill: { color: "FCEBC4" } });
    s.addImage({ data: ic.warn, x: gx + W - 1.8 - 0.86, y: ny + 0.58, w: 0.34, h: 0.34 });
    he(s, "שימו לב — שני מדדים שונים של GitHub", { x: gx + 0.35, y: ny + 0.22, w: W - 1.8 - 1.3, h: 0.45, fontSize: 16, bold: true, color: "8A6212", align: "right" });
    he(s, "ספירת \"שורות שנוספו\" (חלון 28 יום, דוח משתמשים) גבוהה מהסכום היומי המצטבר. במצגת — הציגו את שניהם עם תווית מפורשת: \"28 יום\" מול \"מצטבר מתאריך השקה\". לא לסכם את חלון 28 היום לשנה שלמה.",
      { x: gx + 0.35, y: ny + 0.68, w: W - 1.8 - 1.3, h: 0.8, fontSize: 12.5, color: "7A5A1A", align: "right" });
  }

  // ============================================================
  // SLIDE 7 — AI ADOPTION PHASES
  // ============================================================
  {
    const s = pres.addSlide();
    pageChrome(s, 7, "שלבי אימוץ AI", ic.rocket);
    // left: phase ladder
    const px = 6.4, pw = W - 0.9 - px; // right side cards (Hebrew reads right→left, put ladder on right)
    const phases = [
      ["1", "Code first", "IDE · השלמות · Agent בעורך", "15 משתמשים · 54%", C.green, true],
      ["2", "Agent first", "סוכן בענן / Review / CLI", "0 משתמשים", C.muted, false],
      ["3", "Multi-agent", "מספר משטחי סוכן", "0 משתמשים", C.muted, false],
    ];
    let yy = 1.5;
    const ph = 1.5, pgap = 0.2;
    phases.forEach(([num, t, d, cnt, ac, active]) => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px, y: yy, w: pw, h: ph, fill: { color: active ? C.card : "FFFFFF" }, rectRadius: 0.09, shadow: shadow(), line: active ? { color: C.green, width: 1.5 } : { color: C.line, width: 1 } });
      s.addShape(pres.shapes.OVAL, { x: px + pw - 1.05, y: yy + 0.42, w: 0.66, h: 0.66, fill: { color: active ? C.green : C.light } });
      he(s, num, { x: px + pw - 1.05, y: yy + 0.42, w: 0.66, h: 0.66, fontSize: 24, bold: true, color: active ? "FFFFFF" : C.muted, align: "center", valign: "middle" });
      he(s, t, { x: px + 0.3, y: yy + 0.25, w: pw - 1.5, h: 0.5, fontSize: 19, bold: true, color: active ? C.ink : C.muted, align: "right" });
      he(s, d, { x: px + 0.3, y: yy + 0.74, w: pw - 1.5, h: 0.4, fontSize: 12, color: C.muted, align: "right" });
      he(s, cnt, { x: px + 0.3, y: yy + 1.08, w: pw - 1.5, h: 0.35, fontSize: 12.5, bold: true, color: ac, align: "right" });
      yy += ph + pgap;
    });

    // right: capability usage bar + message
    const cx = 0.9, cw = px - 0.3 - cx;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y: 1.5, w: cw, h: 3.0, fill: { color: C.card }, rectRadius: 0.09, shadow: shadow() });
    he(s, "שימוש ביכולות (28 יום)", { x: cx, y: 1.65, w: cw - 0.3, h: 0.4, fontSize: 14, bold: true, color: C.ink, align: "right" });
    s.addChart(pres.charts.BAR, [{ name: "משתמשים", labels: ["Agent", "Chat", "CLI", "Code Review"], values: [28, 28, 0, 0] }], {
      x: cx + 0.1, y: 2.05, w: cw - 0.2, h: 2.35, barDir: "bar",
      chartColors: [C.purple], showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.ink, dataLabelFontSize: 12, dataLabelFontFace: HFONT,
      catAxisLabelColor: C.ink, catAxisLabelFontSize: 12, catAxisLabelFontFace: HFONT,
      valAxisHidden: true, valGridLine: { style: "none" }, valAxisMaxVal: 32,
      showLegend: false, chartArea: { fill: { color: "FFFFFF" } },
    });
    // message band
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y: 4.65, w: cw, h: 2.0, fill: { color: C.bg }, rectRadius: 0.09, shadow: shadow() });
    s.addShape(pres.shapes.OVAL, { x: cx + cw - 0.95, y: 4.9, w: 0.6, h: 0.6, fill: { color: "23264F" } });
    s.addImage({ data: ic.bulb, x: cx + cw - 0.82, y: 5.03, w: 0.34, h: 0.34 });
    he(s, "המנוף הבא ל-ROI", { x: cx + 0.3, y: 4.92, w: cw - 1.1, h: 0.45, fontSize: 16, bold: true, color: "FFFFFF", align: "right" });
    s.addText([
      R("הצוות \"רוכב\" על Copilot בעורך ובצ'אט (100%). ", { color: "FFFFFF", fontFace: HFONT }),
      R("CLI ו-Code Review עדיין ב-0% — ", { bold: true, color: C.amber, fontFace: HFONT }),
      R("בדיוק שם נמצאת קפיצת הערך הבאה: אוטומציה, סקירת PR, ושלב Agent first.", { color: "C9CCEA", fontFace: HFONT }),
    ], { x: cx + 0.3, y: 5.45, w: cw - 0.6, h: 1.05, fontSize: 13, align: "right", rtlMode: true, lineSpacingMultiple: 1.1 });
  }

  // ============================================================
  // SLIDE 8 — TOP USERS (real names)
  // ============================================================
  {
    const s = pres.addSlide();
    pageChrome(s, 8, "מובילי שימוש — Top 10 (חלון 28 יום)", ic.trophy);
    const rows = [
      ["1", "Talhayo", "14,153", "4", "159", "Code first"],
      ["2", "guyt-mnr", "8,998", "0", "615", "Code first"],
      ["3", "ag936", "8,541", "51", "400", "—"],
      ["4", "dmitrylilmivt", "8,308", "74", "533", "—"],
      ["5", "hgmenor", "7,690", "11", "1,186", "Code first"],
      ["6", "edwardkes", "4,775", "52", "984", "Code first"],
      ["7", "yosef-albo", "3,995", "56", "699", "Code first"],
      ["8", "Barleme", "2,705", "19", "170", "Code first"],
      ["9", "avigam1", "2,278", "107", "73", "Code first"],
      ["10", "dinemenoramivt", "2,209", "297", "95", "Code first"],
    ];
    const hdr = ["#", "משתמש", "שורות שנוספו", "קבלות", "אינטראקציות", "שלב"];
    const head = hdr.map((h) => ({ text: h, options: { fill: { color: C.bg }, color: "FFFFFF", bold: true, align: "center", valign: "middle", fontFace: HFONT, rtlMode: true, fontSize: 12 } }));
    const body = rows.map((r, i) => r.map((cell, j) => ({
      text: cell,
      options: {
        fill: { color: i % 2 === 0 ? "FFFFFF" : "F1F2FA" },
        color: j === 2 ? C.purpleD : C.ink,
        bold: j === 0 || j === 2,
        align: j === 1 ? "right" : "center",
        valign: "middle", fontFace: HFONT, rtlMode: true, fontSize: 12,
      },
    })));
    s.addTable([head, ...body], {
      x: 0.9, y: 1.4, w: 8.2, colW: [0.55, 2.25, 1.85, 1.0, 1.55, 1.0],
      rowH: 0.42, border: { pt: 0.5, color: C.line }, valign: "middle",
    });

    // right insight card
    const ox = 9.4, ow = W - 0.9 - ox;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ox, y: 1.4, w: ow, h: 5.2, fill: { color: C.bg }, rectRadius: 0.09, shadow: shadow() });
    s.addShape(pres.shapes.OVAL, { x: ox + 0.3, y: 1.65, w: 0.62, h: 0.62, fill: { color: "23264F" } });
    s.addImage({ data: ic.trophy, x: ox + 0.43, y: 1.78, w: 0.36, h: 0.36 });
    he(s, "Copilot Champions", { x: ox + 0.3, y: 2.4, w: ow - 0.6, h: 0.5, fontSize: 19, bold: true, color: "FFFFFF", align: "right" });
    he(s, "כ-10 משתמשים נושאים את רוב הערך. מומלץ לזהות אותם כ-\"שגרירי Copilot\" — שיובילו הדרכות והרחבת שיטות עבודה לצוותים נוספים.",
      { x: ox + 0.3, y: 2.95, w: ow - 0.6, h: 1.3, fontSize: 13.5, color: "C9CCEA", align: "right", lineSpacingMultiple: 1.15 });
    s.addShape(pres.shapes.LINE, { x: ox + 0.3, y: 4.35, w: ow - 0.6, h: 0, line: { color: "33375F", width: 0.75 } });
    he(s, "14,153", { x: ox + 0.3, y: 4.5, w: ow - 0.6, h: 0.6, fontSize: 30, bold: true, color: C.green, align: "right" });
    he(s, "שורות שנוספו אצל המוביל (Talhayo) ב-28 יום", { x: ox + 0.3, y: 5.1, w: ow - 0.6, h: 0.6, fontSize: 12, color: "C9CCEA", align: "right" });
    he(s, "הערה: שמות המשתמשים מוצגים כפי שבמערכת. ניתן להציג תפקידים במקום שמות בפורומים רחבים.", { x: ox + 0.3, y: 5.85, w: ow - 0.6, h: 0.65, fontSize: 10.5, italic: true, color: "8E93BE", align: "right" });
  }

  // ============================================================
  // SLIDE 9 — LANGUAGES & EDITORS
  // ============================================================
  {
    const s = pres.addSlide();
    pageChrome(s, 9, "טכנולוגיה וכלים", ic.lang);
    // languages bar
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.9, y: 1.45, w: 7.3, h: 5.15, fill: { color: C.card }, rectRadius: 0.09, shadow: shadow() });
    he(s, "שפות מובילות — שורות שאושרו (מצטבר)", { x: 0.9, y: 1.6, w: 7.0, h: 0.45, fontSize: 16, bold: true, color: C.ink, align: "right" });
    s.addChart(pres.charts.BAR, [{ name: "שורות", labels: ["TypeScript", "JavaScript", "TSX", "Python", "SQL"], values: [601, 433, 222, 89, 18] }], {
      x: 1.0, y: 2.1, w: 7.1, h: 4.3, barDir: "bar",
      chartColors: [C.purple], showValue: true, dataLabelPosition: "outEnd", dataLabelColor: C.ink, dataLabelFontSize: 13, dataLabelFontFace: HFONT,
      catAxisLabelColor: C.ink, catAxisLabelFontSize: 14, catAxisLabelFontFace: HFONT,
      valAxisHidden: true, valGridLine: { style: "none" }, valAxisMaxVal: 700,
      showLegend: false, chartArea: { fill: { color: "FFFFFF" } }, barGapWidthPct: 60,
    });

    // right: editor + message
    const ox = 8.45, ow = W - 0.9 - ox;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ox, y: 1.45, w: ow, h: 2.4, fill: { color: C.bg }, rectRadius: 0.09, shadow: shadow() });
    he(s, "עורך מוביל", { x: ox + 0.3, y: 1.7, w: ow - 0.6, h: 0.4, fontSize: 14, bold: true, color: C.purpleL, align: "right" });
    he(s, "VS Code", { x: ox + 0.3, y: 2.1, w: ow - 0.6, h: 0.8, fontSize: 38, bold: true, color: "FFFFFF", align: "right" });
    he(s, "1,312 קבלות מצטברות — כמעט כל הפעילות. IntelliJ כמעט ללא שימוש.", { x: ox + 0.3, y: 2.95, w: ow - 0.6, h: 0.8, fontSize: 12.5, color: "C9CCEA", align: "right" });

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ox, y: 4.05, w: ow, h: 2.55, fill: { color: C.light }, rectRadius: 0.09, line: { color: C.line, width: 1 } });
    s.addShape(pres.shapes.OVAL, { x: ox + ow - 0.95, y: 4.3, w: 0.6, h: 0.6, fill: { color: C.chipbg } });
    s.addImage({ data: ic.check, x: ox + ow - 0.82, y: 4.43, w: 0.34, h: 0.34 });
    he(s, "התאמה לסטאק הארגוני", { x: ox + 0.3, y: 4.35, w: ow - 1.1, h: 0.45, fontSize: 16, bold: true, color: C.ink, align: "right" });
    he(s, "התפלגות השפות תואמת היטב לסטאק ה-Web/TypeScript של מנורה. שווה לשקול הדרכת IntelliJ ממוקדת אם יש צוותי Java/Kotlin רלוונטיים.",
      { x: ox + 0.3, y: 4.85, w: ow - 0.6, h: 1.6, fontSize: 13, color: C.muted, align: "right", lineSpacingMultiple: 1.15 });
  }

  // ============================================================
  // SLIDE 10 — ROI
  // ============================================================
  {
    const s = pres.addSlide();
    pageChrome(s, 10, "ROI — הערכה לצורך הצגה", ic.money);
    // two model cards
    const cw = 5.6, ch = 3.5, cy = 1.45;
    // Model A conservative (right)
    const ax = W - 0.9 - cw;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ax, y: cy, w: cw, h: ch, fill: { color: C.card }, rectRadius: 0.09, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: ax + cw - 0.09, y: cy, w: 0.09, h: ch, fill: { color: C.purple } });
    he(s, "מודל A — שמרני", { x: ax + 0.3, y: cy + 0.25, w: cw - 0.6, h: 0.45, fontSize: 18, bold: true, color: C.ink, align: "right" });
    he(s, "מבוסס 1,507 שורות שאושרו (מצטבר)", { x: ax + 0.3, y: cy + 0.68, w: cw - 0.6, h: 0.35, fontSize: 12, color: C.muted, align: "right" });
    const aRows = [["שעות פיתוח שנחסכו", "~50 שעות"], ["עלות שעת מפתח", "₪250"], ["ערך מוערך", "~₪12,500"], ["עלות רישיונות (~4.5 ח')", "~₪25,000"]];
    let ay = cy + 1.2;
    aRows.forEach(([k, v], i) => {
      if (i > 0) s.addShape(pres.shapes.LINE, { x: ax + 0.3, y: ay - 0.04, w: cw - 0.6, h: 0, line: { color: C.line, width: 0.75 } });
      he(s, v, { x: ax + 0.3, y: ay, w: 2.3, h: 0.42, fontSize: 14, bold: true, color: C.ink, align: "left", valign: "middle" });
      he(s, k, { x: ax + 2.7, y: ay, w: cw - 3.0, h: 0.42, fontSize: 12.5, color: C.muted, align: "right", valign: "middle" });
      ay += 0.5;
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ax + 0.3, y: ay + 0.05, w: cw - 0.6, h: 0.5, fill: { color: C.chipbg }, rectRadius: 0.06 });
    he(s, "יחס ערך/עלות שמרני: ~0.5×", { x: ax + 0.4, y: ay + 0.08, w: cw - 0.8, h: 0.44, fontSize: 14, bold: true, color: C.purpleD, align: "right", valign: "middle" });

    // Model B optimistic (left)
    const bx = 0.9;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y: cy, w: cw, h: ch, fill: { color: C.bg }, rectRadius: 0.09, shadow: shadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: bx, y: cy, w: 0.09, h: ch, fill: { color: C.green } });
    he(s, "מודל B — אופטימי", { x: bx + 0.3, y: cy + 0.25, w: cw - 0.6, h: 0.45, fontSize: 18, bold: true, color: "FFFFFF", align: "right" });
    he(s, "מבוסס 72K שורות בחלון 28 יום בלבד", { x: bx + 0.3, y: cy + 0.68, w: cw - 0.6, h: 0.35, fontSize: 12, color: C.purpleL, align: "right" });
    he(s, "~₪600,000", { x: bx + 0.3, y: cy + 1.25, w: cw - 0.6, h: 0.95, fontSize: 48, bold: true, color: C.green, align: "right" });
    he(s, "ערך מוערך לחלון 28 יום (2 דק'/שורה, ₪250/שעה)", { x: bx + 0.3, y: cy + 2.25, w: cw - 0.6, h: 0.5, fontSize: 13, color: "C9CCEA", align: "right" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx + 0.3, y: cy + 2.85, w: cw - 0.6, h: 0.5, fill: { color: "3A2A12" }, rectRadius: 0.06 });
    he(s, "⚠ לא להכפיל לחלון שנתי — מדד 28 יום בלבד", { x: bx + 0.4, y: cy + 2.88, w: cw - 0.8, h: 0.44, fontSize: 12.5, bold: true, color: C.amber, align: "right", valign: "middle" });

    // bottom message band
    const by = cy + ch + 0.3;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.9, y: by, w: W - 1.8, h: 1.35, fill: { color: "EAF7F1" }, rectRadius: 0.09, line: { color: "AEE3CE", width: 1 } });
    s.addShape(pres.shapes.OVAL, { x: W - 0.9 - 0.95, y: by + 0.37, w: 0.6, h: 0.6, fill: { color: "D2F0E3" } });
    s.addImage({ data: ic.rocket, x: W - 0.9 - 0.82, y: by + 0.5, w: 0.34, h: 0.34 });
    he(s, "המסר: בתקופת ההשקה המספרים השמרניים עדיין מתחת לעלות — נורמלי. מאי מראה מסלול להחזר, ועם הרחבת CLI / Code Review / Agent הפוטנציאל גבוה משמעותית.",
      { x: 0.9 + 0.3, y: by + 0.25, w: W - 1.8 - 1.2, h: 0.9, fontSize: 14, color: "1E5A44", align: "right", valign: "middle", lineSpacingMultiple: 1.1 });
    he(s, "ROI אמיתי דורש כיול מול שכר מפתח, עלות מושב בפועל וזמן חיסכון לפעולה — המודלים להצגה בלבד.", { x: 0.9, y: by + 1.4, w: W - 1.8, h: 0.3, fontSize: 9.5, italic: true, color: C.muted, align: "right" });
  }

  // ============================================================
  // SLIDE 11 — SUCCESSFUL PROCESSES (placeholder template)
  // ============================================================
  {
    const s = pres.addSlide();
    pageChrome(s, 11, "תהליכים מוצלחים — דוגמאות מהשטח", ic.flag);
    // instruction banner
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.9, y: 1.35, w: W - 1.8, h: 0.7, fill: { color: C.chipbg }, rectRadius: 0.07 });
    he(s, "תבנית למילוי · לכל דוגמה: בעיה → איך Copilot עזר → תוצאה מדידה. החליפו את הטקסט האפור בתוכן אמיתי לפני הפגישה.",
      { x: 1.1, y: 1.35, w: W - 2.2, h: 0.7, fontSize: 13, bold: true, color: C.purpleD, align: "right", valign: "middle" });

    const cards = [
      ["#1", "שם התהליך / הצוות", "צוות / מערכת רלוונטית"],
      ["#2", "שם התהליך / הצוות", "צוות / מערכת רלוונטית"],
      ["#3", "שם התהליך / הצוות", "צוות / מערכת רלוונטית"],
    ];
    const steps = [
      [ic.warn, "הבעיה / האתגר", "תארו את נקודת הכאב: משימה איטית, חוזרת, או דורשת ידע מומחה.", C.amber],
      [ic.gear, "איך Copilot עזר", "באיזו יכולת השתמשתם — השלמות, צ'אט, Agent, CLI — ובאיזה הקשר.", C.purple],
      [ic.check, "התוצאה המדידה", "זמן שנחסך, איכות, מהירות ל-PR, שביעות רצון. מספר אם אפשר.", C.green],
    ];
    const cw = (W - 1.8 - 0.6) / 3, cx0 = 0.9, cgap = 0.3, cy = 2.3, ch = 4.3;
    cards.forEach((c, i) => {
      const cx = cx0 + i * (cw + cgap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y: cy, w: cw, h: ch, fill: { color: C.card }, rectRadius: 0.09, shadow: shadow() });
      // header band
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y: cy, w: cw, h: 0.95, fill: { color: C.bg }, rectRadius: 0.09 });
      s.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy + 0.55, w: cw, h: 0.4, fill: { color: C.bg } });
      he(s, c[0], { x: cx + 0.25, y: cy + 0.12, w: 1.2, h: 0.7, fontSize: 24, bold: true, color: C.purpleL, align: "left", valign: "middle" });
      he(s, c[1], { x: cx + 0.3, y: cy + 0.12, w: cw - 0.6, h: 0.45, fontSize: 14, bold: true, color: "FFFFFF", align: "right" });
      he(s, c[2], { x: cx + 0.3, y: cy + 0.55, w: cw - 0.6, h: 0.35, fontSize: 11, color: C.purpleL, align: "right" });
      // steps
      let sy = cy + 1.2;
      steps.forEach(([iconData, t, d, ac]) => {
        s.addShape(pres.shapes.OVAL, { x: cx + cw - 0.78, y: sy, w: 0.46, h: 0.46, fill: { color: C.light } });
        s.addImage({ data: iconData, x: cx + cw - 0.68, y: sy + 0.1, w: 0.26, h: 0.26 });
        he(s, t, { x: cx + 0.25, y: sy, w: cw - 1.1, h: 0.4, fontSize: 13, bold: true, color: ac, align: "right" });
        he(s, d, { x: cx + 0.25, y: sy + 0.38, w: cw - 0.5, h: 0.65, fontSize: 10.5, italic: true, color: C.muted, align: "right" });
        sy += 1.0;
      });
    });
  }

  // ============================================================
  // SLIDE 12 — RISKS & STRATEGIC PLAN
  // ============================================================
  {
    const s = pres.addSlide();
    pageChrome(s, 12, "סיכונים, הזדמנויות ותוכנית עבודה", ic.target);
    // left: risks/opps table-cards (right side in RTL)
    const rx = 6.95, rw = W - 0.9 - rx;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y: 1.45, w: rw, h: 5.15, fill: { color: C.card }, rectRadius: 0.09, shadow: shadow() });
    he(s, "סיכונים → פעולה", { x: rx + 0.3, y: 1.65, w: rw - 0.6, h: 0.45, fontSize: 17, bold: true, color: C.ink, align: "right" });
    const risks = [
      ["מושב רדום (guyanmen)", "ביטול / העברה"],
      ["6 ללא פעילות 7 יום", "קמפיין חזרה ל-Copilot"],
      ["0% Agent / Multi-agent", "הדרכת Agent + PR Review"],
      ["CLI = 0", "פיילוט CLI ל-DevOps"],
      ["פער org vs דוח משתמשים", "להסביר: מדדים שונים"],
      ["אין נתונים לפני 19/01", "לא לטעון \"שנה מלאה\""],
    ];
    let ry = 2.25;
    risks.forEach(([k, v], i) => {
      if (i > 0) s.addShape(pres.shapes.LINE, { x: rx + 0.3, y: ry - 0.04, w: rw - 0.6, h: 0, line: { color: C.line, width: 0.75 } });
      he(s, v, { x: rx + 0.3, y: ry, w: 2.1, h: 0.6, fontSize: 12, bold: true, color: C.purpleD, align: "left", valign: "middle" });
      he(s, k, { x: rx + 2.5, y: ry, w: rw - 2.8, h: 0.6, fontSize: 12.5, color: C.ink, align: "right", valign: "middle" });
      ry += 0.7;
    });

    // right: strategic recommendations (left side)
    const lx = 0.9, lw = rx - 0.3 - lx;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: lx, y: 1.45, w: lw, h: 5.15, fill: { color: C.bg }, rectRadius: 0.09, shadow: shadow() });
    he(s, "המלצות אסטרטגיות · 2026 H2", { x: lx + 0.3, y: 1.65, w: lw - 0.6, h: 0.45, fontSize: 17, bold: true, color: "FFFFFF", align: "right" });
    const recs = [
      ["יעד DAU", "מ-9 (מאי) ל-15+ עד סוף Q3"],
      ["תוכנית Champions", "10 המובילים מלמדים צוותים"],
      ["הרחבת משטחים", "CLI + Copilot Code Review"],
      ["דשבורד חודשי", "אותו לוח, טווח מתאריך השקה"],
      ["KPI למנהלים", "ניצול 95%+ · Code→Agent · שורות/מפתח"],
    ];
    let ly = 2.2;
    recs.forEach(([t, d], i) => {
      s.addShape(pres.shapes.OVAL, { x: lx + lw - 0.85, y: ly + 0.02, w: 0.5, h: 0.5, fill: { color: C.purple } });
      he(s, String(i + 1), { x: lx + lw - 0.85, y: ly + 0.02, w: 0.5, h: 0.5, fontSize: 17, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
      he(s, t, { x: lx + 0.3, y: ly, w: lw - 1.3, h: 0.38, fontSize: 15, bold: true, color: "FFFFFF", align: "right" });
      he(s, d, { x: lx + 0.3, y: ly + 0.36, w: lw - 1.3, h: 0.42, fontSize: 12, color: "C9CCEA", align: "right" });
      ly += 0.84;
    });
  }

  // ============================================================
  // SLIDE 13 — CLOSING
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.bg };
    s.addShape(pres.shapes.OVAL, { x: -1.6, y: -1.6, w: 5.0, h: 5.0, fill: { color: C.purpleD, transparency: 80 } });
    s.addShape(pres.shapes.OVAL, { x: 10.5, y: 3.6, w: 4.6, h: 4.6, fill: { color: C.green, transparency: 86 } });
    he(s, "תודה — שאלות?", { x: 0.9, y: 2.2, w: 11.5, h: 1.0, fontSize: 46, bold: true, color: "FFFFFF" });
    he(s, "ההשקה מצליחה · המגמה עולה · המנופים הבאים: CLI, Code Review, Champions", { x: 0.9, y: 3.3, w: 11.5, h: 0.6, fontSize: 18, color: C.purpleL });
    s.addShape(pres.shapes.RECTANGLE, { x: 11.0, y: 4.25, w: 1.43, h: 0.04, fill: { color: C.purple } });
    he(s, "נספח · APIs שנקראו: /api/metrics · /api/usage-insights · /api/seats · /api/billing", { x: 0.9, y: 4.5, w: 11.5, h: 0.5, fontSize: 12.5, color: "C9CCEA" });
    he(s, "פרמטרי שאילתה: since=2026-01-19 · until=2026-06-01 · githubOrg=menora-copilot · scope=organization", { x: 0.9, y: 5.0, w: 11.5, h: 0.5, fontSize: 12.5, color: "8E93BE" });
    he(s, "מקור: GitHub Copilot Metrics API + לוח Copilot Metrics Viewer · 1 ביוני 2026", { x: 0.9, y: 6.7, w: 11.5, h: 0.4, fontSize: 11, color: "8E93BE" });
    // security note chip
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.9, y: 5.7, w: 7.6, h: 0.7, fill: { color: "2A1518" }, rectRadius: 0.07, line: { color: "5C2A30", width: 1 } });
    he(s, "אבטחה: אין לכלול קובץ .env / PAT במצגת או ב-git. אם טוקן נחשף — סובבו אותו מיד.", { x: 1.1, y: 5.7, w: 7.2, h: 0.7, fontSize: 11.5, bold: true, color: "F0A8B0", align: "right", valign: "middle" });
  }

  const out = path.join(ROOT, "docs", "GitHub-Copilot-Executive-Menora.pptx");
  await pres.writeFile({ fileName: out });
  console.log("WROTE", out);
})();
