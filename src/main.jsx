*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #ffffff;
  --bg2: #f7f7f9;
  --bg3: #f0f0f4;
  --text: #1a1a2e;
  --text2: #555577;
  --text3: #9999aa;
  --border: #e0e0ea;
  --border2: #c8c8d8;
  --info-bg: #e8f0fe;
  --info: #1a5fc8;
  --warn-bg: #fff8e1;
  --warn: #b8860b;
  --danger-bg: #fce8e8;
  --danger: #c0392b;
  --success-bg: #e8f8ee;
  --success: #1e8449;
  --radius: 8px;
  --radius-lg: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  color: var(--text);
  background: var(--bg3);
}

body { min-height: 100vh; }

input, select, textarea, button {
  font-family: inherit;
  font-size: 13px;
  color: var(--text);
  background: var(--bg);
  border: 0.5px solid var(--border2);
  border-radius: var(--radius);
  padding: 7px 10px;
  outline: none;
  transition: border-color .15s;
}
input:focus, select:focus, textarea:focus { border-color: var(--info); }
textarea { resize: vertical; min-height: 72px; width: 100%; }
input, select { width: 100%; }

button {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 0.5px solid var(--border2);
  background: var(--bg);
  border-radius: var(--radius);
  font-weight: 500;
}
button:hover { background: var(--bg2); }
button.primary { background: var(--text); color: var(--bg); border-color: var(--text); }
button.primary:hover { opacity: .85; }
button:disabled { opacity: .4; cursor: not-allowed; }
button i { font-size: 14px; }

.pill {
  display: inline-block;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 500;
}
.pill-open { background: var(--warn-bg); color: var(--warn); }
.pill-progress { background: var(--info-bg); color: var(--info); }
.pill-done { background: var(--success-bg); color: var(--success); }

.flag-box {
  border-left: 3px solid var(--danger);
  background: var(--danger-bg);
  padding: 9px 13px;
  border-radius: 0;
  font-size: 13px;
  color: var(--danger);
  margin-bottom: 8px;
}
.warn-box {
  border-left: 3px solid var(--warn);
  background: var(--warn-bg);
  padding: 9px 13px;
  border-radius: 0;
  font-size: 13px;
  color: var(--warn);
  margin-bottom: 8px;
}
.info-box {
  border-left: 3px solid var(--info);
  background: var(--info-bg);
  padding: 9px 13px;
  border-radius: 0;
  font-size: 13px;
  color: var(--info);
  margin-bottom: 8px;
}

.card {
  background: var(--bg);
  border: 0.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
}

.spinner {
  width: 26px; height: 26px;
  border: 2px solid var(--border2);
  border-top-color: var(--text2);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
