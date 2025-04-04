// Import the TranslationService
import { TranslationService } from './services/firebase_services.js';

// Initialize translation service
const translationService = new TranslationService();

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
    // Search for exact translation
    const results = await translationService.searchTranslations(
      translation.sourceLang,
      translation.targetLang,
      translation.originalText
    );
    
    if (results && results.length > 0) {
      // Show translation result
      const translationResult = document.getElementById('translation-result');
      translationResult.innerHTML = `<div class="translation-text">${results[0].targetText}</div>`;
      translationResult.classList.remove('no-results-box');
      
      // Save translation to history
      saveTranslationToHistory(translation, results[0].targetText);
    } else {
      // Search for similar translations
      const similarResults = await translationService.searchSimilarTranslations(
        translation.sourceLang,
        translation.targetLang,
        translation.originalText
      );
      
      // Display similar translations
      displaySimilarTranslations(similarResults);
    }
  } catch (error) {
    console.error("Error searching for translation:", error);
  }
}

function displaySimilarTranslations(translations) {
  const similarPhrasesList = document.getElementById('similar-phrases-list');
  
  if (translations && translations.length > 0) {
    similarPhrasesList.innerHTML = '';
    translations.forEach(translation => {
      similarPhrasesList.innerHTML += `
        <div class="similar-phrase-item">
          <div class="original-phrase">"${translation.sourceText}"</div>
          <div class="translated-phrase">${translation.targetText}</div>
        </div>
      `;
    });
  } else {
    similarPhrasesList.innerHTML = `<p>No similar translations found.</p>`;
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
    // Create translation data
    const translationData = {
      sourceText,
      targetText,
      sourceLang,
      targetLang,
      examples: []
    };
    
    // Add example if provided
    if (exampleSource && exampleTarget) {
      translationData.examples.push({
        source: exampleSource,
        target: exampleTarget
      });
    }
    
    // Show loading state
    const submitButton = document.querySelector('.submit-translation-btn');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;
    
    console.log("About to submit translation data:", translationData);
    
    try {
      // Submit to Firebase
      await translationService.addTranslation(translationData);
      
      // Show success and close modal
      alert('Thank you for your contribution! Your translation has been submitted for review.');
      closeModal();
      
      // Update the UI to show the new translation
      const currentTranslation = JSON.parse(localStorage.getItem('currentTranslation') || 'null');
      if (currentTranslation) {
        const translationResult = document.getElementById('translation-result');
        translationResult.innerHTML = `
          <div class="translation-text">
            ${targetText}
            <div class="translation-note">
              (Your contribution has been submitted and will be reviewed by our team)
            </div>
          </div>
        `;
        translationResult.classList.remove('no-results-box');
      }
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      alert(`Error: ${firebaseError.message || 'Could not save translation. Please try again.'}`);
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