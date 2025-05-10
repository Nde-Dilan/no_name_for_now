// API Configuration
const API_CONFIG = {
  baseUrl: "https://group2-backend-nfk0.onrender.com/api", // Your Flask backend
  endpoints: {
    translate: "/translate",
    languages: "/languages",
    stats: "/stats",
  },
};

// TranslationManager class to handle translations and history
class TranslationManager {
  constructor() {
    this.translateBtn = document.getElementById("translate-btn");
    this.translationInput = document.getElementById("translation-text");

    this.initEventListeners();
  }

  initEventListeners() {
    if (this.translateBtn) {
      this.translateBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleTranslation();
      });
    }

    // Add event listener for Enter key in the input field
    if (this.translationInput) {
      this.translationInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.handleTranslation();
        }
      });
    }
  }

  async callTranslationApi(sourceLang, targetLang, text) {
    const cleanSourceLang = sourceLang
      .toLowerCase()
      .replace("'", "")
      .replace("á", "a");
    const cleanTargetLang = targetLang
      .toLowerCase()
      .replace("'", "")
      .replace("á", "a");
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.translate}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceLang,
            targetLang,
            text,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Translation failed");
      }

      const data = await response.json();

      // Handle the response format from your Flask backend
      return {
        translation: data.translation,
        matchType: data.matchType,
        fuzzyMatchScore: data.fuzzyMatchScore || 0,
        matchedWord: data.matchedWord || "",
      };
    } catch (error) {
      console.error("Translation API error:", error);
      throw error;
    }
  }

  async handleTranslation() {
    // Get source and target languages
    const sourceLanguageBtn = document.querySelector(".dropdown-btn");
    const targetLanguageBtn = document.querySelectorAll(".dropdown-btn")[1];

    const sourceLang = sourceLanguageBtn
      ? sourceLanguageBtn.textContent.trim().split(" ")[0].toLowerCase()
      : "french";
    const targetLang = targetLanguageBtn
      ? targetLanguageBtn.textContent.trim().split(" ")[0].toLowerCase()
      : "ghomala";

    // Get text to translate
    const textToTranslate = this.translationInput
      ? this.translationInput.value.trim()
      : "";

    if (!textToTranslate) {
      alert("Please enter text to translate");
      return;
    }

    try {
      // Show loading indicator or spinner if you have one
      this.toggleLoading(true);

      // Call API for translation
      const translationResult = await this.callTranslationApi(
        sourceLang,
        targetLang,
        textToTranslate
      );

      // Create translation object
      const translation = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        sourceLang,
        targetLang,
        originalText: textToTranslate,
        translatedText: translationResult.translation,
        matchType: translationResult.matchType,
        fuzzyMatchScore: translationResult.fuzzyMatchScore,
        matchedWord: translationResult.matchedWord,
        isFavorite: false,
      };

      // Save to current translation in localStorage
      localStorage.setItem("currentTranslation", JSON.stringify(translation));

      // Add to history
      this.addToHistory(translation);

      // Navigate to results page
      window.location.href = "./results.html";
    } catch (error) {
      console.error("Translation error:", error);
      alert("An error occurred during translation. Please try again.");
    } finally {
      // Hide loading indicator
      this.toggleLoading(false);
    }
  }

  toggleLoading(isLoading) {
    // Add loading indicator functionality here if needed
    // For example, show/hide a spinner or disable/enable the translate button
    if (this.translateBtn) {
      this.translateBtn.disabled = isLoading;
      if (isLoading) {
        this.translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      } else {
        this.translateBtn.innerHTML = '<i class="fas fa-search"></i>';
      }
    }
  }

  async callTranslationApi(sourceLang, targetLang, text) {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.translate}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceLang,
          targetLang,
          text,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Translation failed");
    }

    return response.json();
  }

  addToHistory(translation) {
    // Get existing history or initialize new array
    const history = JSON.parse(
      localStorage.getItem("translationHistory") || "[]"
    );

    // Add new translation to the beginning of history
    history.unshift(translation);

    // Keep only the most recent 100 translations
    const updatedHistory = history.slice(0, 100);

    // Save back to localStorage
    localStorage.setItem("translationHistory", JSON.stringify(updatedHistory));
  }

  static getHistory() {
    return JSON.parse(localStorage.getItem("translationHistory") || "[]");
  }

  static getCurrentTranslation() {
    return JSON.parse(localStorage.getItem("currentTranslation") || "null");
  }
}

