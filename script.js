// Dark Mode Toggle
function initDarkMode() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  
  if (!themeToggle) return;
  
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  body.classList.toggle('dark', currentTheme === 'dark');
  themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  
  themeToggle.addEventListener('click', function() {
    body.classList.toggle('dark');
    const isDark = body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

// Mobile Menu Toggle
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  
  if (!mobileMenuBtn || !navMenu) return;
  
  mobileMenuBtn.addEventListener('click', function() {
    const isOpen = mobileMenuBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
    mobileMenuBtn.setAttribute('aria-expanded', isOpen.toString());
    mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  });
  
  // Close menu when a nav item is clicked
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      mobileMenuBtn.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.closest('header')) {
      mobileMenuBtn.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });
}

// Backend removed: localStorage-only data handling is used for messages and projects.

function getStoredMessages() {
  try {
    return JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
  } catch (e) {
    return [];
  }
}

function saveStoredMessages(messages) {
  localStorage.setItem('portfolio_messages', JSON.stringify(messages));
}

function addMessageToStorage(message) {
  const messages = getStoredMessages();
  messages.unshift(message);
  saveStoredMessages(messages);
  return messages;
}

function deleteMessage(id) {
  const messages = getStoredMessages().filter(msg => msg.id !== id);
  saveStoredMessages(messages);
  return messages;
}

function updateMessage(id, updates) {
  const messages = getStoredMessages();
  const updated = messages.map(msg => msg.id === id ? { ...msg, ...updates } : msg);
  saveStoredMessages(updated);
  return updated;
}

function getStoredProjects() {
  try {
    return JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
  } catch (e) {
    return [];
  }
}

function saveStoredProjects(projects) {
  localStorage.setItem('portfolio_projects', JSON.stringify(projects));
}

function getChatApiKey() {
  return window.OPENAI_API_KEY || '';
}

async function fetchChatResponse(message) {
  const apiKey = getChatApiKey();
  if (!apiKey) return null;

  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful portfolio assistant for Suman Singh. Keep answers friendly, concise, and guide visitors to the portfolio, contact, or resume section when relevant.' },
      { role: 'user', content: message }
    ],
    temperature: 0.75,
    max_tokens: 250,
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('Chat API error: ' + errorText);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

function renderPortfolioCards() {
  const container = document.getElementById('portfolioGrid');
  if (!container) return;

  const projects = getStoredProjects();
  if (!projects.length) {
    return;
  }

  container.innerHTML = projects.map(project => `
    <article class="portfolio-card">
      <div class="portfolio-img">
        <div class="placeholder-img" style="background: ${project.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};">${project.icon || '💻'}</div>
      </div>
      <div class="portfolio-info">
        <div class="project-meta">
          <span class="project-type">${project.type || 'Project'}</span>
          <span class="project-status">${project.status || 'Live'}</span>
        </div>
        <h3>${project.title || 'Untitled Project'}</h3>
        <p>${project.description || ''}</p>
        <div class="portfolio-tags">
          ${(project.tags || []).map(tag => `<span>${tag}</span>`).join('')}
        </div>
        <p class="project-highlight">${project.highlight || ''}</p>
        <div class="project-detail-row">
          <div class="project-detail-item"><strong>Role:</strong> ${project.role || 'Contributor'}</div>
          <div class="project-detail-item"><strong>Result:</strong> ${project.result || 'Delivered outcome'}</div>
        </div>
        <div class="project-links">
          <a href="${project.liveUrl || '#portfolio'}" target="_blank" class="link-btn">Live Demo</a>
          <a href="${project.sourceUrl || 'https://github.com/5uman'}" target="_blank" rel="noopener noreferrer" class="link-btn secondary">Source Code</a>
        </div>
      </div>
    </article>
  `).join('');
}


// Initialize on page load
// initMobileMenu is called from `init()` to centralize startup

