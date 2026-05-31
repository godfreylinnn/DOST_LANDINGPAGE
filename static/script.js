const systemsGrid = document.querySelector("#systems-grid");

const systemSearch = document.querySelector("#main-website-search");
const systemSearchForm = document.querySelector("#system-search-form");
const sidebarToggle = document.querySelector("#sidebar-toggle");
const sidebarOverlay = document.querySelector("#sidebar-overlay");
const sideNavLinks = document.querySelectorAll(".side-nav a");
const pstDate = document.querySelector("#pst-date");
const pstTime = document.querySelector("#pst-time");
let systems = [];

function setSidebarOpen(isOpen) {
  document.body.classList.toggle("sidebar-open", isOpen);
  if (sidebarToggle) {
    sidebarToggle.setAttribute("aria-expanded", String(isOpen));
    sidebarToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  }
  if (sidebarOverlay) {
    sidebarOverlay.hidden = !isOpen;
  }
}

function toggleSidebar() {
  setSidebarOpen(!document.body.classList.contains("sidebar-open"));
}

function facebookEmbedUrl(pageUrl) {
  const encodedUrl = encodeURIComponent(pageUrl);
  return `https://www.facebook.com/plugins/page.php?href=${encodedUrl}&tabs=timeline&width=340&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false`;
}

function setFacebookFrame(pageUrl) {
  const facebookFrame = document.querySelector("#facebook-frame");
  if (!facebookFrame || !pageUrl) return;

  const nextUrl = facebookEmbedUrl(pageUrl);
  if (facebookFrame.dataset.currentSrc === nextUrl) {
    return;
  }

  facebookFrame.dataset.currentSrc = nextUrl;
  facebookFrame.setAttribute("src", nextUrl);
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element && value) {
    element.textContent = value;
  }
}

function setLink(selector, url) {
  const element = document.querySelector(selector);
  if (element && url) {
    element.href = url;
  }
}

function setImage(selector, src, alt) {
  const image = document.querySelector(selector);
  if (image && src) {
    image.src = assetPath(src);
  }
  if (image && alt) {
    image.alt = alt;
  }
}

function assetPath(path) {
    if (!path) return '';
    
    // Normalize: remove leading slashes if they exist, to handle /static/ vs static/
    const cleanPath = path.replace(/^\/+/, '');

    if (cleanPath.startsWith('files/')) {
        return encodeURI('/static/assets/' + cleanPath);
    }

    // If it already starts with static/, just return it with a leading slash
    if (cleanPath.startsWith('static/')) {
        return encodeURI('/' + cleanPath);
    }
    
    // If it already starts with /static/ (the result of the above), return as is
    if (path.startsWith('/static/')) {
        return encodeURI(path);
    }

    // Otherwise, it definitely needs the prefix
    return encodeURI('/static/' + cleanPath);
}

function fileRefKey(file) {
    if (typeof file === 'string') return file;
    return file?.url || file?.path || file?.name || '';
}

function fileRefUrl(file) {
    if (typeof file === 'string') {
        return file.startsWith('http') ? file : assetPath(file);
    }
    return file?.url || '#';
}

function fileRefName(file) {
    if (typeof file === 'string') {
        return decodeURIComponent(file.split('/').pop().split('?')[0]);
    }
    return file?.name || file?.path?.split('/').pop() || 'Download file';
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function updatePstClock() {
  const now = new Date();
  const dateEl = document.querySelector('#pst-date');
  const timeEl = document.querySelector('#pst-time');

  let dateText = '';
  let timeText = '';
  try {
    dateText = new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    }).format(now);

    timeText = new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    }).format(now);
  } catch (err) {
    dateText = now.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    timeText = now.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  }

  if (dateEl) dateEl.textContent = dateText;
  if (timeEl) {
    timeEl.textContent = timeText;
    try { timeEl.dateTime = now.toISOString(); } catch (_) {}
  }
}


function filterSystems() {
  if (!systemSearch) return;
  const query = systemSearch.value.trim().toLowerCase();
  
  if (!query) {
    renderSystems(systems);
    return;
  }

  
  const filtered = systems.filter((s) => 
    s.name && s.name.toLowerCase().includes(query)
  );
  
  if (filtered.length > 0) {
    renderSystems(filtered);
  }
}

function renderSystems(items) {
  if (!systemsGrid) return;

  if (!items || items.length === 0) {
    systemsGrid.innerHTML = `
      <div class="empty-state">
        <p>No systems found.</p>
      </div>`;
    return;
  }

  // Pre-calculate the fallback image path
  const fallbackImg = assetPath('assets/dost-logo-photo.jpg');

 systemsGrid.innerHTML = items.map((system) => {
  const imgSrc = system.image ? assetPath(system.image) : null;
  
// ... inside your map loop ...
return `
  <article class="system-card">
    <a href="${system.url || "#"}" target="_blank" class="system-image-link">
      <div class="system-image-wrap">
        ${imgSrc 
          ? `<img src="${imgSrc}" alt="${system.name}" onerror="this.src='${fallbackImg}'">`
          : `<span class="system-logo-fallback">${system.name.slice(0, 3).toUpperCase()}</span>`
        }
      </div>
    </a>
    <div class="system-info">
      <h3>${system.name}</h3>
      <p>${system.description || ''}</p>
    </div>
  </article>
`;
}).join("");
}

