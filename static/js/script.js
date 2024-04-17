

// Define a variable to store chat history
var chatHistory = [];


function createMessageBox(type, message) {
    var userInput = message;
    if (!userInput.trim()) return; // Don't send empty messages
  
    var container = document.createElement("div");
    container.className = type == "user" ? "container darker" : type == "bot" ? "container" : "";
    var img = document.createElement("img");
    img.src = type == "user" ? "static/images/user-logo.jpg" : type == "bot" ? "static/images/bot-logo.jpg" : "";
    img.alt = "Avatar";
    img.className = type == "user" ? "right" : type == "bot" ? "left" : "";
    img.style.width = "100%";
    var p = document.createElement("p");
    p.textContent =  type == "user" ? userInput : type == "bot" ? "" : "";
    var span = document.createElement("span");
    span.className = type == "user" ? "time-left" : type == "bot" ? "time-right" : "";
    var time = new Date();
    span.textContent = time.getHours() + ":" + (time.getMinutes() < 10 ? '0' : '') + time.getMinutes();
    
    container.appendChild(img);
    container.appendChild(p);
    container.appendChild(span);
    
    document.querySelector('.chat-container').appendChild(container);
    
    // Scroll to the bottom of the chat container
    var chatContainer = document.getElementById("chatContainer");
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Dynamically adjust input box width to match container width
    var containerWidth = document.querySelector('.chat-container').offsetWidth;
    document.getElementById("userInput").style.width = containerWidth - 90 + 'px'; // 90px is the width of the send button

    if(type == "bot") typeText(p, userInput);
  }

  function typeText(element, text) {
    // Clear the element content
    element.innerHTML = '';
  
    // Loop through each character in the text
    for (let i = 0; i < text.length; i++) {
      // Create a span element for each character
      let char = text[i];
      let newElement = char === '\n' ? document.createElement('br') : document.createElement('span');
      if(char !== '\n') newElement.textContent = char;
        
      setTimeout(function() {
        element.appendChild(newElement);
        }, i * 15); // Adjust the delay (in milliseconds) as needed
      }
  }

  

// Function to send a message
function saveHistory() {
  // Get the message from the input box
  var userInput = document.getElementById("userInput").value;
  
  // Check if the message is not empty
  if (userInput.trim() !== '') {
    // Add the message to chat history
    chatHistory.push(userInput);
  }
}

async function fetchData(payload) {
    try {
      var requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    };

      // Send a GET request to the demo API endpoint
      const response = await fetch('/api/chatbot', requestOptions);
      
      // Check if the response is successful (status code 200)
      if (response.ok) {
        // Parse the JSON response
        const data = await response.json();
        // Print the response data to the console
        return data;
      } else {
        // If response is not successful, throw an error
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      // If an error occurs during fetching or parsing response, log the error
      console.error('Error:', error);
    }
  }


async function finalAction() {
    userInput =  document.getElementById("userInput").value;
    createMessageBox("user",  userInput);
    saveHistory();
    document.getElementById("userInput").value = ''; // Clear input field after sending message
    payload = {'prompt': userInput}
    data = await fetchData(payload);
    createMessageBox("bot", data.result);
}


// Add event listener to the send button
document.getElementById("send-button").addEventListener("click", finalAction);

