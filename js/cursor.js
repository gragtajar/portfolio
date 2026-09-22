/* ============================================
   FIGMA CURSOR (Desktop Only)
   Carried over unchanged from the old site's main.js so every page can share it.
   Press `/` to rename the cursor label.
   ============================================ */

(function () {
  'use strict';

  if (window.innerWidth < 769) return;

  const cursor = document.createElement('div');
  cursor.classList.add('figma-cursor');
  cursor.innerHTML = `
      <svg width="20" height="26" viewBox="0 0 20 26" fill="none">
        <path d="M1 1L7 25L10.5 16L19 13L1 1Z" fill="#7B61FF" stroke="#fff" stroke-width="1.2"/>
      </svg>
      <div class="cursor-label"><span class="cursor-label-text">Guest</span></div>
    `;
  document.body.appendChild(cursor);
  // The stylesheet hides the system pointer only once this class says the custom one is running
  document.documentElement.classList.add('has-figma-cursor');

  let cursorName = 'Guest';
  let isEditing = false;

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  // Press `/` to edit cursor name
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !isEditing) {
      e.preventDefault();
      isEditing = true;
      const labelContainer = cursor.querySelector('.cursor-label');
      labelContainer.innerHTML = `<input class="cursor-label-input" type="text" value="${cursorName}" maxlength="10" autofocus />`;
      const input = labelContainer.querySelector('input');
      input.style.pointerEvents = 'all';
      input.focus();
      input.select();

      const finish = () => {
        const val = input.value.trim() || 'Guest';
        cursorName = val;
        labelContainer.innerHTML = `<span class="cursor-label-text">${cursorName}</span>`;
        isEditing = false;
      };

      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === 'Escape') {
          ev.preventDefault();
          finish();
        }
        ev.stopPropagation();
      });
      input.addEventListener('blur', finish);
    }
  });
})();
