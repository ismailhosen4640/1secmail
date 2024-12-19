const domainSelect = document.getElementById('domain');
const usernameInput = document.getElementById('username');
const emailDisplay = document.getElementById('emailDisplay');
const inboxList = document.getElementById('inboxList');
const copyBtn = document.getElementById('copyBtn');
const refreshBtn = document.getElementById('refreshBtn');
const generateEmailBtn = document.getElementById('generateEmailBtn');

let currentEmail = '';
let currentLogin = '';
let currentDomain = '';

// Load domains
async function loadDomains() {
    try {
        const response = await fetch('https://www.1secmail.com/api/v1/?action=getDomainList');
        const domains = await response.json();
        domains.forEach(domain => {
            const option = document.createElement('option');
            option.value = domain;
            option.textContent = domain;
            domainSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading domains:', error);
    }
}

// Generate email
function generateEmail() {
    const username = usernameInput.value || Math.random().toString(36).substring(2, 10);
    const domain = domainSelect.value;
    currentEmail = `${username}@${domain}`;
    currentLogin = username;
    currentDomain = domain;

    emailDisplay.textContent = currentEmail;
    copyBtn.style.display = 'inline-block';
    refreshBtn.style.display = 'inline-block';

    fetchInbox();

    // Send email to Telegram bot after generation
    sendToTelegram(currentEmail);
}

// Fetch inbox
function fetchInbox() {
    if (!currentEmail) return;
    fetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${currentLogin}&domain=${currentDomain}`)
        .then(res => res.json())
        .then(messages => {
            inboxList.innerHTML = '';
            if (messages.length === 0) {
                inboxList.innerHTML = '<li>Inbox is empty.</li>';
            } else {
                messages.forEach(message => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>From:</strong> ${message.from}<br><strong>Subject:</strong> ${message.subject}`;
                    inboxList.appendChild(li);
                });
            }
        });
}

// Copy email
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentEmail).then(() => {
        alert('Email copied to clipboard!');
    });
});

// Refresh inbox
refreshBtn.addEventListener('click', fetchInbox);

// Send generated email to Telegram bot
function sendToTelegram(email) {
    const apiToken = '8003534186:AAG0WmJKwE-lS4xS-SQheFVx1_9CeWCc64U';  // Your Telegram bot API token
    const chatId = '<YOUR_CHAT_ID>';  // Replace with your actual chat ID

    fetch(`https://api.telegram.org/bot${apiToken}/sendMessage`, {
        method: 'POST',
        body: JSON.stringify({
            chat_id: chatId,
            text: `New generated email: ${email}`
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => console.log('Message sent to Telegram bot:', data))
    .catch(error => console.error('Error sending message to Telegram:', error));
}

generateEmailBtn.addEventListener('click', generateEmail);

// Load domains on page load
loadDomains();

// Telegram Mini App Integration
if (window.Telegram.WebApp) {
    const webApp = Telegram.WebApp;

    // Setting up Telegram theme
    document.body.style.backgroundColor = webApp.themeParams.bg_color || "#ffffff";
    document.body.style.color = webApp.themeParams.text_color || "#000000";

    // Expanding the WebApp
    webApp.expand();

    // Send data back to Telegram bot when email is generated
    generateEmailBtn.addEventListener('click', () => {
        if (currentEmail) {
            webApp.sendData(JSON.stringify({ email: currentEmail }));
        }
    });
}
