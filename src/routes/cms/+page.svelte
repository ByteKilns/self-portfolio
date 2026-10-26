<script lang="ts">
  import { onMount } from 'svelte';
  import '@fontsource/vt323/400.css';
  import '@fontsource/ibm-plex-mono/400.css';
  import '@fontsource/ibm-plex-mono/500.css';
  import '@fontsource/ibm-plex-mono/600.css';
  import type { Project, Site } from '#lib/content/types.ts';
  import Login from '#lib/components/cms/Login.svelte';
  import Toolbar from '#lib/components/cms/Toolbar.svelte';
  import ProjectList from '#lib/components/cms/ProjectList.svelte';
  import ProjectEditor from '#lib/components/cms/ProjectEditor.svelte';
  import SiteSettings from '#lib/components/cms/SiteSettings.svelte';
  import StatusBar from '#lib/components/cms/StatusBar.svelte';

  const STORE = 'nirjal.cms.v1';
  const AUTH = 'nirjal.cms.auth';
  const SESSION = 'nirjal.cms.session';
  const DEFAULT_SITE: Site = { email: '', github: '', linkedin: '', tagline: '', now: [] };

  const uid = () => Math.random().toString(36).slice(2, 9);
  const P = (o: Partial<Project> = {}): Project => ({
    id: uid(),
    name: '',
    summary: '',
    points: [],
    stack: [],
    url: '',
    year: '',
    role: '',
    client: '',
    image: '',
    hue: 185,
    featured: false,
    draft: false,
    ...o
  });
  const clean = (p: Project): Project => ({
    ...p,
    name: (p.name || '').trim(),
    points: (p.points || []).map((s) => s.trim()).filter(Boolean)
  });

  async function sha(s: string) {
    const bytes = new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
    );
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  let auth = $state<{ user: string; hash: string } | null>(null);
  let authed = $state(false);
  let loaded = $state(false);
  let lu = $state('');
  let lp = $state('');
  let lp2 = $state('');
  let loginErr = $state('');
  let remember = $state(false);

  let projects = $state<Project[]>([]);
  let site = $state<Site>({ ...DEFAULT_SITE });
  let sel = $state(0);
  let tab = $state<'projects' | 'site'>('projects');
  let q = $state('');
  let dirty = $state(false);
  let savedAt = $state<number | null>(null);
  let msg = $state<{ text: string; kind: 'ok' | 'err' } | null>(null);

  let msgTimer: ReturnType<typeof setTimeout> | undefined;

  const cur = $derived(projects[sel] ?? null);
  const featCount = $derived(projects.filter((p) => p.featured && !p.draft).length);
  const liveCount = $derived(projects.filter((p) => !p.draft).length);
  const savedLabel = $derived(
    savedAt
      ? 'saved ' + new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'not saved yet'
  );
  const dotColor = $derived(dirty ? '#f4c21b' : '#5fd0c2');
  const saveLabel = $derived(dirty ? 'unsaved' : 'saved');
  const tabBgP = $derived(tab === 'projects' ? '#d9d3c5' : '#c5beae');
  const tabBgS = $derived(tab === 'site' ? '#d9d3c5' : '#c5beae');
  const tip = $derived.by(() => {
    let text = 'all good. hit save when you’re happy.';
    let color = '#1b1f22';
    if (msg) {
      text = msg.text;
      color = msg.kind === 'err' ? '#8a2a1c' : '#0b5f5a';
    } else if (featCount > 4) {
      text = 'psst — more than 4 featured makes the stage drag. 3–4 is the sweet spot.';
      color = '#8a5a00';
    } else if (featCount === 0) {
      text = 'nothing featured yet — the stage will be empty.';
      color = '#8a5a00';
    } else if (cur && !cur.image) text = 'add a screenshot — the tint is just a stand-in.';
    else if (cur && !cur.summary) text = 'a one-line summary helps the cards.';
    else if (dirty) text = 'unsaved changes — ctrl+s.';
    return { text, color };
  });

  function flash(text: string, kind: 'ok' | 'err' = 'ok') {
    msg = { text, kind };
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => (msg = null), 3200);
  }

  async function loadContent() {
    try {
      const res = await fetch('/api/cms');
      if (!res.ok) throw new Error('could not load content.json');
      const data = await res.json();
      projects = (data.projects as Partial<Project>[]).map((p) => P({ ...p, id: p.id || uid() }));
      site = { ...DEFAULT_SITE, ...(data.site || {}) };
      savedAt = typeof data.savedAt === 'number' ? data.savedAt : null;
    } catch (error) {
      flash(error instanceof Error ? error.message : 'could not load content.json', 'err');
    }
    loaded = true;
  }

  async function login(e?: Event) {
    if (e && e.preventDefault) e.preventDefault();
    const u = lu.trim().toLowerCase();
    if (!u || !lp) {
      loginErr = 'enter a username and password.';
      return;
    }
    if (!auth) {
      if (lp.length < 6) {
        loginErr = 'use at least 6 characters.';
        return;
      }
      if (lp !== lp2) {
        loginErr = 'passwords don’t match.';
        return;
      }
      const next = { user: u, hash: await sha(u + ':' + lp) };
      localStorage.setItem(AUTH, JSON.stringify(next));
      enter(next);
      return;
    }
    const h = await sha(u + ':' + lp);
    if (u !== auth.user || h !== auth.hash) {
      loginErr = 'wrong username or password.';
      lp = '';
      return;
    }
    enter(auth);
  }

  function enter(next: { user: string; hash: string }) {
    (remember ? localStorage : sessionStorage).setItem(SESSION, next.hash);
    auth = next;
    authed = true;
    loaded = false;
    lp = '';
    lp2 = '';
    loginErr = '';
    flash('welcome back, ' + next.user + '.');
    void loadContent();
  }

  function logout() {
    if (dirty && !confirm('You have unsaved changes. Log out anyway?')) return;
    sessionStorage.removeItem(SESSION);
    localStorage.removeItem(SESSION);
    authed = false;
    dirty = false;
    loaded = false;
    projects = [];
    lu = auth ? auth.user : '';
  }

  async function save() {
    const now = site.now.map((s) => s.trim()).filter(Boolean);
    const data = {
      v: 1,
      site: { ...site, now },
      projects: projects.map(clean),
      savedAt: Date.now()
    };
    try {
      const res = await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'could not save content.json');
      dirty = false;
      savedAt = body.savedAt;
      flash('saved. commit content.json to publish.');
    } catch (error) {
      flash(error instanceof Error ? error.message : 'could not save content.json', 'err');
    }
  }

  function update(key: keyof Project, value: string | number | boolean | string[]) {
    dirty = true;
    projects = projects.map((p, i) => (i === sel ? { ...p, [key]: value } : p));
  }

  function setSite(key: keyof Site, value: string | string[]) {
    dirty = true;
    site = { ...site, [key]: value };
  }

  function addProject() {
    const p = P({ name: 'Untitled project', draft: true, year: String(new Date().getFullYear()) });
    projects = [...projects, p];
    sel = projects.length - 1;
    q = '';
    dirty = true;
    tab = 'projects';
    flash('new draft added — it stays hidden until you untick draft.');
  }

  function dupProject() {
    if (!cur) return;
    const p = { ...cur, id: uid(), name: cur.name + ' (copy)', featured: false, draft: true };
    projects = [...projects.slice(0, sel + 1), p, ...projects.slice(sel + 1)];
    sel = sel + 1;
    dirty = true;
  }

  function delProject() {
    if (!cur || !confirm('Delete “' + cur.name + '”? This can’t be undone after you save.')) return;
    projects = projects.filter((_, i) => i !== sel);
    sel = Math.max(0, sel - 1);
    dirty = true;
  }

  function move(d: number) {
    const j = sel + d;
    if (j < 0 || j >= projects.length) return;
    const a = projects.slice();
    [a[sel], a[j]] = [a[j], a[sel]];
    projects = a;
    sel = j;
    dirty = true;
  }

  function exportJson() {
    const data = { v: 1, site, projects: projects.map(clean) };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    );
    a.download = 'portfolio-content.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function importJson(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0];
    input.value = '';
    if (!file) return;
    void file
      .text()
      .then((t) => {
        const data = JSON.parse(t);
        if (!Array.isArray(data.projects)) throw 0;
        projects = data.projects.map((p: Partial<Project>) => P({ ...p, id: p.id || uid() }));
        site = { ...DEFAULT_SITE, ...(data.site || {}) };
        sel = 0;
        dirty = true;
        flash('imported ' + data.projects.length + ' projects — save to publish.');
      })
      .catch(() => flash('that file isn’t a portfolio export.', 'err'));
  }

  async function resetAll() {
    if (!confirm('Discard unsaved changes and reload content.json?')) return;
    await loadContent();
    sel = 0;
    dirty = false;
    flash('reloaded content.json.');
  }

  async function upload(file: File) {
    const form = new FormData();
    form.append('file', file);
    form.append('name', cur?.name || 'image');
    try {
      const res = await fetch('/api/cms/image', { method: 'POST', body: form });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'upload failed');
      update('image', body.path);
    } catch (error) {
      flash(error instanceof Error ? error.message : 'upload failed', 'err');
    }
  }

  function addChip(label: string) {
    if (!cur) return;
    update('stack', [...(cur.stack || []), label]);
  }

  function removeChip(label: string) {
    if (!cur) return;
    update(
      'stack',
      (cur.stack || []).filter((x) => x !== label)
    );
  }

  onMount(() => {
    try {
      auth = JSON.parse(localStorage.getItem(AUTH) || 'null');
    } catch {
      auth = null;
    }
    if (auth) {
      const session =
        sessionStorage.getItem(SESSION) === auth.hash ||
        localStorage.getItem(SESSION) === auth.hash;
      authed = session;
      if (authed) void loadContent();
    }

    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void save();
      }
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    addEventListener('keydown', onKey);
    addEventListener('beforeunload', onUnload);

    return () => {
      removeEventListener('keydown', onKey);
      removeEventListener('beforeunload', onUnload);
      clearTimeout(msgTimer);
    };
  });
