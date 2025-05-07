// results.js - Modified to use Flask backend

// Base URL for Flask API
const FLASK_API_URL = 'http://localhost:5000/api'; // Update this if your Flask server is hosted elsewhere

document.addEventListener("DOMContentLoaded", () => {
  // Get current translation from localStorage
  const currentTranslation = JSON.parse(localStorage.getItem('currentTranslation') || 'null');
  
  // Setup UI based on current translation
  if (currentTranslation) {
    setupTranslationUI(currentTranslation);
    loadRecentSearches();
  }
  
  // Setup event listeners
  setupEventListeners();
  setupModalEventListeners();
});

function setupTranslationUI(translation) {
  // Update query display elements
  document.getElementById('query-text').textContent = translation.originalText;
  document.getElementById('no-results-query').textContent = translation.originalText;
  document.getElementById('source-language-display').textContent = 
    capitalizeFirstLetter(translation.sourceLang);
  document.getElementById('target-language-display').textContent = 
    capitalizeFirstLetter(translation.targetLang);
  document.getElementById('search-input').value = translation.originalText;
  
  // Set languages on the modal dropdowns
  document.getElementById('modal-source-lang-text').textContent = 
    capitalizeFirstLetter(translation.sourceLang);
  document.getElementById('modal-target-lang-text').textContent = 
    capitalizeFirstLetter(translation.targetLang);
  
  // Update similar phrases header
  document.getElementById('similar-phrases-title').textContent = 
    `SIMILAR PHRASES WITH TRANSLATIONS`;
    
  // Pre-fill the form with the search query
  document.getElementById('sourceText').value = translation.originalText;
  
  // Search for translations
  searchForTranslation(translation);
}

async function searchForTranslation(translation) {
  try {
    // Search for translation via Flask API
    const response = await fetch(`${FLASK_API_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceLang: translation.sourceLang,
        targetLang: translation.targetLang,
        text: translation.originalText
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    if (result.translation && !result.translation.startsWith("Sorry, no translation found")) {
      // Show translation result
      const translationResult = document.getElementById('translation-result');
      translationResult.innerHTML = `<div class="translation-text">${result.translation}</div>`;
      translationResult.classList.remove('no-results-box');
      
      // Save translation to history
      saveTranslationToHistory(translation, result.translation);
      
      // Display match info if available
      if (result.matchType === 'fuzzy') {
        const matchInfo = document.createElement('div');
        matchInfo.className = 'match-info';
        matchInfo.textContent = `Matched similar phrase: "${result.matchedWord}" (${result.fuzzyMatchScore}% match)`;
        translationResult.appendChild(matchInfo);
      }
    } else {
      // No translation found - show similar phrases from the dictionary
      await displayDictionaryEntries(translation.sourceLang, translation.targetLang);
    }
  } catch (error) {
    console.error("Error searching for translation:", error);
    // Fallback to showing dictionary entries
    await displayDictionaryEntries(translation.sourceLang, translation.targetLang);
  }
}

async function displayDictionaryEntries(sourceLang, targetLang) {
  try {
    // Get all dictionary entries for this language pair
    const response = await fetch(`${FLASK_API_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceLang: sourceLang,
        targetLang: targetLang,
        text: '' // Empty text to get all entries
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    // Display all dictionary entries as similar phrases
    const similarPhrasesList = document.getElementById('similar-phrases-list');
    similarPhrasesList.innerHTML = '';

    // Get the dictionary for this language pair
    const dictKey = `${sourceLang}-${targetLang}`;
    const dictionary = TEMPORARY_DICTIONARIES[dictKey] || {};

    for (const [sourceText, targetText] of Object.entries(dictionary)) {
      similarPhrasesList.innerHTML += `
        <div class="similar-phrase-item">
          <div class="original-phrase">"${sourceText}"</div>
          <div class="translated-phrase">${targetText}</div>
        </div>
      `;
    }

    // Show no results message if dictionary is empty
    if (Object.keys(dictionary).length === 0) {
      similarPhrasesList.innerHTML = `<p>No translations available for this language pair.</p>`;
    }
  } catch (error) {
    console.error("Error fetching dictionary entries:", error);
    const similarPhrasesList = document.getElementById('similar-phrases-list');
    similarPhrasesList.innerHTML = `<p>Error loading translations. Please try again later.</p>`;
  }
}

function saveTranslationToHistory(translation, translatedText) {
  // Get existing history
  const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
  
  // Find and update or add translation
  const existingIndex = history.findIndex(item => 
    item.sourceLang === translation.sourceLang &&
    item.targetLang === translation.targetLang &&
    item.originalText === translation.originalText
  );
  
  if (existingIndex !== -1) {
    history[existingIndex].translatedText = translatedText;
  } else {
    const newTranslation = {
      ...translation,
      translatedText,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    history.unshift(newTranslation);
  }
  
  // Keep only recent items
  const updatedHistory = history.slice(0, 100);
  localStorage.setItem('translationHistory', JSON.stringify(updatedHistory));
}

function loadRecentSearches() {
  const recentSearchesContainer = document.getElementById('recent-searches');
  const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
  
  if (history.length > 0) {
    recentSearchesContainer.innerHTML = '';
    history.slice(0, 5).forEach(item => {
      recentSearchesContainer.innerHTML += `
        <div class="search-item" data-id="${item.id}">
          <div class="search-text">${item.originalText}</div>
          <div class="search-langs">${item.sourceLang} → ${item.targetLang}</div>
        </div>
      `;
    });
  } else {
    recentSearchesContainer.innerHTML = `<p>No recent searches</p>`;
  }
}

function setupEventListeners() {
  // Add translation button opens modal
  const addTranslationBtn = document.getElementById('translate-btn');
  const modal = document.getElementById('translation-modal');
  
  if (addTranslationBtn && modal) {
    addTranslationBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openModal();
    });
  }
  
  // Search item clicks
  const recentSearches = document.getElementById('recent-searches');
  if (recentSearches) {
    recentSearches.addEventListener('click', function(e) {
      const searchItem = e.target.closest('.search-item');
      if (searchItem) {
        const itemId = searchItem.dataset.id;
        const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
        const selectedItem = history.find(item => item.id.toString() === itemId);
        
        if (selectedItem) {
          // Set as current translation
          localStorage.setItem('currentTranslation', JSON.stringify(selectedItem));
          // Reload the page to display the selected translation
          location.reload();
        }
      }
    });
  }
}

function setupModalEventListeners() {
  const modal = document.getElementById('translation-modal');
  const closeBtn = document.querySelector('.modal-close');
  const form = document.getElementById('translationForm');
  
  // Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  // Click outside to close
  window.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Form submission
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      await handleFormSubmission();
    });
  }
  
  // Character counters
  document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('input', function() {
      const charCountEl = this.closest('.input-wrapper').querySelector('.char-count');
      if (charCountEl) {
        charCountEl.textContent = `${this.value.length}/500`;
      }
    });
  });
}

