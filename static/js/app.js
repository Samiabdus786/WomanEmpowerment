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

function renderSchemes(schemes) {
  const list = document.getElementById('schemesList');
  if(!list) return;

  if (schemes.length === 0) {
    list.innerHTML = '<div style="padding:20px;text-align:center;">No schemes found matching criteria.</div>';
    return;
  }

  list.innerHTML = schemes.map(s => `
    <div class="scheme-card" data-cat="${escapeHtml(s.category)}" data-state="${escapeHtml(s.state)}">
      <div class="scheme-header" onclick="toggleScheme(this)">
        <div>
          <div class="scheme-name">${escapeHtml(s.name)}</div>
          <span class="scheme-badge ${escapeHtml(s.category)}">${escapeHtml(s.category).toUpperCase()}</span>
        </div>
        <span class="arrow">▼</span>
      </div>
      <div class="scheme-body">
        <div class="info-row"><span class="info-label">${s.icon || '📌'} Description:</span><span class="info-val">${escapeHtml(s.description)}</span></div>
        <div class="info-row"><span class="info-label">📍 State:</span><span class="info-val">${escapeHtml(s.state)}</span></div>
        <div class="info-row"><span class="info-label">🌐 Website:</span><span class="info-val"><a href="${escapeHtml(s.link)}" target="_blank">${escapeHtml(s.link)}</a></span></div>
        <button class="apply-btn" onclick="askAI('Tell me more about ${escapeJs(s.name)} and how to apply in ${escapeJs(s.state)}.')">Ask AI for Help 🤖</button>
      </div>
    </div>
  `).join('');
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
    <div class="msg-avatar">${role === 'user' ? '👩' : '🌸'}</div>
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
    <div class="msg-avatar">🌸</div>
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
    document.getElementById('aiStatus').textContent = 'Online — Powered by Claude AI';

    if (autoSpeak && window.speechSynthesis) {
      speakText(reply.replace(/<[^>]*>/g, ''));
    }
  } catch (e) {
    console.error('Chat error:', e);
    document.getElementById('typing-indicator')?.remove();
    document.getElementById('aiStatus').textContent = 'Online — Powered by Claude AI';

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
