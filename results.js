// Import Firebase translation service
import { TranslationService } from './services/firebase_services.js';

// Initialize the service
const translationService = new TranslationService();

document.addEventListener("DOMContentLoaded", () => {
  const currentTranslation = JSON.parse(localStorage.getItem('currentTranslation') || 'null');
  if (currentTranslation) {
    setupTranslationUI(currentTranslation);
    loadRecentSearches();
  }

  setupEventListeners();
  setupModalEventListeners();
});

// Setup translation UI
function setupTranslationUI(translation) {
  document.getElementById('query-text').textContent = translation.originalText;
  document.getElementById('no-results-query').textContent = translation.originalText;
  document.getElementById('source-language-display').textContent = capitalize(translation.sourceLang);
  document.getElementById('target-language-display').textContent = capitalize(translation.targetLang);
  document.getElementById('search-input').value = translation.originalText;
  document.getElementById('modal-source-lang-text').textContent = capitalize(translation.sourceLang);
  document.getElementById('modal-target-lang-text').textContent = capitalize(translation.targetLang);
  document.getElementById('sourceText').value = translation.originalText;

  document.getElementById('similar-phrases-title').textContent = `SIMILAR PHRASES WITH TRANSLATIONS`;
  searchForTranslation(translation);
}

// Perform translation search
async function searchForTranslation(translation) {
  try {
    const results = await translationService.searchTranslations(
      translation.sourceLang,
      translation.targetLang,
      translation.originalText
    );

    if (results?.length) {
      document.getElementById('translation-result').innerHTML = `<div class="translation-text">${results[0].targetText}</div>`;
      saveTranslationToHistory(translation, results[0].targetText);
    } else {
      const similarResults = await translationService.searchSimilarTranslations(
        translation.sourceLang,
        translation.targetLang,
        translation.originalText
      );
      displaySimilarTranslations(similarResults);
    }
  } catch (error) {
    console.error("Error during search:", error);
  }
}

// Display similar translations
function displaySimilarTranslations(translations) {
  const container = document.getElementById('similar-phrases-list');
  container.innerHTML = '';

  if (translations?.length) {
    translations.forEach(tr => {
      container.innerHTML += `
        <div class="similar-phrase-item">
          <div class="original-phrase">"${tr.sourceText}"</div>
          <div class="translated-phrase">${tr.targetText}</div>
        </div>
      `;
    });
  } else {
    container.innerHTML = '<p>No similar translations found.</p>';
  }
}

// Save translation history to localStorage
function saveTranslationToHistory(translation, translatedText) {
  const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
  const index = history.findIndex(item =>
    item.sourceLang === translation.sourceLang &&
    item.targetLang === translation.targetLang &&
    item.originalText === translation.originalText
  );

  if (index !== -1) {
    history[index].translatedText = translatedText;
  } else {
    history.unshift({
      ...translation,
      translatedText,
      timestamp: new Date().toISOString(),
      id: Date.now()
    });
  }

  localStorage.setItem('translationHistory', JSON.stringify(history.slice(0, 100)));
}

// Load recent searches
function loadRecentSearches() {
  const container = document.getElementById('recent-searches');
  const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');

  container.innerHTML = history.slice(0, 5).map(item => `
    <div class="search-item" data-id="${item.id}">
      <div class="search-text">${item.originalText}</div>
      <div class="search-langs">${item.sourceLang} → ${item.targetLang}</div>
    </div>
  `).join('') || '<p>No recent searches</p>';
}

// Set up event listeners
function setupEventListeners() {
  document.getElementById('translate-btn')?.addEventListener('click', openModal);

  document.getElementById('recent-searches')?.addEventListener('click', (e) => {
    const item = e.target.closest('.search-item');
    if (!item) return;

    const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
    const selected = history.find(h => h.id.toString() === item.dataset.id);
    if (selected) {
      localStorage.setItem('currentTranslation', JSON.stringify(selected));
      location.reload();
    }
  });
}

// Modal open/close logic
function setupModalEventListeners() {
  const modal = document.getElementById('translation-modal');
  const closeBtn = document.querySelector('.modal-close');
  const form = document.getElementById('translationForm');

  closeBtn?.addEventListener('click', closeModal);
  window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleFormSubmission();
  });

  // Character count for input fields
  document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('input', function () {
      const counter = this.closest('.input-wrapper')?.querySelector('.char-count');
      if (counter) counter.textContent = `${this.value.length}/500`;
    });
  });
}

function openModal() {
  const modal = document.getElementById('translation-modal');
  if (!modal) return;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  const translation = JSON.parse(localStorage.getItem('currentTranslation') || 'null');
  if (translation) {
    document.getElementById('sourceText').value = translation.originalText;
    document.getElementById('modal-source-lang-text').textContent = capitalize(translation.sourceLang);
    document.getElementById('modal-target-lang-text').textContent = capitalize(translation.targetLang);
  }
}

function closeModal() {
  const modal = document.getElementById('translation-modal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Handle form submission
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

  const translationData = {
    sourceText,
    targetText,
    sourceLang,
    targetLang,
    examples: []
  };

  if (exampleSource && exampleTarget) {
    translationData.examples.push({ source: exampleSource, target: exampleTarget });
  }

  const submitButton = document.querySelector('.submit-translation-btn');
  submitButton.textContent = 'Submitting...';
  submitButton.disabled = true;

  try {
    await translationService.addTranslation(translationData);
    alert('✅ Thank you! Translation submitted for review.');
    closeModal();

    const current = JSON.parse(localStorage.getItem('currentTranslation') || 'null');
    if (current) {
      const result = document.getElementById('translation-result');
      result.innerHTML = `
        <div class="translation-text">
          ${targetText}
          <div class="translation-note">(Your contribution has been submitted for review)</div>
        </div>
      `;
    }

  } catch (error) {
    console.error('Error submitting translation:', error);
    alert('❌ Submission failed. Try again.');
  } finally {
    submitButton.textContent = 'Submit Translation';
    submitButton.disabled = false;
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
