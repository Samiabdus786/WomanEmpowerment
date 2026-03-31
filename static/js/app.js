// ===================================================
// ShaktiPath — Women Empowerment Platform
// Main JavaScript — app.js
// ===================================================

// ===== CONFIG =====
const CHAT_API_URL = "/api/chat";
const OPP_API_URL = "/api/opportunities";

// ===== GLOBAL STATE =====
let chatHistory = [];
let isListening = false;
let autoSpeak = false;
let recognition = null;
let currentSchemeTab = 'all';

// ===== PAGE NAVIGATION =====
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  window.scrollTo(0, 0);
}

// ===== SCHEME FUNCTIONS =====
let allSchemesData = [];

async function loadSchemesData() {
  try {
    const res = await fetch('/api/schemes');
    if(res.ok) {
      allSchemesData = await res.json();
      filterSchemes();
    }
  } catch(e) {
    console.error("Failed to load schemes from API:", e);
  }
}

function toggleScheme(header) {
  const body = header.nextElementSibling;
  const arrow = header.querySelector('.arrow');
  const isOpen = body.classList.contains('open');
  // Close all others
  document.querySelectorAll('.scheme-body.open').forEach(b => {
    b.classList.remove('open');
    b.previousElementSibling.querySelector('.arrow').textContent = '▼';
  });
  if (!isOpen) {
    body.classList.add('open');
    arrow.textContent = '▲';
  }
}

function filterSchemes() {
  const q = document.getElementById('schemeSearch').value.toLowerCase();
  const stateFilterEl = document.getElementById('stateFilter');
  const state = stateFilterEl ? stateFilterEl.value : 'all';

  const filtered = allSchemesData.filter(s => {
    const textTarget = (s.name + " " + s.description).toLowerCase();
    const catMatch = currentSchemeTab === 'all' || s.category === currentSchemeTab;
    
    // Strict State Matching
    // If state is "all", show everything.
    // Otherwise, ensure the scheme's state exactly matches the selected state.
    const stateMatch = state === 'all' || s.state.toLowerCase() === state.toLowerCase();
    
    const searchMatch = !q || textTarget.includes(q);
    
    return catMatch && stateMatch && searchMatch;
  });

  renderSchemes(filtered);
}

let currentRenderedSchemes = [];

function renderSchemes(schemes) {
  const container = document.getElementById('schemesList');
  if(!container) return;
  container.innerHTML = '';
  
  if(schemes.length === 0) {
    container.innerHTML = `<div style="padding:40px; text-align:center; color:var(--muted)">No schemes found matching your filters.</div>`;
    return;
  }

  currentRenderedSchemes = schemes;
  const grid = document.createElement('div');
  grid.className = 'schemes-grid';

  schemes.forEach((s, idx) => {
    const card = document.createElement('div');
    card.className = 'card scheme-card';
    
    // Default values if missing
    const badgeTxt = (s.state === 'All India' || s.state === 'Central') ? 'Central Govt' : s.state || 'Govt Scheme';
    const tagsArray = s.tags || [s.category, 'Women'];
    const timeTxt = s.time || '15-30 days';
    
    const tagsHTML = tagsArray.slice(0, 3).map(t => `<span class="sc-tag">${t}</span>`).join('');
    
    card.innerHTML = `
      <div class="sc-badge">${badgeTxt}</div>
      <div class="sc-title">${s.name}</div>
      <div class="sc-desc">${s.description || ''}</div>
      <div class="sc-tags">${tagsHTML}</div>
      <div class="sc-footer">
        <div class="sc-time">⏱️ ${timeTxt}</div>
        <button class="sc-apply-btn" onclick="openSchemeModal(${idx})">Apply Now</button>
      </div>
    `;
    grid.appendChild(card);
  });
  
  container.appendChild(grid);
}

