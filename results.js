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

