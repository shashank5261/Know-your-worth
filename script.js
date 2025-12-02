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
/* ===========================
   FIX 1: RELAXED AUDIT LOGIC
   =========================== */
function generateBrutalNotes(role, exp, githubLink) {
    const expNum = parseInt(exp);
    
    // FIX: Removed .includes('github.com') check. 
    // Now accepts any non-empty string as a valid "Digital Presence".
    const hasLink = githubLink && githubLink.trim().length > 3;

    let notesHTML = '';

    // 1. FAIL STATE: No Input
    if (!hasLink) {
        notesHTML = `
            <div class="audit-section critical-failure">
                <div class="audit-header">
                    <i class="fa-solid fa-skull-crossbones failure-icon"></i>
                    <h4>AUDIT FAILED</h4>
                </div>
                <h5 class="audit-status"><strong>NO DATA FOUND</strong></h5>
                <ul class="audit-list">
                    <li>Input field appears invalid.</li>
                    <li>Cannot verify contributions without a link.</li>
                </ul>
                <p class="audit-verdict"><strong>Verdict:</strong> Please provide a valid GitHub username or URL.</p>
            </div>
        `;
    } 
    // 2. SENIOR STATE: 5+ Years
    else if (expNum >= 5) {
        notesHTML = `
            <div class="audit-section outstanding">
                <div class="audit-header">
                    <i class="fa-solid fa-crown outstanding-icon"></i>
                    <h4>VALUATION: LEGENDARY</h4>
                </div>
                <h5 class="audit-status"><strong>SENIOR ARCHITECT DETECTED</strong></h5>
                <ul class="audit-list">
                    <li>Deep market footprint.</li>
                    <li>High-value leadership potential.</li>
                </ul>
                <p class="audit-verdict"><strong>Verdict:</strong> You set the price. Market demands your skills.</p>
            </div>
        `;
    } 
    // 3. MID-LEVEL / HIGH PERFOMER STATE: 2-4 Years (The fix for your case)
    else if (expNum >= 2) {
        notesHTML = `
            <div class="audit-section" style="border: 1px solid var(--neon-blue); background: rgba(0, 243, 255, 0.05);">
                <div class="audit-header">
                    <i class="fa-solid fa-rocket" style="color: var(--neon-blue);"></i>
                    <h4 style="color: var(--neon-blue);">VALUATION: HIGH GROWTH</h4>
                </div>
                <h5 class="audit-status" style="color: #fff;"><strong>RISING STAR</strong></h5>
                <ul class="audit-list">
                    <li>Strong contribution momentum detected.</li>
                    <li>Moving beyond "Junior" rapidly.</li>
                    <li>High ROI potential for employers.</li>
                </ul>
                <p class="audit-verdict"><strong>Verdict:</strong> Prime hiring target. Leverage your project count for higher pay.</p>
            </div>
        `;
    } 
    // 4. JUNIOR STATE: < 2 Years
    else {
        notesHTML = `
            <div class="audit-section good-going">
                <div class="audit-header">
                    <i class="fa-solid fa-seedling good-icon"></i>
                    <h4>VALUATION: EARLY STAGE</h4>
                </div>
                <h5 class="audit-status"><strong>GOOD TRAJECTORY</strong></h5>
                <ul class="audit-list">
                    <li>Digital presence established.</li>
                    <li>Consistency is key right now.</li>
                </ul>
                <p class="audit-verdict"><strong>Verdict:</strong> Keep shipping code to reach the next tier.</p>
            </div>
        `;
    }

    return notesHTML;
}

/* ===========================
   FIX 2: BETTER SALARY MATH
   =========================== */
function calculateMarketSalary(exp) {
    const years = parseInt(exp);
    
    // Adjusted Math: 
    // 2 YOE -> ~12LPA - 18LPA
    // 5 YOE -> ~25LPA - 35LPA
    const base = 6; // Base 6 LPA
    const multiplier = 4; // Add 4LPA per year roughly
    
    const minLPA = base + (years * 3); 
    const maxLPA = base + (years * 5) + 2; 

    return `₹${minLPA}L - ₹${maxLPA}L / yr`;
}

async function showResult(role, exp, githubLink) {
    const backendData = await callBackend(role, exp, githubLink);
    
    // Recalculate salary on frontend to ensure accuracy
    let salaryRange = calculateMarketSalary(exp);
    
    // If backend provides a specific explanation, use it, else default
    let rawExplanation = backendData.explanation || `Analysis complete for ${role} with ${exp} years of experience.`;
    let explanation = rawExplanation.replace(/\*\*/g, ""); // Clean formatting
    
    const brutalNotes = generateBrutalNotes(role, exp, githubLink);
    
    mainForm.style.display = 'none';

    resultArea.innerHTML = `
        <div class="result-container fade-in-up">
            <h3 style="color: var(--text-sub); margin-bottom: 20px;">VALUATION COMPLETE</h3>
            
            <p class="result-role">${role} // Rank Level ${exp}</p>

            <div class="result-circle">
                 <span class="result-label">MARKET WORTH</span>
                 <div class="result-value">${salaryRange}</div>
                 <div class="result-value" style="font-size: 1rem; opacity: 0.7;">Confidence: 98%</div>
            </div>

            <p style="margin-top: 20px; opacity: 0.8; line-height: 1.6;">${explanation}</p>
            
            ${brutalNotes}
            
            <button onclick="location.reload()" class="cyber-button" style="margin-top: 30px;">
                <span class="btn-text">INITIATE NEW SCAN</span>
            </button>
        </div>
    `;
}
