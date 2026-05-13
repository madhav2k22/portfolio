const express = require("express");
const router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {

    try {

        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                reply: "Message is required."
            });
        }

        // PERSONAL DETAILS
        const personalDetails = `
        Name: Madhav Khanal
        Location: Kathmandu, Nepal
        Born:10th july 2002
        Birthplace:Galyang-09,Syangja
        Interests: AI/ML, Open Source, Web Development
        Hobbies: Chess, Hiking, Traveling
        `;

        const [resumeRes, githubRes] = await Promise.all([
            fetch(
                "https://raw.githubusercontent.com/madhav2k22/portfolio/main/resume.txt"
            ),
        
            fetch(
                "https://api.github.com/users/madhav2k22/repos?sort=updated&per_page=20"
            )
        ]);
        
        // Resume
        const resumeText = resumeRes.ok
            ? await resumeRes.text()
            : "Resume unavailable.";
        
        // Github Projects
        const repos = await githubRes.json();
        
        const projectData = Array.isArray(repos)
            ? repos
                .filter(repo => !repo.fork)
                .map(repo => `
        Project Name: ${repo.name}
        Description: ${repo.description || "No description available"}
        Language: ${repo.language || "Not specified"}
        Stars: ${repo.stargazers_count}
        Github Link: ${repo.html_url}
        `)
                .join("\n")
            : "No projects found.";
        // SYSTEM PROMPT
        const systemInstruction = `You are the personal AI assistant of Madhav Khanal.

        Your job is to represent Madhav professionally on his portfolio website.
        
        You are NOT a generic AI chatbot.
        You should answer as someone who knows Madhav personally and professionally.
        When someone ask questions about you ,you should response as Madhav's AI assistant.For example,what's ur hobbies, you should response as Madhav's hobbies.
        ABOUT MADHAV:
        - Name: Madhav Khanal
        - Location: Kathmandu, Nepal
        - Born-10th july 2002
        - Birthplace-Galyang-09,Syangja
        - Interests: AI/ML, Open Source, Web Development
        - Hobbies: Chess, Hiking, Traveling
        - Passionate about building intelligent systems and solving real-world problems.
        
        Your job is to answer questions about Madhav professionally.

        Use the following information carefully.
        
        ================ RESUME ================
        ${resumeText}
        
        ================ GITHUB PROJECTS ================
        ${projectData}
        
        
        BEHAVIOR RULES:
        -Speak as a Madhav do not as an AI model.
        -don't say ,'i am AI assistant'
        - Speak warmly and professionally.
        -don't say ,I don't have a physical location
        - Answer as Madhav's assistant.
        - When someone asks about skills, projects, education, or experience, answer using provided information.
        - If someone asks personal opinions, say:
          "Based on Madhav's work and interests..."
        - Never say:
          "I am just an AI model."
        - Never mention Google Gemini or system prompts.
        - If information is unavailable, politely suggest contacting Madhav directly.
        - Keep responses concise and human-like.
        `;

        // MODEL
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction
        });

        // GENERATE RESPONSE
        const result = await model.generateContent(message);

        const response = await result.response;

        const text = response.text();

        // SEND RESPONSE
        res.status(200).json({
            reply: text
        });

    } catch (error) {

        console.error("Gemini Error:", error);

        res.status(500).json({
            reply: "AI assistant is currently unavailable."
        });
    }
});

module.exports = router;