// Global modal function
window.openSchemeModal = function(idx) {
  const s = currentRenderedSchemes[idx];
  if(!s) return;
  
  document.getElementById('m-title').innerText = s.name;
  
  const badgeTxt = (s.state === 'All India' || s.state === 'Central') ? 'Central Govt' : s.state || 'Govt Scheme';
  document.getElementById('m-badge').innerText = badgeTxt + (s.category ? ' • ' + s.category.toUpperCase() : '');
  
  document.getElementById('m-desc').innerText = s.description || '';
  document.getElementById('m-elig').innerText = s.eligibility || 'Specific criteria apply based on state guidelines. Refer to official website.';
  document.getElementById('m-ben').innerText = s.benefits || 'Financial and social assistance.';
  
  const docList = s.documents || ['Aadhaar Card', 'Income/Caste Certificate', 'Bank Passbook', 'Passport Photo'];
  document.getElementById('m-docs').innerHTML = docList.map(d => `<li>${d}</li>`).join('');
  
  const stepList = s.steps || ['Visit respective center', 'Submit application form', 'Document Verification', 'Approval & Disbursement'];
  document.getElementById('m-steps').innerHTML = stepList.map(step => `<li>${step}</li>`).join('');
  
  document.getElementById('m-time').innerHTML = `⏱️ ${s.time || '15-30 days'}`;
  
  const applyBtn = document.querySelector('.modal-btn');
  if(applyBtn) {
    applyBtn.onclick = function() {
      if(s.link) window.open(s.link, '_blank');
      closeSchemeModal();
    };
  }
  
  document.getElementById('schemeModal').classList.add('active');
}

window.closeSchemeModal = function() {
  document.getElementById('schemeModal').classList.remove('active');
}

function filterTab(cat, btn) {
  currentSchemeTab = cat;
  document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterSchemes();
}

// ===== SKILL FUNCTIONS =====
function toggleSkill(chip) {
  chip.classList.toggle('selected');
}

async function findOpportunities() {
  const skills = [...document.querySelectorAll('.skill-chip.selected')]
    .map(c => c.dataset.skill || c.textContent.trim());
  const loc = document.getElementById('locationInp').value.trim() || 'rural Telangana';
  const exp = document.getElementById('expInp').value;
  const pref = document.getElementById('prefInp').value;

  if (!skills.length) {
    showToast('Please select at least one skill! 🌸');
    return;
  }

  const section = document.getElementById('opportunitiesSection');
  const list = document.getElementById('oppList');
  section.style.display = 'block';
  list.innerHTML = `
    <div class="ai-loading">
      <div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div>
      <span style="margin-left:8px;">Finding best opportunities with AI...</span>
    </div>`;
  section.scrollIntoView({ behavior: 'smooth' });

  try {
    const response = await fetch(OPP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system: `You are a women empowerment advisor specializing in rural India, particularly Telangana. 
        Respond ONLY with a valid JSON array. No markdown, no backticks, no preamble, no explanation. 
        Just the raw JSON array.`,
        messages: [{
          role: 'user',
          content: `Give 4 realistic local income opportunities for a woman in ${loc} with these skills: ${skills.join(', ')}.
          Experience level: ${exp}. Work preference: ${pref}.
          Return a JSON array with exactly 4 objects. Each object must have these fields:
          - title: string (opportunity name)
          - description: string (2 sentences explaining what to do)
          - income: string (realistic monthly income range in INR like "₹5,000–15,000/month")
          - type: string (one of: "Home-based", "Local Market", "Online", "Training Program")
          - tips: string (1 specific actionable first step to start immediately)
          - scheme: string (relevant government scheme if any, or "None")`
        }]
      })
    });

    const data = await response.json();
    let text = data.content.map(i => i.text || '').join('');
    text = text.replace(/```json|```/g, '').trim();
    const opps = JSON.parse(text);

    list.innerHTML = opps.map(o => `
      <div class="opp-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;gap:8px;">
          <div class="opp-title">${escapeHtml(o.title)}</div>
          <span class="opp-badge">${escapeHtml(o.type)}</span>
        </div>
        <div class="opp-meta">${escapeHtml(o.description)}</div>
        <div class="opp-income">💰 ${escapeHtml(o.income)}</div>
        <div class="opp-tip">💡 First step: ${escapeHtml(o.tips)}</div>
        ${o.scheme && o.scheme !== 'None' ? `<div style="font-size:12px;color:#6A1B9A;margin-bottom:8px;">🏛️ Scheme: ${escapeHtml(o.scheme)}</div>` : ''}
        <button class="outline-sm-btn" onclick="askAI('Tell me in detail how to start: ${escapeJs(o.title)} in ${loc}. What resources do I need?')">Ask AI for Details →</button>
      </div>
    `).join('');

  } catch (e) {
    console.error('Opportunities error:', e);
    // Fallback opportunities
    list.innerHTML = `
      <div class="opp-card">
        <div class="opp-title">🧵 Home Tailoring & Boutique</div>
        <div class="opp-meta">Take orders for school uniforms, blouses, and traditional dress from neighbors and local schools. Start small and grow by word of mouth.</div>
        <div class="opp-income">💰 ₹8,000–20,000/month</div>
        <div class="opp-tip">💡 First step: Start with 5 neighbors, charge ₹150–300 per item</div>
        <div style="font-size:12px;color:#6A1B9A;margin-bottom:8px;">🏛️ Scheme: Mudra Yojana (Shishu loan ₹50,000)</div>
        <button class="outline-sm-btn" onclick="askAI('How to grow a tailoring business at home step by step?')">Ask AI →</button>
      </div>
      <div class="opp-card">
        <div class="opp-title">🍱 Daily Tiffin Service</div>
        <div class="opp-meta">Provide daily lunch tiffin to office workers and students. Start with 10-15 customers and grow referrals through quality food.</div>
        <div class="opp-income">💰 ₹10,000–25,000/month</div>
        <div class="opp-tip">💡 First step: Offer free samples to 3 nearby offices</div>
        <button class="outline-sm-btn" onclick="askAI('How to start a tiffin service from home in Telangana?')">Ask AI →</button>
      </div>
      <div class="opp-card">
        <div class="opp-title">🎨 Handicraft & Embroidery Sales</div>
        <div class="opp-meta">Create and sell handmade crafts, embroidery, and decorative items online and at local markets. Meesho and WhatsApp Business work well.</div>
        <div class="opp-income">💰 ₹5,000–18,000/month</div>
        <div class="opp-tip">💡 First step: Create a WhatsApp Business profile, post 5 photos today</div>
        <div style="font-size:12px;color:#6A1B9A;margin-bottom:8px;">🏛️ Scheme: PM Vishwakarma Yojana (toolkit + loan)</div>
        <button class="outline-sm-btn" onclick="askAI('How to sell handicrafts online through Meesho or WhatsApp?')">Ask AI →</button>
      </div>
      <div class="opp-card">
        <div class="opp-title">📚 Home Tuition Classes</div>
        <div class="opp-meta">Teach students from class 1-10 in your home or their homes. Telugu medium and English medium both have good demand.</div>
        <div class="opp-income">💰 ₹6,000–15,000/month</div>
        <div class="opp-tip">💡 First step: Put a notice board at your gate offering tuitions</div>
        <button class="outline-sm-btn" onclick="askAI('How to start home tuition classes and find students?')">Ask AI →</button>
      </div>`;
    showToast('Showing example opportunities. Add your API key for AI-powered results!');
  }
}

