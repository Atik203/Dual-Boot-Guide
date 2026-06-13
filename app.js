// ── Phase Registry (single source of truth for the sidebar) ──
const PHASES = [
  { id: 'phase-0', num: 0, icon: '🔒', label: 'Pre-Flight',    badge: 'FIRST', bc: 'warn',  file: 'index.html' },
  { id: 'phase-1', num: 1, icon: '🧹', label: 'Win Cleanup',   badge: '~3h',   bc: '',      file: 'index.html' },
  { id: 'phase-2', num: 2, icon: '📱', label: 'Phone Backup',  badge: '~1h',   bc: '',      file: 'index.html' },
  { id: 'phase-3', num: 3, icon: '💾', label: 'USB Boot',      badge: '~30m',  bc: '',      file: 'install.html' },
  { id: 'phase-4', num: 4, icon: '🐧', label: 'Install+BIOS',  badge: '~1h',   bc: '',      file: 'install.html' },
  { id: 'phase-5', num: 5, icon: '⚙️',  label: 'Post Install',  badge: 'GPU',   bc: 'ok',    file: 'install.html' },
  { id: 'phase-6', num: 6, icon: '🤖', label: 'AI/ML Stack',   badge: '~2h',   bc: '',      file: 'dev.html' },
  { id: 'phase-7', num: 7, icon: '🔗', label: 'Dev Stack',     badge: '~1h',   bc: '',      file: 'dev.html' },
  { id: 'phase-8', num: 8, icon: '🛡️', label: 'Edge Cases',   badge: 'READ',  bc: 'warn',  file: 'troubleshoot.html' },
];

const CURRENT_PAGE = window.location.pathname.split('/').pop() || 'index.html';
let activePhaseId = null;

function init() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.innerHTML = renderSidebarHTML();

  const hash = window.location.hash.replace('#', '');
  const currentPhases = PHASES.filter(p => p.file === CURRENT_PAGE);
  let initialId = currentPhases[0]?.id;

  if (hash && currentPhases.some(p => p.id === hash)) {
    initialId = hash;
  }

  if (initialId) {
    switchPhase(initialId, false);
    updateProgress(initialId);
  }

  const firstHeader = document.querySelector('.phase-content.active .step-header');
  if (firstHeader) {
    setTimeout(() => firstHeader.click(), 80);
  }

  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) backdrop.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sidebar?.classList.contains('open')) {
      closeSidebar();
    }
  });
}

function renderSidebarHTML() {
  let html = `
    <div class="sidebar-brand">
      <div class="device">Legion 5 \u00B7 15ACH6</div>
      <h1>Dual Boot Setup<br>Complete Guide</h1>
    </div>
    <div class="sidebar-section-label">Phases</div>
  `;

  PHASES.forEach(phase => {
    const isActive = phase.id === activePhaseId;
    html += `
      <div class="nav-item ${isActive ? 'active' : ''}" data-phase="${phase.id}" onclick="navigateTo('${phase.id}')">
        <span class="nav-icon">${phase.icon}</span> ${phase.num} — ${phase.label}
        ${phase.badge ? `<span class="nav-badge ${phase.bc}">${phase.badge}</span>` : ''}
      </div>
    `;
  });

  html += `
    <div class="progress-bar-wrap">
      <div class="progress-label">
        <span>Overall Progress</span>
        <span id="prog-pct">0%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" id="prog-fill" style="width:0%"></div>
      </div>
    </div>
  `;

  return html;
}

function navigateTo(phaseId) {
  const phase = PHASES.find(p => p.id === phaseId);
  if (!phase) return;

  if (phase.file === CURRENT_PAGE) {
    switchPhase(phaseId, true);
    updateProgress(phaseId);
    history.replaceState(null, '', '#' + phaseId);
    closeSidebar();
  } else {
    window.location.href = phase.file + '#' + phaseId;
  }
}

function switchPhase(phaseId, scroll) {
  activePhaseId = phaseId;

  document.querySelectorAll('.phase-content').forEach(el => el.classList.remove('active'));

  const target = document.getElementById(phaseId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.phase === phaseId);
  });

  document.querySelectorAll('.step-card .step-body').forEach(el => {
    el.style.display = '';
  });

  if (scroll) {
    const main = document.querySelector('.main-content');
    if (main) main.scrollTop = 0;
  }
}

function updateProgress(phaseId) {
  const phase = PHASES.find(p => p.id === phaseId);
  if (!phase) return;
  const total = PHASES.length - 1;
  const pct = Math.round((phase.num / total) * 100);
  const fill = document.getElementById('prog-fill');
  const label = document.getElementById('prog-pct');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = pct + '%';
}

function toggleStep(headerEl) {
  const card = headerEl.closest('.step-card');
  if (!card) return;
  const body = card.querySelector('.step-body');
  const isOpen = card.classList.toggle('open');

  if (body) {
    if (isOpen) {
      body.style.display = '';
    } else {
      body.style.display = 'none';
    }
  }

  const icon = headerEl.querySelector('.step-icon');
  if (icon) icon.textContent = isOpen ? '▾' : '▸';
}

function copyCode(btnEl) {
  const codeBlock = btnEl.closest('.code-block');
  if (!codeBlock) return;
  const codeEl = codeBlock.querySelector('code');
  if (!codeEl) return;

  const text = codeEl.textContent;
  navigator.clipboard.writeText(text).then(() => {
    btnEl.textContent = 'Copied!';
    setTimeout(() => { btnEl.textContent = 'Copy'; }, 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btnEl.textContent = 'Copied!';
    setTimeout(() => { btnEl.textContent = 'Copy'; }, 2000);
  });
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar) return;
  const open = sidebar.classList.toggle('open');
  if (backdrop) backdrop.classList.toggle('show', open);
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  sidebar?.classList.remove('open');
  backdrop?.classList.remove('show');
}

document.addEventListener('DOMContentLoaded', init);