// Function to populate results page
function populateResultsPage() {
  const currentTranslation = TranslationManager.getCurrentTranslation();

  if (!currentTranslation) {
    // No translation to display, redirect back to main page
    window.location.href = "index.html";
    return;
  }

  // Get result elements
  const sourceTextElement = document.getElementById("source-text");
  const targetTextElement = document.getElementById("translation-result");
  const sourceLanguageElement = document.getElementById("source-language");
  const targetLanguageElement = document.getElementById("target-language");
  const matchInfoElement = document.getElementById("match-info");

  // Update the result page with translation details
  if (sourceTextElement) {
    sourceTextElement.textContent = currentTranslation.originalText;
  }

  if (targetTextElement) {
    targetTextElement.textContent = currentTranslation.translatedText;
  }

  if (sourceLanguageElement) {
    sourceLanguageElement.textContent =
      currentTranslation.sourceLang.charAt(0).toUpperCase() +
      currentTranslation.sourceLang.slice(1);
  }

  if (targetLanguageElement) {
    targetLanguageElement.textContent =
      currentTranslation.targetLang.charAt(0).toUpperCase() +
      currentTranslation.targetLang.slice(1);
  }

  // Display match info (exact/fuzzy/not found)
  if (matchInfoElement) {
    let matchText = "";

    switch (currentTranslation.matchType) {
      case "exact":
        matchText = "Exact match found";
        matchInfoElement.classList.add("exact-match");
        break;
      case "fuzzy":
        matchText = `Closest match: "${currentTranslation.matchedWord}" (${currentTranslation.fuzzyMatchScore}% confidence)`;
        matchInfoElement.classList.add("fuzzy-match");
        break;
      case "none":
        matchText = "No match found in our dictionary";
        matchInfoElement.classList.add("no-match");
        break;
    }

    matchInfoElement.textContent = matchText;
  }
}

// Initialize on document load
document.addEventListener("DOMContentLoaded", () => {
  const langSelector = new LanguageSelector();
  const imageHandler = new ImageHandler();
  const translationManager = new TranslationManager();

  // Check if we're on the results page
  if (window.location.pathname.includes("results.html")) {
    populateResultsPage();
  }
});

// History page functionality
function populateHistoryPage() {
  const historyContainer = document.getElementById("history-container");
  if (!historyContainer) return;

  const history = TranslationManager.getHistory();

  if (history.length === 0) {
    historyContainer.innerHTML =
      '<p class="empty-history">No translation history yet.</p>';
    return;
  }

  // Clear existing content
  historyContainer.innerHTML = "";

  // Create history items
  history.forEach((item) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    // Format date
    const date = new Date(item.timestamp);
    const formattedDate =
      date.toLocaleDateString() + " " + date.toLocaleTimeString();

    historyItem.innerHTML = `
      <div class="history-languages">
        <span class="history-source-lang">${item.sourceLang}</span>
        <i class="fas fa-arrow-right"></i>
        <span class="history-target-lang">${item.targetLang}</span>
      </div>
      <div class="history-text">
        <p class="history-original">${item.originalText}</p>
        <p class="history-translated">${item.translatedText}</p>
      </div>
      <div class="history-meta">
        <span class="history-date">${formattedDate}</span>
        <button class="history-favorite-btn" data-id="${item.id}">
          <i class="fas ${item.isFavorite ? "fa-heart" : "fa-heart-o"}"></i>
        </button>
      </div>
    `;

    historyContainer.appendChild(historyItem);

    // Add click event to view this translation
    historyItem.addEventListener("click", function (e) {
      // Ignore if clicked on favorite button
      if (e.target.closest(".history-favorite-btn")) return;

      // Set as current translation and go to results page
      localStorage.setItem("currentTranslation", JSON.stringify(item));
      window.location.href = "results.html";
    });
  });

  // Add event listeners for favorite buttons
  document.querySelectorAll(".history-favorite-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const id = parseInt(this.dataset.id);
      toggleFavorite(id);

      // Update icon
      const icon = this.querySelector("i");
      icon.classList.toggle("fa-heart");
      icon.classList.toggle("fa-heart-o");
    });
  });
}

// Toggle favorite status in history
function toggleFavorite(id) {
  const history = TranslationManager.getHistory();

  const index = history.findIndex((item) => item.id === id);
  if (index !== -1) {
    history[index].isFavorite = !history[index].isFavorite;
    localStorage.setItem("translationHistory", JSON.stringify(history));
  }
}

// Check if we're on the history page when the document loads
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("history.html")) {
    populateHistoryPage();
  }
});
