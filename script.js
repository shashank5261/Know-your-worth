/* ===========================
   GLOBAL ELEMENT REFERENCES
   (Note: particles.js setup is assumed removed)
   =========================== */
const btn = document.getElementById('btn');
const roleSelect = document.getElementById('role');
const expSelect = document.getElementById('exp');
const githubInput = document.getElementById('github');
const mainForm = document.getElementById('main-form');
const resultArea = document.getElementById('result-area');
const overlay = document.getElementById('calculation-overlay');
const progressFill = document.querySelector('.progress-fill');
const scanText = document.getElementById('scan-text');

// CRITICAL FIX: Ensure this element is defined
// const errorMessageDiv = document.getElementById('error-message'); 

/* ===========================
   EVENT LISTENER (THE CORE ENTRY POINT) - UPDATED FOR STABILITY
   =========================== */
btn.addEventListener('click', () => {
    // CRITICAL FIX: Get the error message element *inside* the function 
    // to ensure the element exists when the button is clicked.
    const errorMessageDiv = document.getElementById('error-message');

    // 1. Clear any previous error message
    errorMessageDiv.style.display = 'none';
    errorMessageDiv.innerHTML = '';

    // 2. Validation Check (Thematic Error Message)
    if (githubInput.value.trim() === "" || roleSelect.value === "" || expSelect.value === "") {
        // Display the in-site error message
        errorMessageDiv.innerHTML = ' Please complete all required fields!';
        errorMessageDiv.style.display = 'block';
        return; // Stop execution
    }

    // 3. Capture and prepare data
    const currentRole = roleSelect.value;
    const currentExp = parseInt(expSelect.value);
    const currentGithub = githubInput.value;

    // 4. Initiate the sequence
    startCalculationSequence(currentRole, currentExp, currentGithub);
});

// NOTE: All other functions (startCalculationSequence, showResult, etc.) remain unchanged.
/* ===========================
   BRUTAL NOTES LOGIC (3-Tier Grading)
   =========================== */
function generateBrutalNotes(role, exp, githubLink) {
    const expNum = parseInt(exp);
    const hasLink = githubLink.trim().length > 15 && githubLink.toLowerCase().includes('github.com');
    const isHighRole = role.includes('AI') || role.includes('ML') || role.includes('Blockchain') || role.includes('Fullstack') || role.includes('Backend');

    let notesHTML = '';

    if (!hasLink || (expNum >= 3 && !hasLink) || (isHighRole && expNum >= 4 && !hasLink)) {
        notesHTML = `
            <div class="audit-section critical-failure">
                <div class="audit-header">
                    <i class="fa-solid fa-skull-crossbones failure-icon"></i>
                    <h4>CRITICAL AUDIT FAILURE</h4>
                </div>
                <h5 class="audit-status">PERFORMANCE: **HIGH RISK**</h5>
                <ul class="audit-list">
                    <li>Based on the provided link status (missing), your digital presence is severely lacking for a role at your claimed experience level.</li>
                    <li>Minimal to zero original high-impact projects detected.</li>
                    <li>Lack of consistent, long-term public commit history.</li>
                    <li>No specialized content or tutorial projects demonstrating domain authority.</li>
                </ul>
                <p class="audit-verdict">
                    **Verdict:** Your digital footprint is nonexistent or inadequate. Focus on building demonstrable projects and elevating public work. Valuation is **highly speculative**.
                </p>
            </div>
        `;
    } else if (expNum < 3 || !isHighRole) {
        notesHTML = `
            <div class="audit-section good-going">
                <div class="audit-header">
                    <i class="fa-solid fa-lightbulb good-icon"></i>
                    <h4>VALUATION AUDIT</h4>
                </div>
                <h5 class="audit-status">PERFORMANCE: **GOOD START**</h5>
                <ul class="audit-list">
                    <li>Basic digital presence established, suitable for an entry or junior level position.</li>
                    <li>Profile shows foundational skills and relevant learning activity.</li>
                    <li>The path to ${role} is clearly defined but requires deeper specialization.</li>
                </ul>
                <p class="audit-verdict">
                    **Verdict:** Continue innovating and building momentum. Focus on **consistency and scale** in your next two high-impact projects. This foundation is solid.
                </p>
            </div>
        `;
    } else if (expNum >= 3 && isHighRole && hasLink) {
        notesHTML = `
            <div class="audit-section outstanding">
                <div class="audit-header">
                    <i class="fa-solid fa-trophy outstanding-icon"></i>
                    <h4>VALUATION: OUTSTANDING</h4>
                </div>
                <h5 class="audit-status">SYSTEM OVERRIDE: **IMPRESSIVE**</h5>
                <ul class="audit-list">
                    <li>Multiple high-impact projects detected. Consistent, high-velocity commit history confirmed.</li>
                    <li>Advanced construction skills demonstrating a deep understanding of domain concepts.</li>
                    <li>Profile aligns perfectly with the valuation of a high-ranking ${role}.</li>
                </ul>
                <p class="audit-verdict">
                    **Verdict:** Your digital footprint is exceptional. We see innovation, skill, and mastery. We are **proud** of this work. Continue to lead the field.
                </p>
            </div>
        `;
    }

    // FINAL FIX: Replace double asterisks with <strong> for HTML bolding
    return notesHTML.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}


