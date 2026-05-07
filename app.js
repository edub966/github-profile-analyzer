const GITHUB_API = 'https://api.github.com';
let compareMode = false;

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  'C++': '#f34b7d',
  C: '#555555',
  Java: '#b07219',
  TypeScript: '#2b7489',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  Swift: '#ffac45',
  Kotlin: '#F18E33',
  Shell: '#89e051',
  'Jupyter Notebook': '#DA5B0B',
};

function setMode(mode) {
  compareMode = mode === 'compare';
  document.getElementById('username2').classList.toggle('hidden', !compareMode);
  document.querySelectorAll('.mode-btn').forEach((btn, i) => {
    btn.classList.toggle('active', (i === 0 && !compareMode) || (i === 1 && compareMode));
  });
}

async function analyze() {
  const u1 = document.getElementById('username').value.trim();
  const u2 = document.getElementById('username2').value.trim();
  const errorDiv = document.getElementById('error-msg');
  const resultsDiv = document.getElementById('results');

  errorDiv.classList.add('hidden');
  resultsDiv.classList.add('hidden');

  if (!u1) return;

  try {
    await renderUser(u1, 'user1-results');

    if (compareMode && u2) {
      document.getElementById('user2-results').classList.remove('hidden');
      await renderUser(u2, 'user2-results');
      resultsDiv.classList.add('compare-layout');
    } else {
      document.getElementById('user2-results').classList.add('hidden');
      resultsDiv.classList.remove('compare-layout');
    }

    resultsDiv.classList.remove('hidden');
  } catch (err) {
    errorDiv.textContent = 'Something went wrong. Check the username and try again.';
    errorDiv.classList.remove('hidden');
  }
}

async function renderUser(username, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '<p class="loading">Loading...</p>';

  const [userRes, reposRes] = await Promise.all([
    fetch(`${GITHUB_API}/users/${username}`),
    fetch(`${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`)
  ]);

  if (!userRes.ok) throw new Error('User not found');

  const user = await userRes.json();
  const repos = await reposRes.json();

  container.innerHTML = '';
  container.innerHTML += renderProfile(user, repos);
  container.innerHTML += renderStats(repos);
  container.innerHTML += renderRepos(repos);
  await renderActivity(username, container);
}

function renderProfile(user, repos) {
  return `
    <div class="profile">
      <img src="${user.avatar_url}" alt="${user.login}" />
      <div class="profile-info">
        <h2>${user.name || user.login}</h2>
        <p class="username">@${user.login}</p>
        <p class="bio">${user.bio || ''}</p>
        <p class="personality">${getPersonality(repos)}</p>
        <div class="profile-stats">
          <span>${user.public_repos} repos</span>
          <span>${user.followers} followers</span>
          <span>${user.following} following</span>
        </div>
      </div>
    </div>
  `;
}

function getPersonality(repos) {
  const langCount = {};
  repos.forEach(repo => {
    if (repo.language) {
      langCount[repo.language] = (langCount[repo.language] || 0) + 1;
    }
  });

  const top = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0]?.[0];

  const personalities = {
    Python: '🧠 Data & AI Nerd',
    JavaScript: '🌐 Web Builder',
    TypeScript: '🏗️ Serious Web Engineer',
    'C++': '⚙️ Systems Thinker',
    C: '🔩 Low-Level Hacker',
    Java: '☕ Enterprise Brain',
    'Jupyter Notebook': '📊 Data Scientist',
    HTML: '🎨 Frontend Tinkerer',
    Go: '🚀 Backend Minimalist',
    Rust: '🦀 Performance Obsessed',
  };

  return personalities[top] || '👨‍💻 Eclectic Coder';
}

function renderStats(repos) {
  const langCount = {};
  repos.forEach(repo => {
    if (repo.language) {
      langCount[repo.language] = (langCount[repo.language] || 0) + 1;
    }
  });

  const sorted = Object.entries(langCount).sort((a, b) => b[1] - a[1]);
  const total = repos.filter(r => r.language).length;

  return `
    <h3>Languages</h3>
    <div class="lang-bar">
      ${sorted.map(([lang, count]) => `
        <div class="lang-seg" style="width: ${(count/total*100).toFixed(1)}%; background: ${LANG_COLORS[lang] || '#8b949e'}" title="${lang}: ${count} repos"></div>
      `).join('')}
    </div>
    <div class="lang-legend">
      ${sorted.map(([lang, count]) => `
        <div class="lang-item">
          <span class="lang-dot" style="background: ${LANG_COLORS[lang] || '#8b949e'}"></span>
          <span class="lang-name">${lang}</span>
          <span class="lang-pct">${(count/total*100).toFixed(1)}%</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderRepos(repos) {
  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  return `
    <h3>Top Repositories</h3>
    <div class="repos-list">
      ${topRepos.map(repo => `
        <a class="repo-card" href="${repo.html_url}" target="_blank">
          <div class="repo-name">${repo.name}</div>
          <div class="repo-desc">${repo.description || 'No description'}</div>
          <div class="repo-meta">
            <span>⭐ ${repo.stargazers_count}</span>
            <span>🍴 ${repo.forks_count}</span>
            ${repo.language ? `<span>📝 ${repo.language}</span>` : ''}
          </div>
        </a>
      `).join('')}
    </div>
  `;
}

async function renderActivity(username, container) {
  const res = await fetch(`${GITHUB_API}/users/${username}/events/public?per_page=100`);
  const events = await res.json();

  const pushes = events.filter(e => e.type === 'PushEvent');

  const days = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days[key] = 0;
  }

  pushes.forEach(event => {
    const day = event.created_at.split('T')[0];
    if (days[day] !== undefined) days[day]++;
  });

  const max = Math.max(...Object.values(days), 1);

  container.innerHTML += `
    <h3>Push Activity — Last 7 Days</h3>
    <div class="activity-chart">
      ${Object.entries(days).map(([date, count]) => `
        <div class="activity-col">
          <div class="activity-bar" style="height: ${(count/max*100)}%"></div>
          <div class="activity-label">${new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}</div>
        </div>
      `).join('')}
    </div>
  `;
}