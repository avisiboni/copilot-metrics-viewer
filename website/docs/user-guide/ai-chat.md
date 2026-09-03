---
title: עוזר AI (צ'אט)
---

# עוזר AI בלוח הבקרה

![לשונית Copilot Chat (מדדי צ'אט)](/img/ui/copilot-chat-tab.png)

כפתור צף (FAB) עם אייקון רובוט (בפינה) פותח **עוזר שיחה** שעונה על שאלות לגבי המדדים בלוח — בהקשר של הלשונית הפעילה. לשונית **צ'אט Copilot** במסך מציגה מדדי שימוש בצ'אט (גרפים ו-KPI).

## הפעלה

```env
NUXT_PUBLIC_ENABLE_AI_CHAT=true   # ברירת מחדל: true
```

כדי להשבית:

```env
NUXT_PUBLIC_ENABLE_AI_CHAT=false
```

## אימות ל-GitHub Models

העוזר משתמש ב-[GitHub Models API](https://docs.github.com/en/github-models). נדרש **טוקן משתמש** (לא PAT השרת):

1. לחצו על FAB → אם אין טוקן, יוצג מסך הגדרה.
2. צרו Personal Access Token עם הרשאת `models:read` (או השלימו OAuth לפי ההוראות בממשק).
3. הדביקו את הטוקן — נשמר ב-session בדפדפן בלבד.

## שאלות מוצעות

השאלות המוצעות משתנות לפי **הלשונית הפעילה** (Organization, Users, Seat analysis וכו') — ראו `shared/i18n/aiChatSuggestions.ts`.

## API

- `POST /api/ai/chat` — שליחת הודעה; השרת מעביר ל-GitHub Models עם הקשר מוגבל.

## פרטיות

- הנתונים שנשלחים למודל הם סיכום/הקשר מהלוח — לא כל ה-raw API.
- טוקן המשתמש ל-Models **לא** מוחלף ב-`NUXT_GITHUB_TOKEN` של השרת.

## קישורים

- [ניווט ולשוניות](./ui-reference/shell-navigation)
- [נתיבי API](../reference/api-routes)
