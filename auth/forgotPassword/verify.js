// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBG9hSiIewb3KKdl8mETiWFgbJ81KYqJDA",
    authDomain: "cammt-b8746.firebaseapp.com",
    projectId: "cammt-b8746",
    storageBucket: "cammt-b8746.firebasestorage.app",
    messagingSenderId: "735271738397",
    appId: "1:735271738397:web:20f5d2c18592efbe23faf4",
    measurementId: "G-4VWQJBGPGJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function () {
    const forgotForm = document.getElementById("forgot-form");
    const verificationSent = document.getElementById("verification-sent");
    const sendVerificationBtn = document.getElementById("send-verification");
    const emailInput = document.getElementById("email");

    // Handle form submission
    document.getElementById("password-reset-form").addEventListener("submit", function (e) {
        e.preventDefault();

        if (emailInput.value.trim() === "") {
            alert("Please enter your email address");
            return;
        }

        sendVerificationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        sendVerificationBtn.disabled = true;

        sendPasswordResetEmail(auth, emailInput.value)
            .then(() => {
                forgotForm.style.display = "none";
                verificationSent.style.display = "block";
                document.querySelector(".verification-message").innerText =
                    "We've sent a password reset link to your email. Please check your inbox and spam folder.";
            })
            .catch((error) => {
                alert(error.message);
                sendVerificationBtn.innerHTML = "Verify email <i class='fas fa-arrow-right'></i>";
                sendVerificationBtn.disabled = false;
            });
    });
});
