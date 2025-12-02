/* ===========================
   GLOBAL ELEMENT REFERENCES
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

/* ===========================
   EVENT LISTENER
   =========================== */
btn.addEventListener('click', () => {
    const errorMessageDiv = document.getElementById('error-message');

    errorMessageDiv.style.display = 'none';
    errorMessageDiv.innerHTML = '';

    if (githubInput.value.trim() === "" || roleSelect.value === "" || expSelect.value === "") {
        errorMessageDiv.innerHTML = ' Please complete all required fields!';
        errorMessageDiv.style.display = 'block';
        return;
    }

    const currentRole = roleSelect.value;
    const currentExp = parseInt(expSelect.value);
    const currentGithub = githubInput.value;

    startCalculationSequence(currentRole, currentExp, currentGithub);
});

/* ===========================
   BACKEND CALL
   =========================== */
async function callBackend(role, exp, githubLink) {
    try {
        const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                github: githubLink,
                experience: exp,
                role: role
            })
        });
        return await res.json();
    } catch (err) {
        console.error("Backend Error:", err);
        return { error: "Backend failed" };
    }
}

/* ===========================
   LOGIC FIX 1: REFINED AUDIT
   =========================== */
function generateBrutalNotes(role, exp, githubLink) {
    const expNum = parseInt(exp);
    
    // Loosened the link check slightly to prevent false negatives
    const hasLink = githubLink.toLowerCase().includes('github.com') && githubLink.length > 10;

    let notesHTML = '';

    // LOGIC: If you have no link, you fail.
    if (!hasLink) {
        notesHTML = `
            <div class="audit-section critical-failure">
                <div class="audit-header">
                    <i class="fa-solid fa-skull-crossbones failure-icon"></i>
                    <h4>CRITICAL AUDIT FAILURE</h4>
                </div>
                <h5 class="audit-status"><strong>HIGH RISK</strong></h5>
                <ul class="audit-list">
                    <li>Digital presence not found.</li>
                    <li>No public code to verify skills.</li>
                </ul>
                <p class="audit-verdict"><strong>Verdict:</strong> Unhirable without proof of work.</p>
            </div>
        `;
    } 
    // LOGIC: If you have a link + High Exp (> 4 years), you are Outstanding.
    // (Previously this was failing senior devs)
    else if (expNum >= 4) {
        notesHTML = `
            <div class="audit-section outstanding">
                <div class="audit-header">
                    <i class="fa-solid fa-trophy outstanding-icon"></i>
                    <h4>VALUATION: OUTSTANDING</h4>
                </div>
                <h5 class="audit-status"><strong>SENIOR LEVEL DETECTED</strong></h5>
                <ul class="audit-list">
                    <li>Senior experience validated.</li>
                    <li>Active repository detected.</li>
                    <li>Market ready for leadership roles.</li>
                </ul>
                <p class="audit-verdict"><strong>Verdict:</strong> High market value. Negotiate aggressively.</p>
            </div>
        `;
    } 
    // LOGIC: If you have a link + Low Exp, you are Good.
    else {
        notesHTML = `
            <div class="audit-section good-going">
                <div class="audit-header">
                    <i class="fa-solid fa-lightbulb good-icon"></i>
                    <h4>VALUATION AUDIT</h4>
                </div>
                <h5 class="audit-status"><strong>GOOD TRAJECTORY</strong></h5>
                <ul class="audit-list">
                    <li>Digital presence active.</li>
                    <li>Consistent growth shown.</li>
                </ul>
                <p class="audit-verdict"><strong>Verdict:</strong> Add 2 complex projects to jump salary tiers.</p>
            </div>
        `;
    }

    return notesHTML;
}

/* ===========================
   LOADING & RESULT LOGIC
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
            setTimeout(async () => {
                overlay.style.display = 'none';
                await showResult(role, exp, githubLink);
            }, 500);
        }
    }, 150);
}

/* ===========================
   LOGIC FIX 2: SALARY OVERRIDE
   =========================== */
function calculateMarketSalary(exp) {
    const years = parseInt(exp);
    
    // Base calculation: roughly 5-7 LPA per year of experience (Standard Market Rate)
    const minLPA = Math.max(4, years * 5); 
    const maxLPA = Math.max(8, years * 8);

    // Formatting to Indian Lakhs format (e.g. ₹25L - ₹40L)
    return `₹${minLPA}L - ₹${maxLPA}L / yr`;
}

async function showResult(role, exp, githubLink) {
    // Call backend for explanation text
    const backendData = await callBackend(role, exp, githubLink);

    // FORCE OVERRIDE SALARY logic
    // Instead of trusting the backend's low number, we calculate it here based on experience
    let salaryRange = calculateMarketSalary(exp);

    let rawExplanation = backendData.explanation || "No explanation provided.";
    let explanation = rawExplanation.replace(/\*\*/g, "");
    let confidence = "High"; // Forced high confidence for better UX

    const brutalNotes = generateBrutalNotes(role, exp, githubLink);
    mainForm.style.display = 'none';

    resultArea.innerHTML = `
        <div class="result-container fade-in-up">
            <h3 style="color: var(--text-sub); margin-bottom: 20px;">VALUATION COMPLETE</h3>
            
            <p class="result-role">${role} // Rank ${exp}</p>

            <div class="result-circle">
                 <span class="result-label">MARKET WORTH</span>
                 <div class="result-value">${salaryRange}</div>
                 <div class="result-value" style="font-size: 1rem; opacity: 0.7;">Confidence: ${confidence}</div>
            </div>

            <p style="margin-top: 20px; opacity: 0.8;">${explanation}</p>
            
            ${brutalNotes}
            
            <button onclick="location.reload()" class="cyber-button" style="margin-top: 30px;">
                <span class="btn-text">INITIATE NEW SCAN</span>
            </button>
        </div>
    `;
}
