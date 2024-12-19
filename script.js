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

// Generate random username
function generateRandomUsername() {
    return Math.random().toString(36).substring(2, 10);
}

// Generate email
function generateEmail() {
    const username = usernameInput.value || generateRandomUsername();
    const domain = domainSelect.value;
    currentEmail = `${username}@${domain}`;
    currentLogin = username;
    currentDomain = domain;

    emailDisplay.textContent = currentEmail;
    copyBtn.style.display = 'inline-block';
    refreshBtn.style.display = 'inline-block';

    fetchInbox();
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

generateEmailBtn.addEventListener('click', generateEmail);

// Load domains on page load
loadDomains();
