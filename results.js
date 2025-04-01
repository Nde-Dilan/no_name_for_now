// results.js

document.addEventListener('DOMContentLoaded', () => {
    setSearchInputFromQuery();
    
    updateDisplayedText(); // Call to update all relevant sections
    
    myFunc(sourceLang, targetLang, data);
    
    initSearchResults(); 
});

function initSearchResults() {
    // Handle search item selection
    const searchItems = document.querySelectorAll('.search-item');
    searchItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            searchItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Update search input with selected text
            const searchInput = document.getElementById('search-input');
            searchInput.value = item.textContent;
            
            // In a real app, this would trigger a new search
            updateSearchResults(item.textContent);
        });
    });
    
    // Handle add translation button
    const addTranslationBtn = document.querySelector('.add-translation-btn');
    addTranslationBtn.addEventListener('click', () => {
        // In a real app, this would open a form to add translation
        alert('This would open a form to add your translation contribution!');
    });
    
    // Handle language links
    const languageLinks = document.querySelectorAll('.language-link');
    languageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // In a real app, this would navigate to the language dictionary
            const language = link.textContent.toLowerCase();
            alert(`Navigating to ${language} dictionary...`);
        });
    });
    
}


function setSearchInputFromQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    searchText = urlParams.get('query'); // Store the query in the variable
    if (searchText) {
        document.getElementById('search-input').value = decodeURIComponent(searchText);
        updateDisplayedText(); // Call to update all relevant sections
    }
}
function myFunc(sourceLang, targetLang, data) {
    // Simulate an API call and return dummy data
    const translations = {
        "french": {
            "bonjour": "Bonjour",
            "comment ça va": "Ghomálá' translation for 'how are you'",
        },
        "english": {
            "hello": "Ghomálá' translation for 'hello'",
            "how are you": "Ghomálá' translation for 'how are you'",
        }
    };

    // Return the translation based on the source and target language
    return translations[sourceLang][data.toLowerCase()] || "Translation not found";
}

function getSimilarPhrases(searchText) {
    // Simulate a function that returns similar phrases based on the search text
    const similarPhrases = {
        "bonjour": ["salut", "coucou", "bienvenue"],
        "comment ça va": ["ça va bien", "tout va bien"],
        // Add more phrases as needed
    };

    return similarPhrases[searchText.toLowerCase()] || [];
}
// Example usage within the existing logic
function updateDisplayedText() {
      // Update all relevant sections with the translation result
      const searchQuery = document.querySelector('.search-query');
      searchQuery.textContent = `Translation of "${searchText}" into Ghomálá'`;
  
      const dictionaryInfo = document.querySelector('.dictionary-info h3');
      dictionaryInfo.innerHTML = `"${searchText.toUpperCase()}" IN <a href="#" class="language-link">FRENCH</a> - <a href="#" class="language-link">GHOMÁLÁ'</a> DICTIONARY`;
  
      const noResultsBox = document.querySelector('.no-results-box p');
      noResultsBox.innerHTML = `Currently we have no translations for <strong>"${searchText}"</strong> in the dictionary, maybe you can add one? Make sure to check automatic translation, translation memory or indirect translations.`;
  
      const similarPhrases = getSimilarPhrases(searchText);
        const similarPhrasesSection = document.querySelector('.similar-phrases-section');
        similarPhrasesSection.innerHTML = `PHRASES SIMILAR TO "${searchText.toUpperCase()}" WITH TRANSLATIONS INTO GHOMÁLÁ': ${similarPhrases.join(', ')}`;
      
      const sourceLang = "french"; // This should be dynamically set based on user input
      const targetLang = "ghomala"; // This should be dynamically set based on user input
      const translationResult = myFunc(sourceLang, targetLang, searchText);
  
      // Check if there are results based on the translation
      const hasResults = translationResult !== "Translation not found";
  
      if (hasResults) {
          document.getElementById('results-section').style.display = 'block';
          document.getElementById('no-results-section').style.display = 'none';
  
          document.getElementById('translation-result').textContent = translationResult;
      } else {
          document.getElementById('results-section').style.display = 'none';
          document.getElementById('no-results-section').style.display = 'block';
      }
  }