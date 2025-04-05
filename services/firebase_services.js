// Replace the CDN imports with npm imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  limit,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Firebase Configuration - Make sure these details match exactly with your Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyBG9hSiIewb3KKdl8mETiWFgbJ81KYqJDA",
  authDomain: "cammt-b8746.firebaseapp.com",
  projectId: "cammt-b8746",
  storageBucket: "cammt-b8746.appspot.com", // Check this carefully
  messagingSenderId: "735271738397",
  appId: "1:735271738397:web:20f5d2c18592efbe23faf4",
  measurementId: "G-4VWQJBGPGJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Translation Service
export class TranslationService {
  constructor() {
    this.translationsRef = collection(db, "translations");
  }

  /**
   * Add a new translation to Firestore
   */
  async addTranslation(translationData) {
    try {
      // Add user info if available
      const currentUser = auth.currentUser;
      if (currentUser) {
        translationData.userId = currentUser.uid;
        translationData.userEmail = currentUser.email;
      }

      // Add metadata
      translationData.timestamp = new Date();
      translationData.verified = false; // New translations need verification

      // For testing: log the data being sent
      console.log("Sending translation data:", translationData);

      // Add to Firestore
      const docRef = await addDoc(this.translationsRef, translationData);
      console.log("Translation added with ID:", docRef.id);
      return docRef;
    } catch (error) {
      console.error("Error adding translation:", error);
      throw error;
    }
  }

  /**
   * Search for translations in Firestore
   */
  async searchTranslations(sourceLanguage, targetLanguage, text) {
    try {
      console.log(
        `Searching for: ${sourceLanguage} -> ${targetLanguage}: "${text}"`
      );

      // Create a query for exact matches
      const q = query(
        this.translationsRef,
        where("sourceLang", "==", sourceLanguage),
        where("targetLang", "==", targetLanguage),
        where("sourceText", "==", text.toLowerCase()),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      const translations = [];

      querySnapshot.forEach((doc) => {
        translations.push({ id: doc.id, ...doc.data() });
      });

      console.log(`Found ${translations.length} translations`);
      return translations;
    } catch (error) {
      console.error("Error searching translations:", error);
      throw error;
    }
  }

  /**
   * Search for similar translations
   */
  async searchSimilarTranslations(sourceLanguage, targetLanguage, text) {
    // In a real app, you'd want to implement more sophisticated search
    try {
      // For now, just return an empty array to avoid errors
      return [];
    } catch (error) {
      console.error("Error searching similar translations:", error);
      return [];
    }
  }
}