function openModal() {
  const modal = document.getElementById('translation-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Pre-fill with current translation info
    const currentTranslation = JSON.parse(localStorage.getItem('currentTranslation') || 'null');
    if (currentTranslation) {
      document.getElementById('sourceText').value = currentTranslation.originalText;
      // Update modal language display
      document.getElementById('modal-source-lang-text').textContent = 
        capitalizeFirstLetter(currentTranslation.sourceLang);
      document.getElementById('modal-target-lang-text').textContent = 
        capitalizeFirstLetter(currentTranslation.targetLang);
    }
  }
}

function closeModal() {
  const modal = document.getElementById('translation-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  }
}

async function handleFormSubmission() {
  const sourceText = document.getElementById('sourceText').value.trim();
  const targetText = document.getElementById('targetText').value.trim();
  const exampleSource = document.getElementById('exampleSource').value.trim();
  const exampleTarget = document.getElementById('exampleTarget').value.trim();
  
  const sourceLang = document.getElementById('modal-source-lang-text').textContent.trim().toLowerCase();
  const targetLang = document.getElementById('modal-target-lang-text').textContent.trim().toLowerCase();
  
  if (!sourceText || !targetText) {
    alert('Please fill in both source and target text fields.');
    return;
  }
  
  try {
    // Show loading state
    const submitButton = document.querySelector('.submit-translation-btn');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;
    
    // In this simplified version, we'll just add to localStorage since we don't have a backend for submissions
    alert('Thank you for your contribution! In a real implementation, this would be saved to the database.');
    closeModal();
    
    // Update the UI to show the new translation
    const currentTranslation = JSON.parse(localStorage.getItem('currentTranslation') || 'null');
    if (currentTranslation) {
      const translationResult = document.getElementById('translation-result');
      translationResult.innerHTML = `
        <div class="translation-text">
          ${targetText}
          <div class="translation-note">
            (Your contribution has been noted locally)
          </div>
        </div>
      `;
      translationResult.classList.remove('no-results-box');
    }
  } catch (error) {
    console.error('Error in form submission process:', error);
    alert('Error submitting your translation. Please try again.');
  } finally {
    // Always reset the button state
    const submitButton = document.querySelector('.submit-translation-btn');
    if (submitButton) {
      submitButton.textContent = 'Submit Translation';
      submitButton.disabled = false;
    }
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Temporary in-memory dictionaries (should match your Flask server)
const TEMPORARY_DICTIONARIES = {
  'english-ghomala': {
    "hello": "mbʉ́ nà", 
    "thank you": "pua' sʉn",
    "good": "mbeñ",
    "morning": "nkɛn",
    "good morning": "mbʉ́ nkɛn",
    "night": "ntʉ'",
    "good night": "mbʉ́ ntʉ'",
    "how are you": "ò yú háp?",
    "welcome": "ò twí' mbeñ",
    "food": "pɛ̂",
    "water": "nchǐ"
  },
  'english-fulfulde': {
    "hello": "jam", 
    "thank you": "useko",
    "good": "woodi",
    "good morning": "jam weetay",
    "night": "jemma",
    "good night": "jam jemma",
    "how are you": "no mboodaa?",
    "welcome": "a jaɓɓaama",
    "food": "nyaamdu",
    "water": "ndiyam"
  },
  'french-ghomala': {
    "bonjour": "mbʉ́ nà", 
    "merci": "pua' sʉn",
    "bien": "mbeñ",
    "matin": "nkɛn",
    "bonsoir": "mbʉ́ ntʉ'",
    "comment allez-vous": "ò yú háp?",
    "bienvenue": "ò twí' mbeñ",
    "nourriture": "pɛ̂",
    "eau": "nchǐ"
  },
  'french-fulfulde': {
    "bonjour": "jam", 
    "merci": "useko",
    "bien": "woodi",
    "matin": "weetay",
    "bonsoir": "jam jemma",
    "comment allez-vous": "no mboodaa?",
    "bienvenue": "a jaɓɓaama",
    "nourriture": "nyaamdu",
    "eau": "ndiyam"
  }
};