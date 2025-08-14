(async function () {
  const qsGame = new URLSearchParams(location.search).get('game');
  const attrGame = document.body.dataset.game;
  const gameId = qsGame || attrGame;
  const res = await fetch('../js/games.json');  // adjust path if needed

  const data = await res.json();
  const game = data.games[gameId];
  if (!game) return;

  // Title / header
  document.getElementById('doc-title').textContent = `${game.title} · Terminal Minds`;
  document.getElementById('game-title').textContent = game.title;
  document.getElementById('game-tagline').textContent = game.tagline;
  const repo = document.getElementById('repo-link');
  if (repo) { repo.href = game.repo; repo.textContent = game.repo.replace(/^https?:\/\//,''); }

  // About (supports multiple paragraphs)
  const about = document.getElementById('about-content');
  if (game.about) {
    (game.about.intro || []).forEach(p => {
      const el = document.createElement('p');
      el.innerHTML = p;
      about.appendChild(el);
    });
    if (game.about.items) {
      const ul = document.createElement('ul');
      (game.about.items || []).forEach(i => {
        const li = document.createElement('li');
        li.innerHTML = i;
        ul.appendChild(li);
      });
      about.appendChild(ul);
    }
  }

  // Lore Snapshot
  const lore_snapshot = document.getElementById('lore-snapshot');
  if (game.loresnapshot) {
    const p = document.createElement('p');
    p.innerHTML = game.loresnapshot
    lore_snapshot.appendChild(p)
  }

  // Status list
  const status = document.getElementById('status-list');
  const version = document.getElementById('version');
  const state = document.getElementById('state');
  version.textContent = game.status.version;
  state.textContent = game.status.state;
  (game.status.items || []).forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = item;
    status.appendChild(li);
  });

  // How To Play
  const flavor = document.getElementById('howto-flavor');
  const install_block = document.getElementById('install-block');
  if (game.howto) {
    flavor.innerHTML = `${game.howto.flavor}<br/>(<span class="mono">${game.howto.help}</span>)`;

    install_block.textContent = game.howto.installblock;

    const wrap = document.getElementById('howto-sections');
    game.howto.sections.forEach(sec => {
      const h4 = document.createElement('h4');
      h4.textContent = sec.title;
      wrap.appendChild(h4);

      if (sec.items) {
        const ul = document.createElement('ul');
        ul.className = 'centered-list';
        sec.items.forEach(([kbd, desc]) => {
          const li = document.createElement('li');
          li.innerHTML = `<kbd>${parseTags(kbd)}</kbd> -> ${parseTags(desc)}`;
          ul.appendChild(li);
        });
        wrap.appendChild(ul);
      }
      if (sec.bullets) {
        const ul = document.createElement('ul');
        ul.className = 'centered-list';
        sec.bullets.forEach(txt => {
          const li = document.createElement('li');
          li.innerHTML = txt; // supports inline code
          ul.appendChild(li);
        });
        wrap.appendChild(ul);
      }
      if (sec.tag) {
        const p = document.createElement('p');
        p.className = 'tag';
        p.textContent = sec.tag;
        wrap.appendChild(p);
      }
    });

    // footer tag (like bindings)
    const last = game.howto.sections[game.howto.sections.length - 1];
    if (last && last.footer) {
      const p = document.createElement('p');
      p.className = 'tag tag--spaced';
      p.textContent = last.footer;
      wrap.appendChild(p);
    }
  }

  // Screenshots gallery + lightboxes
  const gallery = document.getElementById('gallery');
  const lightboxes = document.getElementById('lightboxes');
  (game.screens || []).forEach((shot, i) => {
    const idx = (i + 1).toString().padStart(2, '0');
    const id = `shot-${idx}`;

    // tile
    const fig = document.createElement('figure');
    fig.className = 'shot';
    fig.innerHTML = `
      <a class="shot__link" href="#${id}" aria-label="Open screenshot ${i+1}">
        <img src="${shot.image}" alt="${shot.alt}" loading="lazy">
      </a>
      <figcaption class="shot__caption">${shot.caption}</figcaption>`;
    gallery.appendChild(fig);

    // lightbox
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.id = id;
    const prev = i > 0 ? `#shot-${(i).toString().padStart(2,'0')}` : '';
    const next = i < game.screens.length - 1 ? `#shot-${(i + 2).toString().padStart(2,'0')}` : '';
    box.innerHTML = `
      <a class="lightbox__bg" href="#screenshots" aria-label="Close"></a>
      <figure class="lightbox__figure">
        <img src="${shot.image}" alt="${shot.alt}">
        <figcaption>${shot.caption}</figcaption>
        <a class="lightbox__close" href="#screenshots" aria-label="Close">×</a>
        ${prev ? `<a class="lightbox__prev" href="${prev}" aria-label="Previous">‹</a>` : ''}
        ${next ? `<a class="lightbox__next" href="${next}" aria-label="Next">›</a>` : ''}
      </figure>`;
    lightboxes.appendChild(box);
  });

  // Dev Logs
  const log_items = document.getElementById('log-items');
  (game.devlogs || []).forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = item;
    log_items.appendChild(li);
  }) ;

  // Contribute / Support
  const contributeWrap = document.getElementById('contribute-content');
  if (contributeWrap && game.contribute) {
    // paragraphs (allow inline HTML like <a>, <em>, <br/>)
    (game.contribute.paragraphs || []).forEach(html => {
      const p = document.createElement('p');
      p.innerHTML = html;
      contributeWrap.appendChild(p);
    });

    // optional links row (inline, dot‑separated)
    if (game.contribute.links) {
      const p = document.createElement('p');
      p.className = 'tm-inline-links';
      p.innerHTML = game.contribute.links.map(l => {
        const label = l.label || l.href;
        const rel = l.rel || 'noopener';
        const target = l.target || '_blank';
        const note = l.note ? ` <span class="tag">${l.note}</span>` : '';
        return `<a href="${l.href}" target="${target}" rel="${rel}">${label}</a>${note}`;
      }).join(' · ');
      contributeWrap.appendChild(p);
    }

    // optional footer tag (keeps parity with howto footer)
    if (game.contribute.footer) {
      const p = document.createElement('p');
      p.className = 'tag';
      p.textContent = game.contribute.footer;
      contributeWrap.appendChild(p);
    }
  }
})();


function parseTags(text) {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
