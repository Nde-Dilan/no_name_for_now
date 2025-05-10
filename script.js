function checkLoginStatus() {
  // Check if user is logged in (using localStorage in this example)
  // In a real app, you'd verify with your backend server
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const loginLink = document.getElementById("login-link");
  const userProfile = document.getElementById("user-profile");

  if (isLoggedIn && !window.location.pathname.includes("results.html")) {
    // User is logged in - show profile, hide login button
    loginLink.style.display = "none";
    userProfile.style.display = "block";

    // You could also set the user's actual profile image here
    // const userAvatar = userProfile.querySelector('.user-avatar');
    // userAvatar.src = localStorage.getItem('userAvatar') || 'assets/default-avatar.png';
  } else {
    // User is not logged in - show login button, hide profile
    if (!window.location.pathname.includes("results.html")) {
      loginLink.style.display = "block";
      userProfile.style.display = "none";
    }
  }
}

class LanguageSelector {
  constructor() {
    this.dropdowns = document.querySelectorAll(".dropdown");
    this.sourceLanguageBtn = document.querySelector(".dropdown-btn");
    this.targetLanguageBtn = document.querySelectorAll(".dropdown-btn")[1];
    this.swapBtn = document.querySelector(".swap-btn");

    // These might not exist on all pages
    this.languagePairHeading = document.querySelector(".language-pair");
    this.languagePairFooter = document.querySelector(".language-pair-footer");
    this.translationPlaceholder =
      document.getElementById("translation-text") ||
      document.getElementById("search-input");

    // Only initialize if we have dropdowns
    if (this.dropdowns && this.dropdowns.length > 0) {
      this.initDropdowns();

      if (this.swapBtn) {
        this.initSwapButton();
      }
    }

    console.log("I am being initialize");
  }

  initDropdowns() {
    this.dropdowns.forEach((dropdown) => {
      const btn = dropdown.querySelector(".dropdown-btn");

      if (!btn) return; // Skip if button doesn't exist

      btn.addEventListener("click", (e) => {
        e.stopPropagation();

        // Close any open dropdowns first
        this.dropdowns.forEach((d) => {
          if (d !== dropdown && d.classList.contains("active")) {
            d.classList.remove("active");
          }
        });

        dropdown.classList.toggle("active");
      });

      const options = dropdown.querySelectorAll(".dropdown-content a");
      options.forEach((option) => {
        option.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const selectedLang = option.textContent;

          // Use the original btn reference instead of newBtn
          btn.innerHTML = `${selectedLang} <i class="fas fa-chevron-down"></i>`;
          dropdown.classList.remove("active");

          // Check if function exists before calling
          if (typeof this.updateLanguagePair === "function") {
            this.updateLanguagePair();
          }
        });
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", () => {
      this.dropdowns.forEach((dropdown) => {
        dropdown.classList.remove("active");
      });
    });
  }

  initSwapButton() {
    this.swapBtn.addEventListener("click", () => {
      const sourceLang = this.sourceLanguageBtn.textContent
        .trim()
        .split(" ")[0];
      const targetLang = this.targetLanguageBtn.textContent
        .trim()
        .split(" ")[0];

      console.log("sourceLang :" + sourceLang);
      console.log("targetLang :" + targetLang);

      this.sourceLanguageBtn.innerHTML = `${targetLang} <i class="fas fa-chevron-down"></i>`;
      this.targetLanguageBtn.innerHTML = `${sourceLang} <i class="fas fa-chevron-down"></i>`;

      this.updateLanguagePair();
    });
  }

  updateLanguagePair() {
    const sourceLang = this.sourceLanguageBtn.textContent.trim().split(" ")[0];
    const targetLang = this.targetLanguageBtn.textContent.trim().split(" ")[0];

    // Safe updates: check if elements exist first
    if (this.languagePairHeading) {
      this.languagePairHeading.innerHTML = `<i class="fas fa-language"></i> Experience seamless translation: <span class="highlight">${sourceLang} ⟷ ${targetLang}</span>`;
    }

    if (this.languagePairFooter) {
      this.languagePairFooter.textContent = `${sourceLang} - ${targetLang}`;
    }

    if (this.translationPlaceholder) {
      this.translationPlaceholder.placeholder = `Translate from ${sourceLang} into ${targetLang}`;
    }
  }
}

