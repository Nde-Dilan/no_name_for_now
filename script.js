// Language selector functionality
class LanguageSelector {
    constructor() {
        this.dropdowns = document.querySelectorAll('.dropdown');
        this.sourceLanguageBtn = document.querySelector('.dropdown-btn');
        this.targetLanguageBtn = document.querySelectorAll('.dropdown-btn')[1];
        this.swapBtn = document.querySelector('.swap-btn');
        this.languagePairHeading = document.querySelector('.language-pair');
        this.languagePairFooter = document.querySelector('.language-pair-footer');
        this.translationPlaceholder = document.getElementById('translation-text');
        
        this.initDropdowns();
        this.initSwapButton();
    }
    
    initDropdowns() {
        this.dropdowns.forEach(dropdown => {
            const btn = dropdown.querySelector('.dropdown-btn');
            
            btn.addEventListener('click', () => {
                // Close any open dropdowns first
                this.dropdowns.forEach(d => {
                    if (d !== dropdown && d.classList.contains('active')) {
                        d.classList.remove('active');
                    }
                });
                
                dropdown.classList.toggle('active');
            });
            
            const options = dropdown.querySelectorAll('.dropdown-content a');
            options.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    const selectedLang = option.textContent;
                    btn.innerHTML = `${selectedLang} <i class="fas fa-chevron-down"></i>`;
                    dropdown.classList.remove('active');
                    this.updateLanguagePair();
                });
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                this.dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
    }
    
    initSwapButton() {
        this.swapBtn.addEventListener('click', () => {
            const sourceLang = this.sourceLanguageBtn.textContent.trim().split(' ')[0];
            const targetLang = this.targetLanguageBtn.textContent.trim().split(' ')[0];
            
            this.sourceLanguageBtn.innerHTML = `${targetLang} <i class="fas fa-chevron-down"></i>`;
            this.targetLanguageBtn.innerHTML = `${sourceLang} <i class="fas fa-chevron-down"></i>`;
            
            this.updateLanguagePair();
        });
    }
    
    updateLanguagePair() {
        const sourceLang = this.sourceLanguageBtn.textContent.trim().split(' ')[0];
        const targetLang = this.targetLanguageBtn.textContent.trim().split(' ')[0];
        
        this.languagePairHeading.textContent = `Dictionary ${sourceLang} - ${targetLang}`;
        this.languagePairFooter.textContent = `${sourceLang} - ${targetLang}`;
        this.translationPlaceholder.placeholder = `Translate from ${sourceLang} into ${targetLang}`;
    }
}

// Initialize language selector on page load
document.addEventListener('DOMContentLoaded', () => {
    const langSelector = new LanguageSelector();
});
function redirectToResults() {
    const translationText = document.getElementById('translation-text').value;
    const encodedText = encodeURIComponent(translationText);
    window.location.href = `results.html?query=${encodedText}`;
}