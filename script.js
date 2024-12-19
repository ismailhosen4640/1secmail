// DOM Elements
const generateEmailBtn = document.getElementById("generateEmailBtn");
const emailDisplay = document.getElementById("emailDisplay");
const inboxList = document.getElementById("inboxList");

// Generate Random Email using 1SecMail API
generateEmailBtn.addEventListener("click", async () => {
  try {
    // Generate random email
    const response = await fetch(
      "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1"
    );
    const emails = await response.json();
    const email = emails[0];
    emailDisplay.textContent = email;

    // Clear previous inbox
    inboxList.innerHTML = `<li>Fetching inbox for ${email}...</li>`;

    // Fetch inbox
    fetchInbox(email);
  } catch (error) {
    emailDisplay.textContent = "Error generating email. Try again.";
    console.error(error);
  }
});

// Fetch Inbox Messages
async function fetchInbox(email) {
  try {
    const [username, domain] = email.split("@");
    const response = await fetch(
      `https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`
    );
    const messages = await response.json();

    // Update inbox list
    if (messages.length > 0) {
      inboxList.innerHTML = "";
      messages.forEach((message) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
          <strong>From:</strong> ${message.from} <br>
          <strong>Subject:</strong> ${message.subject} <br>
          <strong>Date:</strong> ${message.date}
        `;
        inboxList.appendChild(listItem);
      });
    } else {
      inboxList.innerHTML = `<li>No new messages found.</li>`;
    }
  } catch (error) {
    inboxList.innerHTML = `<li>Error fetching inbox. Try again later.</li>`;
    console.error(error);
  }
}