// Add chatbot modal to page
function addChatbot() {
  if (document.getElementById('chatbot-modal')) return;
  
  const chatbot = document.createElement('div');
  chatbot.id = 'chatbot-modal';
  chatbot.innerHTML = `
    <div class="chatbot-container">
      <div class="chatbot-header">
        <h3>Chat with Suman</h3>
        <button class="close-chat">&times;</button>
      </div>
      <div class="chatbot-messages" id="chatbot-messages">
        <div class="message bot-message">Hi! I'm Suman. How can I help you?</div>
      </div>
      <div class="chatbot-input-area">
        <input type="text" id="user-input" placeholder="Type your message..." />
        <button id="send-btn">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(chatbot);
  
  // Close button
  document.querySelector('.close-chat').addEventListener('click', function() {
    const chatbotModal = document.getElementById('chatbot-modal');
    if (chatbotModal) {
      chatbotModal.classList.remove('show');
      setTimeout(() => {
        chatbotModal.style.display = 'none';
      }, 220);
    }
  });
  
  // Restore history if present
  const messagesDiv = document.getElementById('chatbot-messages');
  const history = localStorage.getItem('chat_history');
  if (history) {
    try {
      const items = JSON.parse(history);
      messagesDiv.innerHTML = '';
      items.forEach(it => {
        const el = document.createElement('div');
        el.className = `message ${it.sender}-message`;
        el.textContent = it.text;
        messagesDiv.appendChild(el);
      });
    } catch (e) {
      console.error('chat history parse error', e);
    }
  }

  // Send message (with typing simulation and chat API fallback)
  async function handleSend() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if (!msg) return;
    addMessage(msg, 'user');
    input.value = '';
    saveHistory();
    showTyping();

    try {
      const apiResponse = await fetchChatResponse(msg);
      if (apiResponse) {
        addMessage(apiResponse, 'bot');
        saveHistory();
        return;
      }
    } catch (error) {
      console.error('Chat API failed', error);
    }

    setTimeout(() => {
      const res = getBotResponse(msg);
      addMessage(res.text, 'bot');
      if (res.quick && res.quick.length) addQuickReplies(res.quick);
      saveHistory();
    }, 700 + Math.random() * 800);
  }

  document.getElementById('send-btn').addEventListener('click', handleSend);
  document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') handleSend();
  });
}

function addMessage(text, sender) {
  const messagesDiv = document.getElementById('chatbot-messages');
  const msgEl = document.createElement('div');
  msgEl.className = `message ${sender}-message`;
  msgEl.textContent = text;
  messagesDiv.appendChild(msgEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  saveHistory();
}

function saveHistory() {
  try {
    const nodes = Array.from(document.querySelectorAll('#chatbot-messages .message'));
    const items = nodes.map(n => ({ sender: n.classList.contains('user-message') ? 'user' : 'bot', text: n.textContent }));
    localStorage.setItem('chat_history', JSON.stringify(items));
  } catch (e) { console.error(e); }
}

function showTyping() {
  const messagesDiv = document.getElementById('chatbot-messages');
  const tip = document.createElement('div');
  tip.className = 'message bot-message typing';
  tip.textContent = 'Suman is typing...';
  messagesDiv.appendChild(tip);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  setTimeout(() => { tip.remove(); }, 800 + Math.random() * 700);
}

function addQuickReplies(list) {
  // remove existing quick replies
  const existing = document.querySelectorAll('.quick-replies');
  existing.forEach(e => e.remove());
  const messagesDiv = document.getElementById('chatbot-messages');
  const wrap = document.createElement('div');
  wrap.className = 'quick-replies';
  list.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply';
    btn.textContent = q;
    btn.onclick = function() {
      document.getElementById('user-input').value = q;
      document.getElementById('send-btn').click();
    };
    wrap.appendChild(btn);
  });
  messagesDiv.appendChild(wrap);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function getBotResponse(msg) {
  const t = msg.toLowerCase();
  if (/hi|hello|hey\b/.test(t)) return { text: "Hi! I\'m Suman — I\'m a CS student. Ask me about projects, skills, or how to contact me.", quick: ['Projects', 'Skills', 'Contact'] };
  if (/project|portfolio/.test(t)) return { text: 'You can view my projects in the Portfolio section. Would you like me to scroll there?', quick: ['Yes, show projects', 'No thanks'] };
  if (/skill|skillset|tech|tech stack|languages/.test(t)) return { text: 'I work with HTML, CSS, JavaScript and have experience in networking and basic cybersecurity.', quick: ['Projects', 'Contact'] };
  if (/contact|email|phone/.test(t)) return { text: 'You can email me at sumanprasadsingh90@gmail.com or call +977 9812322394.', quick: ['Email', 'Phone'] };
  if (/hire/.test(t)) return { text: 'You can contact me via email or phone 📩', quick: ['Email', 'Call'] };
  if (/resume/i.test(t)) return { text: 'You can download my resume below 👇', quick: ['Download Resume'] };
  if (/email/i.test(t)) return { text: 'Opening your mail client...', quick: [] };
  if (/phone|call/i.test(t)) return { text: 'Tap the phone number in the Contact section to call me.', quick: [] };
  if (/thank/i.test(t)) return { text: 'You\'re welcome! Anything else?', quick: ['Projects', 'Contact'] };
  return { text: 'Sorry, I\'m a simple bot. Try asking about Projects, Skills, or Contact.', quick: ['Projects', 'Skills', 'Contact'] };
}

// Initialize when document is ready
async function init() {
  try {
    console.log('init() starting');
  } catch (e) {
    console.error('init start error', e);
  }
  // Initialize features
  initDarkMode();
  initMobileMenu();
  // Let's Talk button - open chatbot
  const talkBtn = document.getElementById('talkBtn');
  if (talkBtn) {
    talkBtn.onclick = function() {
      addChatbot();
      const chatbotModal = document.getElementById('chatbot-modal');
      if (chatbotModal) {
        chatbotModal.style.display = 'flex';
        chatbotModal.classList.add('show');
      }
    };
  }

  // Nav links
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  navLinks.forEach(link => {
    link.onclick = function(e) {
      e.preventDefault();
      const id = this.getAttribute('href').substring(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    };
  });

  // Projects button
  const projBtn = document.querySelector('.cta-secondary');
  if (projBtn) {
    projBtn.onclick = function() {
      document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
    };
  }

  // Hire me button
  const hireBtn = document.querySelector('.cta-main');
  if (hireBtn) {
    hireBtn.onclick = function() {
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    };
  }

  // Contact form submission via Formspree
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const subject = document.getElementById('contact-subject').value.trim();
      const message = document.getElementById('contact-message').value.trim();
      if (!name || !email || !subject || !message) {
        return;
      }

      const formData = new FormData(form);
      formData.set('_replyto', email);
      formData.set('_subject', `New message from ${name}: ${subject}`);

      const wrapper = form.parentElement;
      const existingMessage = wrapper.querySelector('.success-message, .error-message');
      if (existingMessage) existingMessage.remove();

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Unable to send message.');
        }

        form.reset();
        const success = document.createElement('div');
        success.className = 'success-message show';
        success.textContent = 'Thank you! Your message was sent successfully.';
        wrapper.insertBefore(success, form);
        setTimeout(() => success.remove(), 5000);
      } catch (error) {
        const errMsg = document.createElement('div');
        errMsg.className = 'error-message show';
        errMsg.textContent = 'Oops! Something went wrong. Please try again or email directly.';
        wrapper.insertBefore(errMsg, form);
        setTimeout(() => errMsg.remove(), 7000);
      }
    });
  }

  renderPortfolioCards();
  initScrollAnimation();
}

function initScrollAnimation() {
  const items = document.querySelectorAll('.fade-in');
  const animate = () => {
    items.forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight - 50) {
        el.classList.add('show');
      }
    });
  };
  window.addEventListener('scroll', animate);
  animate();
}

// Run when ready
window.onload = () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.style.opacity = '1';
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 320);
    }, 240);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    try { console.log('DOMContentLoaded fired'); init(); } catch (err) { console.error(err); }
  });
} else {
  try { console.log('Document already ready — running init'); init(); } catch (err) { console.error(err); }
}

// quick indicator script file loaded
console.log('script.js loaded');
