/* Team page: renders people from assets/data/team.json, grouped by role category.
   Add a member by adding one object to that file — no HTML edits needed. */
(function () {
  var mount = document.getElementById('team');
  var sheet = document.getElementById('sheet');
  var sheetBody = document.getElementById('sheet-body');
  if (!mount) return;

  var ORDER = ['Leadership', 'Postdoctoral Researchers', 'Graduate Students', 'Undergraduate Researchers', 'Affiliates', 'Alumni'];

  function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
  }

  function portrait(person) {
    var frame = document.createElement('div');
    frame.className = 'person__frame';
    var fallback = document.createElement('span');
    fallback.className = 'person__initials';
    fallback.textContent = initials(person.name);
    frame.appendChild(fallback);

    if (person.photo) {
      var img = document.createElement('img');
      img.src = person.photo;
      img.alt = person.name;
      img.loading = 'lazy';
      img.addEventListener('error', function () { img.remove(); });
      frame.appendChild(img);
    }
    return frame;
  }

  function openSheet(person) {
    if (!sheet || !sheetBody) return;
    sheetBody.innerHTML = '';

    var left = document.createElement('div');
    left.appendChild(portrait(person));

    var right = document.createElement('div');
    var h = document.createElement('h3');
    h.textContent = person.name;
    var meta = document.createElement('p');
    meta.className = 'sheet__meta';
    meta.textContent = [person.role, person.pronouns].filter(Boolean).join(' · ');
    right.appendChild(h);
    right.appendChild(meta);

    var bio = document.createElement('p');
    bio.textContent = person.bio || 'Bio coming soon.';
    right.appendChild(bio);

    if (person.links && Object.keys(person.links).length) {
      var row = document.createElement('div');
      row.className = 'sheet__links';
      Object.keys(person.links).forEach(function (label) {
        var a = document.createElement('a');
        a.href = person.links[label];
        a.textContent = label;
        if (!/^mailto:/.test(person.links[label])) { a.target = '_blank'; a.rel = 'noopener'; }
        row.appendChild(a);
      });
      right.appendChild(row);
    }

    sheetBody.appendChild(left);
    sheetBody.appendChild(right);
    if (typeof sheet.showModal === 'function') sheet.showModal();
  }

  function card(person) {
    var el = document.createElement('button');
    el.className = 'person';
    el.type = 'button';
    el.setAttribute('aria-label', 'Details for ' + person.name);
    el.appendChild(portrait(person));

    var name = document.createElement('p');
    name.className = 'person__name';
    name.textContent = person.name;
    var role = document.createElement('p');
    role.className = 'person__role';
    role.textContent = person.role;
    el.appendChild(name);
    el.appendChild(role);

    if (person.focus) {
      var focus = document.createElement('p');
      focus.className = 'person__focus';
      focus.textContent = person.focus;
      el.appendChild(focus);
    }

    el.addEventListener('click', function () { openSheet(person); });
    return el;
  }

  function render(people) {
    mount.innerHTML = '';
    var groups = {};
    people.forEach(function (p) {
      var g = p.group || 'Affiliates';
      (groups[g] = groups[g] || []).push(p);
    });

    var names = ORDER.filter(function (g) { return groups[g]; })
      .concat(Object.keys(groups).filter(function (g) { return ORDER.indexOf(g) === -1; }));

    if (!names.length) {
      mount.innerHTML = '<p class="empty">No team members listed yet. Add entries to assets/data/team.json.</p>';
      return;
    }

    names.forEach(function (g) {
      var section = document.createElement('section');
      section.className = 'team-group';

      var head = document.createElement('div');
      head.className = 'team-group__head';
      var h2 = document.createElement('h2');
      h2.textContent = g;
      var rule = document.createElement('span');
      rule.className = 'team-group__rule';
      var count = document.createElement('span');
      count.className = 'team-group__count';
      count.textContent = String(groups[g].length).padStart(2, '0');
      head.appendChild(h2);
      head.appendChild(rule);
      head.appendChild(count);

      var list = document.createElement('div');
      list.className = 'people' + (g === 'Leadership' ? ' people--lead' : '');
      groups[g].forEach(function (p) { list.appendChild(card(p)); });

      section.appendChild(head);
      section.appendChild(list);
      mount.appendChild(section);
    });
  }

  var closeBtn = document.querySelector('.sheet__close');
  if (closeBtn && sheet) closeBtn.addEventListener('click', function () { sheet.close(); });
  if (sheet) {
    sheet.addEventListener('click', function (e) { if (e.target === sheet) sheet.close(); });
  }

  fetch('assets/data/team.json', { cache: 'no-cache' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(render)
    .catch(function () {
      mount.innerHTML = '<p class="empty">Team list could not load. Serve the site over HTTP — <span class="mono">python3 -m http.server</span> — rather than opening the file directly.</p>';
    });
})();
