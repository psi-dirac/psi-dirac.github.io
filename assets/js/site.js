/* Shared site behaviour: mobile navigation and scroll reveals. */
(function () {
  var toggle = document.querySelector('.nav__toggle');
  var links = document.getElementById('navlinks');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }

  /* On narrow screens the full baseline collapses to a hairline, so crop the
     hero light curve to the deep dimming event instead of scaling it down. */
  var lc = document.getElementById('lc');
  if (lc) {
    var narrow = window.matchMedia('(max-width: 700px)');
    var fit = function () {
      lc.setAttribute('viewBox', narrow.matches ? lc.dataset.zoom : lc.dataset.full);
    };
    fit();
    if (narrow.addEventListener) narrow.addEventListener('change', fit);
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
})();
