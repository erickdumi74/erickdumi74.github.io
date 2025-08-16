(async function () {
  const qsGame = new URLSearchParams(location.search).get('game');
  const attrGame = document.body.dataset.game;
  let gameId = (qsGame || attrGame || '').trim().toLowerCase();
  const res = await fetch('../assets/data/games.json');  // adjust path if needed

  const data = await res.json();
  let game = data.games[gameId];
  if (!game || gameId == 'notfound') {
    // Hide sections that don’t make sense on 404
    hide('#play'); hide('#screenshots'); hide('#status'); hide('#devlogs'); hide('#loresnapshot');
    gameId = 'notfound';
    game = data.games.notfound;
    renderNotFound(game, data)
    return
  }

  // Title / header
  document.getElementById('doc-title').textContent = `${game.title} · Terminal Minds`;
  document.getElementById('game-title').textContent = game.title;
  document.getElementById('game-tagline').textContent = game.tagline;
  const repo = document.getElementById('repo-link');
  if (repo) { repo.href = game.repo; repo.textContent = game.repo.replace(/^https?:\/\//,''); }

  // About (supports multiple paragraphs)
  const about = document.getElementById('about-content');
  const icon_image = document.getElementById('icon-image');
  if (game.about) {
    icon_image.src = game.about.icon_image;
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
  if (!game.loresnapshot?.optional) {
    const p = document.createElement('p');
    p.innerHTML = game.loresnapshot.text;
    lore_snapshot.appendChild(p);
  } else {
    hide('#loresnapshot')
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

  // Contribute
  const discussion_link = document.getElementById('discussion-link');
  if (game.contribute) {
    discussion_link.href = game.contribute.discussion_link;
  }
})();

function parseTags(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderNotFound(game, data) {
  // Meta
  ensureMeta('robots', 'noindex, follow');
  ensureMeta('googlebot', 'noindex, follow');   // redundancy for Google
  setCanonical('https://erickdumi74.github.io/projects/');

  // Header
  const titleEl = document.getElementById('doc-title');
  const h1 = document.getElementById('game-title');
  const tag = document.getElementById('game-tagline');
  if (titleEl) titleEl.textContent = `${game.title} · Terminal Minds`;
  if (h1) h1.textContent = game.title;
  if (tag) tag.textContent = game.tagline;

  // Add game image
  const icon_image = document.getElementById('icon-image');

  // hide unwanted nav items
  document.getElementById('nav-play').style.display = 'none';
  document.getElementById('nav-logs').style.display = 'none';
  document.getElementById('nav-lore').style.display = 'none';
  document.getElementById('nav-shots').style.display = 'none';

  // About: lore-style message
  const about = document.getElementById('about-content');
  if (about) {
    (game.intro || []).forEach(p => {
      const p1 = document.createElement('p');
      p1.innerHTML = p;
      about.appendChild(p1);
    });

    // create game links
    const p = document.createElement('p');
    p.innerHTML = 'Known projects: ';
    const links = Object.values(data.games || {}).map(game => {
      const a = document.createElement('a');
      a.className = 'link_item';
      a.href = game.back_link?.link || '#';
      a.textContent = game.back_link?.title || game.title;
      return a;
    });

    links.forEach((a, i) => {
      p.appendChild(a);
    });

    about.appendChild(p);

    // set the image
    icon_image.src = game.icon_image;

    // set the correct discussion link
    const discussion_link = document.getElementById('discussion-link');
    if (game.contribute) {
      discussion_link.href = game.contribute.discussion_link;
    }

  }

  // Optional: point repo link back home
  const repo = document.getElementById('repo-link');
  if (repo) { repo.href = '/'; repo.textContent = 'terminalminds · home'; }
}

// Little helper
function hide(sel){ const el = document.querySelector(sel); if (el) el.style.display = 'none'; }

function ensureMeta(name, content) {
  let m = document.querySelector(`meta[name="${name}"]`);
  if (!m) {
    m = document.createElement('meta');
    m.setAttribute('name', name);
    document.head.appendChild(m);
  }
  m.setAttribute('content', content);
}

function setCanonical(href) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

