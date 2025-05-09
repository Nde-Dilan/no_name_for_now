// ==========================
// Firebase Imports
// ==========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs,
  query, where, orderBy, limit
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// ==========================
// Firebase Configuration
// ==========================
const firebaseConfig = {
  apiKey: "AIzaSyBG9hSiIewb3KKdl8mETiWFgbJ81KYqJDA",
  authDomain: "cammt-b8746.firebaseapp.com",
  projectId: "cammt-b8746",
  storageBucket: "cammt-b8746.appspot.com",
  messagingSenderId: "735271738397",
  appId: "1:735271738397:web:20f5d2c18592efbe23faf4",
  measurementId: "G-4VWQJBGPGJ"
};

// ==========================
// Initialize Firebase
// ==========================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

// ==========================
// Translation Service Class
// ==========================
export class TranslationService {
  constructor() {
    this.translationsRef = collection(db, "translations");

    this.langMap = {
      fulfulde: "fulfulde",
      french: "french",
      english: "english",
      ghomala: "ghomálá",
      ghomála: "ghomálá",
      ghomálá: "ghomálá"
    };
  }

  // Normalize input: remove accents, punctuation, and convert to lowercase
  normalize(str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")     // Remove accents
      .replace(/[^a-z]/gi, "")             // Remove non-alphabet characters
      .toLowerCase();
  }

  // ==========================
  // Add Translation
  // ==========================
  async addTranslation(translationData) {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        translationData.userId = currentUser.uid;
        translationData.userEmail = currentUser.email;
      }

      translationData.timestamp = new Date();
      translationData.verified = false;

      const docRef = await addDoc(this.translationsRef, translationData);
      return docRef;
    } catch (error) {
      console.error("Error adding translation:", error);
      throw error;
    }
  }

  // ==========================
  // Search Translations (Exact Match)
  // ==========================
  async searchTranslations(sourceLanguage, targetLanguage, text) {
    try {
      console.log("searchTranslations() called with:");
      console.log("sourceLanguage (raw):", sourceLanguage);
      console.log("targetLanguage (raw):", targetLanguage);

      // Strip quotes and whitespace
      sourceLanguage = sourceLanguage.trim().replace(/^['"]+|['"]+$/g, "");
      targetLanguage = targetLanguage.trim().replace(/^['"]+|['"]+$/g, "");

      const srcLangKey = this.langMap[this.normalize(sourceLanguage)];
      const tgtLangKey = this.langMap[this.normalize(targetLanguage)];

      console.log("Normalized source:", this.normalize(sourceLanguage));
      console.log("Normalized target:", this.normalize(targetLanguage));
      console.log("srcLangKey:", srcLangKey);
      console.log("tgtLangKey:", tgtLangKey);

      if (!srcLangKey || !tgtLangKey) {
        throw new Error("Unsupported language.");
      }

      const filePath = (srcLangKey === "ghomálá" || tgtLangKey === "ghomálá")
        ? "ghomálá_translations.json"
        : "fulfulde_translations.json";

      const response = await fetch(filePath);
      const allTranslations = await response.json();

      const results = allTranslations
        .filter(entry => {
          const normalized = {
            fulfulde: entry.Fulfulde || entry.fulfulde,
            french: entry.French || entry.french,
            english: entry.English || entry.english,
            ghomálá: entry["ghomálá"] || entry["ghomálá"]
          };

          return (
            normalized[srcLangKey] &&
            normalized[tgtLangKey] &&
            normalized[srcLangKey].toLowerCase() === text.toLowerCase()
          );
        })
        .map(entry => ({
          sourceText: entry[srcLangKey],
          targetText: entry[tgtLangKey]
        }))
        .slice(0, 5);

      console.log(`Found ${results.length} results for "${text}"`);
      return results;
    } catch (error) {
      console.error("Error in searchTranslations:", error);
      return [];
    }
  }

  // ==========================
  // Search Similar Translations (Fuzzy)
  // ==========================
  async searchSimilarTranslations(sourceLanguage, targetLanguage, text) {
    try {
      console.log("searchSimilarTranslations() called with:");
      console.log("sourceLanguage (raw):", sourceLanguage);
      console.log("targetLanguage (raw):", targetLanguage);

      // Strip quotes and whitespace
      sourceLanguage = sourceLanguage.trim().replace(/^['"]+|['"]+$/g, "");
      targetLanguage = targetLanguage.trim().replace(/^['"]+|['"]+$/g, "");

      const srcLangKey = this.langMap[this.normalize(sourceLanguage)];
      const tgtLangKey = this.langMap[this.normalize(targetLanguage)];

      console.log("Normalized source:", this.normalize(sourceLanguage));
      console.log("Normalized target:", this.normalize(targetLanguage));
      console.log("srcLangKey:", srcLangKey);
      console.log("tgtLangKey:", tgtLangKey);

      if (!srcLangKey || !tgtLangKey) {
        throw new Error("Unsupported language.");
      }

      const filePath = (srcLangKey === "ghomálá" || tgtLangKey === "ghomálá")
        ? "ghomálá_translations.json"
        : "fulfulde_translations.json";

      const response = await fetch(filePath);
      const allTranslations = await response.json();

      const results = allTranslations
        .filter(entry => {
          const normalized = {
            fulfulde: entry.Fulfulde || entry.fulfulde,
            french: entry.French || entry.french,
            english: entry.English || entry.english,
            ghomálá: entry["ghomálá"] || entry["ghomálá"]
          };

          return (
            normalized[srcLangKey] &&
            normalized[tgtLangKey] &&
            normalized[srcLangKey].toLowerCase().includes(text.toLowerCase())
          );
        })
        .map(entry => ({
          sourceText: entry[srcLangKey],
          targetText: entry[tgtLangKey]
        }))
        .slice(0, 5);

      return results;
    } catch (error) {
      console.error("Error searching similar translations:", error);
      return [];
    }
  }

  // ==========================
  // Get Recent User Contributions
  // ==========================
  async getRecentUserContributions(limitCount = 3) {
    try {
      const q = query(
        this.translationsRef,
        where("verified", "==", false),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const contributions = [];

      snapshot.forEach(doc => {
        contributions.push({ id: doc.id, ...doc.data() });
      });

      return contributions;
    } catch (error) {
      console.error("Error getting contributions:", error);
      return [];
    }
  }
}
