// =============================================
//   SMART PORTAL – app.js  (AWS version)
// =============================================

const API_BASE = 'https://bo2px8zjmk.execute-api.ap-south-1.amazonaws.com';

const CAT_ICONS = {
  'Pothole / Road Damage': 'fa-road',
  'Garbage / Waste':       'fa-trash',
  'Broken Street Light':   'fa-lightbulb',
  'Water Supply Issue':    'fa-droplet',
  'Sewage / Drainage':     'fa-water',
  'Other':                 'fa-circle-exclamation',
};

const STATUSES = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

const STATUS_BADGE = {
  'Submitted':    'badge-submitted',
  'Under Review': 'badge-review',
  'In Progress':  'badge-progress',
  'Resolved':     'badge-resolved',
};

// =============================================
//  API HELPERS
// =============================================

async function apiGetComplaints() {
  const res = await fetch(API_BASE + '/complaints');
  if (!res.ok) throw new Error('Failed to load complaints');
  return await res.json();
}

async function apiSubmitComplaint(data) {
  const res = await fetch(API_BASE + '/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

async function apiVote(complaint_id) {
  const res = await fetch(API_BASE + '/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ complaint_id, voter_session: getVoterSession() })
  });
  return await res.json();
}

function getVoterSession() {
  let vid = localStorage.getItem('sp_voter_id');
  if (!vid) {
    vid = 'v_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    localStorage.setItem('sp_voter_id', vid);
  }
  return vid;
}

// =============================================
//  UI HELPERS
// =============================================

function badgeHtml(status) {
  return `<span class="badge ${STATUS_BADGE[status] || 'badge-submitted'}">${status}</span>`;
}

function stepIndex(status) { return STATUSES.indexOf(status); }

function cardHtml(c) {
  const imgPart = c.image_url
    ? `<div class="card-img"><img src="${c.image_url}" alt="${c.title}" loading="lazy"/></div>`
    : `<div class="card-img-placeholder"><i class="fa-solid ${CAT_ICONS[c.category] || 'fa-circle-exclamation'}"></i></div>`;
  return `
    <div class="complaint-card">
      ${imgPart}
      <div class="card-body">
        <div class="card-top">
          <span class="card-title">${c.title}</span>
          ${badgeHtml(c.status)}
        </div>
        <div class="card-location"><i class="fa-solid fa-location-dot"></i>${c.location}</div>
        <div class="card-actions">
          <button class="vote-btn" id="vbtn-${c.id}" onclick="voteCard(${c.id}, this)">
            <i class="fa-solid fa-thumbs-up"></i>
            <span class="vote-count">${c.votes}</span> votes
          </button>
          <small style="color:var(--text-muted);font-size:.78rem">${(c.created_at||'').slice(0,10)}</small>
        </div>
      </div>
    </div>`;
}

// =============================================
//  HOME PAGE
// =============================================

async function renderRecentComplaints(containerId, count) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<p style="color:var(--text-muted);padding:1rem">Loading complaints...</p>';
  try {
    const complaints = await apiGetComplaints();
    const top = [...complaints].sort((a, b) => b.votes - a.votes).slice(0, count);
    container.innerHTML = top.length
      ? top.map(c => cardHtml(c)).join('')
      : '<p style="color:var(--text-muted);padding:1rem">No complaints yet. Be the first to report one!</p>';
  } catch (e) {
    container.innerHTML = '<p style="color:var(--text-muted);padding:1rem">Could not load complaints.</p>';
  }
}

async function renderStatsOverview(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const complaints = await apiGetComplaints();
    const total      = complaints.length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved   = complaints.filter(c => c.status === 'Resolved').length;
    const topVotes   = [...complaints].sort((a,b) => b.votes - a.votes)[0]?.votes || 0;
    const stats = [
      { icon:'fa-file-lines',           cls:'blue',   label:'Total Complaints',   value:total },
      { icon:'fa-clock',                cls:'orange',  label:'In Progress',        value:inProgress },
      { icon:'fa-circle-check',         cls:'green',   label:'Resolved',           value:resolved },
      { icon:'fa-triangle-exclamation', cls:'red',     label:'Top Priority Votes', value:topVotes },
    ];
    container.innerHTML = stats.map(s => `
      <div class="stat-card">
        <div class="stat-icon ${s.cls}"><i class="fa-solid ${s.icon}"></i></div>
        <div class="stat-info">
          <div class="stat-label">${s.label}</div>
          <div class="stat-value">${s.value}</div>
        </div>
      </div>`).join('');
  } catch (e) {
    container.innerHTML = '';
  }
}

// =============================================
//  MY COMPLAINTS PAGE
// =============================================