// ===== CHAT FUNCTIONS =====
async function sendMsg() {
  const inp = document.getElementById('chatInput');
  const msg = inp.value.trim();
  if (!msg) return;
  inp.value = '';
  appendMsg('user', msg);
  chatHistory.push({ role: 'user', content: msg });
  await getAIResponse();
}

function sendQuick(msg) {
  showPage('assistant', document.querySelectorAll('.nav-btn')[1]);
  setTimeout(async () => {
    appendMsg('user', msg);
    chatHistory.push({ role: 'user', content: msg });
    await getAIResponse();
  }, 150);
}

function askAI(msg) {
  showPage('assistant', document.querySelectorAll('.nav-btn')[1]);
  setTimeout(async () => {
    appendMsg('user', msg);
    chatHistory.push({ role: 'user', content: msg });
    await getAIResponse();
  }, 150);
}

function appendMsg(role, text) {
  const msgs = document.getElementById('chatMsgs');
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  const formattedText = text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/•/g, '•');
  div.innerHTML = `
    <div class="msg-avatar" style="overflow:hidden;">${role === 'user' ? '👩' : '<img src="/static/logo.png" style="width:100%;height:100%;object-fit:cover;"/>'}</div>
    <div class="msg-bubble">${formattedText}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTypingIndicator() {
  const msgs = document.getElementById('chatMsgs');
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <div class="msg-avatar" style="overflow:hidden;"><img src="/static/logo.png" style="width:100%;height:100%;object-fit:cover;"/></div>
    <div class="typing"><span></span><span></span><span></span></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

async function getAIResponse() {
  showTypingIndicator();
  document.getElementById('aiStatus').textContent = 'Thinking...';

  const systemPrompt = `You are Shakti, a warm, supportive, and knowledgeable AI assistant on ShaktiPath — a Women Empowerment Platform for rural and semi-urban women in India, especially Telangana.

