/* Resources page: renders, filters, and sorts assets/data/resources.json. */
(function () {
  var body = document.getElementById('res-body');
  var chips = document.getElementById('chips');
  var input = document.getElementById('res-search');
  var shown = document.getElementById('res-shown');
  var updated = document.getElementById('res-updated');
  var table = document.querySelector('table.res');
  if (!body) return;

  var all = [];
  var category = 'All';
  var query = '';
  var sortKey = 'name';
  var sortDir = 1;

  var COLUMNS = [
    { key: 'name', label: 'Resource' },
    { key: 'category', label: 'Category' },
    { key: 'type', label: 'Type' },
    { key: 'access', label: 'Access' },
    { key: 'maintainer', label: 'Maintainer' },
    { key: 'updated', label: 'Updated' }
  ];

  function accessClass(a) {
    var v = (a || '').toLowerCase();
    if (v.indexOf('public') === 0 || v.indexOf('open') === 0) return 'tag tag--open';
    return 'tag tag--group';
  }

  function cell(row, label, build) {
    var td = document.createElement('td');
    td.setAttribute('data-label', label);
    var val = document.createElement('div');
    val.className = 't-val';
    build(val, row);
    td.appendChild(val);
    return td;
  }

  function draw() {
    var q = query.trim().toLowerCase();
    var rows = all.filter(function (r) {
      if (category !== 'All' && r.category !== category) return false;
      if (!q) return true;
      return [r.name, r.category, r.type, r.access, r.maintainer, r.description, r.tags && r.tags.join(' ')]
        .filter(Boolean).join(' ').toLowerCase().indexOf(q) > -1;
    });

    rows.sort(function (a, b) {
      var x = (a[sortKey] || '').toString().toLowerCase();
      var y = (b[sortKey] || '').toString().toLowerCase();
      return x < y ? -sortDir : x > y ? sortDir : 0;
    });

    body.innerHTML = '';

    if (!rows.length) {
      var tr = document.createElement('tr');
      var td = document.createElement('td');
      td.colSpan = 7;
      td.className = 'empty';
      td.textContent = 'Nothing matches that. Try a different search or clear the filters.';
      tr.appendChild(td);
      body.appendChild(tr);
    }

    rows.forEach(function (r) {
      var tr = document.createElement('tr');

      tr.appendChild(cell(r, 'Resource', function (td) {
        var n = document.createElement('div');
        n.className = 't-name';
        n.textContent = r.name;
        td.appendChild(n);
        if (r.description) {
          var d = document.createElement('div');
          d.className = 't-desc';
          d.textContent = r.description;
          td.appendChild(d);
        }
      }));

      tr.appendChild(cell(r, 'Category', function (td) { td.textContent = r.category || '—'; }));
      tr.appendChild(cell(r, 'Type', function (td) { td.textContent = r.type || '—'; }));

      tr.appendChild(cell(r, 'Access', function (td) {
        var s = document.createElement('span');
        s.className = accessClass(r.access);
        s.textContent = r.access || 'Unknown';
        td.appendChild(s);
      }));

      tr.appendChild(cell(r, 'Maintainer', function (td) {
        td.className = 't-val t-mono';
        td.textContent = r.maintainer || '—';
      }));

      tr.appendChild(cell(r, 'Updated', function (td) {
        td.className = 't-val t-mono';
        td.textContent = r.updated || '—';
      }));

      tr.appendChild(cell(r, 'Link', function (td) {
        if (!r.url) { td.textContent = '—'; return; }
        var a = document.createElement('a');
        a.className = 't-open';
        a.href = r.url;
        a.textContent = 'Open';
        a.target = '_blank';
        a.rel = 'noopener';
        a.setAttribute('aria-label', 'Open ' + r.name + ' in a new tab');
        td.appendChild(a);
      }));

      body.appendChild(tr);
    });

    if (shown) shown.textContent = rows.length + ' of ' + all.length + ' resources';
  }

  function buildHead() {
    var tr = document.querySelector('.res thead tr');
    if (!tr) return;
    tr.innerHTML = '';
    COLUMNS.forEach(function (col) {
      var th = document.createElement('th');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = col.label + ' <span class="arrow">▲</span>';
      btn.addEventListener('click', function () {
        if (sortKey === col.key) { sortDir = -sortDir; } else { sortKey = col.key; sortDir = 1; }
        markSort();
        draw();
      });
      th.appendChild(btn);
      th.dataset.key = col.key;
      tr.appendChild(th);
    });
    var last = document.createElement('th');
    last.textContent = 'Link';
    last.style.padding = '14px 18px';
    tr.appendChild(last);
    markSort();
  }

  function markSort() {
    document.querySelectorAll('.res thead th[data-key]').forEach(function (th) {
      if (th.dataset.key === sortKey) {
        th.setAttribute('aria-sort', sortDir === 1 ? 'ascending' : 'descending');
        var arrow = th.querySelector('.arrow');
        if (arrow) arrow.textContent = sortDir === 1 ? '▲' : '▼';
      } else {
        th.removeAttribute('aria-sort');
      }
    });
  }

  function buildChips() {
    if (!chips) return;
    var cats = ['All'].concat(all.map(function (r) { return r.category; })
      .filter(function (c, i, arr) { return c && arr.indexOf(c) === i; }).sort());

    cats.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'chip';
      b.type = 'button';
      b.textContent = c;
      b.setAttribute('aria-pressed', String(c === category));
      b.addEventListener('click', function () {
        category = c;
        chips.querySelectorAll('.chip').forEach(function (el) {
          el.setAttribute('aria-pressed', String(el === b));
        });
        draw();
      });
      chips.appendChild(b);
    });
  }

  if (input) {
    input.addEventListener('input', function () { query = input.value; draw(); });
  }

  fetch('assets/data/resources.json', { cache: 'no-cache' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      all = data;
      buildHead();
      buildChips();
      draw();
      if (updated) {
        var dates = all.map(function (r) { return r.updated; }).filter(Boolean).sort();
        if (dates.length) updated.textContent = 'Last entry updated ' + dates[dates.length - 1];
      }
    })
    .catch(function () {
      if (table) table.remove();
      var wrap = document.querySelector('.tablewrap');
      if (wrap) wrap.innerHTML = '<p class="empty">Resource list could not load. Serve the site over HTTP — <span class="mono">python3 -m http.server</span> — rather than opening the file directly.</p>';
    });
})();
