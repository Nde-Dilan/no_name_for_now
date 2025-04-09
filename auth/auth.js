// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBG9hSiIewb3KKdl8mETiWFgbJ81KYqJDA",
  authDomain: "cammt-b8746.firebaseapp.com",
  projectId: "cammt-b8746",
  storageBucket: "cammt-b8746.firebasestorage.app",
  messagingSenderId: "735271738397",
  appId: "1:735271738397:web:20f5d2c18592efbe23faf4",
  measurementId: "G-4VWQJBGPGJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to show messages in UI
function showMessage(container, message, isSuccess) {
  container.innerHTML = `<p class="message ${
    isSuccess ? "success" : "error"
  }">${message}</p>`;
  setTimeout(() => {
    container.innerHTML = "";
  }, 5000);
}

// Handle Signup
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.querySelector(".auth-form form");
  // Create a single message container outside the event listeners
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");

  if (signupForm) {
    signupForm.parentNode.insertBefore(messageContainer, signupForm);
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const signupBtn = signupForm.querySelector("button");

      signupBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Signing up...';
      signupBtn.disabled = true;

      try {
        await createUserWithEmailAndPassword(auth, email, password);
        showMessage(
          messageContainer,
          "Signup successful! Redirecting...",
          true
        );
        setTimeout(() => (window.location.href = "login.html"), 1500);
      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          showMessage(
            messageContainer,
            "This email is already registered. Please use login instead.",
            false
          );
          // Clear the email field to prevent it from showing up in the login form
          document.getElementById("email").value = "";

          // Redirect to login page after a delay
          setTimeout(() => (window.location.href = "login.html"), 3000);
        } else {
          showMessage(messageContainer, error.message, false);
        }
      }

      signupBtn.innerHTML = "Signup";
      signupBtn.disabled = false;
    });
  }

  // Handle Login
  const loginForm = document.querySelector(".auth-form form");
  // Use the same message container for login
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const loginBtn = loginForm.querySelector("button");

      loginBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Logging in...';
      loginBtn.disabled = true;

      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Store authentication state in localStorage
        localStorage.setItem("isLoggedIn", "true");
        // Store user information
        localStorage.setItem("userEmail", user.email);
        // If you have a display name or photo URL from Firebase
        if (user.displayName)
          localStorage.setItem("userName", user.displayName);
        if (user.photoURL) localStorage.setItem("userAvatar", user.photoURL);

        showMessage(
          messageContainer,
          "Login successful! Redirecting...",
          true
        );
        setTimeout(() => (window.location.href = "../index.html"), 1500);
      } catch (error) {
        showMessage(messageContainer, error.message, false);
      }

      loginBtn.innerHTML = "Login";
      loginBtn.disabled = false;
    });
  }
});