Your role is to help women with:
1. **Government Welfare Schemes**: Mudra Yojana, PM Jan Dhan, PMKVY skill training, PM Vishwakarma Yojana, PMMVY maternity benefit, Beti Bachao Beti Padhao, Sukanya Samriddhi, Stree Shakti loan, NRLM/DAY-NRLM, National Scheme for Women
2. **Income Opportunities**: Tailoring, cooking/tiffin service, handicrafts, beauty parlour, tuition, agriculture, dairy, SHG activities, online selling
3. **Skill Development**: PMKVY courses, digital literacy, financial literacy
4. **Motivation & Confidence Building**: Inspirational stories, positive affirmations, overcoming barriers
5. **Digital Skills**: UPI, online banking, Meesho, WhatsApp Business, online selling platforms

Guidelines:
- Be warm, encouraging, and use simple language that is easy to understand
- Occasionally use Hindi/Telugu words naturally (like "Bahut Accha!", "Nallamga!")
- Give practical, actionable advice with specific steps
- Mention relevant government schemes when applicable
- Keep responses concise (3-5 sentences or a short numbered list)
- Use emojis sparingly but warmly
- Always be supportive and never discouraging
- For scheme queries, always mention official website or where to apply`;

  try {
    const response = await fetch(CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system: systemPrompt,
        messages: chatHistory.slice(-10) // Keep last 10 messages for context
      })
    });

    const data = await response.json();
    const reply = data.content.map(i => i.text || '').join('');

    document.getElementById('typing-indicator')?.remove();
    appendMsg('bot', reply);
    chatHistory.push({ role: 'assistant', content: reply });
    document.getElementById('aiStatus').textContent = 'Sakhi AI';

    if (autoSpeak && window.speechSynthesis) {
      speakText(reply.replace(/<[^>]*>/g, ''));
    }
  } catch (e) {
    console.error('Chat error:', e);
    document.getElementById('typing-indicator')?.remove();
    document.getElementById('aiStatus').textContent = 'Sakhi AI';

    const fallbacks = [
      "Namaste! 🌸 I'm here to help you. For government schemes, visit your nearest Anganwadi centre or CSC (Common Service Centre). They can help you with applications for Mudra Yojana, PMKVY, and other schemes. Is there something specific you'd like to know?",
      "To find work from home, start by joining a local Self Help Group (SHG) in your village. They offer training, loans, and connect you with markets for your products. Ask at your Gram Panchayat office for nearby SHGs! 💪",
      "You are capable of achieving great things! 🌸 Many women in your situation have built successful businesses through hard work and the right support. What skill would you like to develop first?",
      "For digital payments, you can start with a simple UPI app like PhonePe or Google Pay — they work even on basic smartphones. Visit your nearest bank to link your Jan Dhan account!"
    ];
    const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    appendMsg('bot', '⚠️ Connection issue. Please check your API key in app.js or internet connection.\n\n' + fallback);
  }
}

// ===== VOICE FUNCTIONS =====
function toggleVoice() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    showToast('Voice input not supported. Please use Chrome browser! 🎤');
    return;
  }

  if (isListening) {
    recognition && recognition.stop();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'hi-IN'; // Hindi — change to 'te-IN' for Telugu
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening = true;
    document.getElementById('voiceBtn').classList.add('listening');
    showToast('🎤 Listening... Please speak now (Hindi/English)');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('chatInput').value = transcript;
    showToast(`Heard: "${transcript}"`);
  };

  recognition.onend = () => {
    isListening = false;
    document.getElementById('voiceBtn').classList.remove('listening');
  };

  recognition.onerror = (event) => {
    isListening = false;
    document.getElementById('voiceBtn').classList.remove('listening');
    showToast('Voice error: ' + event.error + '. Try again!');
  };

  recognition.start();
}

function toggleAutoSpeak() {
  autoSpeak = !autoSpeak;
  const btn = document.getElementById('speakBtn');
  btn.textContent = autoSpeak ? '🔊' : '🔇';
  showToast(autoSpeak ? '🔊 Voice responses ON' : '🔇 Voice responses OFF');
  
  if (!autoSpeak && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    window.ttsUtterances = []; // Clear queued sentences
  }
}

function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  // Remove emojis and formatting
  const cleanText = text.replace(/[🌸🤖📋💼✨👤💰✅📄📝🌐💡*#_]/g, '');
  
  // Split text into sentences to prevent browser TTS limit cutoffs
  const chunks = cleanText.match(/[^.!?\n]+[.!?\n]+/g) || [cleanText];
  window.ttsUtterances = []; // Prevent Garbage Collection of utterances
  
  chunks.forEach(chunk => {
    if (chunk.trim().length === 0) return;
    const utterance = new SpeechSynthesisUtterance(chunk.trim());
    utterance.lang = 'hi-IN';
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    window.ttsUtterances.push(utterance);
    window.speechSynthesis.speak(utterance);
  });
}

// ===== AFFIRMATIONS =====
const affirmations = [
  '"I am capable, I am strong, and I deserve every opportunity that comes my way."',
  '"My skills are valuable. My voice matters. My dreams are absolutely worth pursuing."',
  '"Every small step I take today builds the life I deserve tomorrow."',
  '"I am not just a woman — I am a force of positive change for my family and community."',
  '"Financial independence is my right. I will work towards it with confidence and courage."',
  '"I learn something new every day. I grow stronger with every challenge I face."',
  '"I am worthy of respect, love, and every success that comes with hard work."',
  '"My children see a strong, independent woman in me. That is my greatest achievement."',
  '"I will not let fear stop me. I take one step at a time, and that is enough."',
  '"बेटी हूँ, बहन हूँ, माँ हूँ — और मैं बहुत सशक्त हूँ! (I am a daughter, sister, mother — and I am very powerful!)"'
];

let affirmationIndex = 0;

function newAffirmation() {
  affirmationIndex = (affirmationIndex + 1) % affirmations.length;
  const el = document.getElementById('affirmation');
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = affirmations[affirmationIndex];
    el.style.opacity = '1';
  }, 300);
  el.style.transition = 'opacity 0.3s';
}

// ===== PROFILE FUNCTIONS =====
async function saveProfile() {
  const name = document.getElementById('pName').value.trim();
  const city = document.getElementById('pCity').value.trim();
  const mobile = document.getElementById('pMobile').value.trim();
  const age = document.getElementById('pAge').value.trim();

  if (!name) { showToast('Please enter your name!'); return; }
  if (!mobile || !/^\d{10}$/.test(mobile)) { showToast('Please enter a valid 10-digit mobile number to save profile!'); return; }

  document.getElementById('profileName').textContent = name;
  document.getElementById('profileLocation').textContent = city ? '📍 ' + city : '📍 India';

  // Keep in localStorage to remember who is logged in on refresh
  localStorage.setItem('shaktipath_mobile', mobile);

  try {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, city, mobile, age })
    });
    if (res.ok) {
      showToast('Profile saved successfully to Database! ✓');
    } else {
      showToast('Failed to save to Database ❌');
    }
  } catch (e) {
    showToast('Failed to connect to backend Database ❌');
  }
}

async function loadProfile() {
  try {
    const mobile = localStorage.getItem('shaktipath_mobile');
    if (mobile) {
      const res = await fetch('/api/profile?mobile=' + mobile);
      if (res.ok) {
        const p = await res.json();
        if (p.name) {
          document.getElementById('pName').value = p.name;
          document.getElementById('profileName').textContent = p.name;
        }
        if (p.city) {
          document.getElementById('pCity').value = p.city;
          document.getElementById('profileLocation').textContent = '📍 ' + p.city;
        }
        if (p.mobile) document.getElementById('pMobile').value = p.mobile;
        if (p.age) document.getElementById('pAge').value = p.age;
      } else {
        console.log('Profile not found in DB');
      }
    }
  } catch (e) {
    console.log('Failed to fetch profile from DB', e);
  }
}

// ===== VIDEO FUNCTION =====
function openVideo(url) {
  window.open(url, '_blank');
  showToast('Opening YouTube in new tab...');
}

// ===== LANG TOGGLE =====
function toggleLang() {
  showToast('Hindi/Telugu support coming soon! Currently in English. 🌐');
}

// ===== UTILITIES =====
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJs(str) {
  if (!str) return '';
  return String(str).replace(/'/g, '').replace(/"/g, '').replace(/\n/g, ' ');
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadSchemesData();
  loadDirectory();
  loadInbox();

  console.log('🌸 ShaktiPath Women Empowerment Platform loaded successfully!');
  console.log('🛠️ Powered by Flask Backend and DB Integration');
  
  // Dynamic Premium Background Slideshow
  const bgSlideshow = document.getElementById('bgSlideshow');
  if (bgSlideshow) {
    const bgs = [
      'https://images.unsplash.com/photo-1596489366650-70f907b2b733?auto=format&fit=crop&q=80', // Indian women working/farming
      'https://images.unsplash.com/photo-1627857189151-5121b6d92ded?auto=format&fit=crop&q=80', // Rural India women
      'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80', // Indian people/culture
      'https://images.unsplash.com/photo-1623868846960-b9cc570da275?auto=format&fit=crop&q=80'  // Women entrepreneur/smile
    ];
    let currentBg = 0;
    
    function changeBg() {
      bgSlideshow.style.backgroundImage = `url('${bgs[currentBg]}')`;
      currentBg = (currentBg + 1) % bgs.length;
    }
    changeBg(); // Initial
    setInterval(changeBg, 15000); // Rotate every 15s
  }
});

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    document.getElementById('themeToggleBtn').innerText = '🌙';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    document.getElementById('themeToggleBtn').innerText = '☀️';
  }
}

(function initTheme() {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    window.addEventListener('DOMContentLoaded', () => {
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.innerText = '☀️';
    });
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.innerText = '🌙';
    });
  }
})();

// ===== DIRECTORY & INBOX LOGIC =====

function addCustomSkill() {
  const inp = document.getElementById('customSkill');
  const val = inp.value.trim();
  if(!val) return;
  const chip = document.createElement('div');
  chip.className = 'skill-chip rt-chip selected';
  chip.dataset.skill = val;
  chip.innerText = val;
  chip.onclick = function() { toggleSkill(this); };
  document.getElementById('registerSkillChips').appendChild(chip);
  inp.value = '';
}

async function submitRegistration() {
  const skills = [...document.getElementById('registerSkillChips').querySelectorAll('.selected')].map(c => c.dataset.skill || c.innerText);
  const minInc = document.getElementById('regMinIncome').value;
  const maxInc = document.getElementById('regMaxIncome').value;
  const about = document.getElementById('regAbout').value;
  const state = document.getElementById('regState').value;
  const city = document.getElementById('regCity').value;
  const avail = [...document.getElementById('registerAvailChips').querySelectorAll('.selected')].map(c => c.innerText)[0] || 'Flexible';
  
  if(!skills.length || !minInc || !maxInc || !state || !city) {
    showToast('Please fill all required (*) fields!');
    return;
  }
  
  // Use explicit name input, OR Firebase Profile Name, otherwise generic 
  const name = document.getElementById('regName').value || window.currentProfileName || "Registered Worker";
  
  const payload = {
    name: name || "Registered Worker",
    skills: skills,
    income: `₹${minInc}-₹${maxInc}/mo`,
    desc: about,
    state: state,
    city: city,
    avail: avail,
    exp: "New",
    contact: "Contact via Inbox"
  };
  
  try {
    const res = await fetch('/api/workers', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    if(res.ok) {
      showToast('Registration successful! Your profile is public.🎉');
      showPage('directory', document.querySelectorAll('.nav-btn')[3]);
      loadDirectory();
    } else {
      showToast('Error registering skills.');
    }
  } catch(e) {
    showToast('Network error.');
  }
}

async function loadDirectory() {
  const state = document.getElementById('dirState').value;
  const skill = document.getElementById('dirSkill').value;
  const avail = document.getElementById('dirAvail').value;
  const city = document.getElementById('dirCity').value;
  
  document.getElementById('dirCountText').innerText = 'Loading...';
  document.getElementById('dirCountBadge').innerText = '...';
  
  let url = `/api/workers?state=${encodeURIComponent(state)}&skill=${encodeURIComponent(skill)}&avail=${encodeURIComponent(avail)}&city=${encodeURIComponent(city)}`;
  
  try {
    const res = await fetch(url);
    const workers = await res.json();
    const grid = document.getElementById('dirGrid');
    grid.innerHTML = '';
    
    document.getElementById('dirCountText').innerText = `Showing ${workers.length} profiles`;
    document.getElementById('dirCountBadge').innerText = `${workers.length} WORKERS`;
    
    workers.forEach(w => {
      const card = document.createElement('div');
      card.className = 'worker-card';
      
      const tagsH = (w.skills || []).map(s => `<span class="wt-tag">${escapeHtml(s)}</span>`).join('');
      
      card.innerHTML = `
        <div class="worker-header">
          <div class="worker-av">${escapeHtml(w.avatar || 'W')}</div>
          <div>
            <div class="worker-name">${escapeHtml(w.name)} <span style="font-size:12px;color:#f39c12">⭐ ${w.rating||'New'}</span></div>
            <div class="worker-loc">📍 ${escapeHtml(w.city)}, ${escapeHtml(w.state)}</div>
            <div class="worker-avail">${escapeHtml(w.avail)}</div>
          </div>
        </div>
        <div class="worker-tags">${tagsH}</div>
        <div class="worker-desc">${escapeHtml(w.desc || '')}</div>
        <div class="worker-stats">
          <span style="color:#d35400;">${escapeHtml(w.income)}</span>
          <span style="color:#7f8c8d;">${escapeHtml(w.exp)}</span>
        </div>
        <div class="worker-footer">
          <div class="worker-contact">📧 ${escapeHtml(w.contact || 'No email')}</div>
          <button class="worker-msg-btn" onclick="openMessage('${escapeJs(w.id)}', '${escapeJs(w.name)}')">💬 Message</button>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch(e) {
    document.getElementById('dirCountText').innerText = 'Error loading directory';
  }
}

