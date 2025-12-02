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
   BRUTAL NOTES LOGIC
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
                <h5 class="audit-status"><strong>HIGH RISK</strong></h5>
                <ul class="audit-list">
                    <li>Digital presence severely lacking.</li>
                    <li>No consistent public commit activity found.</li>
                    <li>Insufficient high-impact projects.</li>
                </ul>
                <p class="audit-verdict"><strong>Verdict:</strong> Build strong public work to improve valuation.</p>
            </div>
        `;
    } else if (expNum < 3 || !isHighRole) {
        notesHTML = `
            <div class="audit-section good-going">
                <div class="audit-header">
                    <i class="fa-solid fa-lightbulb good-icon"></i>
                    <h4>VALUATION AUDIT</h4>
                </div>
                <h5 class="audit-status"><strong>GOOD START</strong></h5>
                <ul class="audit-list">
                    <li>Decent digital presence for early-level roles.</li>
                    <li>Shows learning momentum in key areas.</li>
                </ul>
                <p class="audit-verdict"><strong>Verdict:</strong> Build 2 more high-impact projects to grow fast.</p>
            </div>
        `;
    } else {
        notesHTML = `
            <div class="audit-section outstanding">
                <div class="audit-header">
                    <i class="fa-solid fa-trophy outstanding-icon"></i>
                    <h4>VALUATION: OUTSTANDING</h4>
                </div>
                <h5 class="audit-status"><strong>IMPRESSIVE</strong></h5>
                <ul class="audit-list">
                    <li>High-impact projects detected.</li>
                    <li>Strong commit frequency.</li>
                    <li>Profile aligned with senior-level expectations.</li>
                </ul>
                <p class="audit-verdict"><strong>Verdict:</strong> Exceptional digital footprint. Keep dominating.</p>
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

async function showResult(role, exp, githubLink) {
    // 🔥 CALL BACKEND HERE
    const backendData = await callBackend(role, exp, githubLink);

    let salaryRange = backendData.salary_range || "N/A";
    let explanation = backendData.explanation || "No explanation provided.";
    let confidence = backendData.confidence || "N/A";

    const brutalNotes = generateBrutalNotes(role, exp, githubLink);
    mainForm.style.display = 'none';

    resultArea.innerHTML = `
        <div class="result-container fade-in-up">
            <h3 style="color: var(--text-sub); margin-bottom: 20px;">VALUATION COMPLETE</h3>
            
            <p class="result-role">${role} // Rank ${exp}</p>

            <div class="result-circle">
                 <span class="result-label">AI ESTIMATED RANGE</span>
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