async function loadProfile() {
  const response = await fetch("/api/profile");
  const profile = await response.json();

  setText("#office-name", profile.office);
  setText("#tagline", profile.tagline);
  setText("#office-full-name", profile.fullName);
  setText("#office-location", profile.location);
  setText("#office-telephone", profile.telephone);
  setText("#quick-label", profile.quickInfo?.label);
  setText("#quick-title", profile.quickInfo?.title);
  setText("#quick-detail", profile.quickInfo?.detail);

  setLink("#facebook-link", profile.facebook);
  setLink("#facebook-panel-link", profile.facebook);

  const fallbackFacebook = document.querySelector("#facebook-frame")?.dataset.pageUrl;
  setFacebookFrame(profile.facebook || fallbackFacebook);

  setImage("#top-brand-logo", profile.assets?.logo, profile.assets?.logoAlt || "DOST logo");
  if (profile.assets?.background) {
    document.documentElement.style.setProperty("--hero-image", `url("${profile.assets.background}")`);
  }

  const email = document.querySelector("#office-email");
  if (email && profile.email) {
    email.textContent = profile.email;
    email.href = `mailto:${profile.email}`;
  }
}

async function loadSystems() {
  const response = await fetch("/api/systems");
  systems = await response.json();
  renderSystems(systems);
}

if (sidebarToggle) {
  sidebarToggle.addEventListener("click", toggleSidebar);
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", () => setSidebarOpen(false));
}

sideNavLinks.forEach((link) => {
  link.addEventListener("click", () => setSidebarOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setSidebarOpen(false);
  }
});


if (systemSearch) {
  systemSearch.addEventListener("input", filterSystems);
}

