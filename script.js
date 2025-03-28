// Language selector functionality
class LanguageSelector {
    constructor() {
      this.dropdowns = document.querySelectorAll(".dropdown")
      this.sourceLanguageBtn = document.querySelector(".dropdown-btn")
      this.targetLanguageBtn = document.querySelectorAll(".dropdown-btn")[1]
      this.swapBtn = document.querySelector(".swap-btn")
      this.languagePairHeading = document.querySelector(".language-pair")
      this.languagePairFooter = document.querySelector(".language-pair-footer")
      this.translationPlaceholder = document.getElementById("translation-text")
  
      this.initDropdowns()
      this.initSwapButton()
    }
  
    initDropdowns() {
      this.dropdowns.forEach((dropdown) => {
        const btn = dropdown.querySelector(".dropdown-btn")
  
        btn.addEventListener("click", () => {
          // Close any open dropdowns first
          this.dropdowns.forEach((d) => {
            if (d !== dropdown && d.classList.contains("active")) {
              d.classList.remove("active")
            }
          })
  
          dropdown.classList.toggle("active")
        })
  
        const options = dropdown.querySelectorAll(".dropdown-content a")
        options.forEach((option) => {
          option.addEventListener("click", (e) => {
            e.preventDefault()
            const selectedLang = option.textContent
            btn.innerHTML = `${selectedLang} <i class="fas fa-chevron-down"></i>`
            dropdown.classList.remove("active")
            this.updateLanguagePair()
          })
        })
      })
  
      // Close dropdowns when clicking outside
      document.addEventListener("click", (e) => {
        if (!e.target.closest(".dropdown")) {
          this.dropdowns.forEach((dropdown) => {
            dropdown.classList.remove("active")
          })
        }
      })
    }
  
    initSwapButton() {
      this.swapBtn.addEventListener("click", () => {
        const sourceLang = this.sourceLanguageBtn.textContent.trim().split(" ")[0]
        const targetLang = this.targetLanguageBtn.textContent.trim().split(" ")[0]
  
        this.sourceLanguageBtn.innerHTML = `${targetLang} <i class="fas fa-chevron-down"></i>`
        this.targetLanguageBtn.innerHTML = `${sourceLang} <i class="fas fa-chevron-down"></i>`
  
        this.updateLanguagePair()
      })
    }
  
    updateLanguagePair() {
      const sourceLang = this.sourceLanguageBtn.textContent.trim().split(" ")[0]
      const targetLang = this.targetLanguageBtn.textContent.trim().split(" ")[0]
  
      this.languagePairHeading.textContent = `Dictionary ${sourceLang} - ${targetLang}`
      this.languagePairFooter.textContent = `${sourceLang} - ${targetLang}`
      this.translationPlaceholder.placeholder = `Translate from ${sourceLang} into ${targetLang}`
    }
  }
  
  // Image Upload and Camera Functionality
  class ImageHandler {
    constructor() {
      // Get elements
      this.uploadBtn = document.querySelector(".upload-btn")
      this.cameraBtn = document.querySelector(".camera-btn")
      this.imageUploadInput = document.getElementById("image-upload")
      this.cameraCaptureInput = document.getElementById("camera-capture")
  
      // Create image preview container
      this.createImagePreviewContainer()
  
      // Initialize event listeners
      this.initEventListeners()
    }
  
    createImagePreviewContainer() {
      // Create container for image preview
      this.previewContainer = document.createElement("div")
      this.previewContainer.className = "image-preview-container"
  
      // Create image element
      this.previewImage = document.createElement("img")
      this.previewImage.className = "image-preview"
      this.previewContainer.appendChild(this.previewImage)
  
      // Create remove button
      this.removeBtn = document.createElement("button")
      this.removeBtn.className = "remove-image-btn"
      this.removeBtn.innerHTML = '<i class="fas fa-times"></i> Remove image'
      this.previewContainer.appendChild(this.removeBtn)
  
      // Add container after translation input
      const translationInput =
        document.querySelector(".translation-input") || document.querySelector(".search-input-container")
      if (translationInput) {
        translationInput.after(this.previewContainer)
      }
    }
  
    initEventListeners() {
      // Upload button click
      if (this.uploadBtn) {
        this.uploadBtn.addEventListener("click", () => {
          this.imageUploadInput.click()
        })
      }
  
      // Camera button click
      if (this.cameraBtn) {
        this.cameraBtn.addEventListener("click", () => {
          this.cameraCaptureInput.click()
        })
      }
  
      // Handle file selection for upload
      if (this.imageUploadInput) {
        this.imageUploadInput.addEventListener("change", (e) => {
          this.handleImageSelection(e.target.files)
        })
      }
  
      // Handle file selection for camera
      if (this.cameraCaptureInput) {
        this.cameraCaptureInput.addEventListener("change", (e) => {
          this.handleImageSelection(e.target.files)
        })
      }
  
      // Remove image button
      this.removeBtn.addEventListener("click", () => {
        this.removeImage()
      })
    }
  
    handleImageSelection(files) {
      if (files && files[0]) {
        const file = files[0]
  
        // Check if file is an image
        if (!file.type.startsWith("image/")) {
          alert("Please select an image file")
          return
        }
  
        // Create a URL for the image
        const imageUrl = URL.createObjectURL(file)
  
        // Display the image
        this.previewImage.src = imageUrl
        this.previewContainer.style.display = "block"
  
        // You could add code here to process the image for translation
        // For example, send it to an OCR service to extract text
        console.log("Image selected:", file.name)
      }
    }
  
    removeImage() {
      // Clear the image preview
      this.previewImage.src = ""
      this.previewContainer.style.display = "none"
  
      // Reset file inputs
      this.imageUploadInput.value = ""
      this.cameraCaptureInput.value = ""
  
      console.log("Image removed")
    }
  }
  
  // Initialize on page load
  document.addEventListener("DOMContentLoaded", () => {
    const langSelector = new LanguageSelector()
    const imageHandler = new ImageHandler()
  })
  
  