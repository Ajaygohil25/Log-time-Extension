(async () => {
  // === Configure your target times ===
  const targetTimes = [
    { label: 'Workday', hours: 8, minutes: 20 },
    { label: 'Flexible', hours: 7, minutes: 0 },
    { label: 'Half day', hours: 4, minutes: 20 },
  ];

  // Define a fixed office start time (e.g., 10:00 AM)
  const OFFICE_START_HOUR = 10;
  const OFFICE_START_MIN = 0;

  // Extracts the time string from the active page
  function getTimeElementText() {
    const cells = document.querySelectorAll("td[data-index='4'] span.globalTable-Badge-label");
    if (cells.length) {
      return cells[cells.length - 1].textContent.trim();
    }
    const fallback = document.querySelector("span.globalTable-Badge-label");
    return fallback ? fallback.textContent.trim() : null;
  }

  // Parses 'HH:MM:SS' into total seconds
  function parseTime(str) {
    if (!str) return null;
    const parts = str.split(":").map(p => parseInt(p, 10));
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    const [hh, mm, ss] = parts;
    return hh * 3600 + mm * 60 + ss;
  }

  // Formats a future timestamp given seconds from now
  function formatETA(secondsFromNow) {
    const future = new Date(Date.now() + secondsFromNow * 1000);
    return future.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  // Adjusts logged time to start counting from fixed start (e.g. 10:00 AM)
  function getAdjustedLoggedTime(loggedSec) {
    const now = new Date();
    const officeStart = new Date();
    officeStart.setHours(OFFICE_START_HOUR, OFFICE_START_MIN, 0, 0);

    const actualStart = new Date(now.getTime() - loggedSec * 1000);

    if (actualStart < officeStart) {
      const offset = (officeStart - actualStart) / 1000;
      return Math.max(0, loggedSec - offset);
    }

    return loggedSec;
  }

  // Builds the output cards
  function buildOutput(loggedSec) {
    const fragment = document.createDocumentFragment();
    targetTimes.forEach(({ label, hours, minutes }) => {
      const targetSec = hours * 3600 + minutes * 60;
      const remaining = targetSec - loggedSec;
      const card = document.createElement('div');
      card.className = 'card' + (remaining <= 0 ? ' completed' : '');

      const lbl = document.createElement('div');
      lbl.className = 'label';
      lbl.textContent = `${label} (${hours}:${minutes.toString().padStart(2, '0')})`;
      card.appendChild(lbl);

      const tm = document.createElement('div');
      tm.className = 'time';
      tm.textContent = remaining <= 0 ? 'Completed' : formatETA(remaining);
      card.appendChild(tm);

      fragment.appendChild(card);
    });
    return fragment;
  }

  // Main execution
  const outputEl = document.getElementById('output');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: getTimeElementText
      },
      (results) => {
        const raw = results[0]?.result;
        const loggedSec = parseTime(raw);
        if (loggedSec === null) {
          outputEl.innerHTML = `<div class="error">Could not parse time: "${raw || ''}"</div>`;
          return;
        }

        const adjustedSec = getAdjustedLoggedTime(loggedSec);
        outputEl.innerHTML = '';
        outputEl.appendChild(buildOutput(adjustedSec));
      }
    );
  } catch (err) {
    console.error(err);
    outputEl.innerHTML = '<div class="error">Unexpected error. See console.</div>';
  }
})();
