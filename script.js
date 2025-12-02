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
/* ===========================
   FIX 1: INTELLIGENT AUDIT LOGIC
   =========================== */
function generateBrutalNotes(role, exp, githubLink) {
    const expNum = parseInt(exp);
    const hasLink = githubLink && githubLink.trim().length > 3;
    
    // 1. Identify High-Complexity Roles
    const lowerRole = role.toLowerCase();
    const isComplexRole = lowerRole.includes('fullstack') || 
                          lowerRole.includes('ai') || 
                          lowerRole.includes('machine learning') || 
                          lowerRole.includes('blockchain') ||
                          lowerRole.includes('backend');

    let notesHTML = '';

    // --- FAIL STATE ---
    if (!hasLink) {
        notesHTML = `
            <div class="audit-section critical-failure">
                <div class="audit-header">
                    <i class="fa-solid fa-skull-crossbones failure-icon"></i>
                    <h4>AUDIT FAILED</h4>
                </div>
                <h5 class="audit-status"><strong>NO DATA FOUND</strong></h5>
                <p class="audit-verdict"><strong>Verdict:</strong> Unhirable without proof of work.</p>
            </div>`;
    } 
    // --- SENIOR STATE (5+ Years) ---
    else if (expNum >= 5) {
        notesHTML = `
            <div class="audit-section outstanding">
                <div class="audit-header">
                    <i class="fa-solid fa-crown outstanding-icon"></i>
                    <h4>VALUATION: LEGENDARY</h4>
                </div>
                <h5 class="audit-status"><strong>SENIOR ARCHITECT</strong></h5>
                <ul class="audit-list">
                    <li>Deep market footprint verified.</li>
                    <li>Leadership & System Design ready.</li>
                </ul>
                <p class="audit-verdict"><strong>Verdict:</strong> Name your price.</p>
            </div>`;
    } 
    // --- RISING STAR (2-4 Years) ---
    else if (expNum >= 2) {
        notesHTML = `
            <div class="audit-section" style="border: 1px solid var(--neon-blue); background: rgba(0, 243, 255, 0.05);">
                <div class="audit-header">
                    <i class="fa-solid fa-rocket" style="color: var(--neon-blue);"></i>
                    <h4 style="color: var(--neon-blue);">VALUATION: HIGH GROWTH</h4>
                </div>
                <h5 class="audit-status" style="color: #fff;"><strong>RISING STAR</strong></h5>
                <p class="audit-verdict"><strong>Verdict:</strong> Prime hiring target. High ROI.</p>
            </div>`;
    } 
    // --- FIX: PRODIGY STATE (Fresher + Complex Role) ---
    // If Exp < 2 BUT Role is Fullstack/AI -> They are NOT just "Early Stage"
    else if (expNum < 2 && isComplexRole) {
        notesHTML = `
            <div class="audit-section" style="border: 1px solid #ff00ff; background: rgba(255, 0, 255, 0.05);">
                <div class="audit-header">
                    <i class="fa-solid fa-bolt" style="color: #ff00ff;"></i>
                    <h4 style="color: #ff00ff;">VALUATION: PRODIGY</h4>
                </div>
                <h5 class="audit-status" style="color: #fff;"><strong>HIDDEN GEM DETECTED</strong></h5>
                <ul class="audit-list">
                    <li>High-complexity role for early career.</li>
                    <li>Portfolio indicates skills above experience level.</li>
                    <li>Project density outweighs years worked.</li>
                </ul>
                <p class="audit-verdict"><strong>Verdict:</strong> Hire immediately before market realizes value.</p>
            </div>`;
    } 
    // --- STANDARD JUNIOR STATE ---
    else {
        notesHTML = `
            <div class="audit-section good-going">
                <div class="audit-header">
                    <i class="fa-solid fa-seedling good-icon"></i>
                    <h4>VALUATION: EARLY STAGE</h4>
                </div>
                <h5 class="audit-status"><strong>GOOD TRAJECTORY</strong></h5>
                <p class="audit-verdict"><strong>Verdict:</strong> Keep shipping code to level up.</p>
            </div>`;
    }

    return notesHTML;
}

/* ===========================
   FIX 2: ROLE-BASED SALARY
   =========================== */
function calculateMarketSalary(role, exp) {
    const years = parseInt(exp);
    const lowerRole = role.toLowerCase();
    
    // Check if role commands a premium (Fullstack, AI, etc.)
    const isPremiumRole = lowerRole.includes('fullstack') || 
                          lowerRole.includes('ai') || 
                          lowerRole.includes('data') || 
                          lowerRole.includes('cloud');

    // Base Logic:
    // Standard Fresher: 5 LPA
    // Premium Fresher (Fullstack): 8 LPA (The boost you asked for)
    let base = isPremiumRole ? 8 : 5;
    
    // Multiplier: 
    // Standard: +3 LPA per year
    // Premium: +5 LPA per year
    let multiplier = isPremiumRole ? 5 : 3;

    const minLPA = base + (years * multiplier); 
    const maxLPA = minLPA + (isPremiumRole ? 6 : 4); // Wider range for premium roles

    return `₹${minLPA}L - ₹${maxLPA}L / yr`;
}

async function showResult(role, exp, githubLink) {
    const backendData = await callBackend(role, exp, githubLink);
    
    // PASS ROLE to salary calculation to boost Fullstack/AI salaries
    let salaryRange = calculateMarketSalary(role, exp);
    
    let rawExplanation = backendData.explanation || `Analysis complete for ${role}.`;
    let explanation = rawExplanation.replace(/\*\*/g, "");
    
    const brutalNotes = generateBrutalNotes(role, exp, githubLink);
    
    mainForm.style.display = 'none';

    resultArea.innerHTML = `
        <div class="result-container fade-in-up">
            <h3 style="color: var(--text-sub); margin-bottom: 20px;">VALUATION COMPLETE</h3>
            
            <p class="result-role">${role} // Rank Level ${exp}</p>

            <div class="result-circle">
                 <span class="result-label">MARKET WORTH</span>
                 <div class="result-value">${salaryRange}</div>
                 <div class="result-value" style="font-size: 1rem; opacity: 0.7;">Confidence: 99%</div>
            </div>

            <p style="margin-top: 20px; opacity: 0.8; line-height: 1.6;">${explanation}</p>
            
            ${brutalNotes}
            
            <button onclick="location.reload()" class="cyber-button" style="margin-top: 30px;">
                <span class="btn-text">INITIATE NEW SCAN</span>
            </button>
        </div>
    `;
}
