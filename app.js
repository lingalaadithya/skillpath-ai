/* =====================================================
   APPLICATION STATE
===================================================== */

const state = {
  skills: [],

  category: "all",

  special: "all",

  history: [],

  busy: false
};


/* =====================================================
   HELPERS
===================================================== */

const $ = id =>
  document.getElementById(id);


const skillsGrid =
  $("skillsGrid");

const roadmapGrid =
  $("roadmapGrid");

const promptGrid =
  $("promptGrid");

const chatMessages =
  $("chatMessages");

const mentorForm =
  $("mentorForm");

const mentorInput =
  $("mentorInput");

const sendButton =
  $("sendButton");

const sendLabel =
  $("sendLabel");

const sendIcon =
  $("sendIcon");

const chatError =
  $("chatError");

const charCount =
  $("charCount");


/* =====================================================
   PROMPTS
===================================================== */

const prompts = [

  {
    emoji: "📚",
    title: "Learn from Zero",

    text:
      "Teach me [SKILL] from absolute beginner level. Give me a step-by-step roadmap, explain the first concept simply, and give me a small exercise."
  },

  {
    emoji: "🛠️",
    title: "Build a Project",

    text:
      "Help me build a [PROJECT] using [TECHNOLOGY]. Break it into milestones, explain the architecture and guide me through implementation."
  },

  {
    emoji: "🐞",
    title: "Debug My Code",

    text:
      "Help me debug this code. Explain the error, identify the root cause, show the corrected version and tell me how to verify the fix."
  },

  {
    emoji: "🤖",
    title: "Explore AI",

    text:
      "Explain [AI TOPIC] to me like a beginner. Start with the mental model, show a practical example and suggest a small project."
  },

  {
    emoji: "🎯",
    title: "Interview Practice",

    text:
      "Act as my technical interviewer for [SKILL]. Ask one question at a time, evaluate my answer and explain how I can improve."
  },

  {
    emoji: "📅",
    title: "Study Plan",

    text:
      "Create a realistic 14-day learning plan for [SKILL]. I can study for 60 minutes per day. Include practice and a final project."
  }

];


/* =====================================================
   CAPABILITY PROMPTS
===================================================== */

const capabilityPrompts = {

  learn:
    "📚 I want to learn a new skill. Help me choose a suitable starting point, create a step-by-step roadmap, teach me the first lesson and give me a small exercise.",

  build:
    "🛠️ I want to build a practical software project. Help me choose the technology stack, design the project, divide it into milestones and start implementation step by step.",

  debug:
    "🐞 I need help debugging code. I will paste my code and error next. Explain the root cause clearly, show the smallest correct fix and explain how I can verify it.",

  explore:
    "🤖 I want to explore Artificial Intelligence. Teach me an AI concept from first principles, give me a practical example and suggest a small project."
};


/* =====================================================
   SECURITY
===================================================== */

