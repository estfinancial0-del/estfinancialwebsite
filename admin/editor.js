/**
 * EST Financial — Inline Page Editor
 * Activates when URL contains ?edit=1 and correct password is entered.
 * Saves changes directly to GitHub → Vercel auto-deploys in ~30s.
 */
(function () {
  const PASS = 'est2025admin';
  const REPO = 'estfinancial0-del/estfinancialwebsite';

  // Only activate in edit mode
  if (!location.search.includes('edit=1')) return;

  // Auth check
  let token = sessionStorage.getItem('est_edit_token');
  let authed = sessionStorage.getItem('est_edit_auth') === '1';

  if (!authed) {
    const pw = prompt('EST Financial Editor — Enter password:');
    if (pw !== PASS) {
      alert('Incorrect password.');
      location.href = location.pathname;
      return;
    }
    authed = true;
    sessionStorage.setItem('est_edit_auth', '1');
  }

  if (!token) {
    token = localStorage.getItem('gh_token');
    if (!token) {
      token = prompt('Enter your GitHub token to enable saving:');
      if (token) localStorage.setItem('gh_token', token.trim());
    }
    if (token) sessionStorage.setItem('est_edit_token', token);
  }

  // ── INJECT TOOLBAR ────────────────────────────────────────────────────────
  const bar = document.createElement('div');
  bar.id = 'est-edit-bar';
  bar.innerHTML = `
    <style>
      #est-edit-bar {
        position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
        background: #080f1e; border-bottom: 2px solid #e5291f;
        padding: 0 20px; height: 48px;
        display: flex; align-items: center; justify-content: space-between;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        box-shadow: 0 2px 12px rgba(0,0,0,0.4);
      }
      #est-edit-bar .bar-left { display: flex; align-items: center; gap: 12px; }
      #est-edit-bar .edit-badge {
        background: #e5291f; color: white; font-size: 11px; font-weight: 700;
        padding: 3px 8px; border-radius: 4px; letter-spacing: 0.05em;
      }
      #est-edit-bar .bar-hint { color: rgba(255,255,255,0.45); font-size: 12px; }
      #est-edit-bar .bar-right { display: flex; align-items: center; gap: 10px; }
      #est-edit-bar button {
        border: none; border-radius: 6px; padding: 7px 16px;
        font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;
      }
      #est-edit-bar .btn-exit { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }
      #est-edit-bar .btn-exit:hover { background: rgba(255,255,255,0.15); color: white; }
      #est-edit-bar .btn-save { background: #e5291f; color: white; }
      #est-edit-bar .btn-save:hover { opacity: 0.85; }
      #est-edit-bar .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
      #est-edit-bar .save-status { font-size: 12px; }
      #est-edit-bar .save-status.ok  { color: #4caf50; }
      #est-edit-bar .save-status.err { color: #ef5350; }
      #est-edit-bar .save-status.loading { color: #90caf9; }

      /* Editable element highlights */
      [data-editable]:hover { outline: 2px dashed rgba(229,41,31,0.4); outline-offset: 2px; cursor: text; }
      [data-editable]:focus { outline: 2px solid #e5291f; outline-offset: 2px; background: rgba(229,41,31,0.04); }

      /* Push content below toolbar */
      body { padding-top: 48px !important; }
    </style>
    <div class="bar-left">
      <span class="edit-badge">EDITING</span>
      <span class="bar-hint">Click any text to edit it</span>
    </div>
    <div class="bar-right">
      <span class="save-status" id="est-save-status"></span>
      <button class="btn-exit" onclick="exitEdit()">Exit</button>
      <button class="btn-save" id="est-btn-save" onclick="saveToGitHub()">Save &amp; Publish</button>
    </div>
  `;
  document.body.prepend(bar);

  // ── MAKE TEXT EDITABLE ────────────────────────────────────────────────────
  const EDITABLE_SELECTORS = [
    'h1', 'h2', 'h3', 'h4',
    'p:not(.footer-legal):not(#est-edit-bar *)',
    '.eyebrow', '.section-sub', '.hero-sub',
    '.stat-number', '.stat-label',
    'li a', '.service-card p', '.feature-item p',
    '.case-card p', '.blog-card p',
  ].join(', ');

  // Skip elements inside nav, footer-bottom, admin bar, scripts
  const SKIP_PARENTS = ['#est-edit-bar', 'nav', '.footer-bottom', 'script', 'style', '.social-links'];

  document.querySelectorAll(EDITABLE_SELECTORS).forEach(el => {
    if (el.closest(SKIP_PARENTS.join(', '))) return;
    if (el.children.length > 0 && !el.querySelector('em, strong, br, span')) return; // skip complex nested
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('data-editable', '1');
    el.setAttribute('data-original', el.innerHTML);

    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // prevent adding <div> blocks
      }
    });
    el.addEventListener('input', () => markChanged());
    el.addEventListener('paste', e => {
      // Paste as plain text only
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  });

  let hasChanges = false;
  function markChanged() {
    hasChanges = true;
    setStatus('Unsaved changes', '');
  }

  function exitEdit() {
    if (hasChanges && !confirm('You have unsaved changes. Exit anyway?')) return;
    location.href = location.pathname;
  }

  // ── SAVE TO GITHUB ────────────────────────────────────────────────────────
  async function saveToGitHub() {
    if (!token) {
      token = prompt('Enter your GitHub token:');
      if (!token) return;
      localStorage.setItem('gh_token', token);
    }

    const btn = document.getElementById('est-btn-save');
    btn.disabled = true;
    setStatus('Saving...', 'loading');

    try {
      // Remove editor attributes before saving
      document.querySelectorAll('[data-editable]').forEach(el => {
        el.removeAttribute('contenteditable');
        el.removeAttribute('data-editable');
        el.removeAttribute('data-original');
      });
      bar.remove();
      document.body.style.paddingTop = '';

      // Get the clean HTML
      const cleanHTML = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

      // Get current file SHA from GitHub
      const filename = location.pathname.replace(/^\//, '') || 'index.html';
      const apiURL = `https://api.github.com/repos/${REPO}/contents/${filename}`;
      const headers = { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' };

      const res = await fetch(apiURL, { headers });
      if (!res.ok) throw new Error('Could not fetch file from GitHub. Check your token.');
      const data = await res.json();

      const encoded = btoa(unescape(encodeURIComponent(cleanHTML)));
      const putRes = await fetch(apiURL, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Update content: ${filename}`,
          content: encoded,
          sha: data.sha
        })
      });
      if (!putRes.ok) {
        const err = await putRes.json();
        throw new Error(err.message || 'GitHub save failed');
      }

      hasChanges = false;
      // Re-add toolbar in success state
      document.body.prepend(bar);
      document.querySelectorAll(EDITABLE_SELECTORS).forEach(el => {
        if (el.closest(SKIP_PARENTS.join(', '))) return;
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('data-editable', '1');
      });
      document.body.style.paddingTop = '48px';
      setStatus('✓ Published! Live in ~30 seconds.', 'ok');
      btn.disabled = false;

    } catch (err) {
      document.body.prepend(bar);
      document.body.style.paddingTop = '48px';
      document.querySelectorAll(EDITABLE_SELECTORS).forEach(el => {
        if (el.closest(SKIP_PARENTS.join(', '))) return;
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('data-editable', '1');
      });
      setStatus('Error: ' + err.message, 'err');
      btn.disabled = false;
    }
  }

  function setStatus(msg, type) {
    const s = document.getElementById('est-save-status');
    if (!s) return;
    s.textContent = msg;
    s.className = 'save-status ' + type;
  }

  window.exitEdit = exitEdit;
  window.saveToGitHub = saveToGitHub;

})();
