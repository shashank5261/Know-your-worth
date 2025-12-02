import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { github, experience, role } = req.body;

    const username = github.split("github.com/")[1];

    const profileRes = await axios.get(`https://api.github.com/users/${username}`);
    const repoRes = await axios.get(profileRes.data.repos_url);

    const prompt = `
Analyze this GitHub profile:

Profile: ${JSON.stringify(profileRes.data)}
Repos: ${JSON.stringify(repoRes.data)}

Experience: ${experience}
Target Role: ${role}

Return JSON:
{
  "salary_range": "₹X - ₹Y",
  "confidence": "45%",
  "explanation": "3 lines of explanation"
}
`;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      { contents: [{ parts: [{ text: prompt }] }] },
      { params: { key: process.env.GEMINI_API_KEY } }
    );

    const text = response.data.candidates[0].content.parts[0].text;

    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(cleaned);

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
-