function clearDirFilters() {
  document.getElementById('dirState').value = 'all';
  document.getElementById('dirSkill').value = 'all';
  document.getElementById('dirAvail').value = 'all';
  document.getElementById('dirCity').value = '';
  loadDirectory();
}

function openMessage(workerId, workerName) {
  showPage('inbox', document.querySelectorAll('.nav-btn')[3]); 
  loadInbox(workerId, workerName);
}

let activeThreadId = null;
let isInboxSelecting = false;

async function loadInbox(threadToSelectId = null, threadToSelectName = null) {
  try {
    const res = await fetch('/api/messages');
    const data = await res.json();
    let threads = data.threads || [];
    
    // Inject optimistic dummy thread explicitly if DB returns empty for this user interaction
    if (threadToSelectId && !threads.find(t => t.id === threadToSelectId)) {
       threads.unshift({
           id: threadToSelectId,
           name: threadToSelectName || "Worker",
           avatar: (threadToSelectName || "W")[0].toUpperCase(),
           messages: []
       });
    }

    const list = document.getElementById('inboxList');
    list.innerHTML = '';
    
    if(threads.length === 0) {
      list.innerHTML = '<div style="padding:20px; text-align:center; color:var(--muted); font-size:14px;">No conversations.<br><br><span style="font-size:11px;opacity:0.6;">Click "Message" on any Worker Profile in the Skill Directory to begin.</span></div>';
      return;
    }
    
    threads.forEach(t => {
      const msgs = t.messages || [];
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].text : 'Click to send first message';
      const lastTime = msgs.length > 0 ? msgs[msgs.length - 1].time : '';
      
      const div = document.createElement('div');
      div.className = 'inbox-thread' + (activeThreadId === t.id ? ' active' : '');
      div.onclick = () => selectThread(t);
      div.innerHTML = `
        <div class="inbox-thread-av">${escapeHtml(t.avatar || 'W')}</div>
        <div class="inbox-thread-info">
          <div class="inbox-thread-name">${escapeHtml(t.name)}</div>
          <div class="inbox-thread-msg">${escapeHtml(lastMsg)}</div>
        </div>
        <span class="inbox-thread-time">${escapeHtml(lastTime)}</span>
      `;
      list.appendChild(div);
      
      if(threadToSelectId && t.id === threadToSelectId) {
        if(!isInboxSelecting) { isInboxSelecting = true; selectThread(t); isInboxSelecting = false; }
      }
    });
    
    if(!threadToSelectId && !activeThreadId && threads.length > 0) {
       if(!isInboxSelecting) { isInboxSelecting = true; selectThread(threads[0]); isInboxSelecting = false; }
    }
  } catch(e) {
    console.error('Error loading inbox', e);
  }
}