</script>

<svelte:head>
  <title>Bit·CMS — portfolio manager</title>
  <style>
    html,
    html.dark,
    body {
      background: #0b5f5a !important;
      color-scheme: light !important;
    }
  </style>
</svelte:head>

<div
  class="cms"
  style="min-height:100vh;box-sizing:border-box;padding:clamp(10px,2.5vw,32px);background:#0b5f5a;background-image:radial-gradient(rgba(0,0,0,.22) 1px,transparent 1.3px);background-size:4px 4px;font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:14px;color:#1b1f22"
>
  {#if !authed}
    <Login
      isSetup={!auth}
      loginTitle={!auth ? 'first run' : 'sign in'}
      loginHead={!auth ? 'Create your login' : 'Welcome back'}
      loginSub={!auth
        ? 'Pick a username and password. You’ll use them to open the CMS from now on.'
        : 'Sign in to manage projects and site content.'}
      loginBtn={!auth ? 'Create & enter' : 'Log in'}
      pwAuto={!auth ? 'new-password' : 'current-password'}
      loginTip={!auth ? 'at least 6 characters. I’ll remember it.' : 'press enter to log in.'}
      {lu}
      {lp}
      {lp2}
      {loginErr}
      hasLoginErr={!!loginErr}
      {remember}
      onLu={(e) => {
        lu = (e.target as HTMLInputElement).value;
        loginErr = '';
      }}
      onLp={(e) => {
        lp = (e.target as HTMLInputElement).value;
        loginErr = '';
      }}
      onLp2={(e) => {
        lp2 = (e.target as HTMLInputElement).value;
        loginErr = '';
      }}
      onRemember={(e) => (remember = (e.target as HTMLInputElement).checked)}
      onLogin={(e) => void login(e)}
    />
  {:else if loaded}
    <div
      style="max-width:1320px;margin:0 auto;background:#d9d3c5;border:2px solid;border-color:#fffef8 #3b372f #3b372f #fffef8;box-shadow:6px 6px 0 rgba(0,0,0,.35);display:flex;flex-direction:column"
    >
      <div
        style="display:flex;align-items:center;gap:12px;padding:5px 8px 5px 12px;background:#1d2b33;color:#f4efe2"
      >
        <svg width="20" height="20" viewBox="0 0 120 120" aria-hidden="true"
          ><rect x="20" y="34" width="80" height="74" rx="37" fill="#5fd0c2"></rect><path
            d="M60 36 Q58 24 61 15"
            stroke="#9ee07a"
            stroke-width="6"
            fill="none"
          ></path><circle cx="46" cy="68" r="8" fill="#1d2b33"></circle><circle
            cx="74"
            cy="68"
            r="8"
            fill="#1d2b33"
          ></circle></svg
        >
        <span style="font-family:VT323,monospace;font-size:24px;line-height:1;white-space:nowrap"
          >BIT·CMS</span
        >
        <span style="font-size:12px;color:#a9b5b9;white-space:nowrap">portfolio.db</span>
        <span
          aria-hidden="true"
          style="flex:1;height:10px;min-width:20px;background:repeating-linear-gradient(0deg,#f4efe2 0 1px,transparent 1px 3px);opacity:.35"
        ></span>
        <span style="display:flex;align-items:center;gap:8px;font-size:12px;white-space:nowrap"
          ><span style="width:8px;height:8px;background:{dotColor}"></span>{saveLabel}</span
        >
      </div>

      <Toolbar
        onAdd={addProject}
        onDup={dupProject}
        onDel={delProject}
        onMoveUp={() => move(-1)}
        onMoveDown={() => move(1)}
        onSave={() => void save()}
        onExport={exportJson}
        onImport={importJson}
        onReset={() => void resetAll()}
        onLogout={logout}
      />

      <div style="display:flex;gap:2px;padding:10px 8px 0;border-bottom:2px solid #fffef8">
        <button
          onclick={() => (tab = 'projects')}
          style="padding:7px 16px 6px;margin-bottom:-2px;font-family:VT323,monospace;font-size:21px;line-height:1;color:#1b1f22;cursor:pointer;background:{tabBgP};border:2px solid;border-bottom:0;border-color:#fffef8 #77705f #77705f #fffef8"
          >Projects [{projects.length}]</button
        >
        <button
          onclick={() => (tab = 'site')}
          style="padding:7px 16px 6px;margin-bottom:-2px;font-family:VT323,monospace;font-size:21px;line-height:1;color:#1b1f22;cursor:pointer;background:{tabBgS};border:2px solid;border-bottom:0;border-color:#fffef8 #77705f #77705f #fffef8"
          >Site settings</button
        >
      </div>

      {#if tab === 'projects'}
        <div style="display:flex;flex-wrap:wrap;gap:14px;padding:14px;align-items:flex-start">
          <ProjectList
            {projects}
            {sel}
            {q}
            onQ={(e) => (q = (e.target as HTMLInputElement).value)}
            onPick={(i) => (sel = i)}
          />
          {#if cur}
            {#key cur.id}
              <ProjectEditor
                project={cur}
                {featCount}
                onField={update}
                onUpload={(file) => void upload(file)}
                onClearImage={() => update('image', '')}
                onRemoveChip={removeChip}
                onAddChip={addChip}
              />
            {/key}
          {:else}
            <div
              style="flex:999 1 460px;padding:48px 20px;text-align:center;border:2px groove #f3eee2;font-size:14px;color:#4a463d"
            >
              No project selected. Hit <strong>+ New</strong> to start one.
            </div>
          {/if}
        </div>
      {:else}
        <SiteSettings {site} onSite={setSite} />
      {/if}

      <StatusBar
        live={liveCount}
        draft={projects.length - liveCount}
        {featCount}
        tip={tip.text}
        tipColor={tip.color}
        {savedLabel}
      />
    </div>
  {/if}
</div>

<style>
  .cms :global(input::placeholder),
  .cms :global(textarea::placeholder) {
    color: #8f887a;
  }

  .cms :global(::selection) {
    background: #0b7a74;
    color: #fffdf5;
  }
</style>