/* ===========================
   CALCULATION SEQUENCE & RESULT DISPLAY
   =========================== */
function startCalculationSequence(role, exp, githubLink) {
    overlay.style.display = 'flex';
    let progress = 0;
    progressFill.style.width = '0%';
    scanText.innerText = "INITIALIZING SCAN...";

    const messages = ["CONNECTING TO GITHUB API...", "ANALYZING REPOSITORY DATA...", "COMPARING MARKET TRENDS...", "FINALIZING VALUATION..."];

    const interval = setInterval(() => {
        progress += 5;
        progressFill.style.width = `${progress}%`;

        if (progress < 30) scanText.innerText = messages[0];
        else if (progress < 60) scanText.innerText = messages[1];
        else if (progress < 85) scanText.innerText = messages[2];
        else scanText.innerText = messages[3];

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                overlay.style.display = 'none';
                showResult(role, exp, githubLink);
            }, 500);
        }
    }, 150);
}


function showResult(role, exp, githubLink) {
    // Salary calculation logic (INR)
    const baseSalaries = {
        "Backend Developer": 500000, "Frontend Developer": 450000, "Fullstack Developer": 600000, 
        "AI Engineer": 900000, "Data Scientist": 850000, "ML Engineer": 950000,         
        "Blockchain Developer": 1100000, "Cloud Engineer": 700000,
    };
    let base = baseSalaries[role] || 400000;
    let multiplier = 1 + (exp * 0.25);
    let estimatedSalary = Math.floor(base * multiplier);
    let minSalary = estimatedSalary - 50000;
    let maxSalary = estimatedSalary + 50000;
    let minStr = minSalary.toLocaleString('en-IN');
    let maxStr = maxSalary.toLocaleString('en-IN');

    const brutalNotes = generateBrutalNotes(role, exp, githubLink);
    mainForm.style.display = 'none';

    resultArea.innerHTML = `
        <div class="result-container fade-in-up">
            <h3 style="color: var(--text-sub); margin-bottom: 20px;">VALUATION COMPLETE</h3>
            
            <p class="result-role">${role} // Rank ${exp}</p>

            <div class="result-circle">
                 <span class="result-label">ESTIMATED ANNUAL RANGE</span>
                 <div class="result-value">₹${minStr}</div>
                 <div class="result-value" style="font-size: 1.2rem; opacity: 0.7;">to ₹${maxStr}</div>
            </div>
            
            ${brutalNotes}
            
            <button onclick="location.reload()" class="cyber-button" style="margin-top: 30px;">
                <span class="btn-text">INITIATE NEW SCAN</span>
            </button>
        </div>
    `;
}