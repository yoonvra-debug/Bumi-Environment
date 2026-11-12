// ===== Earth Prize Team Hub — app =====
(function () {
  const KEY = 'earthprize-hub-v1';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const D = (s) => new Date(s + 'T00:00:00');
  const fmt = (s, o = { day: 'numeric', month: 'short' }) => (s ? D(s).toLocaleDateString('en-GB', o) : '');
  const today = (() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; })();

  // ---------- state ----------
  const seed = () => ({
    links: {
      blueprint: 'https://drive.google.com/file/d/1DbMj7RNQSPAzHtAMaH_7NctR1Bb85Ud1/view?usp=sharing',
      submit: 'https://www.theinnovation.exchange/opportunities/7d2c365c-0956-45b6-bf8f-5f01bf1ba566',
      web: '', drive: '', ig: '', igUser: '', igPass: '', tt: '', ttUser: '', ttPass: '', email: '', emailPass: '',
    },
    m5: '',
    phaseDone: {},
    workload: WORKLOAD.map((w) => ({ ...w, zoomLink: '', doc: '', status: 'Not started' })),
    todos: TODOS.map((t) => ({ ...t, link: '', status: 'Not started', notes: '' })),
    partners: PARTNERS.map((p) => ({ ...p, contact: '', why: '', person: '', status: 'Not contacted', notes: '' })),
    checks: {},
    video: { location: '', link: '', date: '' },
    logo: { link: '' },
  });
  let S;
  try { S = Object.assign(seed(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = seed(); }
  let saveT;
  const save = () => {
    const el = $('#saveState'); el.classList.add('saving'); el.lastChild.textContent = ' Saving…';
    clearTimeout(saveT);
    saveT = setTimeout(() => {
      localStorage.setItem(KEY, JSON.stringify(S));
      el.classList.remove('saving'); el.lastChild.textContent = ' Saved on this device';
    }, 300);
  };
  const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1800); };
  const person = (id) => PEOPLE.find((p) => p.id === id);
  const pName = (p) => (p.id === 'm5' ? (S.m5 || 'Member 5') : p.short);
  const chip = (id) => { const p = person(id); return `<span class="chip"><span class="av" style="background:${p.color}">${p.id === 'm5' && !S.m5 ? '?' : p.ini}</span>${esc(pName(p))}</span>`; };

  // ---------- hero ----------
  function renderHero() {
    const s = D(HUB_START), e = D(HUB_END);
    const total = (e - s) / 864e5;
    const left = Math.max(0, Math.ceil((e - today) / 864e5));
    const pct = Math.min(100, Math.max(0, ((today - s) / 864e5 / total) * 100));
    $('#cDays').innerHTML = `${left}<small>days left</small>`;
    $('#cBar').style.width = pct + '%';
    const cur = PHASES.filter((p) => p.k !== '★').find((p) => D(p.end) >= today) || PHASES[PHASES.length - 1];
    $('#cNext').innerHTML = `<span>Now: <b>${esc(cur.title)}</b></span><span>due ${fmt(cur.end)}</span>`;
    const allTasks = S.todos.length, doneTasks = S.todos.filter((t) => t.status === 'Done').length;
    const phases = PHASES.length, phasesDone = PHASES.filter((p) => S.phaseDone[p.id]).length;
    const partnersIn = S.partners.filter((p) => p.status === 'Agreed').length;
    $('#stats').innerHTML = [
      [`${phasesDone}/${phases}`, 'phases complete'],
      [`${doneTasks}/${allTasks}`, 'tasks done'],
      [`${PEOPLE.filter((p) => p.id !== 'm5' || S.m5).length}/5`, 'team members'],
      [`${partnersIn}`, 'partners agreed'],
    ].map(([b, s]) => `<div class="stat"><b>${b}</b><span>${s}</span></div>`).join('');
  }

  // ---------- links ----------
  function renderLinks() {
    const L = S.links;
    const card = (o) => `
      <div class="link-card">
        <div class="lc-top">
          <div class="lc-ico" style="background:${o.bg};color:${o.fg}">${o.ico}</div>
          ${o.filled ? '<span class="ok-tag">● ready</span>' : '<span class="empty-tag">to fill</span>'}
        </div>
        <div><h3>${o.title}</h3><p>${o.desc}</p></div>
        <div class="lc-field">${o.fields}</div>
      </div>`;
    const f = (k, label, ph, type = 'url') => `
      <label>${label}</label>
      <div class="pw-row"><input class="inp" type="${type === 'pw' ? 'password' : 'text'}" data-link="${k}" value="${esc(L[k])}" placeholder="${ph}">
      ${type === 'url' && L[k] ? `<a class="btn sm dark" href="${esc(L[k])}" target="_blank" rel="noopener">Open ↗</a>` : ''}
      ${type === 'pw' ? `<button class="btn sm" data-peek="${k}">Show</button>` : ''}</div>`;
    $('#linksGrid').innerHTML = [
      card({ ico: 'BP', bg: '#C9DD5B', fg: '#14241A', title: 'Blueprint', desc: 'The official guide — 7 sections we must answer.', filled: !!L.blueprint, fields: f('blueprint', 'Google Drive link', 'Paste link…') }),
      card({ ico: 'GO', bg: '#C2623A', fg: '#fff', title: 'Registration & Submit', desc: 'The Innovation Exchange portal. Deadline 30 Jan 2027.', filled: !!L.submit, fields: f('submit', 'Portal link', 'Paste link…') }),
      card({ ico: 'WWW', bg: '#5C8AA6', fg: '#fff', title: 'Website', desc: 'Our project website — goes live by 31 Dec.', filled: !!L.web, fields: f('web', 'Website URL', 'Not created yet') + f('drive', 'Shared Drive folder', 'Paste team Drive link…') }),
      card({ ico: '@', bg: '#14241A', fg: '#C9DD5B', title: 'Social Media', desc: 'Accounts & logins. Only share this hub with the team!', filled: !!(L.ig || L.tt), fields:
        f('ig', 'Instagram', 'instagram.com/…') + f('igUser', 'IG username / email', '—', 'text') + f('igPass', 'IG password', '—', 'pw') +
        f('tt', 'TikTok', 'tiktok.com/@…') + f('ttPass', 'TikTok password', '—', 'pw') }),
    ].join('');
    $$('[data-link]').forEach((i) => i.addEventListener('input', () => { S.links[i.dataset.link] = i.value.trim(); save(); }));
    $$('[data-link]').forEach((i) => i.addEventListener('change', () => { renderLinks(); }));
    $$('[data-peek]').forEach((b) => b.addEventListener('click', () => {
      const i = $(`[data-link="${b.dataset.peek}"]`); const show = i.type === 'password';
      i.type = show ? 'text' : 'password'; b.textContent = show ? 'Hide' : 'Show';
    }));
  }

  // ---------- blueprint ----------
  function renderBlueprint() {
    $('#bpGrid').innerHTML = SECTIONS.map((s, i) => `
      <article class="bp-card ${[0, 1, 5, 6].includes(i) ? 'wide' : ''}">
        <div class="bp-head">
          <div class="bp-letter" style="color:${s.color}">${s.k}</div>
          <div class="bp-limit"><b>${s.k === 'G' ? '60–90s' : s.words + ' words'}</b>${s.k === 'G' ? s.words + ' words · ' : ''}${s.chars.toLocaleString()} characters</div>
        </div>
        <h3>${s.title}</h3>
        <p class="bp-q">${s.q}</p>
        <ul>${s.think.map((t) => `<li>${t}</li>`).join('')}</ul>
        <div class="bp-submit"><b>Submit</b>${s.submit}</div>
        <div class="bp-meta">${s.owners.map(chip).join('')}</div>
      </article>`).join('') +
      `<div class="bp-note"><span class="tag" style="background:#14241A">Tip</span>Always reference sources and credit the people whose work helped us. Also prepare the <b>Additional Questions</b>: partnerships, past competitions, website/socials, stage of innovation, SDGs, industries, impact areas, skills, target populations, visibility.</div>`;
  }

  // ---------- timeline ----------
  function renderTimeline() {
    // gantt
    const s = D(HUB_START), e = D(HUB_END);
    const days = (e - s) / 864e5 + 1;
    const weeks = []; for (let i = 0; i < 12; i++) { const d = new Date(s); d.setDate(d.getDate() + i * 7); weeks.push(d); }
    const col = (d) => ((D(d) - s) / 864e5) / days;
    let html = `<div class="gantt-in"><div class="g-weeks"><div></div>${weeks.map((w) => `<div>${w.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>`).join('')}</div>`;
    PHASES.forEach((p) => {
      const a = col(p.start), b = col(p.end) + 1 / days;
      html += `<div class="g-row"><div class="g-name">${p.k !== '★' && p.k !== '0' && p.k !== '✓' ? p.k + ' · ' : ''}${esc(p.title)}</div>
        <div style="grid-column:2/-1;position:relative;height:18px"><div class="g-bar" style="position:absolute;left:${a * 100}%;width:${(b - a) * 100}%;background:${p.color};${S.phaseDone[p.id] ? 'opacity:.4' : ''}">${fmt(p.start)}–${fmt(p.end)}</div></div></div>`;
    });
    const tp = (today - s) / 864e5 / days;
    if (tp >= 0 && tp <= 1) html += `<div class="g-today" style="left:calc(170px + (100% - 170px) * ${tp})"><span>today</span></div>`;
    html += `</div>`;
    $('#gantt').innerHTML = html;

    // vertical list
    const curId = (PHASES.find((p) => !S.phaseDone[p.id] && D(p.start) <= today && D(p.end) >= today) || {}).id;
    $('#tl').innerHTML = PHASES.map((p) => {
      const o = person(p.owner);
      const cls = S.phaseDone[p.id] ? 'done' : p.id === curId ? 'now' : '';
      return `<div class="tl-row ${cls}">
        <div class="tl-date"><b>${fmt(p.start)}</b><span>→ ${fmt(p.end, { day: 'numeric', month: 'short', year: '2-digit' })}</span></div>
        <div class="tl-rail"><div class="tl-dot" data-phase="${p.id}" title="Mark as done"></div></div>
        <div class="tl-card">
          <div>
            <h4><span class="tag" style="background:${p.color}">${p.k === '★' ? 'Side quest' : p.k === '0' ? 'Start' : p.k === '✓' ? 'Finish' : 'Section ' + p.k}</span>${esc(p.title)}${cls === 'now' ? '<span class="now-badge">NOW</span>' : ''}</h4>
            <ul>${p.tasks.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          </div>
          <div class="tl-side">
            <div><div class="k">Lead</div><div class="v">${chip(p.owner)}</div></div>
            <div><div class="k">Zoom</div><div class="v">${esc(p.zoom)}</div></div>
            <div><div class="k">Due</div><div class="v">${fmt(p.end, { weekday: 'short', day: 'numeric', month: 'long' })}</div></div>
          </div>
        </div></div>`;
    }).join('') + `<div class="tl-row"><div class="tl-date"><b style="color:var(--clay)">30 Jan</b><span>2027</span></div><div class="tl-rail"><div class="tl-dot" style="border-color:var(--clay);background:var(--clay);cursor:default"></div></div><div class="tl-card" style="grid-template-columns:1fr;background:var(--clay);border-color:var(--clay);color:#fff"><h4 style="margin:0">Official deadline — we submit 2 days early, on 28 Jan.</h4></div></div>`;
    $$('[data-phase]').forEach((d) => d.addEventListener('click', () => { S.phaseDone[d.dataset.phase] = !S.phaseDone[d.dataset.phase]; save(); renderTimeline(); renderHero(); }));
  }

  // ---------- team ----------
  function renderTeam() {
    $('#teamGrid').innerHTML = PEOPLE.map((p) => {
      const owns = SECTIONS.filter((s) => s.owners.includes(p.id)).map((s) => s.k);
      const open = p.id === 'm5' && !S.m5;
      return `<div class="member ${p.role === 'Team Leader' ? 'lead' : ''} ${open ? 'open' : ''}">
        <div class="m-av" style="background:${p.color}">${p.id === 'm5' ? (S.m5 ? S.m5.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '+') : p.ini}</div>
        <div class="m-role">${p.role}</div>
        ${p.id === 'm5'
          ? `<input class="inp" id="m5name" placeholder="Still looking — type name when found" value="${esc(S.m5)}">`
          : `<h3 class="m-name">${esc(p.name)}</h3>`}
        <ul class="m-duties">${p.duties.map((d) => `<li>${d}</li>`).join('')}</ul>
        <div class="m-owns">${owns.map((k) => `<span>${k}</span>`).join('')}</div>
      </div>`;
    }).join('');
    $('#m5name').addEventListener('change', (e) => { S.m5 = e.target.value.trim(); save(); renderAll(); });
  }

  // ---------- generic editable table ----------
  const STATUS = ['Not started', 'In progress', 'In review', 'Done', 'Blocked'];
  const PSTATUS = ['Not contacted', 'Contacted', 'Meeting set', 'Agreed', 'Declined'];
  const PEOPLE_OPTS = () => ['—', 'Rafeyfa', 'Avirha', 'Fadlan', 'Talitha', S.m5 || 'Member 5', 'Everyone'];

  function table(el, rowsKey, cols, opts = {}) {
    const rows = S[rowsKey];
    const cell = (r, i, c) => {
      const v = r[c.k] ?? '';
      if (c.type === 'select' || c.type === 'status' || c.type === 'person') {
        const list = c.type === 'person' ? PEOPLE_OPTS() : c.options;
        const sIdx = list.indexOf(v);
        const has = list.includes(v) || !v;
        return `<select data-r="${i}" data-k="${c.k}" class="${c.type === 'status' ? 'status-sel s-' + sIdx : ''}">${!has ? `<option selected>${esc(v)}</option>` : ''}${list.map((o) => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
      }
      if (c.type === 'date') return `<input type="date" data-r="${i}" data-k="${c.k}" value="${esc(v)}">`;
      if (c.type === 'link') return `<div class="linkcell"><span class="cell" contenteditable="plaintext-only" data-r="${i}" data-k="${c.k}" data-ph="${c.ph || 'paste link'}">${esc(v)}</span>${v ? `<a href="${esc(v)}" target="_blank" rel="noopener">↗</a>` : ''}</div>`;
      if (c.type === 'sec') { const s = SECTIONS.find((x) => x.k === v); return `<span class="cell" style="font-family:var(--display);font-weight:800;font-size:20px;color:${s ? s.color : 'inherit'}">${esc(v)}</span>`; }
      return `<span class="cell" contenteditable="plaintext-only" data-r="${i}" data-k="${c.k}" data-ph="${c.ph || ''}" style="${c.bold ? 'font-weight:600' : ''}">${esc(v)}</span>`;
    };
    el.innerHTML = `<div class="sheet-scroll"><table class="t"><thead><tr><th class="rn">#</th>${cols.map((c) => `<th style="${c.w ? 'width:' + c.w : ''}">${c.label}</th>`).join('')}${opts.noAdd ? '' : '<th style="width:40px"></th>'}</tr></thead>
      <tbody>${rows.map((r, i) => `<tr><td class="rn">${i + 1}</td>${cols.map((c) => `<td>${cell(r, i, c)}</td>`).join('')}${opts.noAdd ? '' : `<td><button class="btn ghost sm del" data-del="${i}" title="Delete row">✕</button></td>`}</tr>`).join('')}</tbody></table></div>
      <div class="sheet-foot"><span>${rows.length} rows · ${opts.doneLabel ? opts.doneLabel(rows) : ''}</span>${opts.noAdd ? '' : `<button class="btn sm dark" data-add>+ Add row</button>`}</div>`;

    $$('[contenteditable]', el).forEach((c) => {
      c.addEventListener('input', () => { rows[c.dataset.r][c.dataset.k] = c.textContent.trim(); save(); });
      c.addEventListener('blur', () => { if (cols.find((x) => x.k === c.dataset.k)?.type === 'link') table(el, rowsKey, cols, opts); });
      c.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); c.blur(); } });
    });
    $$('select, input[type=date]', el).forEach((s) => s.addEventListener('change', () => {
      rows[s.dataset.r][s.dataset.k] = s.value; save(); table(el, rowsKey, cols, opts); renderHero();
    }));
    $$('[data-del]', el).forEach((b) => b.addEventListener('click', () => {
      if (!confirm('Delete this row?')) return; rows.splice(+b.dataset.del, 1); save(); table(el, rowsKey, cols, opts); renderHero();
    }));
    $('[data-add]', el)?.addEventListener('click', () => {
      const blank = {}; cols.forEach((c) => (blank[c.k] = c.type === 'status' ? c.options[0] : '')); rows.push(blank); save(); table(el, rowsKey, cols, opts);
      const last = $$('tbody tr', el).pop(); $('[contenteditable]', last)?.focus();
    });
  }

  function renderTables() {
    table($('#workSheet'), 'workload', [
      { k: 's', label: 'Sec', type: 'sec', w: '52px' },
      { k: 'name', label: 'Blueprint part', bold: true, w: '210px' },
      { k: 'limit', label: 'Limit' },
      { k: 'owners', label: 'Who writes it' },
      { k: 'zoom', label: 'Zoom date', type: 'date', w: '140px' },
      { k: 'zoomLink', label: 'Zoom link', type: 'link', ph: 'zoom.us/j/…' },
      { k: 'doc', label: 'Draft doc (Google Docs)', type: 'link', ph: 'docs.google.com/…' },
      { k: 'due', label: 'Final due', type: 'date', w: '140px' },
      { k: 'status', label: 'Status', type: 'status', options: STATUS, w: '130px' },
    ], { noAdd: true, doneLabel: (r) => r.filter((x) => x.status === 'Done').length + ' done' });

    table($('#todoSheet'), 'todos', [
      { k: 'task', label: 'Task', bold: true, w: '260px', ph: 'What needs doing?' },
      { k: 'cat', label: 'Category', type: 'select', options: ['Meeting', 'Docs', 'Team', 'Admin', 'Logo', 'Social media', 'Website', 'Prototype', 'Video', 'Partners', 'Other'], w: '130px' },
      { k: 'owner', label: 'Owner', type: 'person', w: '120px' },
      { k: 'due', label: 'Due', type: 'date', w: '140px' },
      { k: 'link', label: 'Link (Zoom / Docs / file)', type: 'link' },
      { k: 'status', label: 'Status', type: 'status', options: STATUS, w: '130px' },
      { k: 'notes', label: 'Notes', ph: '…' },
    ], { doneLabel: (r) => r.filter((x) => x.status === 'Done').length + ' done' });

    table($('#partnerSheet'), 'partners', [
      { k: 'org', label: 'Organisation / Person', bold: true, w: '220px', ph: 'Name…' },
      { k: 'type', label: 'Type', type: 'select', options: ['NGO / Community group', 'Teacher / School mentor', 'Local government office', 'University / Expert', 'Business / Sponsor', 'Affected community', 'Media', 'Other'], w: '190px' },
      { k: 'why', label: 'How they can help', ph: 'Data, interviews, funding, mentoring…' },
      { k: 'contact', label: 'Contact (email / IG / phone)', ph: '—' },
      { k: 'person', label: 'Our contact', type: 'person', w: '120px' },
      { k: 'status', label: 'Status', type: 'status', options: PSTATUS, w: '140px' },
      { k: 'notes', label: 'Notes', ph: '…' },
    ], { doneLabel: (r) => r.filter((x) => x.status === 'Agreed').length + ' agreed' });
  }

  // ---------- checklists ----------
  function renderChecks() {
    const list = (key) => CHECKS[key].map(([t, s], i) => {
      const id = key + i;
      return `<label class="check"><input type="checkbox" data-chk="${id}" ${S.checks[id] ? 'checked' : ''}><span class="box"></span><span class="txt"><b>${t}</b>${s ? `<span>${s}</span>` : ''}</span></label>`;
    }).join('');
    const prog = (key) => `${CHECKS[key].filter((_, i) => S.checks[key + i]).length}/${CHECKS[key].length}`;
    const fld = (label, path, ph) => { const [a, b] = path.split('.'); return `<div class="fld"><label>${label}</label><input class="inp" data-path="${path}" value="${esc(S[a][b])}" placeholder="${ph}"></div>`; };
    $('#todoSplit').innerHTML = `
      <div class="mini"><h4>Video pitch <small>${prog('video')}</small></h4>
        <p class="d">60–90 sec, one take, unscripted. Lead: Talitha.</p>
        ${fld('Where we film', 'video.location', 'e.g. school garden, river bank…')}
        ${fld('Filming date', 'video.date', 'e.g. Sun 17 Jan')}
        ${fld('Video link', 'video.link', 'YouTube (unlisted) / Drive link')}
        <div>${list('video')}</div></div>
      <div class="mini"><h4>Website <small>${prog('website')}</small></h4>
        <p class="d">Pages to build — fill them as blueprint sections get finished. Lead: Fadlan.</p>
        <div>${list('website')}</div></div>
      <div class="mini"><h4>Social media <small>${prog('social')}</small></h4>
        <p class="d">Logins live in the Links section above.</p>
        <div>${list('social')}</div>
        <h4 style="margin-top:8px">Logo <small>${prog('logo')}</small></h4>
        <p class="d">It has to be good: simple, memorable, works tiny. Lead: Talitha.</p>
        <div class="logo-swatches"><i style="background:#1E4A33"></i><i style="background:#C9DD5B"></i><i style="background:#C2623A"></i><i style="background:#F1EDE3;border:1px solid var(--line)"></i></div>
        ${fld('Logo files link', 'logo.link', 'Drive / Canva link')}
        <div>${list('logo')}</div></div>`;
    $$('[data-chk]').forEach((c) => c.addEventListener('change', () => { S.checks[c.dataset.chk] = c.checked; save(); renderChecks(); }));
    $$('[data-path]').forEach((i) => i.addEventListener('input', () => { const [a, b] = i.dataset.path.split('.'); S[a][b] = i.value; save(); }));
  }

  // ---------- export / import ----------
  function csv(rows, cols) {
    const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    return [cols.map(q).join(','), ...rows.map((r) => cols.map((c) => q(r[c])).join(','))].join('\n');
  }
  function download(name, text, type) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click();
  }
  window.hubExport = () => { download('earth-prize-hub.json', JSON.stringify(S, null, 2), 'application/json'); toast('Backup downloaded'); };
  window.hubImport = () => {
    const i = document.createElement('input'); i.type = 'file'; i.accept = '.json';
    i.onchange = () => { const r = new FileReader(); r.onload = () => { try { S = Object.assign(seed(), JSON.parse(r.result)); localStorage.setItem(KEY, JSON.stringify(S)); renderAll(); toast('Data loaded'); } catch (e) { alert('That file could not be read.'); } }; r.readAsText(i.files[0]); };
    i.click();
  };
  window.hubCSV = (which) => {
    const map = {
      todos: ['task', 'cat', 'owner', 'due', 'link', 'status', 'notes'],
      partners: ['org', 'type', 'why', 'contact', 'person', 'status', 'notes'],
      workload: ['s', 'name', 'limit', 'owners', 'zoom', 'zoomLink', 'doc', 'due', 'status'],
    };
    download(`earth-prize-${which}.csv`, csv(S[which], map[which]), 'text/csv'); toast('CSV downloaded — open in Google Sheets / Excel');
  };
  window.hubReset = () => { if (confirm('Reset everything back to the starting template? This clears all edits on this device.')) { localStorage.removeItem(KEY); S = seed(); renderAll(); toast('Reset'); } };

  // ---------- nav scrollspy ----------
  function spy() {
    const links = $$('.nav-links a');
    const secs = links.map((a) => $(a.getAttribute('href')));
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { links.forEach((l) => l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id)); } });
    }, { rootMargin: '-40% 0px -55% 0px' });
    secs.forEach((s) => s && io.observe(s));
  }

  function renderAll() { renderHero(); renderLinks(); renderBlueprint(); renderTimeline(); renderTeam(); renderTables(); renderChecks(); }
  renderAll(); spy();
})();
