import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = Number(process.env.PORT || 3000);
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

app.disable("x-powered-by");

app.use(express.json({ limit: "1mb" }));

app.use(express.static(path.join(__dirname, "public")));

/* =========================================================
   SKILL DATA
========================================================= */

const skills = [
  {
    id: "python",
    title: "Python",
    emoji: "🐍",
    category: "Programming",
    level: "Beginner",
    trending: true,
    upcoming: false,
    color: "purple",
    description:
      "Learn Python from the basics and build useful real-world programs.",
    roadmap: [
      "Variables & Data Types",
      "Conditions & Loops",
      "Functions",
      "Lists & Dictionaries",
      "Files & APIs",
      "Real Projects"
    ]
  },

  {
    id: "javascript",
    title: "JavaScript",
    emoji: "⚡",
    category: "Programming",
    level: "Beginner",
    trending: true,
    upcoming: false,
    color: "yellow",
    description:
      "Learn modern JavaScript and create interactive web applications.",
    roadmap: [
      "Variables",
      "Functions",
      "DOM",
      "Events",
      "Async JavaScript",
      "Projects"
    ]
  },

  {
    id: "html-css",
    title: "HTML & CSS",
    emoji: "🎨",
    category: "Web Development",
    level: "Beginner",
    trending: false,
    upcoming: false,
    color: "pink",
    description:
      "Build beautiful responsive websites using HTML and CSS.",
    roadmap: [
      "HTML Basics",
      "Semantic HTML",
      "CSS Basics",
      "Flexbox",
      "CSS Grid",
      "Responsive Design"
    ]
  },

  {
    id: "react",
    title: "React",
    emoji: "⚛️",
    category: "Web Development",
    level: "Intermediate",
    trending: true,
    upcoming: false,
    color: "blue",
    description:
      "Create modern component-based web applications with React.",
    roadmap: [
      "JSX",
      "Components",
      "Props",
      "State",
      "Hooks",
      "Projects"
    ]
  },

  {
    id: "nodejs",
    title: "Node.js",
    emoji: "🟢",
    category: "Backend",
    level: "Intermediate",
    trending: false,
    upcoming: true,
    color: "green",
    description:
      "Learn backend development and create APIs using Node.js.",
    roadmap: [
      "Node Runtime",
      "Modules",
      "HTTP",
      "Express",
      "REST APIs",
      "Production"
    ]
  },

  {
    id: "sql",
    title: "SQL",
    emoji: "🗄️",
    category: "Data",
    level: "Beginner",
    trending: true,
    upcoming: false,
    color: "cyan",
    description:
      "Learn how to store, query and analyze data using SQL.",
    roadmap: [
      "SELECT",
      "Filtering",
      "Sorting",
      "Joins",
      "Grouping",
      "Database Design"
    ]
  },

  {
    id: "git",
    title: "Git & GitHub",
    emoji: "🔀",
    category: "Tools",
    level: "Beginner",
    trending: false,
    upcoming: true,
    color: "orange",
    description:
      "Learn version control and collaborate on software projects.",
    roadmap: [
      "Git Basics",
      "Commits",
      "Branches",
      "Merge",
      "GitHub",
      "Team Workflow"
    ]
  },

  {
    id: "ai",
    title: "AI Fundamentals",
    emoji: "🤖",
    category: "AI",
    level: "Beginner",
    trending: true,
    upcoming: true,
    color: "violet",
    description:
      "Understand AI, machine learning, LLMs, prompts and AI applications.",
    roadmap: [
      "AI Basics",
      "Machine Learning",
      "LLMs",
      "Prompt Engineering",
      "AI APIs",
      "AI Projects"
    ]
  }
];

/* =========================================================
   LOGGING
========================================================= */

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

function errorResponse(res, status, message, internalError = null) {
  if (internalError) {
    log("ERROR:", internalError);
  }

  return res.status(status).json({
    error: message
  });
}

/* =========================================================
   TEST
========================================================= */

app.get("/test", (_req, res) => {
  res.status(200).type("text").send(
    "SkillPath AI server is running successfully. 🚀"
  );
});

/* =========================================================
   HEALTH
========================================================= */

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    model: MODEL
  });
});

/* =========================================================
   SKILLS
========================================================= */