function escapeHtml(value) {

  return String(value).replace(
    /[&<>"']/g,

    character => {

      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return entities[character];
    }
  );
}


/* =====================================================
   SAFE MARKDOWN RENDERING
===================================================== */

function renderMarkdown(text) {

  let safe =
    escapeHtml(text);

  const codeBlocks = [];

  safe = safe.replace(
    /```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g,

    (_match, _language, code) => {

      const index =
        codeBlocks.length;

      codeBlocks.push(
        `<pre><code>${code.trim()}</code></pre>`
      );

      return `___CODE_BLOCK_${index}___`;
    }
  );

  safe = safe.replace(
    /\*\*(.+?)\*\*/g,
    "<strong>$1</strong>"
  );

  safe = safe.replace(
    /`([^`]+)`/g,
    "<code>$1</code>"
  );

  safe = safe
    .replace(
      /\n\n+/g,
      "</p><p>"
    )
    .replace(
      /\n/g,
      "<br>"
    );

  safe =
    `<p>${safe}</p>`;

  codeBlocks.forEach(
    (block, index) => {

      safe = safe.replace(
        `<p>___CODE_BLOCK_${index}___</p>`,
        block
      );

    }
  );

  return safe;
}


/* =====================================================
   SKILL RENDERING
===================================================== */

function renderSkills() {

  const visibleSkills =
    state.skills.filter(skill => {

      const categoryMatch =
        state.category === "all" ||
        skill.category === state.category;

      const specialMatch =
        state.special === "all" ||
        (
          state.special === "trending" &&
          skill.trending
        ) ||
        (
          state.special === "upcoming" &&
          skill.upcoming
        );

      return (
        categoryMatch &&
        specialMatch
      );
    });


  if (!visibleSkills.length) {

    skillsGrid.innerHTML = `
      <div class="status">
        😕 No skills match these filters.
      </div>
    `;

  } else {

    skillsGrid.innerHTML =
      visibleSkills.map(
        skill => `

        <article class="skill-card">

          <span class="skill-emoji">
            ${skill.emoji}
          </span>

          <h3>
            ${escapeHtml(skill.title)}
          </h3>

          <p>
            ${escapeHtml(skill.description)}
          </p>

          <div class="skill-meta">

            <span class="tag">
              ${escapeHtml(skill.category)}
            </span>

            <span class="tag">
              ${escapeHtml(skill.level)}
            </span>

            ${
              skill.trending
                ? `<span class="tag">🔥 Trending</span>`
                : ""
            }

            ${
              skill.upcoming
                ? `<span class="tag">✨ Upcoming</span>`
                : ""
            }

          </div>

          <button
            class="skill-button"
            type="button"
            data-skill="${skill.id}"
          >
            Learn ${escapeHtml(skill.title)} →
          </button>

        </article>
      `
      ).join("");

  }


  $("skillsStatus").textContent =
    `📚 ${visibleSkills.length} skill${
      visibleSkills.length === 1
        ? ""
        : "s"
    } shown`;
}


/* =====================================================
   ROADMAP
===================================================== */

function renderRoadmaps() {

  roadmapGrid.innerHTML =
    state.skills
      .slice(0, 4)
      .map(
        skill => `

        <article class="roadmap-card">

          <div>

            <span class="skill-emoji">
              ${skill.emoji}
            </span>

            <h3>
              ${escapeHtml(skill.title)}
            </h3>

            <span class="tag">
              ${escapeHtml(skill.level)}
            </span>

          </div>

          <ol>

            ${skill.roadmap
              .map(
                step =>
                  `<li>${escapeHtml(step)}</li>`
              )
              .join("")}

          </ol>

        </article>
      `
      )
      .join("");
}


/* =====================================================
   PROMPT RENDERING
===================================================== */

function renderPrompts() {

  promptGrid.innerHTML =
    prompts
      .map(
        (prompt, index) => `

        <article class="prompt-card">

          <div class="prompt-icon">
            ${prompt.emoji}
          </div>

          <h3>
            ${escapeHtml(prompt.title)}
          </h3>

          <p>
            ${escapeHtml(prompt.text)}
          </p>

          <div class="prompt-actions">

            <button
              class="small-button"
              type="button"
              data-copy="${index}"
            >
              📋 Copy
            </button>

            <button
              class="small-button primary"
              type="button"
              data-use-prompt="${index}"
            >
              🤖 Use with Mentor
            </button>

          </div>

        </article>
      `
      )
      .join("");
}


/* =====================================================
   CHAT MESSAGE
===================================================== */

function appendMessage(
  role,
  text,
  loading = false
) {

  const empty =
    chatMessages.querySelector(
      ".chat-empty"
    );

  if (empty) {
    empty.remove();
  }


  const message =
    document.createElement("div");

  message.className =
    `message ${role}`;


  message.innerHTML = `

    <div class="bubble">

      ${
        loading
          ? `<span class="typing">
               🤖 Mentor is thinking
             </span>`
          : renderMarkdown(text)
      }

    </div>

  `;


  chatMessages.appendChild(
    message
  );


  chatMessages.scrollTop =
    chatMessages.scrollHeight;


  return message;
}


/* =====================================================
   BUSY STATE
===================================================== */

function setBusy(value) {

  state.busy = value;

  sendButton.disabled =
    value;

  sendButton.classList.toggle(
    "loading",
    value
  );


  sendLabel.textContent =
    value
      ? "Thinking..."
      : "Send to Mentor";


  sendIcon.textContent =
    value
      ? "⏳"
      : "🚀";
}


/* =====================================================
   ERRORS
===================================================== */

function showError(message) {

  chatError.textContent =
    `⚠️ ${message}`;

  chatError.hidden =
    false;
}


function clearError() {

  chatError.textContent =
    "";

  chatError.hidden =
    true;
}


/* =====================================================
   MENTOR INPUT
===================================================== */

function populateMentor(text) {

  mentorInput.value =
    text;

  updateCount();


  document
    .querySelector("#mentor")
    .scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


  mentorInput.focus();
}


/* =====================================================
   CHARACTER COUNT
===================================================== */

function updateCount() {

  charCount.textContent =
    `${mentorInput.value.length} / 12000`;
}


/* =====================================================
   LOAD SKILLS FROM BACKEND
===================================================== */

async function loadSkills() {

  $("skillsStatus").textContent =
    "⏳ Loading skills...";


  try {

    const response =
      await fetch(
        "/api/skills"
      );


    if (!response.ok) {
      throw new Error(
        "Could not load skills."
      );
    }


    const data =
      await response.json();


    state.skills =
      Array.isArray(data.skills)
        ? data.skills
        : [];


    renderSkills();

    renderRoadmaps();

  } catch (error) {

    $("skillsStatus").textContent =
      `❌ ${error.message}`;

    skillsGrid.innerHTML = `
      <div class="status">
        ❌ Skill library could not be loaded.
        Make sure the server is running.
      </div>
    `;
  }
}


/* =====================================================
   SEND MESSAGE TO GEMINI
===================================================== */

async function sendMessage(event) {

  /*
    CRITICAL:

    Prevent normal HTML form navigation.

    This stops the page jumping to the top.
  */

  event.preventDefault();


  if (state.busy) {
    return;
  }


  const message =
    mentorInput.value.trim();


  if (!message) {

    showError(
      "Please enter a message before sending."
    );

    mentorInput.focus();

    return;
  }


  clearError();


  /*
    Show user's message immediately.
  */

  appendMessage(
    "user",
    message
  );


  state.history.push({
    role: "user",
    text: message
  });


  mentorInput.value = "";

  updateCount();


  setBusy(true);


  /*
    Show real loading state.
  */

  const loadingMessage =
    appendMessage(
      "assistant",
      "",
      true
    );


  try {

    /*
      REAL BACKEND REQUEST

      Browser
          ↓
      Express /api/chat
          ↓
      Gemini
    */

    const response =
      await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message,

            history:
              state.history
                .slice(-20)
          })
        }
      );


    const data =
      await response.json()
        .catch(() => ({}));


    if (!response.ok) {

      throw new Error(
        data.error ||
        `Request failed (${response.status})`
      );
    }


    if (
      typeof data.reply !==
      "string" ||
      !data.reply.trim()
    ) {

      throw new Error(
        "Gemini returned an empty response."
      );
    }


    /*
      Replace loading indicator
      with the ACTUAL Gemini response.
    */

    loadingMessage
      .querySelector(".bubble")
      .innerHTML =
      renderMarkdown(
        data.reply
      );


    state.history.push({
      role: "model",
      text: data.reply
    });


    chatMessages.scrollTop =
      chatMessages.scrollHeight;


  } catch (error) {

    /*
      Remove failed loading message.
    */

    loadingMessage.remove();


    /*
      Remove user's history entry
      because request failed.
    */

    state.history.pop();


    showError(
      error.message ||
      "Could not contact the AI Mentor."
    );


    /*
      Show a real error state,
      NOT a fake AI answer.
    */

    appendMessage(
      "assistant",
      "⚠️ I could not complete that request. Please check the error above and try again."
    );


  } finally {

    /*
      ALWAYS enable Send again.
    */

    setBusy(false);

    mentorInput.focus();
  }
}


