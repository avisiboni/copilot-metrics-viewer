import type { MessageTree } from '../types'

const he: MessageTree = {
  common: {
    apply: 'החל',
    close: 'סגור',
    yes: 'כן',
    no: 'לא',
    na: 'לא זמין',
    allUsers: 'כל המשתמשים',
    loading: 'טוען',
    aboutKpi: 'אודות מדד זה',
    aboutChart: 'אודות תרשים: {title}',
    emDash: '—',
    comingSoon: 'בקרוב',
  },
  language: {
    label: 'שפה',
    english: 'אנגלית',
    hebrew: 'עברית',
  },
  header: {
    /** Fallback only; runtime title uses NUXT_PUBLIC_BRAND_APP_NAME */
    appName: 'Copilot Metrics Viewer',
    scopeEnterprise: 'ארגון-על',
    scopeOrganization: 'ארגון',
    teamSuffix: ' | צוות : {team}',
    pageTitle: '{appName} | {scope} : {name}{team}',
    metaDescription: 'לוח בקרה למדדי Copilot',
    mockData: 'נתוני דמה',
    logout: 'התנתקות',
    collapseSidebar: 'כווץ לסמלים',
    expandSidebar: 'הרחב סרגל צד',
    signInGithub: 'התחברות עם GitHub',
    seatsBanner: 'מושבים · {name}',
    mockDataHint: 'משתמשים בנתוני דמה — ראו README אם לא מכוון',
  },
  footer: {
    docs: 'תיעוד',
  },
  skeleton: {
    page: 'טוען תוכן עמוד',
    metrics: 'טוען מדדים',
    table: 'טוען טבלה',
    seats: 'טוען מדדי מושבים',
  },
  tabs: {
    organization: 'ארגון',
    enterprise: 'ארגון-על',
    team: 'צוות',
    teams: 'צוותים',
    languages: 'שפות',
    editors: 'עורכים',
    copilotChat: "צ'אט Copilot",
    usageInsights: 'תובנות שימוש',
    users: 'משתמשים',
    usageBilling: 'שימוש וחיוב',
    seatAnalysis: 'ניתוח מושבים',
    apiResponse: 'תגובת API',
  },
  alerts: {
    noDataTitle: 'אין נתונים',
    noDataText: 'אין נתונים להצגה',
    loadingTab: 'טוען {tab}',
  },
  errors: {
    noTeamData:
      'לא הוחזרו נתונים מה-API — בדקו שהצוות קיים, שיש פעילות ולפחות 5 חברים פעילים',
    unauthorized:
      '401 גישה לא מורשית מ-GitHub API — בדקו את הטוקן ב-.env (הרצה מקומית), הרשאות PAT ו-GitHub.',
    notFound:
      '404 לא נמצא — האם {scope} org:"{org}" ent:"{ent}" team:"{team}" נכונים? {message}',
    unprocessable:
      '422 ישות לא ניתנת לעיבוד — האם Copilot Metrics API מופעל לארגון/Enterprise? בעת שינוי מסננים, נסו להתאים את תאריך "מ". {message}',
    serverError: '500 שגיאת שרת פנימית — כנראה באג באפליקציה. שגיאה: {message}',
    generic: 'שגיאה {status}: {message}',
  },
  dateRange: {
    from: 'מ-',
    to: 'עד',
    excludeHolidays: 'החרג חגים מהמדדים',
    last28Days: '28 הימים האחרונים',
    selectRange: 'בחרו טווח תאריכים',
    exclHolidays: ', ללא חגים',
    reportSuffix: '· דוח {range}',
    forSingleDay: 'עבור {date}{holidayNote}',
    overLast28: 'ב-28 הימים האחרונים{holidayNote}',
    fromTo: 'מ-{from} עד {to} ({days} ימים){holidayNote}',
    excludingHolidays: ' (ללא חגים/סופי שבוע)',
    summarySingle: '{date}{holidayNote}',
    summaryLast28: '28 הימים האחרונים{holidayNote}',
    summaryRange: '{from} – {to} ({days} ימ{holidayNote})',
  },
  metrics: {
    acceptanceRateByCount: 'שיעור קבלה (לפי ספירה)',
    totalSuggestions: 'סה״כ הצעות (פרומפטים)',
    acceptanceRateByLines: 'שיעור קבלה (לפי שורות)',
    totalLinesSuggested: 'סה״כ שורות קוד שהוצעו',
    kpiTooltipAcceptanceCount:
      'יחס הצעות שאושרו לסה״כ הצעות (לפי מספר פרומפטים). מצביע על תדירות קבלת הצעות Copilot; יש לפרש בהקשר אופן השימוש בצוות.',
    kpiTooltipTotalSuggestions:
      'מספר הצעות הקוד (פרומפטים) ש-Copilot הציע בתקופה שנבחרה. משקף מעורבות ונפח פעילות.',
    kpiTooltipAcceptanceLines:
      'יחס שורות שאושרו לסה״כ שורות שהוצעו. מודד קבלה לפי נפח קוד ולא לפי מספר פרומפטים.',
    kpiTooltipTotalLines:
      'סה״כ שורות קוד ש-Copilot הציע בתקופה. מראה את היקף הקוד שנוצר או סונכרן.',
    chartAcceptanceRateByCount: 'שיעור קבלה לפי ספירה (%)',
    chartSuggestionsAcceptances: 'סה״כ הצעות | סה״כ קבלת הצעת קוד',
    chartAcceptanceRateByLines: 'שיעור קבלה לפי שורות (%)',
    chartLinesSuggestedAccepted: 'שורות שהוצעו | שורות שאושרו',
    chartTotalActiveUsers: 'סה״כ משתמשים פעילים',
    chartDauWauMau: 'DAU / WAU / MAU',
    legendTotalSuggestions: 'סה״כ הצעות',
    legendTotalAcceptance: 'סה״כ קבלת הצעת קוד',
    legendTotalLinesSuggested: 'סה״כ שורות שהוצעו',
    legendTotalLinesAccepted: 'סה״כ שורות שאושרו',
    legendAcceptanceRateLines: 'שיעור קבלה לפי שורות',
    legendAcceptanceRateCount: 'שיעור קבלה לפי ספירה',
    legendTotalActiveUsers: 'סה״כ משתמשים פעילים',
    legendDau: 'DAU',
    legendWau: 'WAU',
    legendMau: 'MAU',
  },
  chat: {
    cumulativeTurns: 'סה״כ תורות מצטבר',
    cumulativeAcceptances: 'סה״כ קבלת הצעת קוד מצטבר',
    kpiTooltipTurns:
      'סה״כ תורות צ׳אט בתקופה שנבחרה. תורה היא הודעת משתמש או עוזר בצ׳אט Copilot.',
    kpiTooltipAcceptances:
      'סה״כ קבלת הצעת קוד בצ׳אט בתקופה. מראה באיזו תדירות מאושרות הצעות הצ׳אט.',
    chartAcceptancesTurns: 'סה״כ קבלת הצעת קוד | סה״כ תורות',
    chartActiveUsers: 'סה״כ משתמשי Copilot Chat פעילים',
    chartByMode: 'בקשות צ׳אט לפי מצב',
    legendAcceptances: 'סה״כ קבלת הצעת קוד',
    legendTurns: 'סה״כ תורות',
    legendActiveUsers: 'סה״כ משתמשי צ׳אט פעילים',
    modeAsk: 'שאלה',
    modeEdit: 'עריכה',
    modePlan: 'תכנון',
    modeAgent: 'סוכן',
    modeCustom: 'מותאם',
    modeUnknown: 'לא ידוע',
  },
  breakdown: {
    entityLanguage: 'שפה',
    entityEditor: 'עורך',
    entityLanguages: 'שפות',
    entityEditors: 'עורכים',
    kpiCount: 'מספר {entity}',
    kpiTooltip: 'מספר {entity} ייחודיים עם פעילות Copilot בתקופה שנבחרה.',
    chartTopAccepted: '5 {entities} מובילים לפי הצעות שאושרו',
    chartAcceptanceByCount: 'שיעור קבלה (ספירה) ל-5 {entities} המובילים',
    chartAcceptanceByLines: 'שיעור קבלה (שורות) ל-5 {entities} המובילים',
    tableTitle: 'פירוט {entities}',
    headerName: 'שם {entity}',
    headerAcceptedPrompts: 'פרומפטים שאושרו',
    headerSuggestedPrompts: 'פרומפטים שהוצעו',
    headerAcceptedLines: 'שורות קוד שאושרו',
    headerSuggestedLines: 'שורות קוד שהוצעו',
    headerAcceptanceCount: 'שיעור קבלה לפי ספירה (%)',
    headerAcceptanceLines: 'שיעור קבלה לפי שורות (%)',
  },
  teams: {
    loading: 'טוען צוותים',
    title: 'השוואת צוותים',
    subtitle: 'בחרו צוותים להשוואת מדדים ב-{scope} שלכם',
    searchLabel: 'חפשו ובחרו צוותים להשוואה',
    searchHint:
      'הקלידו לסינון ובחירת מספר צוותים מה-{scope}. המדדים מצטברים לפי צוות לטווח התאריכים שנבחר.',
    clearAll: 'נקה הכל',
    selectedTeams: 'צוותים שנבחרו',
    viewDetails: 'הצג פרטים',
    teamsSelected: 'צוותים שנבחרו',
    totalActiveUsers: 'סה״כ משתמשים פעילים',
    kpiTooltipTeams: 'מספר הצוותים שנבחרו להשוואה.',
    kpiTooltipUsers: 'סה״כ משתמשי Copilot פעילים בכל הצוותים שנבחרו.',
    noLanguageData: 'אין נתוני שפה לצוותים שנבחרו',
    noEditorData: 'אין נתוני עורך לצוותים שנבחרו',
    noTeamsTitle: 'לא נבחרו צוותים',
    noTeamsText: 'בחרו צוות אחד או יותר מהרשימה למעלה כדי להשוות מדדי Copilot.',
    scopeEnterprise: 'ארגון-על',
    scopeOrganization: 'ארגון',
    chartAcceptanceCount: 'שיעור קבלה לפי ספירה (%)',
    chartSuggestions: 'סה״כ הצעות | סה״כ קבלת הצעת קוד',
    chartAcceptanceLines: 'שיעור קבלה לפי שורות (%)',
    chartLines: 'שורות שהוצעו | שורות שאושרו',
    chartActiveUsers: 'סה״כ משתמשים פעילים',
    chartIdeCompletions: 'שימוש בהשלמות IDE',
    chartIdeChat: 'שימוש בצ׳אט IDE',
    chartDotcomChat: 'שימוש בצ׳אט GitHub.com',
    chartDotcomPr: 'שימוש ב-PR ב-GitHub.com',
    chartLanguage: 'שימוש לפי שפה לפי צוות',
    chartEditor: 'שימוש לפי עורך לפי צוות',
    legendAcceptanceRate: '{team} - שיעור קבלה (%)',
    legendSuggestions: '{team} - הצעות',
    legendAcceptances: '{team} - קבלת הצעת קוד',
    legendLinesSuggested: '{team} - שורות שהוצעו',
    legendLinesAccepted: '{team} - שורות שאושרו',
    legendActiveUsers: '{team} - משתמשים פעילים',
    legendIdeCompletions: 'משתמשי השלמות IDE',
    legendIdeChat: 'משתמשי צ׳אט IDE',
    legendCli: 'משתמשי CLI פעילים',
    legendCodeReview: 'משתמשי סקירת קוד פעילים',
  },
  seats: {
    totalAssigned: 'סה״כ מוקצים',
    assignedNeverUsed: 'מוקצים אך לא בשימוש',
    noActivity7: 'ללא פעילות ב-7 הימים האחרונים',
    noActivity30: 'ללא פעילות ב-30 הימים האחרונים',
    subtitleAssigned: 'מושבים מוקצים כעת',
    subtitleAssignedTeam: 'מושבים מוקצים לצוות "{team}"',
    subtitleNeverUsed: 'מושבים ללא שימוש',
    subtitleNoUse7: 'ללא שימוש ב-7 הימים האחרונים',
    subtitleNoUse30: 'ללא שימוש ב-30 הימים האחרונים',
    filterHint: 'מוצג בטבלה · לחצו שוב לניקוי',
    billingTitle: 'מדיניות מנוי Copilot',
    plan: 'תוכנית:',
    ideChat: 'צ׳אט IDE:',
    platformChat: 'צ׳אט פלטפורמה:',
    cli: 'CLI:',
    publicSuggestions: 'הצעות קוד ציבוריות:',
    seatManagement: 'ניהול מושבים:',
    totalSeats: 'סה״כ מושבים:',
    activeCycle: 'פעילים במחזור זה:',
    tableAll: 'כל המושבים המוקצים',
    tableNeverUsed: 'מוקצים אך לא בשימוש',
    tableNoActivity7: 'ללא פעילות ב-7 הימים האחרונים',
    tableNoActivity30: 'ללא פעילות ב-30 הימים האחרונים',
    colSerial: 'מס׳',
    colLogin: 'התחברות',
    colGithubId: 'מזהה GitHub',
    colTeam: 'צוות מקצה',
    colAssigned: 'זמן הקצאה',
    colLastActivity: 'פעילות אחרונה',
    colLastEditor: 'עורך אחרון',
    tooltipTotal:
      'סה״כ מושבי Copilot מוקצים {scope}. לחצו להצגת כל המושבים בטבלה.',
    tooltipNeverUsed:
      'מושבים מוקצים שלא נעשה בהם שימוש. לחצו לסינון הטבלה.',
    tooltipInactive:
      'מושבים ללא שימוש או שפעילותם האחרונה לפני יותר מ-{days} ימים. לחצו לסינון.',
    scopeInOrg: 'בתוך הארגון',
    scopeInEnt: 'בתוך ארגון-העל',
    scopeToTeam: 'לצוות "{team}"',
    scopeCurrentOrgEnt: 'בתוך הארגון/ארגון-העל הנוכחי',
  },
  api: {
    checkQuality: 'בדיקת איכות נתוני מדדים',
    copyClipboard: 'העתקת מדדים ללוח',
    downloadCsvSummary: 'הורדת CSV (סיכום)',
    downloadCsvFull: 'הורדת CSV (מלא)',
    downloadNdjson: 'הורדת NDJSON (מלא)',
    showSeatCount: 'הצגת מספר מושבים מוקצים',
    copied: 'הועתק ללוח!',
    copyFailed: 'לא ניתן להעתיק!',
    allValid: 'כל המדדים תקינים!',
    inconsistent: 'ייתכן שחלק מהמדדים אינם עקביים — בדקו את תגובת ה-API.',
    seatCount: 'מספר מושבים: {count}',
    csvSummaryOk: 'קובץ CSV (סיכום) הורד בהצלחה!',
    csvFullOk: 'קובץ CSV (מלא) הורד בהצלחה!',
    noExportData: 'אין נתוני מדדים לייצוא.',
    csvError: 'שגיאה ביצירת קובץ CSV.',
    ndjsonOk: 'קובץ NDJSON (מלא) הורד בהצלחה!',
    ndjsonError: 'שגיאה ביצירת קובץ NDJSON.',
  },
  billing: {
    loading: 'טוען שימוש וחיוב',
    errorTitle: 'שגיאה בטעינת שימוש וחיוב',
    errorLoad: 'טעינת תובנות השימוש נכשלה.',
    title: 'תובנות שימוש וחיוב',
    subtitle:
      'פעילות מודלים לפי משתמש מדוחות Copilot Metrics; סכומים בדולר מ-GitHub Billing Usage כשזמין.',
    emailUnavailableTitle: 'אימיילים לא זמינים מ-GitHub API',
    emailUnavailableBody:
      'אימיילי משתמשים אינם כלולים בתגובות API של מדדי Copilot. השתמשו בהתחברות או בשם תצוגה. לייצוא אימיילים נדרש admin:org וייתכן ש-SAML מגביל.',
    filterUser: 'סינון לפי משתמש',
    filterHint: 'חיפוש לפי התחברות, שם תצוגה או אימייל כשזמין',
    showingUser: 'מציג: {user}',
    noUserData: 'אין נתוני שימוש למשתמש זה בחלון הדוח',
    billingNotLoadedTitle: 'נתוני Billing API לא נטענו',
    billingNotLoadedSummary: 'נקודות הקצה של שימוש בחיוב לא החזירו נתונים.',
    billingNotLoadedDetail:
      'מדדי השימוש למטה עדיין משקפים דוח users-28-day. הפעילו enhanced billing והעניקו manage_billing:copilot, והתנתקו והתחברו מחדש.',
    kpiNetSpend: 'סה״כ הוצאה נטו (תקופה)',
    kpiPremiumRequests: 'בקשות פרימיום (PRU)',
    kpiModelsBilled: 'מודלים בחיוב (PRU)',
    kpiHintSku: '{count} סוגי שורות SKU',
    kpiHintUsers: '{count} משתמשים עם PRU',
    kpiHintDistinct: 'מודלים ייחודיים בדוח פרימיום',
    kpiActiveUsers: 'משתמשים פעילים',
    kpiInteractions: 'אינטראקציות',
    kpiGenerations: 'יצירות',
    kpiAcceptances: 'קבלת הצעת קוד',
    kpiLocAdded: 'שורות קוד שנוספו',
    kpiModelsUsed: 'מודלים בשימוש',
    kpiAgentUsers: 'משתמשי סוכן',
    kpiChatUsers: 'משתמשי צ׳אט',
    chartTopModels: 'מודלים מובילים לפי אינטראקציות',
    chartFeatureAdoption: 'אימוץ תכונות',
    chartCostBySku: 'עלות לפי SKU',
    chartPremiumByModel: 'בקשות פרימיום לפי מודל',
    chartTeamUsage: 'שימוש צוות (יום user-teams אחרון)',
    tableLeaderboard: 'לוח מובילים משתמשים',
    colUser: 'משתמש',
    colInteractions: 'אינטראקציות',
    colGenerations: 'יצירות',
    colAcceptances: 'קבלת הצעת קוד',
    colLocAdded: 'שורות שנוספו',
    colModels: 'מודלים',
    colTopModel: 'מודל מוביל',
    colAgent: 'סוכן',
    colChat: "צ'אט",
    colPremiumCredits: 'קרדיט פרימיום',
    colPruCost: 'עלות PRU',
    colUsage: 'שימוש',
    dataSources: 'מקורות נתונים:',
    dataSourcesBilling:
      'users-28-day, user-teams-1-day, billing usage ו-premium requests APIs.',
    dataSourcesNoBilling:
      'Billing REST לא זמין — תואם לייצוא CSV ידני כשהארגון מפעיל enhanced billing.',
    legendInteractions: 'אינטראקציות',
    legendNetUsd: 'נטו $',
    legendPru: 'כמות PRU',
    billingApiRequired: 'נדרש Billing usage API',
    percentPruLeft: '{percent}% · נותרו {left} PRU',
    pruLeft: 'PRU נותרו',
    usedQuota: '{used} / {quota} בשימוש',
    estimated: '(משוער)',
    perUserUnavailable: '(PRU למשתמש לא ב-API של הארגון)',
    perUserUnavailableHint:
      'ל-API חיוב של ארגון בבעלות enterprise אין שורות PRU לפי משתמש. הגדירו NUXT_PUBLIC_GITHUB_ENT ו-admin:enterprise ב-PAT.',
    premiumCreditsCacheHint:
      'שימוש פרימיום נטען לפי משתמש מ-API החיוב (10 במקביל). התוצאות נשמרות במטמון שרת ל-10 דקות.',
    premiumCreditsLoading: 'טוען…',
    premiumCreditsDisabledIp:
      'מושבת לעת עתה — Billing API חסום בהגבלת IP (allowlist).',
    premiumCreditsDisabledIpShort: 'מושבת (IP allowlist)',
    premiumCreditsDisabledIpHint:
      'עמודת קרדיט פרימיום תחזור כשתותר גישת רשת ל-GitHub Billing Usage מהפריסה הזו.',
    leaderboardColumnHints:
      'שלב אימוץ AI: תווית בשלות Copilot לכל משתמש מדוח 28 הימים (ריחוף על הצ\'יפ). קרדיט פרימיום: מכסת PRU חודשית כש-Billing API פעיל.',
    kpiTooltipActiveUsers:
      'משתמשים עם לפחות אינטראקציית Copilot אחת בדוח המשתמשים לתקופה שנבחרה.',
    kpiTooltipInteractions:
      'סה״כ אינטראקציות מודל (פרומפטים, תורות צ׳אט וכו׳) מצטברות על כל המשתמשים.',
    kpiTooltipGenerations:
      'סה״כ יצירות שמודלי Copilot הפיקו בחלון הדוח.',
    kpiTooltipAcceptances:
      'סה״כ קבלת הצעת קוד של הצעות או פלטים של Copilot על כל המשתמשים.',
    kpiTooltipLocAdded:
      'סה״כ שורות קוד שנוספו דרך תכונות סוכן או השלמות של Copilot.',
    kpiTooltipModelsUsed:
      'מודלי Copilot ייחודיים שבהם השתמש לפחות משתמש אחד בתקופה.',
    kpiTooltipAgentUsers:
      'משתמשים שהשתמשו בתכונות סוכן של Copilot (למשל מצב סוכן) בתקופה.',
    kpiTooltipChatUsers:
      'משתמשים שהשתמשו בתכונות צ׳אט של Copilot בתקופה.',
    kpiTooltipNetSpend:
      'סה״כ הוצאה נטו של Copilot לתקופה שנבחרה מ-GitHub Billing Usage API (כל שורות ה-SKU).',
    kpiTooltipPremiumRequests:
      'סה״כ יחידות בקשות פרימיום (PRU) שנצרכו בתקופה — שימוש במודלים מעבר למכסה.',
    kpiTooltipModelsBilled:
      'מספר מודלים ייחודיים שגרמו לחיוב פרימיום (PRU) בדוח החיוב.',
    dataSourcesMetrics:
      'users-28-day/latest (מודלים, תכונות, פעילות); user-teams-1-day (צבירת צוותים);',
    dataSourcesBillingEndpoints:
      'billing/usage, billing/usage/summary, billing/premium_request/usage.',
    leaderboardReportLabel: 'דוח שימוש 28 יום',
    premiumQuotaPerSeat: 'בקשות פרימיום (חיוב) · עד {quota} PRU/מושב לחודש',
  },
  users: {
    loading: 'טוען מדדי משתמשים',
    errorTitle: 'שגיאה בטעינת מדדי משתמשים',
    errorLoad: 'טעינת מדדי משתמשים נכשלה.',
    errorBilling: 'בדיקת סטטוס החיוב נכשלה.',
    title: 'שימוש Copilot לפי משתמש',
    billingStatus: 'סטטוס חיוב',
    billingStatusHint:
      'בודק את GitHub Billing Usage API לנתוני בקשות פרימיום. דורש manage_billing:copilot.',
    checkNow: 'בדוק עכשיו',
    premiumNeedsBillingTitle: 'קרדיט פרימיום דורש נתוני חיוב',
    premiumNeedsBillingBody:
      'נתוני שימוש בחיוב לא זמינים. הפעילו enhanced billing ו-manage_billing:copilot על הטוקן.',
    tokenScopes: 'הרשאות טוקן נוכחיות: {scopes}',
    addScope:
      'הוסיפו manage_billing:copilot לאפליקציית OAuth והתנתקו והתחברו מחדש.',
    premiumCreditsNote:
      'קרדיט פרימיום משתמש ב-Billing Usage עבור {dates} ({count} משתמשים עם PRU בתקופה).',
    filterByDay: 'סינון לפי יום (דוח users-1-day)',
    filterDayHint: 'השאירו ריק לדוח 28 יום מתגלגל אחרון',
    filterUser: 'סינון לפי משתמש',
    applyFilters: 'החל מסננים',
    searchUsers: 'חיפוש משתמשים',
    tableTitle: 'משתמשים',
    subtitleBillingUnavailable: 'קרדיט פרימיום: Billing API לא זמין לתקופה זו.',
    subtitleBillingRange: 'חיוב: {range}',
    subtitleBillingRangeDetailed:
      'חיוב: {since} → {until} ({count} משתמשים עם נתוני PRU)',
    billingUnavailablePeriod:
      'נתוני שימוש בחיוב לא זמינים לתקופה זו ({since} → {until}).',
    billingHttpStatus: 'GitHub החזיר HTTP {status}.',
    billingReasonFallback:
      'הפעילו enhanced billing ו-manage_billing:copilot על הטוקן.',
    addScopePat:
      'הוסיפו manage_billing:copilot לאפליקציית GitHub או ל-PAT, והתנתקו והתחברו מחדש.',
    billingStatusHintColumn:
      'בודק את GitHub Billing Usage API עבור עמודת "Premium credits".',
    reportDay: 'יום: {day}',
    usersWithPruInWindow: '{count} משתמשים עם שימוש PRU בחלון זה.',
    perUserPruUnavailable:
      'ה-API לחיוב מחובר, אך GitHub לא מחזיר שימוש פרימיום לפי משתמש לארגון בבעלות enterprise דרך REST של הארגון. הגדירו NUXT_PUBLIC_GITHUB_ENT (למשל your-enterprise) ב-PAT קלאסי עם admin:enterprise.',
    premiumLoadingProgress:
      'טוען קרדיטים פרימיום מ-API החיוב… {loaded} / {total} משתמשים (מטמון 10 דק׳).',
    premiumCreditsComingSoonTitle: 'קרדיט פרימיום — בקרוב',
    premiumCreditsComingSoonBody:
      'שליפת PRU לפי משתמש מ-GitHub Billing API מושבתת זמנית. מדדי השימוש בטבלה נטענים מדוחות Copilot metrics. הגדירו NUXT_PUBLIC_PREMIUM_CREDITS_FETCH_ENABLED=true כשגישת החיוב והרשת מוכנות.',
    premiumCreditsComingSoonHint:
      'נדרש API חיוב ברמת enterprise לארגונים בבעלות enterprise. ראו תיעוד → קרדיט פרימיום.',
  },
  usageInsights: {
    loading: 'טוען תובנות שימוש',
    errorTitle: 'שגיאה בטעינת סטטיסטיקות',
    errorLoad: 'שליפת סטטיסטיקות GitHub נכשלה',
    title: 'תובנות שימוש Copilot',
    ideCompletions: 'השלמות IDE',
    ideChat: "צ'אט IDE",
    totalUsersActivity: 'סה״כ משתמשים עם פעילות',
    modelsUsed: '{count} מודלים בשימוש',
    copilotCli: 'Copilot CLI',
    cliActiveUsers: 'משתמשי CLI פעילים (סכום לתקופה)',
    codeReview: 'סקירת קוד',
    activeReviewUsers: 'משתמשי סקירה פעילים (סכום)',
    passive: 'פסיבי: {count}',
    agentLocAdded: 'שורות קוד שנוספו על ידי סוכן: {count}',
    chartFeatureUsage: 'שימוש בתכונות Copilot לאורך זמן',
    chartDauWauMau: 'DAU / WAU / MAU',
    chartChatByMode: 'בקשות צ׳אט לפי מצב',
    chartCli: 'שימוש ב-CLI',
    chartModels: 'מודלים בשימוש על ידי משתמשים',
    yAxisUsers: 'משתמשים עם פעילות',
    panelCompletions: 'מודלי השלמות IDE ({count})',
    panelChat: "מודלי צ'אט IDE ({count})",
    colModel: 'שם מודל',
    colEditor: 'עורך',
    colType: 'סוג',
    colTotalUsers: 'סה״כ משתמשים עם פעילות',
    colTotalChats: 'סה״כ צ׳אטים',
    colInsertions: 'הכנסות',
    colCopyEvents: 'אירועי העתקה',
    kpiTooltipCompletions: 'משתמשים עם פעילות השלמות IDE בתקופה שנבחרה.',
    kpiTooltipChat: 'משתמשים עם פעילות צ׳אט IDE בתקופה שנבחרה.',
    kpiTooltipCli: 'סכום משתמשי Copilot CLI פעילים יומיים לאורך התקופה.',
    kpiTooltipReview:
      'משתמשים עם מעורבות פעילה בסקירת קוד; מדדי פסיבי וסוכן מוצגים למטה.',
  },
  userDetail: {
    premiumCredits: 'קרדיט פרימיום',
    pruCost: 'עלות PRU (תקופה)',
    teamsSnapshot: 'צוותים (צילום user-teams אחרון)',
    agent: 'סוכן',
    chat: "צ'אט",
    cli: 'CLI',
    noBreakdown: 'אין פירוט מודל או תכונה למשתמש זה בחלון הדוח.',
    kpiInteractions: 'אינטראקציות',
    kpiGenerations: 'יצירות',
    kpiAcceptances: 'קבלת הצעת קוד',
    kpiLocAdded: 'שורות שנוספו',
    chartTopModels: 'מודלים מובילים (אינטראקציות)',
    chartActivityMix: 'תמהיל פעילות',
    chartFeatures: 'תכונות (אינטראקציות)',
    chartModelFeature: 'מודל × תכונה (אינטראקציות)',
    legendInteractions: 'אינטראקציות',
    legendCount: 'ספירה',
    activityInteractions: 'אינטראקציות',
    activityGenerations: 'יצירות',
    activityAcceptances: 'קבלת הצעת קוד',
  },
  charts: {
    acceptanceRateByCount:
      'אחוז יומי של הצעות Copilot שאושרו מול סה״כ הצעות (לפי ספירת פרומפטים). עוזר לראות אם ההצעות שימושיות יותר לאורך זמן.',
    totalSuggestionsAndAcceptances:
      'נפח יומי של הצעות ש-Copilot הציע וכמה אושרו. מפריד בין רמת פעילות לאיכות קבלה.',
    acceptanceRateByLines:
      'אחוז יומי של שורות קוד שהוצעו ואושרו. משלים את שיעור הקבלה לפי ספירה כשהשינויים גדולים או קטנים.',
    totalLinesSuggestedAccepted:
      'שורות קוד יומיות שהוצעו מול שורות שאושרו בקוד. מראה כמה קוד שנוצר באמת נשמר.',
    totalActiveUsers:
      'מספר משתמשים עם פעילות Copilot בכל יום בטווח שנבחר. מצביע על אימוץ והיקף שימוש.',
    dauWauMau:
      'משתמשים פעילים יומיים (DAU), שבועיים (WAU) וחודשיים (MAU). השוו בין קפיצות קצרות למעורבות ארוכת טווח.',
    chatAcceptancesAndTurns:
      'קבלת הצעת קוד בצ׳אט יומית לצד סה״כ תורות (משתמש + עוזר). מראה עוצמת צ׳אט מול תדירות קבלת הצעת קוד.',
    chatActiveUsers:
      'משתמשים שהשתמשו בצ׳אט Copilot בכל יום. שימושי להפרדת אימוץ צ׳אט מהשלמות קוד.',
    chatRequestsByMode:
      'שימוש בצ׳אט לפי מצב (שאלה, סוכן, עריכה, תכנון וכו׳) לאורך זמן. מראה אילו תהליכי עבודה מועדפים.',
    usageInsightsOverview:
      'שימוש בתכונות ומודלים של Copilot ברמת הארגון ממדדים יומיים של ארגון/Enterprise לטווח התאריכים.',
    copilotFeatureUsageOverTime:
      'מגמת תכונות Copilot (השלמות, צ׳אט, CLI, סקירת קוד) יום-יום. זיהוי שינויים באופן השימוש.',
    usageInsightsDauWauMau:
      'משתמשים פעילים יומיים, שבועיים וחודשיים ממדדי ארגון. אותה לוגיקת DAU/WAU/MAU כמו בלשונית ארגון.',
    usageInsightsChatByMode:
      'בקשות צ׳אט IDE לפי מצב לוח הצ׳אט לאורך זמן (שאלה, סוכן, עריכה, תכנון, מותאם).',
    usageInsightsCli:
      'סכום משתמשי Copilot CLI פעילים יומיים. מראה אימוץ שורת פקודה לאורך זמן.',
    modelsUsedByUsers:
      'אילו מודלי AI שימשו להשלמות וצ׳אט IDE וכמה משתמשים מעורבים לכל מודל.',
    teamsAcceptanceRateByCount:
      'השוואת צוותים: שיעור קבלה לפי ספירת הצעות. גבוה יותר = יותר פרומפטים שאושרו.',
    teamsTotalSuggestions:
      'השוואת צוותים בהצעות יומיות מול קבלת הצעת קוד. אילו צוותים מייצרים ומאשרים הכי הרבה.',
    teamsAcceptanceRateByLines:
      'השוואת שיעור קבלה לפי שורות בין צוותים. שימושי כשגדלי שינוי שונים.',
    teamsLinesSuggestedAccepted:
      'שורות שהוצעו מול שורות שאושרו לפי צוות. מדגיש צוותים שמשלבים יותר קוד מוצע.',
    teamsActiveUsers:
      'משתמשי Copilot פעילים לפי צוות לאורך זמן. אימוץ יחסי בין צוותים שנבחרו.',
    teamsIdeCompletions:
      'שימוש בהשלמות IDE לפי צוות. השוואת מעורבות השלמות בין צוותים.',
    teamsIdeChat:
      'שימוש בצ׳אט IDE לפי צוות. אילו צוותים מסתמכים יותר על Copilot שיחתי.',
    teamsDotcomChat:
      'שימוש בצ׳אט Copilot ב-GitHub.com לפי צוות כשזמין במדדים.',
    teamsDotcomPr:
      'שימוש ב-Copilot ב-PR ב-GitHub.com לפי צוות (למשל סיכומי PR) כשזמין.',
    teamsLanguageUsage:
      'פירוט פעילות Copilot לפי שפת תכנות לכל צוות שנבחר.',
    teamsEditorUsage:
      'פירוט פעילות Copilot לפי עורך (VS Code, JetBrains וכו׳) לכל צוות.',
    billingTopModels:
      'מודלים עם הכי הרבה אינטראקציות בדוח users-28-day (כל המשתמשים).',
    billingFeatureAdoption:
      'חלק האינטראקציות לפי תכונת Copilot (השלמות, מצבי צ׳אט, סוכן וכו׳) בארגון.',
    billingCostBySku:
      'הוצאה נטו לפי SKU מ-Billing Usage API לתקופה שנבחרה. דורש manage_billing:copilot.',
    billingPremiumByModel:
      'יחידות בקשות פרימיום (PRU) לפי מודל כשנתוני חיוב זמינים.',
    billingTeamUsage:
      'סה״כ אינטראקציות לפי צוות מצילום user-teams האחרון. אילו צוותים מניעים שימוש.',
    userTopModels:
      'אינטראקציות המשתמש לפי מודל AI. אילו מודלים בשימוש תדיר.',
    userActivityMix:
      'אינטראקציות, יצירות וקבלת הצעת קוד של המשתמש זה לצד זה לחלון הדוח.',
    userFeatures:
      'חלק האינטראקציות של המשתמש לפי תכונת Copilot (מצב צ׳אט, השלמות, סוכן).',
    userModelFeature:
      'שילובי מודל + תכונה מובילים למשתמש. האם הוא משתמש בצ׳אט מול השלמות על מודלים מסוימים.',
    breakdownTopAcceptedPrompts:
      'חמש ממדי הפירוט (למשל שפות) עם הכי הרבה הצעות Copilot שאושרו בתקופה.',
    breakdownAcceptanceRateByCount:
      'שיעור קבלה לפי ספירת הצעות לחמש ממדים מובילים. אילו תחומים מקבלים הכי הרבה.',
    breakdownAcceptanceRateByLines:
      'שיעור קבלה לפי שורות קוד לחמש ממדים מובילים. שימושי כשגודל השינוי משתנה.',
    adoptionPhases:
      'שלבי אימוץ Copilot ל-28 יום (≥2 ימים פעילים): ללא cohort, Code first, Agent first, Multi-agent. בכל כרטיס — מעורבים ב-cohort וספירה מדוח המשתמשים כששניהם זמינים.',
  },
  adoption: {
    panelTitle: 'קבוצות אימוץ AI',
    panelSubtitle:
      'סיווג משתמשים בחלון 28 יום מתגלגל (GitHub Copilot usage metrics API). השלבים מבוססים על אילו משטחי Copilot נוצלו בלפחות יומיים.',
    panelTooltip:
      'GitHub מסווג כל משתמש לשלב אימוץ מ-28 הימים האחרונים (לפחות 2 ימים פעילים): ללא cohort → Code first (בעיקר IDE) → Agent first → Multi-agent.',
    panelTooltipDual:
      'בכל כרטיס שני מספרים: מעורבים ב-cohort — סיכום ארגון מדוח 28 יום; בדוח משתמשים — משתמשים עם התווית בטבלת Users (כמו בעמודת השלב).',
    dualMetricsNote:
      'שני מונים: מעורבים ב-cohort לפי דוח ארגון (28 יום, ≥2 ימים פעילים) לעומת תוויות בדוח המשתמשים (כמו בעמודת הטבלה).',
    kpiSectionCohort: 'מעורבים ב-cohort (דוח ארגון 28 יום)',
    kpiSectionReport: 'מתויגים בדוח משתמשים',
    engagedUsers: 'משתמשים מעורבים',
    engagedUsersCohort: 'מעורבים ב-cohort',
    labeledInReport: 'בדוח משתמשים',
    chartUsersByPhase: 'משתמשים לפי שלב אימוץ',
    chartCohortEngaged: 'מעורבים ב-cohort',
    chartLabeledInReport: 'מתויגים בדוח',
    colLabeledUsers: 'בדוח משתמשים',
    tableTitle: 'ממוצעים לפי cohort',
    tableSubtitle: 'ממוצעים למשתמש בכל שלב (לא סכומים).',
    colPhase: 'שלב',
    colEngagedUsers: 'משתמשים מעורבים',
    colAvgInteractions: 'ממוצע אינטראקציות',
    colAvgGenerations: 'ממוצע יצירות',
    colAvgAcceptances: 'ממוצע קבלות',
    colAvgLocAdded: 'ממוצע שורות שנוספו',
    colAvgLocDeleted: 'ממוצע שורות שנמחקו',
    colAvgPrCreated: 'ממוצע PR שנוצרו',
    colAvgPrMerged: 'ממוצע PR שמוזגו',
    colAvgPrReviewed: 'ממוצע PR שנסקרו',
    colMedianMinutesToMerge: 'ממוצע חציון דקות למיזוג',
    colAdoptionPhase: 'שלב אימוץ AI',
    colAdoptionPhaseHint:
      'קוהורטה למשתמש מדוח מדדי שימוש Copilot (חלון 28 יום, מעורבות ב≥2 ימים). Code first = בעיקר השלמות קוד ו/או IDE agent mode; Agent first / Multi-agent = משטחי סוכן ב-GitHub. ריחוף על הצ\'יפ בשורה להסבר מלא.',
    leaderboardColumnNote:
      'עמודת שלב אימוץ AI מציגה את סיווג המשתמש בדוח המשתמשים האחרון. ריחוף על צ\'יפ (למשל Code first) להסבר השלב.',
    phaseUnknown: 'לא מסווג',
    phase0Title: 'ללא cohort',
    phase0Hint: 'לא עמד בקריטריוני מעורבות ל-cohort בחלון 28 הימים.',
    phase1Title: 'קודם (Code first)',
    phase1Hint:
      'שלב 1 (Code first): המשתמש עמד בקריטריון מעורבות בהשלמות קוד ו/או Copilot IDE agent mode בלפחות יומיים ב-28 האחרונים — שימוש ממוקד בעזרה בתוך העורך לפני משטחי סוכן רחבים יותר ב-GitHub.',
    phase2Title: 'סוכן (Agent first)',
    phase2Hint: 'משטח סוכן אחד מבוסס GitHub (ענן, code review או CLI).',
    phase3Title: 'רב-סוכנים',
    phase3Hint: 'שני משטחי סוכן או יותר, או אפליקציית GitHub Copilot.',
    versionLabel: 'גרסת סיווג: {version}',
  },

}

export default he
