// Serverless Function handler for Vercel
export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }

    // 1. Extract data from the client request body
    const { github, experience, role } = req.body;

    // --- 2. SALARY CALCULATION LOGIC (Moved from old script.js) ---
    const exp = parseInt(experience);
    const hasLink = github.trim().length > 15 && github.toLowerCase().includes('github.com');

    const baseSalaries = {
        "Backend Developer": 500000, 
        "Frontend Developer": 450000,
        "Fullstack Developer": 600000, 
        "AI Engineer": 900000, 
        "Data Scientist": 850000,
        "ML Engineer": 950000,         
        "Blockchain Developer": 1100000, 
        "Cloud Engineer": 700000,
    };

    let base = baseSalaries[role] || 400000;
    let multiplier = 1 + (exp * 0.25);
    let estimatedSalary = Math.floor(base * multiplier);
    
    // Adjust salary and confidence based on GitHub presence
    let confidenceValue = 85; // Base confidence
    
    if (!hasLink || exp > 10) {
        // Punish salary heavily if no link is provided, or for highly experienced users without a link
        estimatedSalary = Math.floor(estimatedSalary * 0.7);
        confidenceValue = 30;
    } else if (hasLink && exp >= 4) {
        // Reward established professionals with a GitHub link
        confidenceValue = 95;
    } else {
        confidenceValue = 75;
    }
    
    let minSalary = estimatedSalary - 50000;
    let maxSalary = estimatedSalary + 50000;
    let minStr = minSalary.toLocaleString('en-IN');
    let maxStr = maxSalary.toLocaleString('en-IN');
    
    const salaryRangeStr = `₹${minStr} - ₹${maxStr}`;

    // --- 3. EXPLANATION GENERATION ---
    const explanationText = hasLink 
        ? `Valuation derived from market data for a **${role}** at Rank ${exp}. GitHub profile successfully linked, providing high confidence in experience level.`
        : `Valuation is adjusted significantly lower due to the **lack of a verifiable digital profile**. Focus on building public work to achieve a higher rank.`;

    // --- 4. RETURN THE DATA (Must match the expected keys in your client JS) ---
    res.status(200).json({
        salary_range: salaryRangeStr,
        explanation: explanationText,
        confidence: `${confidenceValue}%`
    });
}