/* =====================================================
   EVENT HANDLING
===================================================== */

document.addEventListener(
  "click",
  async event => {

    /* CATEGORY FILTER */

    const filter =
      event.target.closest(
        "[data-filter]"
      );


    if (filter) {

      document
        .querySelectorAll(
          "[data-filter]"
        )
        .forEach(
          button =>
            button.classList.remove(
              "active"
            )
        );


      filter.classList.add(
        "active"
      );


      state.category =
        filter.dataset.filter;


      renderSkills();

      return;
    }


    /* TRENDING / UPCOMING */

    const special =
      event.target.closest(
        "[data-special]"
      );


    if (special) {

      document
        .querySelectorAll(
          "[data-special]"
        )
        .forEach(
          button =>
            button.classList.remove(
              "active"
            )
        );


      special.classList.add(
        "active"
      );


      state.special =
        special.dataset.special;


      renderSkills();

      return;
    }


    /* SKILL BUTTON */

    const skillButton =
      event.target.closest(
        "[data-skill]"
      );


    if (skillButton) {

      const skill =
        state.skills.find(
          item =>
            item.id ===
            skillButton.dataset.skill
        );


      if (skill) {

        populateMentor(
          `📚 Teach me ${skill.title} from beginner level. Start with the first roadmap step, explain it simply, then give me a small exercise.`
        );
      }

      return;
    }


    /* COPY */

    const copyButton =
      event.target.closest(
        "[data-copy]"
      );


    if (copyButton) {

      const prompt =
        prompts[
          Number(
            copyButton.dataset.copy
          )
        ]?.text;


      if (!prompt) {
        return;
      }


      try {

        await navigator.clipboard.writeText(
          prompt
        );


        const oldText =
          copyButton.textContent;


        copyButton.textContent =
          "✅ Copied!";


        setTimeout(
          () => {
            copyButton.textContent =
              oldText;
          },
          1300
        );


      } catch {

        showError(
          "Clipboard access was blocked by the browser."
        );
      }


      return;
    }


    /* USE PROMPT */

    const usePrompt =
      event.target.closest(
        "[data-use-prompt]"
      );


    if (usePrompt) {

      const prompt =
        prompts[
          Number(
            usePrompt.dataset.usePrompt
          )
        ]?.text;


      if (prompt) {

        populateMentor(
          prompt
        );
      }

      return;
    }


    /* CAPABILITIES */

    const capability =
      event.target.closest(
        "[data-capability]"
      );


    if (capability) {

      const prompt =
        capabilityPrompts[
          capability.dataset.capability
        ];


      if (prompt) {

        populateMentor(
          prompt
        );
      }
    }

  }
);