// Image Upload and Camera Functionality

class ImageHandler {
  constructor() {
    // Get elements
    this.uploadBtn = document.querySelector(".upload-btn");
    this.cameraBtn = document.querySelector(".camera-btn");
    this.imageUploadInput = document.getElementById("image-upload");
    this.translationInput =
      document.getElementById("translation-text") ||
      document.getElementById("search-input");

    // Camera modal elements
    this.modal = document.getElementById("camera-modal");
    this.closeModalBtn = document.querySelector(".close-modal");
    this.cameraPreview = document.getElementById("camera-preview");
    this.cameraCanvas = document.getElementById("camera-canvas");
    this.captureBtn = document.getElementById("capture-btn");
    this.retakeBtn = document.getElementById("retake-btn");
    this.usePhotoBtn = document.getElementById("use-photo-btn");

    // Stream variables
    this.stream = null;
    this.capturedImage = null;

    // Create image preview container
    this.createImagePreviewContainer();

    // Initialize image recognition service
    this.recognitionService = new ImageRecognitionService();

    // Initialize event listeners
    this.initEventListeners();
  }

  createImagePreviewContainer() {
    // Create container for image preview
    this.previewContainer = document.createElement("div");
    this.previewContainer.className = "image-preview-container";

    // Create image element
    this.previewImage = document.createElement("img");
    this.previewImage.className = "image-preview";
    this.previewContainer.appendChild(this.previewImage);

    // Create loading indicator
    this.loadingIndicator = document.createElement("div");
    this.loadingIndicator.className = "loading-indicator";
    this.loadingIndicator.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Analyzing image...';
    this.loadingIndicator.style.display = "none";
    this.previewContainer.appendChild(this.loadingIndicator);

    // Create recognized text element
    this.recognizedTextElement = document.createElement("div");
    this.recognizedTextElement.className = "recognized-text";
    this.previewContainer.appendChild(this.recognizedTextElement);

    // Create remove button
    this.removeBtn = document.createElement("button");
    this.removeBtn.className = "remove-image-btn";
    this.removeBtn.innerHTML = '<i class="fas fa-times"></i> Remove image';
    this.previewContainer.appendChild(this.removeBtn);

    // Add container after translation input
    const translationInput =
      document.querySelector(".translation-input") ||
      document.querySelector(".search-input-container");
    if (translationInput) {
      translationInput.after(this.previewContainer);
    }
  }

  initEventListeners() {
    // Upload button click
    if (this.uploadBtn) {
      this.uploadBtn.addEventListener("click", () => {
        this.imageUploadInput.click();
      });
    }

    // Camera button click
    if (this.cameraBtn) {
      this.cameraBtn.addEventListener("click", () => {
        this.openCameraModal();
      });
    }

    // Handle file selection for upload
    if (this.imageUploadInput) {
      this.imageUploadInput.addEventListener("change", (e) => {
        this.handleImageSelection(e.target.files);
      });
    }

    // Remove image button
    this.removeBtn.addEventListener("click", () => {
      this.removeImage();
    });

    // Camera modal events
    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener("click", () => {
        this.closeCameraModal();
      });
    }

    // Capture button
    if (this.captureBtn) {
      this.captureBtn.addEventListener("click", () => {
        this.capturePhoto();
      });
    }

    // Retake button
    if (this.retakeBtn) {
      this.retakeBtn.addEventListener("click", () => {
        this.retakePhoto();
      });
    }

