# PrepFlow Project Memory

## Real Project Path

The production app is located at:

C:\Users\Leon\source\repos\PrepFlow\apps\mobile

Always investigate this folder first.

Do NOT investigate:

* PrepFlowClean
* test projects
* archived folders

unless explicitly requested.

---

## Current Status

GitHub backup is healthy.

Latest stable commit:

75b99fe
"PrepFlow before clean rebuild"

Restore command:

git reset --hard HEAD

---

## UI Style

Target aesthetic:

* Premium chef software
* Apple Notes simplicity
* Clean spacing
* Minimal clutter
* Warm neutral colors
* Elegant typography
* Fast workflows

Avoid:

* Developer-looking layouts
* Excessive borders
* Dense tables
* Debug text

---

## Known Bugs

### Ingredient Form

Status:

Button works.

Confirmed:

LOG ADD PRESSED appears.

Problem occurs after state changes to:

setIsCreating(true)

Rendering a TextInput causes freeze.

Rendering only:

<Text>FORM TEST</Text>

works.

Do not investigate buttons, navigation, or Expo Router again.

Focus on TextInput rendering path.

---

## Inventory Health

Purpose:

Dashboard feed showing:

* Low stock items
* Inventory alerts
* Restock recommendations

Red notification badge should appear when alerts exist.

---

## Development Rules

Before editing:

1. Explain root cause.
2. Show files to be changed.
3. Make smallest possible change.
4. Never redesign multiple screens at once.
5. One bug at a time.

---

## Current Priorities

1. Restore Inventory Health feed.
2. Restore red notification badge.
3. Improve Recipes screen appearance.
4. Improve Menus screen appearance.
5. Improve Inventory screen appearance.
6. Improve Dashboard appearance.
7. Return to TextInput freeze investigation later.

---

## Commands

Start app:

cd C:\Users\Leon\source\repos\PrepFlow\apps\mobile

npx expo start -c

Git status:

git status

Restore modified file:

git restore "path"

Restore entire repo:

git reset --hard HEAD

## Inventory Health Root Cause

Current issue:

Dashboard shows healthy inventory even when inventory table is empty.

Investigation results:

* Inventory table contains 0 rows
* getLowStockItems() returns 0 rows
* lowStockCount = 0
* Red notification dot does not render

This is expected behavior under current logic.

Problem:

Dashboard treats "no inventory data" as "healthy inventory".

Desired behavior:

If inventory count = 0:

Show:

"No inventory data"

instead of:

"All systems stable"

Do not investigate notification dot again until inventory records exist.

Rule:
Always read MEMORY.md before investigating PrepFlow.