/* =====================================================
   FORM
===================================================== */

mentorForm.addEventListener(
  "submit",
  sendMessage
);


/* =====================================================
   TEXTAREA
===================================================== */

mentorInput.addEventListener(
  "input",
  updateCount
);


mentorInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      mentorForm.requestSubmit();
    }

  }
);


/* =====================================================
   CLEAR CHAT
===================================================== */

$("clearChat").addEventListener(
  "click",
  () => {

    state.history = [];

    clearError();


    chatMessages.innerHTML = `

      <div class="chat-empty">

        <div class="large-robot">
          🤖
        </div>

        <h3>
          Hello! I'm your AI Mentor 👋
        </h3>

        <p>
          Ask me about programming,
          projects, debugging or AI.
        </p>

        <div class="quick-examples">

          <span>🐍 Learn Python</span>

          <span>🌐 Build a Website</span>

          <span>🐞 Fix My Code</span>

          <span>🤖 Learn AI</span>

        </div>

      </div>

    `;


    mentorInput.focus();
  }
);


/* =====================================================
   MOBILE MENU
===================================================== */

$("menuToggle").addEventListener(
  "click",
  () => {

    $("mainNav")
      .classList
      .toggle("open");

  }
);


document
  .querySelectorAll(
    "#mainNav a"
  )
  .forEach(
    link => {

      link.addEventListener(
        "click",
        () => {

          $("mainNav")
            .classList
            .remove("open");

        }
      );

    }
  );


/* =====================================================
   INITIALIZE
===================================================== */

renderPrompts();

loadSkills();

updateCount();