    // Use photo button
    if (this.usePhotoBtn) {
      this.usePhotoBtn.addEventListener("click", () => {
        this.usePhoto();
      });
    }

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeCameraModal();
      }
    });
  }

  async handleImageSelection(files) {
    if (files && files[0]) {
      const file = files[0];

      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Create a URL for the image
      const imageUrl = URL.createObjectURL(file);

      // Display the image
      this.previewImage.src = imageUrl;
      this.previewContainer.style.display = "block";

      // Show loading indicator
      this.loadingIndicator.style.display = "block";
      this.recognizedTextElement.textContent = "";

      try {
        // Get the source language from the UI
        const sourceLanguageElement = document.querySelector(".dropdown-btn");
        const sourceLanguage = sourceLanguageElement
          ? sourceLanguageElement.textContent.trim().split(" ")[0].toLowerCase()
          : "french";

        // Recognize objects in the image
        const recognizedText = await this.recognitionService.recognizeImage(
          file,
          sourceLanguage
        );

        // Display the recognized text
        this.recognizedTextElement.textContent = `Recognized: ${recognizedText}`;

        // Set the recognized text in the translation input
        if (this.translationInput) {
          this.translationInput.value = recognizedText;
        }

        console.log("Image analyzed:", recognizedText);
      } catch (error) {
        console.error("Error analyzing image:", error);
        this.recognizedTextElement.textContent =
          "Error analyzing image. Please try again.";
      } finally {
        // Hide loading indicator
        this.loadingIndicator.style.display = "none";
      }

      console.log("Image selected:", file.name);
    }
  }

  removeImage() {
    // Clear the image preview
    this.previewImage.src = "";
    this.previewContainer.style.display = "none";
    this.recognizedTextElement.textContent = "";

    // Reset file input
    this.imageUploadInput.value = "";

    console.log("Image removed");
  }

  openCameraModal() {
    // Show the modal
    this.modal.style.display = "block";

    // Reset UI
    this.cameraPreview.style.display = "block";
    this.cameraCanvas.style.display = "none";
    this.captureBtn.style.display = "block";
    this.retakeBtn.style.display = "none";
    this.usePhotoBtn.style.display = "none";

    // Start the camera
    this.startCamera();
  }

  closeCameraModal() {
    // Hide the modal
    this.modal.style.display = "none";

    // Stop the camera stream
    this.stopCamera();
  }

  startCamera() {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support camera access");
      this.closeCameraModal();
      return;
    }

    // Request camera access
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.stream = stream;
        this.cameraPreview.srcObject = stream;
        this.captureBtn.disabled = false;
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
        alert("Could not access camera. Please check your permissions.");
        this.closeCameraModal();
      });
  }

  stopCamera() {
    // Stop all tracks in the stream
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  capturePhoto() {
    // Get the canvas context
    const context = this.cameraCanvas.getContext("2d");

    // Set canvas dimensions to match video
    this.cameraCanvas.width = this.cameraPreview.videoWidth;
    this.cameraCanvas.height = this.cameraPreview.videoHeight;

    // Draw the current video frame on the canvas
    context.drawImage(
      this.cameraPreview,
      0,
      0,
      this.cameraCanvas.width,
      this.cameraCanvas.height
    );

    // Get the image data URL
    this.capturedImage = this.cameraCanvas.toDataURL("image/png");

    // Update UI
    this.cameraPreview.style.display = "none";
    this.cameraCanvas.style.display = "block";
    this.captureBtn.style.display = "none";
    this.retakeBtn.style.display = "inline-block";
    this.usePhotoBtn.style.display = "inline-block";
  }

  retakePhoto() {
    // Reset UI
    this.cameraPreview.style.display = "block";
    this.cameraCanvas.style.display = "none";
    this.captureBtn.style.display = "block";
    this.retakeBtn.style.display = "none";
    this.usePhotoBtn.style.display = "none";

    // Clear captured image
    this.capturedImage = null;
  }

  async usePhoto() {
    if (this.capturedImage) {
      // Display the captured image in the preview container
      this.previewImage.src = this.capturedImage;
      this.previewContainer.style.display = "block";

      // Close the modal
      this.closeCameraModal();

      // Show loading indicator
      this.loadingIndicator.style.display = "block";
      this.recognizedTextElement.textContent = "";

      try {
        // Get the source language from the UI
        const sourceLanguageElement = document.querySelector(".dropdown-btn");
        const sourceLanguage = sourceLanguageElement
          ? sourceLanguageElement.textContent.trim().split(" ")[0].toLowerCase()
          : "french";

        // Recognize objects in the image
        const recognizedText = await this.recognitionService.recognizeImage(
          this.capturedImage,
          sourceLanguage
        );

        // Display the recognized text
        this.recognizedTextElement.textContent = `Recognized: ${recognizedText}`;

        // Set the recognized text in the translation input
        if (this.translationInput) {
          this.translationInput.value = recognizedText;
        }

        console.log("Image analyzed:", recognizedText);
      } catch (error) {
        console.error("Error analyzing image:", error);
        this.recognizedTextElement.textContent =
          "Error analyzing image. Please try again.";
      } finally {
        // Hide loading indicator
        this.loadingIndicator.style.display = "none";
      }

      console.log("Photo captured and used");
    }
  }
}