if (systemSearchForm) {
  systemSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!systemSearch) return;
    const keyword = systemSearch.value.trim().toLowerCase();
    if (!keyword) return;

    
    const systemsMatched = systems.filter((s) => [s.name, s.description, s.category, s.status].join(' ').toLowerCase().includes(keyword)).length;

    const systemCards = Array.from(document.querySelectorAll('.system-card'));
    let firstMatchEl = null;
    if (systemCards.length) {
      systemCards.forEach(card => card.classList.remove('search-highlight'));
      systems.forEach((s, idx) => {
        const hay = [s.name, s.description, s.category, s.status].join(' ').toLowerCase();
        if (hay.includes(keyword)) {
          const card = systemCards[idx];
          if (card) {
            card.classList.add('search-highlight');
            if (!firstMatchEl) firstMatchEl = card;
          }
        }
      });
    }

    // 2) inventory table search & highlight
    const inventoryEl = document.querySelector('#inventory');
    const inventoryTable = document.querySelector('#inventory table');
    let inventoryMatches = 0;
    
    document.querySelectorAll('.search-highlight').forEach(el => el.classList.remove('search-highlight'));
    if (inventoryTable) {
      const cells = Array.from(inventoryTable.querySelectorAll('td'));
      cells.forEach(td => {
        if (td.textContent.toLowerCase().includes(keyword)) {
          td.classList.add('search-highlight');
          inventoryMatches++;
        }
      });
    }

    
    let formMatches = 0;
    const formsSection = document.querySelector('#forms');
    if (formsSection) {
      if (formsSection.textContent.toLowerCase().includes(keyword)) {
        formMatches = 1;
      }
      const knownFiles = ['Cest_Form_A.pdf', 'Cest_Manual.docx', 'Setup_Application.pdf', 'Guidelines.pdf', 'GIA_Proposal_Template.xlsx'];
      knownFiles.forEach(f => {
        if (f.toLowerCase().includes(keyword)) formMatches++;
      });
    }

    
    let contentMatches = 0;
    const main = document.querySelector('main');
    if (main && main.textContent.toLowerCase().includes(keyword)) contentMatches = 1;

    
    if (inventoryMatches > 0 && inventoryEl) {
      const firstInv = inventoryTable.querySelector('.search-highlight');
      if (firstInv) {
        firstInv.tabIndex = -1;
        firstInv.focus({ preventScroll: true });
        firstInv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstMatchEl = firstInv;
      } else {
        inventoryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (systemsMatched > 0) {
      if (firstMatchEl) {
        firstMatchEl.tabIndex = -1;
        firstMatchEl.focus({ preventScroll: true });
        firstMatchEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        document.querySelector('#systems')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (formMatches > 0) {
      const formsEl = document.querySelector('#forms');
      formsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (contentMatches > 0) {
      const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, null);
      let node;
      while (node = walker.nextNode()) {
        if (node.nodeValue.toLowerCase().includes(keyword)) {
          const parent = node.parentElement;
          if (parent) {
            parent.classList.add('search-highlight');
            parent.tabIndex = -1;
            parent.focus({ preventScroll: true });
            parent.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstMatchEl = parent;
            break;
          }
        }
      }
      if (!firstMatchEl) main.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      showNoResultsNotice(keyword);
    }
  });
}

function showNoResultsNotice(keyword) {
  const main = document.querySelector('main');
  if (!main) return;
  const existing = document.querySelector('.no-results-notice');
  if (existing) existing.remove();

  const notice = document.createElement('div');
  notice.className = 'no-results-notice';
  notice.textContent = `No results found for "${keyword}".`;
  main.prepend(notice);
  setTimeout(() => notice.remove(), 4000);
}

function openDash(type) {
  const overlay = document.getElementById('form-dash-overlay');
  const title = document.getElementById('dash-title');
  const list = document.getElementById('dash-list');
  const categoryField = document.getElementById('categoryField');
  
  if (categoryField) categoryField.value = type;
  if (!overlay || !list) return;

  title.innerText = `${type} `;
  
  // 1. Your existing hardcoded files
  const hardcodedFiles = {
    'PM-DOST-VIII (Quality Management / CSM / Meeting Forms)': [
        'files/PM-DOST-VIII-07-04-F1-Action-Slip-Rev.1.xls',
        'files/PM-DOST-VIII-09-03-F1-Attendance-Sheet-Rev.1.doc',
        'files/PM-DOST-VIII-09-03-F2-Minutes-of-Meeting-Rev.1.doc',
        'files/PM-DOST-VIII-09-01-F4-CSM-Questionnaire-Version-4.docx',
        'files/PM-DOST-VIII-09-01-F5-Customer-Satisfaction-Feedback-Action-Plan.doc',
        'files/PM-DOST-VIII-09-01-F6-Consolidated-CSM-Results.docx',
    ],
    'PM-FAS-SPO (Finance and Administrative Services / Supply & Property)': [
        'files/PM-FAS-SPO-07-01-F1-Purchase-Request-Rev.0.xls',
        'files/PM-FAS-SPO-07-01-F4-Purchase-Order-Rev.-0.xlsx',
    ],
    'Assistance & Technical Programs (PM-TO)': ['files/GIA_Proposal_Template.xlsx']
  };

  // 2. Fetch new files from your server and combine them
  fetch('/api/files')
    .then(res => res.json())
    .then(serverFiles => {
        let combinedFiles = hardcodedFiles[type] || [];
        
        // Add new files from server if they exist for this category
        if (serverFiles[type]) {
            serverFiles[type].forEach(newFile => {
                const exists = combinedFiles.some(file => fileRefKey(file) === fileRefKey(newFile));
                if (!exists) {
                    combinedFiles.push(newFile);
                }
            });
        }

        // 3. Render the combined list
        if (combinedFiles.length > 0) {
          // Change your rendering logic inside openDash to this:
// Change your list.innerHTML map function to this:
list.innerHTML = combinedFiles.map(file => {
    const cleanPath = fileRefUrl(file);
    const displayName = fileRefName(file);
    
    return `<div class="file-item"><a href="${escapeHtml(cleanPath)}" download>${escapeHtml(displayName)}</a></div>`;
}).join('');
        } else {
            list.innerHTML = '<p>No files available for this category.</p>';
        }
    });

  overlay.style.display = 'flex';
}
function closeDash() {
  document.getElementById('form-dash-overlay').style.display = 'none';
}

const aboutModalContent = {
  history: {
    title: "Historical Background",
    body: `
      <p>The Department of Science and Technology (Kagawaran ng Agham at Teknolohiya), more popularly 
      known as the DOST, was originally established as the National Science and Development Board 
      (NSDB) on June 13, 1958. It was later reorganized on March 17, 1982 to become the National Science 
      and Technology Authority vested with broader policy-making and program implementing functions. 
      NSTA was elevated as a Department on January 30, 1987 under Executive Order No.128. Presently, 
      DOST has 16 regional offices all over the country which includes Regions: I, II, III, IV-A, IV-B, 
      NCR, CAR, V, VI, VII, VIII, IX, CARAGA, X, XI, XII, and ARMM. DOST has also a total of 87 Provincial 
      S&T Centers nationwide.
      </p>
      <p>The Department through the years</p>
      <ul>
        <li>1958 - 1958 – Congress passes a law establishing the National Science Development Board (NSDB) 
        upon the recommendation of Dr. Frank Co Tui, who was tasked to survey the state of Philippine S&T 
        during President Carlos Garcia’s administration;</li>
        <li>1982 – NSDB revamped as the National Science and Technology (NSTA) and accorded broader 
        policy-making and program implementing functions;</li>
        <li>1987 – NSTA elevated to Cabinet level and becomes the DOST in response to increasing 
        demands for S&T intervention in national development.</li>
        <li>Executive Order (EO) 128</li>
      </ul>
    `
  },
 privacy: {
        title: "DOST VIII's Privacy Policy",
        body: `
            <div class="privacy-container" style="font-family: Arial, sans-serif; font-size: 0.95rem; line-height: 1.6; color: #333; text-align: justify; padding-right: 5px;">
                
                <p><strong>General Privacy Statement</strong><br>
                The Department of Science and Technology Regional Office VIII (DOST VIII) respects and protects the privacy of our data subjects (employees, clients, providers and other stakeholders) and ensure that all personal information collected are processed lawfully, fairly, and appropriately in accordance with the confidentiality practices and applicable laws on data privacy.</p>

                <p><strong>Consent</strong><br>
                When accessing our services through website and in-office whereby we collect your personal information through any format, including but not limited to online forms, you consent us to the collecting, processing, storing and use of your personal information, in accordance with this privacy policy. If you do not allow the collection, use, and processing of your personal information, kindly refrain from using our website, and/or contact us for any privacy-related concerns.</p>

                <p><strong>Collection and Use of Personal information</strong><br>
                We collect personal information to enable us to deliver our services. We may collect, use, and process your personal information through various sources depending on how you interact with us (online and/or offline forms, over the phone, email, etc.).</p>

                <p><strong>Information you provide to us</strong><br>
                Your personal information refers to any information, whether recorded in a material form or not, from which the identity of an individual is apparent or can be reasonably and directly ascertained by the entity holding the information, or when put together with other information would directly and certainly identify an individual. This may include your name, email address, telephone number, postal address, demographic information such as age, sex, income level, and /or any personal references needed to provide access to our service.</p>

                <p><strong>How we Use the Information we collect</strong><br>
                We use the data collected to understand your needs and provide you with a better service, and particularly, for the following reasons:</p>
                <ul style="margin-top: -5px; margin-bottom: 15px; padding-left: 20px;">
                    <li>To verify your identity when you log-in, and to respond to your queries, requests and complaints;</li>
                    <li>To use the collected data to process information necessary with your transactions;</li>
                    <li>To collect the information to conduct research and analysis to improve our customer service;</li>
                    <li>To disclose information when the law requires us to do so in compliance with legal, regulatory, and contractual obligations;</li>
                    <li>To use the information to perform such other processing or disclosure that may be required by the DOST.</li>
                </ul>

                <p><strong>Privileged Information</strong><br>
                Privileged information refers to any and all forms of data which under the Rules of Court and other pertinent laws constitute privileged 
                communication.<br>
                The processing of privileged information shall be prohibited, except when (1)the data subject has given his or her consent, specific to 
                the purpose prior to the processing, or in the case of privileged information, all parties to the exchange have given their consent prior 
                to processing; (2) the processing of the same is provided for by existing laws and regulations; (3) the processing is necessary to achieve 
                the lawful and noncommercial objectives of public organizations and their associations: Provided, That such processing is only confined and 
                related to the bona fide members of these organizations or their associations: Provided, further, That the sensitive personal information 
                are not transferred to third parties: Provided, finally, That consent of the data subject was obtained prior to processing.</p>

                <p><strong>Protection and Security of Data</strong><br>
                All collected personal information shall be retained and kept with reasonable security measures for as long as necessary for the fulfillment 
                of the purposes for which the data were obtained or as provided by law.</p>

                <p><strong>Effectivity</strong><br>
                This Policy shall take effect immediately after being posted on DOST8 website. Adopted this 15th day of February 2022.</p>

                <p><strong>Privacy Policy Changes / Updates</strong><br>
                This Privacy Policy will remain effective until any amendments, modifications or changes will be made at any time to comply with the latest 
                directives from laws and regulations.</p>

                <p><strong>Questions/Concerns</strong><br>
                For any questions and/or concerns about this Privacy Policy, please address your concerns to:</p>
                
                <p style="background-color: #f9f9f9; padding: 12px; border: 1px solid #e3e3e3; border-left: 4px solid #0066cc; line-height: 1.5; margin-top: -5px;">
                    <strong>The Data Protection Officer</strong><br>
                    DOST VIII Regional Office Building<br>
                    Government Center, Candahug<br>
                    6501 Palo, Leyte, Philippines<br>
                    Tel. Nos: (053) 888-4203 / 6036<br>
                    Email/Web: <a href="https://facebook.com/dost8official" target="_blank" style="color: #0066cc; text-decoration: none;">facebook.com/dost8official</a>
                </p>
            </div>
        `
    },
officials: {
        title: "Key Officials",
        body: `
            <div class="officials-container" style="display: flex; flex-direction: column; gap: 20px; font-family: Arial, sans-serif;">
                
                <div class="section-header" style="background-color: #f0f0f0; font-size: 0.85rem; font-weight: bold; padding: 8px 12px; border-bottom: 
                1px solid #e0e0e0;">OFFICE OF THE REGIONAL DIRECTOR</div>
                <div class="official-card" style="display: flex; gap: 20px; align-items: flex-start; padding: 10px 0;">
                    <img src="/static/assets/RegionalDirector.png" alt="Dr. John Glenn D. Ocaña" style="width: 150px; height: auto; border: 1px solid #ccc;">
                    <div class="official-details" style="font-size: 0.9rem; line-height: 1.5;">
                        <strong style="font-size: 1rem; color: #000;">DR. JOHN GLENN D. OCAÑA</strong><br>
                        Regional Director<br>
                        DOST Regional Office VIII<br>
                        Government Center, Palo, Leyte<br>
                        Tel No: (053) 832-8978<br>
                        Email: <a href="mailto:records@region8.dost.gov.ph" style="color: #0066cc; text-decoration: none;">records@region8.dost.gov.ph</a>
                    </div>
                </div>

                <div class="section-header" style="background-color: #f0f0f0; font-size: 0.85rem; font-weight: bold; padding: 8px 12px; border-bottom: 1px 
                solid #e0e0e0;">TECHNICAL OPERATIONS DIVISION</div>
                <div class="official-card" style="display: flex; gap: 20px; align-items: flex-start; padding: 10px 0;">
                    <img src="/static/assets/TechOperation.png" alt="Marilyn O. Radam" style="width: 150px; height: auto; border: 1px solid #ccc;">
                    <div class="official-details" style="font-size: 0.9rem; line-height: 1.5;">
                        <strong style="font-size: 1rem; color: #000;">MARILYN O. RADAM</strong><br>
                        Assistant Regional Director for Technical Operations<br>
                        DOST Regional Office VIII<br>
                        Government Center, Palo, Leyte<br>
                        Tel No: (053) 888-4203<br>
                        Email: <a href="mailto:maradam@region8.dost.gov.ph" style="color: #0066cc; text-decoration: none;">maradam@region8.dost.gov.ph</a>
                    </div>
                </div>

                <div class="section-header" style="background-color: #f0f0f0; font-size: 0.85rem; font-weight: bold; padding: 8px 12px; border-bottom: 1px 
                solid #e0e0e0;">FINANCE AND ADMIN SERVICES DIVISION</div>
                <div class="official-card" style="display: flex; gap: 20px; align-items: flex-start; padding: 10px 0;">
                    <img src="/static/assets/Finance_REMengote.png" alt="Dr. Rufino E. Mengote" style="width: 150px; height: auto; border: 1px solid #ccc;">
                    <div class="official-details" style="font-size: 0.9rem; line-height: 1.5;">
                        <strong style="font-size: 1rem; color: #000;">DR. RUFINO E. MENGOTE</strong><br>
                        Assistant Regional Director for Finance and Administrative Services<br>
                        DOST Regional Office VIII<br>
                        Government Center, Palo, Leyte<br>
                        Tel/Fax No: (053) 832-0785<br>
                        Email: <a href="mailto:rufino.mengote@region8.dost.gov.ph" style="color: #0066cc; text-decoration: none;">rufino.mengote@region8.dost.gov.ph</a>
                    </div>
                </div>
                <div class="official-card" style="display: flex; gap: 20px; align-items: flex-start; padding: 10px 0;">
                    <img src="/static/assets/Finance_CCMBasiano.png" alt="Carissa Mae M. Basiano" style="width: 150px; height: auto; border: 1px solid #ccc;">
                    <div class="official-details" style="font-size: 0.9rem; line-height: 1.5;">
                        <strong style="font-size: 1rem; color: #000;">CARISSA MAE M. BASIANO</strong><br>
                        Budget Officer<br>
                        DOST Regional Office VIII<br>
                        Government Center, Palo, Leyte<br>
                        Tel/Fax No: (053) 832-0785<br>
                        Email: <a href="mailto:cmbasiano@region8.dost.gov.ph" style="color: #0066cc; text-decoration: none;">cmbasiano@region8.dost.gov.ph</a>
                    </div>
                </div>

                <div class="official-card" style="display: flex; gap: 20px; align-items: flex-start; padding: 10px 0;">
                    <img src="/static/assets/Finance_RVTobias.png" alt="Rogen Vincent R. Tobias" style="width: 150px; height: auto; border: 1px solid #ccc;">
                    <div class="official-details" style="font-size: 0.9rem; line-height: 1.5;">
                        <strong style="font-size: 1rem; color: #000;">ROGEN VINCENT R. TOBIAS</strong><br>
                        Accountant<br>
                        DOST Regional Office VIII<br>
                        Government Center, Palo, Leyte<br>
                        Tel/Fax No: (053) 832-8765<br>
                        Email: <a href="mailto:rvtobias@region8.dost.gov.ph" style="color: #0066cc; text-decoration: none;">rvtobias@region8.dost.gov.ph</a>
                    </div>
                </div>

                <div class="official-card" style="display: flex; gap: 20px; align-items: flex-start; padding: 10px 0;">
                    <img src="/static/assets/Fianance_PTPeque.png" alt="Prospero T. Peque" style="width: 150px; height: auto; border: 1px solid #ccc;">
                    <div class="official-details" style="font-size: 0.9rem; line-height: 1.5;">
                        <strong style="font-size: 1rem; color: #000;">PROSPERO T. PEQUE</strong><br>
                        Supply and Property Officer<br>
                        DOST Regional Office VIII<br>
                        Government Center, Palo, Leyte<br>
                        Tel/Fax No: (053) 832-8765<br>
                        Email: <a href="mailto:prosper@region8.dost.gov.ph" style="color: #0066cc; text-decoration: none;">prosper@region8.dost.gov.ph</a>
                    </div>
                </div>

                <div class="section-header" style="background-color: #f0f0f0; font-size: 0.85rem; font-weight: bold; padding: 8px 12px; border-bottom: 1px 
                solid #e0e0e0;">PROVINCIAL SCIENCE AND TECHNOLOGY OFFICES</div>
                
                <div style="font-size: 0.85rem; font-weight: bold; margin-top: 5px; color: #444;">PSTO LEYTE</div>
                <div class="official-card" style="display: flex; gap: 20px; align-items: flex-start; padding: 10px 0; border-bottom: 1px dashed #ddd;">
                    <img src="/static/assets/PSTO-Leyte.png" alt="Mr. Mhardy C. Montejo" style="width: 150px; height: auto; border: 1px solid #ccc;">
                    <div class="official-details" style="font-size: 0.9rem; line-height: 1.5;">
                        <strong style="font-size: 1rem; color: #000;">MR. MHARDY C. MONTEJO</strong><br>
                        Provincial S&T Director<br>
                        Telephone: (053) 832-2967<br>
                        Email: <a href="mailto:mhardy.montejo@region8.dost.gov.ph" style="color: #0066cc; text-decoration: none;">mhardy.montejo@region8.dost.gov.ph</a>
                    </div>
                </div>

                <div style="font-size: 0.85rem; font-weight: bold; margin-top: 5px; color: #444;">PSTO SOUTHERN LEYTE</div>
                <div class="official-card" style="display: flex; gap: 20px; align-items: flex-start; padding: 10px 0; border-bottom: 1px dashed #ddd;">
                    <img src="/static/assets/PSTO-SouthernLeyte.png" alt="Dr. Ramil T. Uy" style="width: 150px; height: auto; border: 1px solid #ccc;">
                    <div class="official-details" style="font-size: 0.9rem; line-height: 1.5;">
                        <strong style="font-size: 1rem; color: #000;">DR. RAMIL T. UY</strong><br>
                        Provincial S&T Director<br>
                        Telephone: (053) 571-3990<br>
                        Email: <a href="mailto:ramiltuy@region8.dost.gov.ph" style="color: #0066cc; text-decoration: none;">ramiltuy@region8.dost.gov.ph</a>
                    </div>
                </div>

                <div style="font-size: 0.85rem; font-weight: bold; margin-top: 5px; color: #444;">PSTO BILIRAN</div>
                <div class="official-card" style="display: flex; gap: 20px; align-items: flex-start; padding: 10px 0; border-bottom: 1px dashed #ddd;">
                    <img src="/static/assets/PSTO-Biliran.png" alt="Dr. Romeo L. Dignos" style="width: 150px; height: auto; border: 1px solid #ccc;">
                    <div class="official-details" style="font-size: 0.9rem; line-height: 1.5;">
                        <strong style="font-size: 1rem; color: #000;">DR. ROMEO L. DIGNOS</strong><br>
                        Provincial S&T Director<br>
                        Telephone: (053) 500-9347<br>
                        Email: <a href="mailto:romeo.dignos@region8.dost.gov.ph" style="color: #0066cc; text-decoration: none;">romeo.dignos@region8.dost.gov.ph</a>
                    </div>
                </div>

                <div style="font-size: 0.85rem; font-weight: bold; margin-top: 5px; color: #444;">PSTO SAMAR</div>
                <div class="official-card" style="display: flex; gap: 20px; align-items: flex-start; padding: 10px 0; border-bottom: 1px dashed #ddd;">
                    <img src="/static/assets/PSTO-Samar.png" alt="Dr. Evelyn B. Tablante" style="width: 150px; height: auto; border: 1px solid #ccc;">
                    <div class="official-details" style="font-size: 0.9rem; line-height: 1.5;">
                        <strong style="font-size: 1rem; color: #000;">DR. EVELYN B. TABLANTE</strong><br>
                        Provincial S&T Director<br>
                        Telephone: (055) 251-6288<br>
                        Email: <a href="mailto:ebtablante@region8.dost.gov.ph" style="color: #0066cc; text-decoration: none;">ebtablante@region8.dost.gov.ph</a>
                    </div>
                </div>

                <div style="font-size: 0.85rem; font-weight: bold; margin-top: 5px; color: #444;">PSTO EASTERN SAMAR</div>
                <div class="official-card" style="display: flex; gap: 20px; align-items: flex-start; padding: 10px 0; border-bottom: 1px dashed #ddd;">
                    <img src="/static/assets/PSTO-EasternSamar.png" alt="Dr. Arnaldo T. Amosco, Jr." style="width: 150px; height: auto; border: 1px solid #ccc;">
                    <div class="official-details" style="font-size: 0.9rem; line-height: 1.5;">
                        <strong style="font-size: 1rem; color: #000;">DR. ARNALDO T. AMOSCO, JR.</strong><br>
                        Provincial S&T Director<br>
                        Telephone: (055) 261-2664<br>
                        Email: <a href="mailto:atamoscojr@region8.dost.gov.ph" style="color: #0066cc; text-decoration: none;">atamoscojr@region8.dost.gov.ph</a>
                    </div>
                </div>

                <div style="font-size: 0.85rem; font-weight: bold; margin-top: 5px; color: #444;">PSTO NORTHERN SAMAR</div>
                <div class="official-card" style="display: flex; gap: 20px; align-items: flex-start; padding: 10px 0;">
                    <img src="/static/assets/PSTO-NorthernSamar.png" alt="Engr. Veronica A. Laguitan" style="width: 150px; height: auto; border: 1px solid #ccc;">
                    <div class="official-details" style="font-size: 0.9rem; line-height: 1.5;">
                        <strong style="font-size: 1rem; color: #000;">ENGR. VERONICA A. LAGUITAN</strong><br>
                        Provincial S&T Director<br>
                        Telephone: (055) 251-7258<br>
                        Email: <a href="mailto:valaguitan@region8.dost.gov.ph" style="color: #0066cc; text-decoration: none;">valaguitan@region8.dost.gov.ph</a>
                    </div>
                </div>

            </div>
        `
    },

  offices: {
        title: "Offices",
        body: `
            <p>DOST VIII serves Eastern Visayas through its regional office and provincial science and technology offices.</p>
            
            <div class="section-header" style="background-color: #f0f0f0; font-size: 0.85rem; font-weight: bold; padding: 8px 12px; 
            margin-top: 20px; border-bottom: 1px solid #e0e0e0;">REGIONAL OFFICE</div>
            <table class="office-table" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                <tr>
                    <td class="office-name" style="width: 25%; background-color: #f7f7f7; font-weight: bold; padding: 12px; border: 
                    1px solid #ccc;">Address</td>
                    <td class="office-address" style="width: 75%; background-color: #fafafa; padding: 12px; border: 1px solid #ccc;">
                    Government Center, Candahug, Palo, Leyte</td>
                </tr>
            </table>

            <div class="section-header" style="background-color: #f0f0f0; font-size: 0.85rem; font-weight: bold; padding: 8px 12px; 
            margin-top: 20px; border-bottom: 1px solid #e0e0e0;">PROVINCIAL OFFICES</div>
            <table class="office-table" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                <tr>
                    <td class="office-name" style="width: 25%; background-color: #f7f7f7; font-weight: bold; padding: 12px; border: 
                    1px solid #ccc;">PSTO Leyte</td>
                    <td class="office-address" style="width: 75%; background-color: #fafafa; padding: 12px; border: 1px solid #ccc;">
                    Government Center, Candahug, Palo, Leyte</td>
                </tr>
                <tr>
                    <td class="office-name" style="width: 25%; background-color: #f7f7f7; font-weight: bold; padding: 12px; border: 
                    1px solid #ccc;">PSTO Southern Leyte</td>
                    <td class="office-address" style="width: 75%; background-color: #fafafa; padding: 12px; border: 1px solid #ccc;">
                    Asuncion, Maasin City, Southern Leyte</td>
                </tr>
                <tr>
                    <td class="office-name" style="width: 25%; background-color: #f7f7f7; font-weight: bold; padding: 12px; border: 
                    1px solid #ccc;">PSTO Biliran</td>
                    <td class="office-address" style="width: 75%; background-color: #fafafa; padding: 12px; border: 1px solid #ccc;">
                    NSU Campus, Naval, Biliran</td>
                </tr>
                <tr>
                    <td class="office-name" style="width: 25%; background-color: #f7f7f7; font-weight: bold; padding: 12px; border: 1px 
                    solid #ccc;">PSTO Samar</td>
                    <td class="office-address" style="width: 75%; background-color: #fafafa; padding: 12px; border: 1px solid #ccc;">
                    SSU Campus, Catbalogan City, Samar</td>
                </tr>
                <tr>
                    <td class="office-name" style="width: 25%; background-color: #f7f7f7; font-weight: bold; padding: 12px; border: 1px solid #ccc;">
                    PSTO Eastern Samar</td>
                    <td class="office-address" style="width: 75%; background-color: #fafafa; padding: 12px; border: 1px solid #ccc;">ESSU Campus, 
                    Borongan City, Eastern Samar</td>
                </tr>
                <tr>
                    <td class="office-name" style="width: 25%; background-color: #f7f7f7; font-weight: bold; padding: 12px; border: 1px solid #ccc;">
                    PSTO Northern Samar</td>
                    <td class="office-address" style="width: 75%; background-color: #fafafa; padding: 12px; border: 1px solid #ccc;">UEP Campus, 
                    Catarman, Northern Samar</td>
                </tr>
            </table>
        `
    },
  quality: {
    title: "Quality Policy",
    body: `
      <p>“We are committed to provide the public and private sectors in Region VIII with science and technology products and services in:</p>
      <ul>
        <li>Technology transfer and commercialization;</li>
        <li>Information and promotion</li>
        <li>Human resource development</li>
      </ul>
      <p>with the highest standards of quality and reliability within our capabilities and resources according to customer and all applicable 
      regulatory and statutory requirements, to address risks and opportunities, and to continually improve the effectiveness of our Quality 
      Management System at all times in order to meet customer satisfaction.”</p>
    `
  },
  mandate: {
    title: "Mandate",
    body: `
      <p>Executive Order No.128 mandates the Department to “provide central direction, leadership and coordination of scientific and technological 
      efforts and ensure that the results therefrom are geared and utilized in areas of maximum economic and social benefits for the people”.</p>
      <ul>
        <li>Mandate - Lead and coordinate S&T efforts.</li>
        <li>Vision - Enable STI-driven development.</li>
        <li>Core Values - Service, Commitment, Innovation, Ethics, Nurturance, Collaboration, Excellence.</li>
      </ul>
    `
  },
   vision: {
    title: "Vision",
    body: `
      <br>
      <p> The leading enabler and provider of science, technology, and innovation (STI)- explicit solutions towards national development.</p>
      `
   },
    mission: {
    title: "Mission",
    body: `
      <p> To direct, lead, and coordinate the country’s scientific, technological, and innovative efforts geared towards maximum economic and 
      social benefits for the people.</p>
      `
   },
    core: {
    title: "Core Values",
    body: `
      <p> To direct, lead, and coordinate the country’s scientific, technological, and innovative efforts geared towards maximum economic and 
      social benefits for the people.</p>
      `
   },
     

};

function openAboutModal(type) {
  const overlay = document.getElementById('about-modal-overlay');
  const title = document.getElementById('about-modal-title');
  const body = document.getElementById('about-modal-body');
  const content = aboutModalContent[type];

  if (!overlay || !title || !body || !content) return;

  title.innerText = content.title;
  body.innerHTML = content.body;
  overlay.style.display = 'flex';
}

function closeAboutModal() {
  const overlay = document.getElementById('about-modal-overlay');
  if (overlay) overlay.style.display = 'none';
}

document.getElementById('about-modal-overlay')?.addEventListener('click', (event) => {
  if (event.target.id === 'about-modal-overlay') {
    closeAboutModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeAboutModal();
  }
});

// Initialize execution loops
updatePstClock();
setInterval(updatePstClock, 1000);
loadProfile();
loadSystems();

function uploadFile() {
    const form = document.getElementById('uploadForm');
    const formData = new FormData(form);

    fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Upload successful!');
            // Re-open the dash to refresh the file list
            const type = document.getElementById('categoryField').value;
            openDash(type); 
        } else {
            alert('Upload failed: ' + data.error);
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/systems')
        .then(response => response.json())
        .then(data => {
            const grid = document.getElementById('systems-grid');
            if (!grid) return;

            // 1. Build the HTML array first (better performance)
            grid.innerHTML = data.map(system => {
                
                // 2. Smart Pathing: Prevents double "static/" prefixes
                const cleanPath = system.image.replace(/^static\//, '');
                const imageUrl = `/static/${cleanPath}`;

                return `
                    <div class="system-card">
                        <a href="${system.url}" target="_blank" class="system-image-link">
                            <div class="system-image-wrap">
                                <img src="${imageUrl}" alt="${system.name}" onerror="this.src='/static/assets/dost-logo-photo.jpg'">
                            </div>
                        </a>
                        <div class="system-info">
                            <h3>${system.name}</h3>
                            <p>${system.description}</p>
                        </div>
                    </div>
                `;
            }).join(''); // Combine the array into one string
        })
        .catch(error => console.error('Error loading systems:', error));
});
function updateLabel(input) {
  const fileChosen = document.getElementById('file-chosen');
  fileChosen.textContent = input.files[0] ? input.files[0].name : "No file chosen";
}
