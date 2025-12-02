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
   BACKEND CALL (MOCK)
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
        // Return a mock response structure for frontend to render, even on fetch failure
        return { 
            error: "Backend failed, rendering local estimate.",
            explanation: "The connection to the external analysis server failed. Displaying market data based on local experience and role estimation rules."
        };
    }
}

/* =======================================
   FIXED LOGIC 1: INTELLIGENT AUDIT TIERS
   ======================================= */
function generateBrutalNotes(role, exp, githubLink) {
    const expNum = parseInt(exp);
    const hasLink = githubLink && githubLink.trim().length > 3;
    
    // 1. Identify High-Complexity Roles for Prodigy/Premium tiering
    const lowerRole = role.toLowerCase();
    const isComplexRole = lowerRole.includes('fullstack') || 
                          lowerRole.includes('ai') || 
                          lowerRole.includes('machine learning') || 
                          lowerRole.includes('blockchain') ||
                          lowerRole.includes('backend');

    let notesHTML = '';

    // --- 1. FAIL STATE: No Input ---
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
                <p class="audit-verdict"><strong>Verdict:</strong> Unhirable without proof of work.</p>
            </div>
        `;
    } 
    // --- 2. LEGENDARY STATE: 5+ Years ---
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
                    <li>Leadership & System Design ready.</li>
                </ul>
                <p class="audit-verdict"><strong>Verdict:</strong> You set the price. Market demands your skills.</p>
            </div>
        `;
    } 
    // --- 3. RISING STAR STATE: 2-4 Years ---
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
    // --- 4. PRODIGY STATE: Fresher (0-1 YOE) + Complex Role ---
    else if (expNum < 2 && isComplexRole) {
        notesHTML = `
            <div class="audit-section" style="border: 1px solid #ff00ff; background: rgba(255, 0, 255, 0.05);">
                <div class="audit-header">
                    <i class="fa-solid fa-bolt" style="color: #ff00ff;"></i>
                    <h4 style="color: #ff00ff;">VALUATION: PRODIGY</h4>
                </div>
                <h5 class="audit-status" style="color: #fff;"><strong>HIDDEN GEM DETECTED</strong></h5>
                <ul class="audit-list">
                    <li>Portfolio indicates skills above experience level.</li>
                    <li>Project density outweighs years worked.</li>
                </ul>
                <p class="audit-verdict"><strong>Verdict:</strong> Hire immediately before market realizes value.</p>
            </div>
        `;
    } 
    // --- 5. STANDARD JUNIOR STATE: Fresher (0-1 YOE) + Simple Role ---
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

/* =======================================
   FIXED LOGIC 2: ROLE-BASED SALARY MATH
   ======================================= */
function calculateMarketSalary(role, exp) {
    const years = parseInt(exp);
    const lowerRole = role.toLowerCase();
    
    // Check if role commands a premium (Fullstack, AI, etc.)
    const isPremiumRole = lowerRole.includes('fullstack') || 
                          lowerRole.includes('ai') || 
                          lowerRole.includes('data') || 
                          lowerRole.includes('cloud') ||
                          lowerRole.includes('backend');

    // Base Logic (in Lakhs Per Annum):
    let base = isPremiumRole ? 8 : 5; // Premium Fresher starts at 8LPA
    
    // Multiplier per year (Growth rate):
    let multiplier = isPremiumRole ? 5 : 3;

    const minLPA = base + (years * multiplier); 
    const maxLPA = minLPA + (isPremiumRole ? 6 : 4); // Wider range for premium roles

    return `₹${minLPA}L - ₹${maxLPA}L / yr`;
}

/* ===========================
   LOADING & RESULT LOGIC
   =========================== */
function startCalculationSequence(role, exp, githubLink) {
    if (!overlay) {
        console.error("ERROR: Calculation overlay element not found (ID 'calculation-overlay').");
        return; 
    }
    
    overlay.style.display = 'flex'; 
    let progress = 0;
    
    if (progressFill) progressFill.style.width = '0%';
    if (scanText) scanText.innerText = "INITIALIZING SCAN...";

    const messages = ["CONNECTING TO GITHUB API...", "ANALYZING REPOSITORY DATA...", "COMPARING MARKET TRENDS...", "FINALIZING VALUATION..."];

    const interval = setInterval(() => {
        progress += 5;
        if (progressFill) progressFill.style.width = `${progress}%`;

        if (progress < 30) {
            if (scanText) scanText.innerText = messages[0];
        } else if (progress < 60) {
            if (scanText) scanText.innerText = messages[1];
        } else if (progress < 85) {
            if (scanText) scanText.innerText = messages[2];
        } else {
            if (scanText) scanText.innerText = messages[3];
        }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(async () => {
                if (overlay) overlay.style.display = 'none';
                await showResult(role, exp, githubLink);
            }, 500);
        }
    }, 150);
}


async function showResult(role, exp, githubLink) {
    // 1. Fetch data (or mock response if backend fails)
    const backendData = await callBackend(role, exp, githubLink);
    
    // 2. Calculate dynamic values
    let salaryRange = calculateMarketSalary(role, exp);
    let rawExplanation = backendData.explanation || `Analysis complete for ${role}.`;
    let explanation = rawExplanation.replace(/\*\*/g, "");
    let confidence = backendData.confidence || "99%"; // Defaulting to high confidence
    
    const brutalNotes = generateBrutalNotes(role, exp, githubLink);
    
    // 3. Hide Form and Display Result
    mainForm.style.display = 'none';

    resultArea.innerHTML = `
        <div class="result-container fade-in-up">
            <h3 style="color: var(--text-sub); margin-bottom: 20px;">VALUATION COMPLETE</h3>
            
            <p class="result-role">${role} // Rank Level ${exp}</p>

            <div class="result-circle">
                 <span class="result-label">MARKET WORTH</span>
                 <div class="result-value">${salaryRange}</div>
                 <div class="result-value" style="font-size: 1rem; opacity: 0.7;">Confidence: ${confidence}</div>
            </div>

            <p style="margin-top: 20px; opacity: 0.8; line-height: 1.6;">${explanation}</p>
            
            ${brutalNotes}
            
            <button onclick="location.reload()" class="cyber-button" style="margin-top: 30px;">
                <span class="btn-text">INITIATE NEW SCAN</span>
            </button>
        </div>
    `;
}
