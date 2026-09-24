/* ============================================
   BEER FROM SCRATCH
   The style explorer (filter, search, sort, count) and the standard drink
   calculator. The page renders in full without this file: the rows are in
   the markup and the calculator shows its default figures. This only adds
   the interaction on top.
   ============================================ */

(function () {
  'use strict';

  // ─── Style explorer ────────────────────────────────────────────────
  const explorer = document.querySelector('.explorer');
  if (explorer) {
    const body = explorer.querySelector('[data-rows]');
    const rows = [...body.querySelectorAll('tr[data-code]')];
    const empty = body.querySelector('.empty');
    const count = explorer.querySelector('[data-count]');
    const search = explorer.querySelector('[data-search]');
    const sort = explorer.querySelector('[data-sort]');
    const filters = [...explorer.querySelectorAll('[data-filter]')];
    let type = 'all';

    // BJCP order: the integer prefix of the code, then the whole code
    const bjcp = (a, b) => {
      const d = parseInt(a.dataset.code, 10) - parseInt(b.dataset.code, 10);
      return d || a.dataset.code.localeCompare(b.dataset.code);
    };
    // the other orders sort by a figure, highest first, and fall back to BJCP order
    const by = (key) => (a, b) => (Number(b.dataset[key]) - Number(a.dataset[key])) || bjcp(a, b);
    const orders = { code: bjcp, abv: by('abv'), ibu: by('ibu'), srm: by('srm') };

    // "Ale" takes in the one hybrid too (Kölsch: ale-fermented, cold-conditioned)
    const ofType = (row) => type === 'all'
      || row.dataset.ferment === type
      || (type === 'ale' && row.dataset.ferment === 'hybrid');

    function render() {
      const q = search.value.trim().toLowerCase();
      const order = orders[sort.value] || bjcp;
      let shown = 0;
      rows.sort(order).forEach((row) => {
        const on = ofType(row) && (!q || row.dataset.text.includes(q));
        row.hidden = !on;
        if (on) shown += 1;
        body.insertBefore(row, empty);
      });
      empty.hidden = shown > 0;
      count.textContent = shown;
    }

    filters.forEach((button) => button.addEventListener('click', () => {
      type = button.dataset.filter;
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      render();
    }));
    search.addEventListener('input', render);
    sort.addEventListener('change', render);
  }

  // ─── Standard drink calculator ─────────────────────────────────────
  const calc = document.querySelector('[data-calc]');
  if (calc) {
    const volume = calc.querySelector('[data-volume]');
    const abv = calc.querySelector('[data-abv]');
    const slider = calc.querySelector('[data-slider]');
    const ml = calc.querySelector('[data-ml]');
    const drinks = calc.querySelector('[data-drinks]');
    const tier = calc.querySelector('[data-tier]');

    // FSSAI's bands: 0 is alcohol free, up to 5 is mild, up to 8 is strong, above that is not beer
    const band = (a) => (a === 0 ? 'Alcohol free' : a <= 5 ? 'Mild' : a <= 8 ? 'Strong' : 'Not beer');

    function update() {
      const a = Math.min(Math.max(parseFloat(abv.value) || 0, 0), 20);
      const pure = Number(volume.value) * a / 100;
      ml.value = pure.toFixed(1);
      drinks.value = (pure / 12.7).toFixed(1);
      tier.value = band(a);
    }

    // the number and the slider stay in step both ways; the slider stops at 12
    abv.addEventListener('input', () => {
      slider.value = Math.min(parseFloat(abv.value) || 0, 12);
      update();
    });
    slider.addEventListener('input', () => {
      abv.value = slider.value;
      update();
    });
    volume.addEventListener('change', update);
    calc.addEventListener('submit', (e) => e.preventDefault());
    update();
  }
})();
