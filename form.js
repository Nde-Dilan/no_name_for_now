document.addEventListener("DOMContentLoaded", function () {
  const sourceDropdown = document.querySelector("#source-languages");
  const targetDropdown = document.querySelector("#target-languages");
  const sourceButton = document
    .querySelector("#source-languages")
    .parentElement.querySelector(".dropdown-btn");
  const targetButton = document
    .querySelector("#target-languages")
    .parentElement.querySelector(".dropdown-btn");
  const swapButton = document.querySelector(".swap-btn");
  const closeButton = document.querySelector(".close");

  // Dropdown Functionality
  function setupDropdown(dropdown, button) {
    button.addEventListener("click", function () {
      dropdown.classList.toggle("show");
    });

    dropdown.querySelectorAll("a").forEach((item) => {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        button.textContent = this.textContent + " ";
        button.appendChild(document.createElement("i")).className =
          "fas fa-chevron-down";
        dropdown.classList.remove("show");
      });
    });
  }

  setupDropdown(sourceDropdown, sourceButton);
  setupDropdown(targetDropdown, targetButton);

  // Swap Languages Functionality
  swapButton.addEventListener("click", function () {
    const sourceLang = sourceButton.textContent.trim();
    const targetLang = targetButton.textContent.trim();

    sourceButton.textContent = targetLang + " ";
    sourceButton.appendChild(document.createElement("i")).className =
      "fas fa-chevron-down";

    targetButton.textContent = sourceLang + " ";
    targetButton.appendChild(document.createElement("i")).className =
      "fas fa-chevron-down";
  });

  // Close Button Functionality
  if (closeButton) {
    closeButton.addEventListener("click", function () {
      window.location.href = "results.html"; // Or your desired close action
    });
  }

  // Speak and Copy Functionality (for each form)
  document
    .querySelectorAll(".translated-phrases")
    .forEach(function (phraseContainer) {
      const speakButton = phraseContainer.querySelector(".speak-btn");
      const copyButton = phraseContainer.querySelector(".copy-btn");
      const microphoneButton = phraseContainer.querySelector(".microphone-btn");

      const inputField = phraseContainer
        .closest("form")
        .querySelector('input[type="text"]');

      if (speakButton) {
        speakButton.addEventListener("click", function () {
          const text = inputField.value;
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
          } else {
            alert("Speech synthesis is not supported in your browser.");
          }
        });
      }

      if (copyButton) {
        copyButton.addEventListener("click", function () {
          inputField.select();
          document.execCommand("copy");
          window.getSelection().removeAllRanges();
          alert("Text copied to clipboard!");
        });
      }
    });
});

function addTranslation() {
  const sourceLang = document
    .querySelector("#source-languages")
    .parentElement.querySelector(".dropdown-btn")
    .textContent.trim();
  const targetLang = document
    .querySelector("#target-languages")
    .parentElement.querySelector(".dropdown-btn")
    .textContent.trim();
  const sourceText = document
    .querySelectorAll("#translationForm")[0]
    .querySelector('input[type="text"]').value;
  const targetText = document
    .querySelectorAll("#translationForm")[1]
    .querySelector('input[type="text"]').value;
  const exampleSource = document
    .querySelectorAll("#translationForm")[2]
    .querySelector('input[type="text"]').value;
  const exampleTarget = document
    .querySelectorAll("#translationForm")[3]
    .querySelector('input[type="text"]').value;

  // Here you would typically send this data to a server or store it locally.
  // For demonstration, we'll just log it to the console.
  console.log({
    sourceLang,
    targetLang,
    sourceText,
    targetText,
    exampleSource,
    exampleTarget,
  });

  // You can add logic to clear the form fields after submission if needed.
  document.querySelectorAll("#translationForm").forEach((form) => {
    form.querySelector('input[type="text"]').value = "";
  });
}

// Close dropdown when clicking outside
window.addEventListener("click", function (event) {
  if (!event.target.matches(".dropdown-btn")) {
    const dropdowns = document.querySelectorAll(".dropdown-content");
    dropdowns.forEach(function (openDropdown) {
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    });
  }
});
