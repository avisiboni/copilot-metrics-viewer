---
# TODO: Translate to English — source of truth is Hebrew in website/docs/
---

---
title: עמודות Usage insights
---

# עמודות — לשונית Usage insights

![לשונית Usage insights](/img/ui/usage-insights-tab.png)

בנוסף ל-KPI וגרפים, הלשונית כוללת שתי **טבלאות מודלים** (`AgentModeViewer`) מתוך סטטיסטיקות GitHub (`/api/usage-insights`).

## טבלת מודלי השלמות IDE

| עמודה | מפתח | הסבר |
|--------|------|------|
| **שם מודל** | `name` | שם המודל |
| **עורך** | `editor` | עורך IDE (אם מפורט בדוח) |
| **סוג** | `model_type` | סוג מודל |
| **סה״כ משתמשים עם פעילות** | `total_engaged_users` | משתמשים עם פעילות במודל בטווח |

## טבלת מודלי צ'אט IDE

| עמודה | מפתח | הסבר |
|--------|------|------|
| **שם מודל** | `name` | שם המודל |
| **עורך** | `editor` | עורך |
| **סוג** | `model_type` | סוג מודל |
| **סה״כ משתמשים עם פעילות** | `total_engaged_users` | משתמשים פעילים |
| **סה״כ צ'אטים** | `total_chats` | מספר שיחות |
| **הכנסות** | `total_chat_insertion_events` | אירועי הכנסת קוד מצ'אט |
| **אירועי העתקה** | `total_chat_copy_events` | העתקות מצ'אט |

מפתחות: `usageInsights.col*`.

כשמופיע, פאנל **קוהורטות AI adoption** משתמש באותה טבלת cohort כמו ב-Organization — [עמודות cohort](./ai-adoption-cohorts#טבלת-ממוצעים-לפי-cohort).

קישור: [תובנות שימוש](../usage-insights).
