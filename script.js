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
    this.translationInput = document.getElementById("translation-text") || document.getElementById("search-input")

    // Camera modal elements
    this.modal = document.getElementById("camera-modal")
    this.closeModalBtn = document.querySelector(".close-modal")
    this.cameraPreview = document.getElementById("camera-preview")
    this.cameraCanvas = document.getElementById("camera-canvas")
    this.captureBtn = document.getElementById("capture-btn")
    this.retakeBtn = document.getElementById("retake-btn")
    this.usePhotoBtn = document.getElementById("use-photo-btn")

    // Stream variables
    this.stream = null
    this.capturedImage = null

    // Create image preview container
    this.createImagePreviewContainer()

    // Initialize image recognition service
    this.recognitionService = new ImageRecognitionService()

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

    // Create loading indicator
    this.loadingIndicator = document.createElement("div")
    this.loadingIndicator.className = "loading-indicator"
    this.loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing image...'
    this.loadingIndicator.style.display = "none"
    this.previewContainer.appendChild(this.loadingIndicator)

    // Create recognized text element
    this.recognizedTextElement = document.createElement("div")
    this.recognizedTextElement.className = "recognized-text"
    this.previewContainer.appendChild(this.recognizedTextElement)

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
        this.openCameraModal()
      })
    }

    // Handle file selection for upload
    if (this.imageUploadInput) {
      this.imageUploadInput.addEventListener("change", (e) => {
        this.handleImageSelection(e.target.files)
      })
    }

    // Remove image button
    this.removeBtn.addEventListener("click", () => {
      this.removeImage()
    })

    // Camera modal events
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener("click", () => {
        this.closeCameraModal()
      })
    }

    // Capture button
    if (this.captureBtn) {
      this.captureBtn.addEventListener("click", () => {
        this.capturePhoto()
      })
    }

    // Retake button
    if (this.retakeBtn) {
      this.retakeBtn.addEventListener("click", () => {
        this.retakePhoto()
      })
    }

    // Use photo button
    if (this.usePhotoBtn) {
      this.usePhotoBtn.addEventListener("click", () => {
        this.usePhoto()
      })
    }

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeCameraModal()
      }
    })
  }

  async handleImageSelection(files) {
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

      // Show loading indicator
      this.loadingIndicator.style.display = "block"
      this.recognizedTextElement.textContent = ""

      try {
        // Get the source language from the UI
        const sourceLanguageElement = document.querySelector(".dropdown-btn")
        const sourceLanguage = sourceLanguageElement
          ? sourceLanguageElement.textContent.trim().split(" ")[0].toLowerCase()
          : "french"

        // Recognize objects in the image
        const recognizedText = await this.recognitionService.recognizeImage(file, sourceLanguage)

        // Display the recognized text
        this.recognizedTextElement.textContent = `Recognized: ${recognizedText}`

        // Set the recognized text in the translation input
        if (this.translationInput) {
          this.translationInput.value = recognizedText
        }

        console.log("Image analyzed:", recognizedText)
      } catch (error) {
        console.error("Error analyzing image:", error)
        this.recognizedTextElement.textContent = "Error analyzing image. Please try again."
      } finally {
        // Hide loading indicator
        this.loadingIndicator.style.display = "none"
      }

      console.log("Image selected:", file.name)
    }
  }

  removeImage() {
    // Clear the image preview
    this.previewImage.src = ""
    this.previewContainer.style.display = "none"
    this.recognizedTextElement.textContent = ""

    // Reset file input
    this.imageUploadInput.value = ""

    console.log("Image removed")
  }

  openCameraModal() {
    // Show the modal
    this.modal.style.display = "block"

    // Reset UI
    this.cameraPreview.style.display = "block"
    this.cameraCanvas.style.display = "none"
    this.captureBtn.style.display = "block"
    this.retakeBtn.style.display = "none"
    this.usePhotoBtn.style.display = "none"

    // Start the camera
    this.startCamera()
  }

  closeCameraModal() {
    // Hide the modal
    this.modal.style.display = "none"

    // Stop the camera stream
    this.stopCamera()
  }

  startCamera() {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support camera access")
      this.closeCameraModal()
      return
    }

    // Request camera access
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.stream = stream
        this.cameraPreview.srcObject = stream
        this.captureBtn.disabled = false
      })
      .catch((error) => {
        console.error("Error accessing camera:", error)
        alert("Could not access camera. Please check your permissions.")
        this.closeCameraModal()
      })
  }

  stopCamera() {
    // Stop all tracks in the stream
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }
  }

  capturePhoto() {
    // Get the canvas context
    const context = this.cameraCanvas.getContext("2d")

    // Set canvas dimensions to match video
    this.cameraCanvas.width = this.cameraPreview.videoWidth
    this.cameraCanvas.height = this.cameraPreview.videoHeight

    // Draw the current video frame on the canvas
    context.drawImage(this.cameraPreview, 0, 0, this.cameraCanvas.width, this.cameraCanvas.height)

    // Get the image data URL
    this.capturedImage = this.cameraCanvas.toDataURL("image/png")

    // Update UI
    this.cameraPreview.style.display = "none"
    this.cameraCanvas.style.display = "block"
    this.captureBtn.style.display = "none"
    this.retakeBtn.style.display = "inline-block"
    this.usePhotoBtn.style.display = "inline-block"
  }

  retakePhoto() {
    // Reset UI
    this.cameraPreview.style.display = "block"
    this.cameraCanvas.style.display = "none"
    this.captureBtn.style.display = "block"
    this.retakeBtn.style.display = "none"
    this.usePhotoBtn.style.display = "none"

    // Clear captured image
    this.capturedImage = null
  }

  async usePhoto() {
    if (this.capturedImage) {
      // Display the captured image in the preview container
      this.previewImage.src = this.capturedImage
      this.previewContainer.style.display = "block"

      // Close the modal
      this.closeCameraModal()

      // Show loading indicator
      this.loadingIndicator.style.display = "block"
      this.recognizedTextElement.textContent = ""

      try {
        // Get the source language from the UI
        const sourceLanguageElement = document.querySelector(".dropdown-btn")
        const sourceLanguage = sourceLanguageElement
          ? sourceLanguageElement.textContent.trim().split(" ")[0].toLowerCase()
          : "french"

        // Recognize objects in the image
        const recognizedText = await this.recognitionService.recognizeImage(this.capturedImage, sourceLanguage)

        // Display the recognized text
        this.recognizedTextElement.textContent = `Recognized: ${recognizedText}`

        // Set the recognized text in the translation input
        if (this.translationInput) {
          this.translationInput.value = recognizedText
        }

        console.log("Image analyzed:", recognizedText)
      } catch (error) {
        console.error("Error analyzing image:", error)
        this.recognizedTextElement.textContent = "Error analyzing image. Please try again."
      } finally {
        // Hide loading indicator
        this.loadingIndicator.style.display = "none"
      }

      console.log("Photo captured and used")
    }
  }
}

