// Mobile Menu Toggle
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  
  if (!mobileMenuBtn || !navMenu) return;
  
  mobileMenuBtn.addEventListener('click', function() {
    mobileMenuBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
});

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
    document.getElementById('chatbot-modal').style.display = 'none';
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

  // Send message (with typing simulation and smart replies)
  function handleSend() {
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if (!msg) return;
    addMessage(msg, 'user');
    input.value = '';
    saveHistory();
    showTyping();
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
  if (/email/i.test(t)) return { text: 'Opening your mail client...', quick: [] };
  if (/phone|call/i.test(t)) return { text: 'Tap the phone number in the Contact section to call me.', quick: [] };
  if (/thank/i.test(t)) return { text: 'You\'re welcome! Anything else?', quick: ['Projects', 'Contact'] };
  return { text: 'Sorry, I\'m a simple bot. Try asking about Projects, Skills, or Contact.', quick: ['Projects', 'Skills', 'Contact'] };
}

// Initialize when document is ready
function init() {
  try {
    console.log('init() starting');
  } catch (e) {
    console.error('init start error', e);
  }
  // Let's Talk button - open chatbot
  const talkBtn = document.querySelector('.header-btn');
  if (talkBtn) {
    talkBtn.onclick = function() {
      addChatbot();
      document.getElementById('chatbot-modal').style.display = 'flex';
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
  const projBtn = document.querySelector('.cta-1');
  if (projBtn) {
    projBtn.onclick = function() {
      document.getElementById('portfolio').scrollIntoView({ behavior: 'smooth' });
    };
  }

  // Hire me button
  const hireBtn = document.querySelector('.cta-2');
  if (hireBtn) {
    hireBtn.onclick = function() {
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    };
  }

  // Contact form
  const form = document.getElementById('contactForm');
  if (form) {
    form.onsubmit = function(e) {
      e.preventDefault();
      const inputs = this.querySelectorAll('input[type="text"]');
      const email = this.querySelector('input[type="email"]');
      const msg = this.querySelector('textarea');
      
      if (inputs[0].value && email.value && inputs[1].value && msg.value) {
        const wrapper = this.parentElement;
        const success = document.createElement('div');
        success.className = 'success-message show';
        success.textContent = 'Thank you! Message sent successfully!';
        wrapper.insertBefore(success, this);
        setTimeout(() => success.remove(), 5000);
        this.reset();
      } else {
        alert('Please fill all fields');
      }
    };
  }
}

// Run when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    try { console.log('DOMContentLoaded fired'); init(); } catch (err) { console.error(err); }
  });
} else {
  try { console.log('Document already ready — running init'); init(); } catch (err) { console.error(err); }
}

// quick indicator script file loaded
console.log('script.js loaded');
