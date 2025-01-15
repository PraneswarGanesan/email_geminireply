console.log("Email-Writer extension - Content Script is loaded");

function createAIButton() {
  // const button = document.createElement('div');
  // button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
  // button.style.marginRight = '8px';
  // button.innerHTML = 'AI-Reply';
  // button.setAttribute('role', 'button');
  // button.setAttribute('data-tooltip', 'Generate AI Reply');
  // return button;
  const button = document.createElement('div');
  button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
  button.style.marginRight = '8px';
  button.innerHTML = 'AI-Reply';  // Removed image and kept text
  button.setAttribute('role', 'button');
  button.setAttribute('data-tooltip', 'Generate AI Reply');
  
  // Add custom styling for blue-violet gradient background
  button.style.background = 'linear-gradient(45deg, #6A5ACD, #00BFFF)'; // Blue-Violet Gradient
  button.style.color = 'white';
  button.style.padding = '10px 15px';
  button.style.borderRadius = '5px';
  button.style.border = 'none';
  button.style.fontSize = '14px';
  button.style.cursor = 'pointer';

  return button;
}

function getEmailContent() {
  const selectors = [
    '.h7',
    '.a3s.aiL',
    '[role="presentation"]',
    '.gU.Up'
  ];
  for (const selector of selectors) {
    const content = document.querySelector(selector);
    if (content) {
      return content.innerText.trim();
    }
  }
  return ''; // Return empty if nothing is found
}

function findComposeToolbar() {
  const selectors = [
    '.btC',
    '.aDh',
    '[role="toolbar"]',
    '.gU.Up'
  ];
  for (const selector of selectors) {
    const toolbar = document.querySelector(selector);
    if (toolbar) {
      return toolbar;
    }
  }
  return null;
}

function showPopup(message) {
  const popup = document.createElement('div');
  popup.classList.add('ai-popup');
  popup.innerHTML = message;
  document.body.appendChild(popup);

  // Show popup with animation
  setTimeout(() => {
    popup.classList.add('show');
  }, 100);

  // Hide the popup after 3 seconds
  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => {
      popup.remove();
    }, 500); // Allow animation to finish before removal
  }, 3000);
}

function injectButton() {
  const existingButton = document.querySelector('.ai-reply-button');
  if (existingButton) existingButton.remove();

  const toolbar = findComposeToolbar();
  if (!toolbar) {
    console.log("Toolbar not found");
    return;
  }
  console.log("Toolbar found, creating AI button");

  const button = createAIButton();
  button.classList.add("ai-button-reply");

  button.addEventListener('click', async () => {
    try {
      button.innerHTML = "Generating.......";
      button.disabled = true;

      const emailContent = getEmailContent();
      console.log(emailContent);

      const response = await fetch('http://localhost:8080/api/emailgenerator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "emailContent": emailContent,
          "tone": "professional"
        })
      });

      if (!response.ok) {
        throw new Error("API REQUEST FAILURE");
      }

      const generatedReply = await response.text();
      const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
      if (composeBox) {
        composeBox.focus();
        document.execCommand('insertText', false, generatedReply);
      } else {
        console.error('Compose box was not found');
      }

      // Show the success popup
      showPopup('Reply Generated!');
      
    } catch (error) {
      console.log(error);
      alert('Failed to generate reply');
    } finally {
      button.innerHTML = 'AI-Reply';
      button.disabled = false;
    }
  });

  toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);
    const hasComposeElements = addedNodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches('.adh,.btC,[role="dialog"]') ||
          node.querySelector('.adh,.btC,[role="dialog"]'))
    );

    if (hasComposeElements) {
      console.log("Compose window Detected");
      setTimeout(injectButton, 500);
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
