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
  }

  handleTranslation() {
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

    // Create translation object
    const translation = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      sourceLang,
      targetLang,
      originalText: textToTranslate,
      translatedText: "", // Will be filled on results page
      isFavorite: false,
    };

    // Save to current translation in localStorage
    localStorage.setItem("currentTranslation", JSON.stringify(translation));

    // Add to history
    this.addToHistory(translation);

    // Navigate to results page
    window.location.href = "./results.html";
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

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  const langSelector = new LanguageSelector();
  const imageHandler = new ImageHandler();
  const translationManager = new TranslationManager(); // Add this line
});