app.get("/api/skills", (_req, res) => {
  res.json({
    skills
  });
});

app.get("/api/skills/:id", (req, res) => {
  const skill = skills.find(
    item => item.id === req.params.id
  );

  if (!skill) {
    return errorResponse(
      res,
      404,
      "Skill not found."
    );
  }

  res.json(skill);
});

/* =========================================================
   AI MENTOR
========================================================= */

app.post("/api/chat", async (req, res) => {
  const {
    message,
    history = []
  } = req.body || {};

  /* Validate message */

  if (
    typeof message !== "string" ||
    !message.trim()
  ) {
    return errorResponse(
      res,
      400,
      "Please enter a message."
    );
  }

  /* Validate history */

  if (!Array.isArray(history)) {
    return errorResponse(
      res,
      400,
      "Conversation history must be an array."
    );
  }

  /* API key */

  if (!process.env.GEMINI_API_KEY) {
    return errorResponse(
      res,
      503,
      "Gemini is not configured. Add GEMINI_API_KEY to your .env file and restart the server."
    );
  }

  const safeHistory = history
    .slice(-20)
    .filter(item =>
      item &&
      (item.role === "user" || item.role === "model") &&
      typeof item.text === "string"
    );

  const conversation = safeHistory
    .map(item => {
      const speaker =
        item.role === "user"
          ? "Student"
          : "AI Mentor";

      return `${speaker}: ${item.text.slice(0, 8000)}`;
    })
    .join("\n\n");

  const systemInstruction = `
You are SkillPath AI Mentor 🤖.

You are a friendly, patient and practical technical mentor.

Your job is to help students:

📚 Learn programming and technology
🛠️ Build projects
🐞 Debug code
✨ Explore artificial intelligence
🎯 Prepare for technical interviews
💡 Understand difficult concepts

Rules:

1. Explain concepts clearly.
2. Assume the learner may be a beginner.
3. Use simple examples.
4. Teach step by step.
5. Give practical exercises.
6. When debugging, identify the root cause.
7. When giving code, use Markdown fenced code blocks.
8. Never pretend that you executed code if you did not.
9. Encourage learning through projects.
10. Ask a useful follow-up question when appropriate.

You are the actual AI Mentor. Do not claim that you are a fake or demo AI.
`;

  const prompt = `
${systemInstruction}

Previous conversation:

${conversation || "No previous conversation."}

New student message:

${message.trim()}
`;

  try {
    log("AI Mentor request received", {
      messageLength: message.length,
      historyLength: safeHistory.length,
      model: MODEL
    });

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const result = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        temperature: 0.6,
        maxOutputTokens: 4096
      }
    });

    const reply =
      typeof result.text === "string"
        ? result.text.trim()
        : "";

    if (!reply) {
      return errorResponse(
        res,
        502,
        "Gemini returned an empty response."
      );
    }

    log("Gemini response received", {
      responseLength: reply.length
    });

    return res.json({
      reply
    });

  } catch (error) {
    log(
      "Gemini API error:",
      error?.message || error
    );

    return errorResponse(
      res,
      502,
      "The AI Mentor could not contact Gemini. Please check your API key, model and internet connection.",
      error?.stack
    );
  }
});

/* =========================================================
   UNKNOWN API ROUTES
========================================================= */

app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return errorResponse(
      res,
      404,
      "API endpoint not found."
    );
  }

  next();
});

/* =========================================================
   WEBSITE FALLBACK
========================================================= */

app.get("/{*splat}", (_req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "public",
      "index.html"
    )
  );
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
  (
    error,
    _req,
    res,
    _next
  ) => {
    log(
      "Unhandled server error:",
      error?.stack || error
    );

    if (res.headersSent) {
      return;
    }

    res.status(500).json({
      error: "Internal server error."
    });
  }
);

/* =========================================================
   START
========================================================= */

app.listen(
  PORT,
  "127.0.0.1",
  () => {
    log(
      `🚀 SkillPath AI running at http://127.0.0.1:${PORT}`
    );

    log(
      `🧪 Test: http://127.0.0.1:${PORT}/test`
    );

    log(
      `🤖 Gemini configured: ${Boolean(
        process.env.GEMINI_API_KEY
      )}`
    );

    log(
      `🧠 Gemini model: ${MODEL}`
    );
  }
);