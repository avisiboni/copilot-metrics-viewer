---
# TODO: Translate to English — source of truth is Hebrew in website/docs/
---

---
title: עמודות שפות ועורכים
---

# עמודות — לשוניות Languages ו-Editors

![לשונית Languages](/img/ui/languages-tab.png)

אותה טבלה ב-`BreakdownComponent` — פעם לפי **שפה** (`tab=languages`) ופעם לפי **עורך** (`tab=editors`). הכותרות משתנות (שפה / עורך) אך המבנה זהה.

| # | עמודה | מפתח | הסבר |
|---|--------|------|------|
| 1 | **שם** (שפה / עורך) | `name` | שם השפה או העורך ממדדי היום |
| 2 | **פרומפטים שאושרו** | `acceptedPrompts` | סכום הצעות שאושרו בטווח |
| 3 | **פרומפטים שהוצעו** | `suggestedPrompts` | סכום הצעות שהוצעו |
| 4 | **שורות קוד שאושרו** | `acceptedLinesOfCode` | שורות שאושרו |
| 5 | **שורות קוד שהוצעו** | `suggestedLinesOfCode` | שורות שהוצעו |
| 6 | **שיעור קבלה לפי ספירה (%)** | `acceptanceRateByCount` | אחוז קבלה לפי מספר הצעות |
| 7 | **שיעור קבלה לפי שורות (%)** | `acceptanceRateByLines` | אחוז קבלה לפי שורות |

מפתחות i18n: `breakdown.header*` · `breakdown.tableTitle`.

מעל הטבלה: KPI **מספר שפות/עורכים**, גרפי עוגה ו-Bar ל-5 המובילים — ללא טבלה נפרדת.

קישור: [ארגון](../organization) (מדדי ארגון כלליים) · [מדריך UI](./overview).
