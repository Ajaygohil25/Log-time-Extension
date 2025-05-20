# Log Time ETA Chrome Extension

A lightweight Chrome extension that calculates when you will complete your specified work hours (e.g., 8:00, 8:20, 9:00) based on the current time entry displayed on your company's portal.

---

## 🗂️ Project Structure
```
log-time-eta-extension/
├── manifest.json       # Extension metadata and permissions
├── popup.html          # Popup UI (dark-themed) and styles
├── popup.js            # Main script: extracts logged time, computes ETAs, renders cards
├── background.js       # Service worker stub (Manifest V3 requirement)
├── icon.png            # 128×128 toolbar icon
└── README.md           # Project overview and setup instructions
```

---

## ⚙️ Customization
Open **`popup.js`** and modify the `targetTimes` array at the top:
```js
const targetTimes = [
  { label: 'Workday', hours: 8, minutes: 0 },
  { label: 'Extended', hours: 8, minutes: 20 },
  { label: 'Overtime', hours: 9, minutes: 0 },
];
```
- **Add or remove** items for any required thresholds.
- No other code changes are needed.

If your portal uses a different HTML structure, adjust the selector in `getTimeElementText()` inside **`popup.js`**:
```js
function getTimeElementText() {
  // e.g., using a table cell data-index
  const cells = document.querySelectorAll("td[data-index='4'] span.globalTable-Badge-label");
  if (cells.length) return cells[cells.length-1].textContent.trim();
  onsct fallback = document.querySelector("span.globalTable-Badge-label");
  return fallback ? fallback.textContent.trim() : null;
}
```

---

## 🚀 Installation
1. **Clone** the repo:
   ```bash
git clone https://github.com/Ajaygohil25/Log-time-Extension.git
   ```
2. **Open** Chrome and go to `chrome://extensions/`.
3. **Enable** **Developer mode** (toggle top-right).
4. **Load unpacked** and select the `log-time-eta-extension` folder.
5. **Pin** the extension and click the icon while on your portal page.

---

## 📃 License
MIT © Ajay Gohil
---

*Built with ❤️ to simplify your daily time tracking.*