async function renderComplaintsList(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<p style="color:var(--text-muted);padding:1rem">Loading...</p>';
  try {
    const complaints = await apiGetComplaints();
    window._allComplaints = complaints;
    displayFiltered(complaints);
  } catch (e) {
    container.innerHTML = '<p style="color:red;padding:1rem">Could not load complaints.</p>';
  }
}

function displayFiltered(complaints) {
  const container = document.getElementById('complaintsList');
  const noResults = document.getElementById('noResults');
  if (!container) return;
  if (!complaints.length) {
    container.innerHTML = '';
    if (noResults) noResults.style.display = 'block';
    return;
  }
  if (noResults) noResults.style.display = 'none';
  container.innerHTML = complaints.map(c => listCardHtml(c)).join('');
}

function listCardHtml(c) {
  const si   = stepIndex(c.status);
  const dots = STATUSES.map((_, i) =>
    `<div class="track-step ${i <= si ? 'done' : ''}"></div>`).join('');
  return `
    <div class="list-card" onclick="openModal(${c.id})">
      <div class="list-icon"><i class="fa-solid ${CAT_ICONS[c.category] || 'fa-circle-exclamation'}"></i></div>
      <div class="list-info">
        <div class="list-title">${c.title}</div>
        <div class="list-meta">
          <span><i class="fa-solid fa-location-dot"></i>${c.location}</span>
          <span><i class="fa-solid fa-tag"></i>${c.category}</span>
          <span><i class="fa-solid fa-calendar"></i>${(c.created_at||'').slice(0,10)}</span>
        </div>
      </div>
      <div class="list-right">
        ${badgeHtml(c.status)}
        <div class="status-track">${dots}</div>
        <small style="color:var(--text-muted);font-size:.78rem">
          <i class="fa-solid fa-thumbs-up"></i> ${c.votes}
        </small>
      </div>
    </div>`;
}

function filterComplaints() {
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const status = document.getElementById('statusFilter')?.value || '';
  const cat    = document.getElementById('catFilter')?.value || '';
  let list     = window._allComplaints || [];
  if (search) list = list.filter(c =>
    c.title.toLowerCase().includes(search) ||
    c.location.toLowerCase().includes(search));
  if (status) list = list.filter(c => c.status === status);
  if (cat)    list = list.filter(c => c.category === cat);
  displayFiltered(list);
}

// =============================================
//  MODAL
// =============================================

function openModal(id) {
  const c = (window._allComplaints || []).find(x => x.id === id);
  if (!c) return;
  const si    = stepIndex(c.status);
  const steps = STATUSES.map((s, i) => `
    <div class="progress-step">
      <div class="step-dot ${i < si ? 'done' : i === si ? 'active' : ''}">
        ${i < si ? '<i class="fa-solid fa-check"></i>' : i + 1}
      </div>
      <div class="step-info">
        <div class="step-label">${s}</div>
        <div class="step-date">${i <= si ? (c.created_at||'').slice(0,10) : 'Pending'}</div>
      </div>
    </div>`).join('');

  document.getElementById('modalContent').innerHTML = `
    <h2 style="font-size:1.2rem;margin-bottom:.4rem">${c.title}</h2>
    <p style="color:var(--text-muted);font-size:.85rem;margin-bottom:1rem">
      ${c.location} &bull; ${c.category}
    </p>
    <p style="margin-bottom:1.2rem;font-size:.92rem">${c.description || ''}</p>
    <h4 style="margin-bottom:.5rem">Status Progress</h4>
    <div class="progress-steps">${steps}</div>
    <div style="display:flex;align-items:center;gap:1rem;margin-top:1rem;
                padding-top:1rem;border-top:1px solid var(--border)">
      <span style="font-size:.85rem;color:var(--text-muted)">
        Reported by ${c.reporter_name} on ${(c.created_at||'').slice(0,10)}
      </span>
      <span style="margin-left:auto;font-weight:700;color:var(--green)">
        <i class="fa-solid fa-thumbs-up"></i> ${c.votes} votes
      </span>
    </div>`;
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay')?.classList.remove('open');
}

// =============================================
//  VOTING
// =============================================

async function voteCard(id, btn) {
  event.stopPropagation();
  if (btn.classList.contains('voted') || btn.disabled) return;
  btn.disabled = true;
  const countEl = btn.querySelector('.vote-count');
  try {
    const result = await apiVote(id);
    if (result.success) {
      countEl.textContent = result.votes;
      btn.classList.add('voted');
      if (window._allComplaints) {
        const c = window._allComplaints.find(x => x.id === id);
        if (c) c.votes = result.votes;
      }
    } else if (result.error === 'Already voted') {
      btn.classList.add('voted');
      btn.title = 'You already voted on this';
    } else {
      alert('Could not register vote. Try again.');
      btn.disabled = false;
    }
  } catch (e) {
    alert('Network error. Could not vote.');
    btn.disabled = false;
  }
}