// Image Recognition Service uses Gemini Pro Vision API
class ImageRecognitionService {
  // --- Configuration ---
  // IMPORTANT: Replace with your actual Gemini API key from Google AI Studio.
  // !! DO NOT hardcode this in production client-side code !!
  #apiKey = "process.env.GEMINI_API_KEY"; // CHANGE THIS TO YOUR API KEY
  #apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
    this.#apiKey
  }`;

  /**
   * Converts an image File object to a Base64 encoded string.
   * @param {File} file - The image file object.
   * @returns {Promise<string>} A promise that resolves with the Base64 string (without prefix).
   */
  convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) {
        return reject(new Error("Invalid file type. Please provide an image."));
      }
      const reader = new FileReader();
      reader.onload = () => {
        // result is "data:image/jpeg;base64,..." - we only want the part after the comma
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file); // Reads the file as a data URL (includes base64)
    });
  }

  /**
   * Calls the Gemini Pro Vision API to identify the main object in an image.
   * @param {string} imageDataBase64 - The Base64 encoded image data.
   * @param {string} imageMimeType - The MIME type of the image (e.g., "image/jpeg").
   * @param {string} [language='English'] - The desired language for the object name (e.g., 'English', 'French').
   * @returns {Promise<string|null>} A promise that resolves with the identified object name/description in the specified language, or null on error/block.
   */
  async identifyObjectWithGemini(
    imageBase64,
    imageMimeType,
    language = "English"
  ) {
    // Construct the prompt for Gemini
    const prompt = `Identify the main object or scene in this image. Return only the most specific and common name for it in ${language}. If unsure, provide the most likely category. Do not add any explanation or preamble.`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: imageMimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      // Optional: Add generationConfig for safety settings, etc. if needed
      // generationConfig: { ... },
      // safetySettings: [ ... ]
    };

    try {
      console.log("Sending request to Gemini API...");
      const response = await fetch(this.#apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json(); // Try parsing JSON regardless of status for error details

      if (!response.ok) {
        console.error("API Error Response:", responseData);
        const errorMessage =
          responseData?.error?.message ||
          `API request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      console.log("API Response:", responseData);

      // --- Extract the text result ---
      const candidate = responseData.candidates?.[0];
      if (candidate?.content?.parts?.[0]?.text) {
        const resultText = candidate.content.parts[0].text.trim();
        console.log("Identified Object Name:", resultText);
        return resultText; // Success!
      } else if (responseData.promptFeedback?.blockReason) {
        // Handle cases where the prompt or image was blocked
        console.warn(
          `Request blocked: ${responseData.promptFeedback.blockReason}`,
          responseData.promptFeedback.safetyRatings
        );
        return `Blocked: ${responseData.promptFeedback.blockReason}`; // Return specific block reason
      } else {
        console.error(
          "Could not extract text from API response structure.",
          responseData
        );
        throw new Error("Invalid API response structure received.");
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      // Propagate the error or return null to indicate failure
      // Depending on how you want the calling code to handle it
      // Returning null might be simpler for the caller to check
      return null;
    }
  }

  /**
   * Orchestrates the process: takes a File object, converts it, and calls the API.
   * @param {File} imageFile - The image file object from an input element.
   * @param {string} [language='English'] - The desired language for the result.
   * @returns {Promise<string|null>} A promise resolving with the identified name, a block reason, or null on error.
   */
  async recognizeImage(imageFile, language = "English") {
    try {
      // 1. Validate and Convert image to Base64
      const imageDataBase64 = await this.convertImageToBase64(imageFile);
      const imageMimeType = imageFile.type;

      // 2. Call the Gemini API
      const identifiedName = await this.identifyObjectWithGemini(
        imageDataBase64,
        imageMimeType,
        language
      );

      return identifiedName;
    } catch (error) {
      console.error("Error processing image file:", error);
      return null;
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Check login status
  checkLoginStatus();

  // const langSelector = new LanguageSelector();
  // const imageHandler = new ImageHandler();

  const userProfile = document.getElementById("user-profile");
  if (userProfile) {
    userProfile.addEventListener("click", function () {
      // Show user menu or profile options
      console.log("User profile clicked");
      // You could add dropdown menu here
    });
  }

  const userDropdown = document.getElementById("user-dropdown");
  const userEmail = document.getElementById("user-email");
  const loginLink = document.getElementById("login-link");
  const logoutLink = document.getElementById("logout-link");

  // Toggle dropdown when clicking on profile
  if (userProfile) {
    userProfile.addEventListener("click", function (e) {
      e.stopPropagation();
      userDropdown.style.display =
        userDropdown.style.display === "block" ? "none" : "block";

      // Update user email in dropdown
      if (userEmail) {
        userEmail.textContent = localStorage.getItem("userEmail") || "User";
      }
    });
  }

  // Handle logout
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();

      // Clear authentication data
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      localStorage.removeItem("userAvatar");

      // Redirect to login page or refresh current page
      window.location.href = "index.html";
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", function () {
    if (userDropdown) {
      userDropdown.style.display = "none";
    }
  });

  const keyboardContainer = document.getElementById("aglc-keyboard");

  const closeKeyboardBtn = document.querySelector(".close-keyboard");

  // Close the keyboard when the button is clicked
  closeKeyboardBtn.addEventListener("click", function () {
    keyboardContainer.style.display = "none";
  });

  const keyboardBtn = document.querySelector(".keyboard-btn");

  const textInput = document.getElementById("translation-text");
  let isShiftActive = false;
  let isCapsActive = false;

  // Afficher / Cacher le clavier
  keyboardBtn.addEventListener("click", function () {
    console.log(keyboardContainer.style.display);
    keyboardContainer.style.display =
      keyboardContainer.style.display === "none" ? "flex" : "none";
    console.log(keyboardContainer.style.display);
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

  document.addEventListener("click", (event) => {
    const keyboardContainer = document.getElementById("aglc-keyboard");
    if (
      !event.target.closest("#aglc-keyboard") &&
      !event.target.closest(".keyboard-btn")
    ) {
      keyboardContainer.style.display = "none";
    }
  });

  let isDragging = false;
  let offset = { x: 0, y: 0 };

  keyboardContainer.addEventListener("mousedown", (e) => {
    isDragging = true;
    offset.x = e.clientX - keyboardContainer.getBoundingClientRect().left;
    offset.y = e.clientY - keyboardContainer.getBoundingClientRect().top;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      keyboardContainer.style.position = "absolute";
      keyboardContainer.style.left = `${e.clientX - offset.x}px`;
      keyboardContainer.style.top = `${e.clientY - offset.y}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

});