// Dummy ImageRecognitionService class (replace with actual implementation)
class ImageRecognitionService {
  async recognizeImage(image, language) {
    // Simulate image recognition
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return `Recognized text in ${language}`
  }
}

const translations = {
  "french-ghomala": {
      "bonjour": "bongu",
      "famille": "fami",
      // Add more translations
  },
  "english-ghomala": {
      "hello": "bongu",
      // Add more translations
  },
  "french-fulfulde": {
      "bonjour": "djamina",
      // Add more translations
  },
  "english-fulfulde": {
      "hello": "djamina",
      // Add more translations
  },
};

function translateText() {
    const sourceText = document.getElementById("translation-text").value.trim();
    const sourceLang = document.querySelector('.dropdown-btn').textContent.trim().toLowerCase();
    const targetLang = document.querySelectorAll('.dropdown-btn')[1].textContent.trim().toLowerCase();

    const translationKey = `${sourceLang}-${targetLang}`;
    const outputField = document.getElementById("output-text"); // Ensure this ID exists in results.html
    const noResultsBox = document.getElementById("no-results");

    if (translations[translationKey] && translations[translationKey][sourceText]) {
        const translatedText = translations[translationKey][sourceText];
        outputField.value = translatedText; // Display the translated text
        noResultsBox.style.display = "none"; // Hide no results box
    } else {
        outputField.value = ""; // Clear output
        noResultsBox.style.display = "block"; // Show no results box
    }
}

// Attach event listener to the translate button
document.addEventListener("DOMContentLoaded", () => {
    const translateBtn = document.getElementById("translate-btn");
    translateBtn.addEventListener("click", translateText);
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  const langSelector = new LanguageSelector()
  const imageHandler = new ImageHandler()
})