// =============================================
//  DASHBOARD
// =============================================

async function renderDashboard() {
  let complaints = [];
  try { complaints = await apiGetComplaints(); }
  catch (e) { console.error('Dashboard load failed', e); }

  const total    = complaints.length;
  const byStatus = {};
  const byCat    = {};
  STATUSES.forEach(s => byStatus[s] = 0);
  complaints.forEach(c => {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    byCat[c.category]  = (byCat[c.category]  || 0) + 1;
  });

  const statsEl = document.getElementById('dashStats');
  if (statsEl) {
    const stats = [
      { icon:'fa-file-lines',           cls:'blue',   label:'Total Complaints', value:total },
      { icon:'fa-clock',                cls:'orange',  label:'In Progress',      value:byStatus['In Progress']||0 },
      { icon:'fa-circle-check',         cls:'green',   label:'Resolved',         value:byStatus['Resolved']||0 },
      { icon:'fa-eye',                  cls:'blue',   label:'Under Review',     value:byStatus['Under Review']||0 },
      { icon:'fa-paper-plane',          cls:'red',     label:'Submitted',        value:byStatus['Submitted']||0 },
      { icon:'fa-triangle-exclamation', cls:'red',     label:'Top Priority Votes',
        value:[...complaints].sort((a,b)=>b.votes-a.votes)[0]?.votes||0 },
    ];
    statsEl.innerHTML = stats.map(s => `
      <div class="dash-stat-card">
        <div class="stat-icon ${s.cls}"><i class="fa-solid ${s.icon}"></i></div>
        <div class="stat-info">
          <div class="stat-label">${s.label}</div>
          <div class="stat-value">${s.value}</div>
        </div>
      </div>`).join('');
  }

  const donutSvg    = document.getElementById('donutSvg');
  const donutLegend = document.getElementById('donutLegend');
  if (donutSvg && donutLegend) {
    const colors = {
      'Submitted':'#1a6ef5','Under Review':'#f5a623',
      'In Progress':'#e74c3c','Resolved':'#28a745'
    };
    const vals = STATUSES.map(s => byStatus[s] || 0);
    const sum  = vals.reduce((a,b)=>a+b,0) || 1;
    let offset = 0;
    const cx=100, cy=100, r=70, inner=44;
    let paths = '';
    STATUSES.forEach((s,i) => {
      const pct   = vals[i]/sum;
      const angle = pct * 2 * Math.PI;
      if (pct === 0) return;
      const ox1 = cx + r*Math.sin(offset),      oy1 = cy - r*Math.cos(offset);
      offset += angle;
      const ox2 = cx + r*Math.sin(offset),      oy2 = cy - r*Math.cos(offset);
      const ix1 = cx + inner*Math.sin(offset),  iy1 = cy - inner*Math.cos(offset);
      const ix2 = cx + inner*Math.sin(offset-angle), iy2 = cy - inner*Math.cos(offset-angle);
      const large = angle > Math.PI ? 1 : 0;
      paths += `<path d="M ${ox1} ${oy1} A ${r} ${r} 0 ${large} 1 ${ox2} ${oy2}
                         L ${ix1} ${iy1} A ${inner} ${inner} 0 ${large} 0 ${ix2} ${iy2} Z"
                     fill="${colors[s]}"/>`;
    });
    paths += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
                    font-size="22" font-weight="700" fill="var(--text)">${total}</text>
              <text x="${cx}" y="${cy+20}" text-anchor="middle"
                    font-size="10" fill="var(--text-muted)">Total</text>`;
    donutSvg.innerHTML = paths;
    donutLegend.innerHTML = STATUSES.map(s => `
      <div class="legend-item">
        <div class="legend-dot" style="background:${colors[s]}"></div>
        <span>${s}: <b>${byStatus[s]||0}</b></span>
      </div>`).join('');
  }

  const barChart = document.getElementById('barChart');
  if (barChart) {
    const maxCat = Math.max(...Object.values(byCat), 1);
    barChart.innerHTML = Object.entries(byCat).map(([cat,cnt]) => `
      <div class="bar-row">
        <div class="bar-label">${cat.split('/')[0].trim()}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${(cnt/maxCat*100).toFixed(0)}%"></div>
        </div>
        <div class="bar-count">${cnt}</div>
      </div>`).join('');
  }

  const priorityList = document.getElementById('priorityList');
  if (priorityList) {
    const top = [...complaints].sort((a,b)=>b.votes-a.votes).slice(0,5);
    priorityList.innerHTML = top.map((c,i) => `
      <div class="priority-item">
        <div class="priority-rank">#${i+1}</div>
        <div class="priority-info">
          <div class="priority-title">${c.title}</div>
          <div class="priority-meta">${c.location} &bull; ${c.category}</div>
        </div>
        ${badgeHtml(c.status)}
        <div class="priority-votes"><i class="fa-solid fa-thumbs-up"></i> ${c.votes}</div>
      </div>`).join('');
  }

  const tableBody = document.getElementById('tableBody');
  if (tableBody) {
    const sorted = [...complaints].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    tableBody.innerHTML = sorted.map((c,i) => `
      <tr>
        <td>${i+1}</td>
        <td>${c.title}</td>
        <td>${c.category}</td>
        <td>${c.location}</td>
        <td>${badgeHtml(c.status)}</td>
        <td><b>${c.votes}</b></td>
        <td>${(c.created_at||'').slice(0,10)}</td>
      </tr>`).join('');
  }
}

// =============================================
//  REPORT FORM
// =============================================

let selectedCat = '';

function selectCat(el, cat) {
  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedCat = cat;
  document.getElementById('selectedCategory').value = cat;
}

// Location detect — works on HTTP using OpenStreetMap
function getLocation() {
  const input  = document.getElementById('location');
  const status = document.getElementById('locationStatus');
  if (!input || !status) return;

  if (!navigator.geolocation) {
    status.textContent = 'GPS not supported. Please type your location.';
    return;
  }

  status.textContent = '📍 Detecting your location...';

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      try {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        input.value        = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        status.textContent = '✓ Location detected successfully';
        status.style.color = 'var(--green)';
      } catch {
        input.value        = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        status.textContent = '✓ GPS coordinates detected';
        status.style.color = 'var(--green)';
      }
    },
    (err) => {
      // HTTP sites: browser may block GPS — give clear message
      if (err.code === 1) {
        status.textContent = '⚠ Location blocked. In Chrome: click the 🔒 icon in address bar → Site settings → Allow Location. Or just type your area below.';
      } else {
        status.textContent = '⚠ Could not detect. Please type your area name manually.';
      }
      status.style.color = '#e67e22';
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

// Image preview
let _pendingImageFile = null;

function previewPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  _pendingImageFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('photoPreview');
    if (preview) {
      preview.src          = e.target.result;
      preview.style.display = 'block';
    }
    const area = document.getElementById('uploadArea');
    if (area) area.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// Upload image to S3 via signed URL
async function uploadImageToS3(file) {
  const res = await fetch(API_BASE + '/upload-url', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ filename: file.name, filetype: file.type })
  });
  const { uploadUrl, imageUrl } = await res.json();
  await fetch(uploadUrl, {
    method:  'PUT',
    headers: { 'Content-Type': file.type },
    body:    file
  });
  return imageUrl;
}

// Submit complaint
async function submitComplaint() {
  const title    = document.getElementById('title')?.value.trim();
  const desc     = document.getElementById('desc')?.value.trim();
  const location = document.getElementById('location')?.value.trim();
  const name     = document.getElementById('name')?.value.trim();
  const category = selectedCat;

  if (!title || !desc || !location || !name || !category) {
    alert('Please fill in all required fields and select a category.');
    return;
  }

  const submitBtn = document.querySelector('.btn-primary.full-width');
  if (submitBtn) {
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Submitting...';
  }

  try {
    // Upload image if one was selected
    let image_url = null;
    if (_pendingImageFile) {
      try {
        image_url = await uploadImageToS3(_pendingImageFile);
      } catch (imgErr) {
        console.error('Image upload failed — submitting without image:', imgErr);
      }
    }

    const result = await apiSubmitComplaint({
      title,
      description: desc,
      category,
      location,
      reporter_name: name,
      image_url
    });

    if (result.success) {
      document.getElementById('complaintForm').style.display = 'none';
      document.getElementById('formSuccess').style.display   = 'block';
    } else {
      alert('Error: ' + (result.error || 'Something went wrong. Try again.'));
      if (submitBtn) {
        submitBtn.disabled   = false;
        submitBtn.innerHTML  = '<i class="fa-solid fa-paper-plane"></i> Submit Complaint';
      }
    }
  } catch (e) {
    alert('Network error. Please check your internet connection.\n\nDetails: ' + e.message);
    if (submitBtn) {
      submitBtn.disabled  = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Complaint';
    }
  }
}

// =============================================
//  NAV
// =============================================

function toggleMenu() {
  document.querySelector('.nav-links')?.classList.toggle('open');
}