let currentChatListener = null;

function selectThread(t) {
  activeThreadId = t.id;
  activeThreadObj = t;
  document.getElementById('chatAv').innerText = t.avatar || 'W';
  document.getElementById('chatName').innerText = t.name;
  document.getElementById('chatStatus').innerText = 'Online';
  
  const inp = document.getElementById('inboxInput');
  const btn = document.getElementById('inboxSendBtn');
  inp.disabled = false;
  btn.disabled = false;
  btn.style.opacity = '1';
  
  const msgBox = document.getElementById('inboxMessages');
  msgBox.innerHTML = '<div style="text-align:center; padding:20px; color:var(--muted); font-size:14px;">Connecting to secure chat...</div>';
  
  document.querySelectorAll('.inbox-thread').forEach(el => el.classList.remove('active'));
  
  if(!window.db) {
      msgBox.innerHTML = '<div style="color:red; padding:20px; text-align:center;">[System Error] Firebase Database not initialized properly.</div>';
      return;
  }
  
  if(currentChatListener) currentChatListener();
  
  try {
      const q = window.query(window.collection(window.db, "chats", t.id, "messages"), window.orderBy("timestamp"));
      currentChatListener = window.onSnapshot(q, (snapshot) => {
          msgBox.innerHTML = '';
          if(snapshot.empty) {
              msgBox.innerHTML = '<div style="text-align:center; color:#95a5a6; margin-top:40px; font-size:14px;">Say hi! Start the secure conversation.</div>';
          }
          snapshot.forEach((doc) => {
              const m = doc.data();
              const isUser = window.currentProfileEmail ? (m.senderEmail === window.currentProfileEmail) : (m.sender === 'user');
              
              const cls = isUser ? 'sent' : 'received';
              const timeStr = m.timestamp ? new Date(m.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now';
              
              const div = document.createElement('div');
              div.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
              div.style.background = isUser ? 'var(--primary)' : 'var(--card-bg)';
              div.style.color = isUser ? '#fff' : 'var(--text)';
              div.style.padding = '12px 18px';
              div.style.border = isUser ? 'none' : '1px solid var(--border-color)';
              div.style.borderRadius = '20px';
              div.style.borderBottomRightRadius = isUser ? '4px' : '20px';
              div.style.borderBottomLeftRadius = !isUser ? '4px' : '20px';
              div.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
              div.style.maxWidth = '80%';
              div.style.marginBottom = '12px';
              
              div.innerHTML = escapeHtml(m.text) + `<div style="font-size:10px; opacity:0.7; margin-top:6px; text-align:right;">${timeStr}</div>`;
              msgBox.appendChild(div);
          });
          msgBox.scrollTop = msgBox.scrollHeight;
      }, (err) => {
          msgBox.innerHTML = `
            <div style="background:var(--card-bg); border:2px solid #e91e63; padding:20px; border-radius:12px; margin:20px;">
              <h4 style="color:#e91e63; margin-bottom:12px;">🛑 Action Required: Enable Firestore</h4>
              <p style="font-size:14px; margin:8px 0; color:var(--text);">Firebase is blocking the Chatroom because your Database is not created.</p>
              <ol style="font-size:13px; margin-left:15px; color:var(--muted); line-height:1.7;">
               <li>Go to <b>console.firebase.google.com</b></li>
               <li>Open <b>woman-empowerment-4825a</b></li>
               <li>Click <b>Build -> Firestore Database</b></li>
               <li>Click <b>Create database</b></li>
               <li>Start in <b>Test mode</b></li>
               <li>Select any location and hit <b>Create</b>!</li>
              </ol>
            </div>`;
      });
  } catch(e) {
      console.error(e);
  }
}

async function sendInboxMessage() {
  if(!activeThreadId || !window.db) return;
  const inp = document.getElementById('inboxInput');
  const txt = inp.value.trim();
  if(!txt) return;
  inp.value = '';
  
  try {
      await window.addDoc(window.collection(window.db, "chats", activeThreadId, "messages"), {
          text: txt,
          sender: 'user',
          senderEmail: window.currentProfileEmail || 'Anonymous',
          timestamp: window.serverTimestamp()
      });
  } catch(err) {
      alert("Failed to send: " + err.message);
  }
}

