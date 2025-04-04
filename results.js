document.addEventListener("DOMContentLoaded", () => {
  initSearchResults()
})

function initSearchResults() {
  // Handle search item selection
  const searchItems = document.querySelectorAll(".search-item")
  searchItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Remove active class from all items
      searchItems.forEach((i) => i.classList.remove("active"))

      // Add active class to clicked item
      item.classList.add("active")

      // Update search input with selected text
      const searchInput = document.getElementById("search-input")
      searchInput.value = item.textContent

      // In a real app, this would trigger a new search
      updateSearchResults(item.textContent)
    })
  })

  // Handle add translation button
  const addTranslationBtn = document.querySelector(".add-translation-btn")
  addTranslationBtn.addEventListener("click", () => {
    // In a real app, this would open a form to add translation
    alert("This would open a form to add your translation contribution!")
  })

  // Handle language links
  const languageLinks = document.querySelectorAll(".language-link")
  languageLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      // In a real app, this would navigate to the language dictionary
      const language = link.textContent.toLowerCase()
      alert(`Navigating to ${language} dictionary...`)
    })
  })
}

function updateSearchResults(searchText) {
  // This is a placeholder function for demonstration
  // In a real app, this would fetch new results from the server

  // Update search query title
  const searchQuery = document.querySelector(".search-query")
  searchQuery.textContent = `Translation of "${searchText}" into Ghomálá'`

  // Update no results box if needed
  const noResultsBox = document.querySelector(".no-results-box p")
  noResultsBox.innerHTML = `Currently we have no translations for <strong>"${searchText}"</strong> in the dictionary, maybe you can add one? Make sure to check automatic translation, translation memory or indirect translations.`
}


document.addEventListener("DOMContentLoaded", function () {
  const keyboardContainer = document.getElementById("aglc-keyboard");
  const closeKeyboardBtn = document.querySelector(".close-keyboard");

  // Close the keyboard when the button is clicked
  closeKeyboardBtn.addEventListener("click", function () {
    keyboardContainer.style.display = "none";
  });
});




document.addEventListener("DOMContentLoaded", function () {
  const keyboardBtn = document.querySelector(".keyboard-btn");
  const keyboardContainer = document.getElementById("aglc-keyboard");
  const textInput = document.getElementById("translation-text");
  let isShiftActive = false;
  let isCapsActive = false;

  // Afficher / Cacher le clavier
  keyboardBtn.addEventListener("click", function () {
    keyboardContainer.style.display =
      keyboardContainer.style.display === "none" ? "flex" : "none";
  });

  // Ajouter un caractère au champ de texte
  document.querySelectorAll(".key").forEach((key) => {
    key.addEventListener("click", function () {
      let char = this.textContent;

      if (this.classList.contains("backspace")) {
        textInput.value = textInput.value.slice(0, -1);
      } else if (this.classList.contains("space")) {
        textInput.value += " ";
      } else if (this.classList.contains("return")) {
        textInput.value += "\n";
      } else if (this.classList.contains("shift")) {
        isShiftActive = !isShiftActive;
      } else if (this.classList.contains("capslock")) {
        isCapsActive = !isCapsActive;
      } else {
        if (isShiftActive || isCapsActive) {
          char = char.toUpperCase();
        } else {
          char = char.toLowerCase();
        }
        textInput.value += char;
      }
    });
  });
});


document.addEventListener("click", (event) => {
  const keyboardContainer = document.getElementById("aglc-keyboard");
  if (!event.target.closest("#aglc-keyboard") && !event.target.closest(".keyboard-btn")) {
    keyboardContainer.style.display = "none";
  }
});

const keyboardContainer = document.getElementById("aglc-keyboard");
let isDragging = false;
let offset = { x: 0, y: 0 };

keyboardContainer.addEventListener("mousedown", (e) => {
  isDragging = true;
  offset.x = e.clientX - keyboardContainer.getBoundingClientRect().left;
  offset.y = e.clientY - keyboardContainer.getBoundingClientRect().top;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    keyboardContainer.style.position = 'absolute';
    keyboardContainer.style.left = `${e.clientX - offset.x}px`;
    keyboardContainer.style.top = `${e.clientY - offset.y}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});


document.addEventListener("DOMContentLoaded", function () {
  const keyboardContainer = document.getElementById("aglc-keyboard");
  const textInput = document.getElementById("search-input"); // Utilisez le champ correspondant

  const keyboardBtn = document.querySelector(".keyboard-btn");
  keyboardBtn.addEventListener("click", function () {
    keyboardContainer.style.display =
      keyboardContainer.style.display === "none" ? "flex" : "none";
  });

  // Ajouter le caractère au champ de texte
  document.querySelectorAll(".key").forEach((key) => {
    key.addEventListener("click", function () {
      let char = this.getAttribute("data-char");
      textInput.value += char; // Ajouter le caractère au champ de texte
    });
  });
});