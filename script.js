if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');
  document.getElementById('themeToggle').textContent = localStorage.getItem('theme')==='dark' ? '🌞 Light Mode' : '🌙 Dark Mode';

  document.getElementById('themeToggle').onclick = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark?'dark':'light');
    document.getElementById('themeToggle').textContent = isDark?'🌞 Light Mode':'🌙 Dark Mode';
  }

  document.getElementById('searchBtn').onclick = searchProfile;
  document.getElementById('usernameInput').addEventListener('keypress', e => {
    if (e.key==='Enter') searchProfile();
  });

  function formatAge(joined) {
    const years = new Date().getFullYear() - joined.getFullYear();
    return years + ' year(s)';
  }

  async function fetchReadme(username, repo) {
    try {
      const res = await fetch(`https://api.github.com/repos/${username}/${repo}/readme`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const content = atob(data.content);
      return content.replace(/#/g, ''); // Basic clean
    } catch {
      return 'README not available';
    }
  }

  async function searchProfile() {
    const u = document.getElementById('usernameInput').value.trim();
    const loading = document.getElementById('loading');
    const err = document.getElementById('errorMsg');
    const card = document.getElementById('profileCard');
    const topC = document.getElementById('topReposContainer');
    const allC = document.getElementById('reposContainer');
    const readmeBox = document.getElementById('readmeContainer');
    const readmeArea = document.getElementById('readmeContent');

    if (!u) return;
    card.classList.add('hidden'); err.classList.add('hidden'); loading.classList.remove('hidden');
    readmeBox.classList.add('hidden'); readmeArea.innerHTML='';

    try {
      const r1 = await fetch(`https://api.github.com/users/${u}`);
      if (!r1.ok) throw new Error();
      const user = await r1.json();

      document.getElementById('avatar').src = user.avatar_url;
      document.getElementById('name').textContent = user.name || 'No name';
      document.getElementById('username').textContent = '@' + user.login;
      document.getElementById('bio').textContent = user.bio || 'No bio';
      document.getElementById('location').textContent = '📍 ' + (user.location||'Unknown');
      document.getElementById('company').textContent = '🏢 ' + (user.company||'N/A');
      document.getElementById('blog').innerHTML = user.blog ? `<a href="${user.blog}" target="_blank" class="underline">${user.blog}</a>` : '🌍 Not available';
      document.getElementById('twitter').innerHTML = user.twitter_username ? `<a href="https://twitter.com/${user.twitter_username}" target="_blank" class="underline">@${user.twitter_username}</a>` : '🐦 Not available';
      document.getElementById('joined').textContent = '📅 Joined: ' + new Date(user.created_at).toDateString();
      document.getElementById('age').textContent = '⏳ Account age: ' + formatAge(new Date(user.created_at));
      document.getElementById('repos').textContent = user.public_repos;
      document.getElementById('followers').textContent = user.followers;
      document.getElementById('following').textContent = user.following;
      document.getElementById('profileLink').href = user.html_url;
      document.getElementById('ghChart').src = `https://ghchart.rshah.org/${u}`;

      const r2 = await fetch(`https://api.github.com/users/${u}/repos?per_page=100`);
      const repos = await r2.json();

      const top = [...repos].sort((a,b)=>b.stargazers_count-a.stargazers_count).slice(0,6);
      topC.innerHTML = top.map(r=>`
        <li class="card rounded shadow p-4 flex flex-col">
          <a href="${r.html_url}" target="_blank" class="font-semibold text-blue-600 dark:text-blue-400">${r.name}</a>
          <p class="text-sm mt-1">${r.description||'No description'}</p>
          <div class="mt-2 text-sm">
            <span>⭐${r.stargazers_count}</span> <span>🍴${r.forks_count}</span>
            <span>🧠 ${r.language||'N/A'}</span>
            <span>⏰ ${new Date(r.updated_at).toDateString()}</span>
          </div>
          <button onclick="loadReadme('${u}','${r.name}')" class="mt-2 px-2 py-1 bg-green-500 text-white rounded w-max">Show README</button>
        </li>`).join('');

      allC.innerHTML = repos.map(r=>`
        <li class="card rounded shadow p-4 flex flex-col">
          <a href="${r.html_url}" target="_blank" class="font-semibold text-blue-600 dark:text-blue-400">${r.name}</a>
          <p class="text-sm mt-1">${r.description||'No description'}</p>
          <div class="mt-2 text-sm">
            <span>⭐${r.stargazers_count}</span> <span>🍴${r.forks_count}</span>
            <span>🧠 ${r.language||'N/A'}</span>
            <span>⏰ ${new Date(r.updated_at).toDateString()}</span>
          </div>
        </li>`).join('');

      loading.classList.add('hidden');
      card.classList.remove('hidden');
    } catch {
      loading.classList.add('hidden');
      card.classList.add('hidden');
      err.classList.remove('hidden');
    }
  }

  async function loadReadme(user, repo) {
    document.getElementById('readmeContainer').classList.remove('hidden');
    document.getElementById('readmeContent').textContent = 'Loading README...';
    const md = await fetchReadme(user, repo);
    document.getElementById('readmeContent').textContent = md;
  }