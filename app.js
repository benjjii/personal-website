const technicalPostsContainer = document.getElementById("technicalPosts");
const personalPostsContainer = document.getElementById("personalPosts");
const themeToggle = document.getElementById("themeToggle");
const personalBlogSection = document.getElementById("personalBlogSection");
const unlockTechnicalButton = document.getElementById("unlockTechnicalButton");
const technicalModal = document.getElementById("technicalModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const technicalPostForm = document.getElementById("technicalPostForm");
const technicalPostTitle = document.getElementById("technicalPostTitle");
const technicalPostBody = document.getElementById("technicalPostBody");
const cancelTechnicalPostButton = document.getElementById("cancelTechnicalPost");

const TECHNICAL_POSTS_KEY = "customTechnicalPosts";
const TECHNICAL_POST_PASSWORD = "benislucky";
const DEFAULT_PERSONAL_POSTS = [
  {
    title: "What Running Teaches Me About Engineering",
    date: "2026-03-22",
    summary:
      "Consistency compounds. A short note about patience, systems, and long-term thinking.",
    url: "#",
    tags: ["Personal", "Habits"],
  },
  {
    title: "On Slowing Down To Learn Faster",
    date: "2026-02-28",
    summary:
      "Why fewer projects with deeper reflection can outperform frantic context switching.",
    url: "#",
    tags: ["Learning", "Mindset"],
  },
  {
    title: "A Weekend Photography Walk",
    date: "2026-01-30",
    summary:
      "Notes from a calm day with no agenda except noticing details and following good light.",
    url: "#",
    tags: ["Photography", "Life"],
  },
];

let personalPosts = [];
let technicalPosts = [];

function formatDate(isoDate) {
  const parsedDate = new Date(`${isoDate}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return isoDate;
  }

  return parsedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function createPostCard(post, variant = "technical") {
  const article = document.createElement("article");
  article.className = `post-item post-item--${variant}`;

  const safeUrl = post.url && post.url.trim().length > 0 ? post.url : "#";
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const titleText = post.title || "Untitled";
  const meta = document.createElement("p");
  meta.className = "post-item__meta";
  meta.textContent = `${formatDate(post.date)}${
    tags.length ? ` · ${tags.join(" · ")}` : ""
  }`;

  const title = document.createElement("h3");
  const titleLink = document.createElement("a");
  titleLink.href = safeUrl;
  titleLink.textContent = titleText;

  if (safeUrl.startsWith("http")) {
    titleLink.target = "_blank";
    titleLink.rel = "noreferrer";
  }

  title.appendChild(titleLink);

  const summary = document.createElement("p");
  summary.textContent = post.summary;

  const link = document.createElement("a");
  link.href = safeUrl;
  link.textContent = variant === "personal" ? "Open note" : "Read post";

  if (safeUrl.startsWith("http")) {
    link.target = "_blank";
    link.rel = "noreferrer";
  }

  if (variant === "personal") {
    const brand = document.createElement("p");
    brand.className = "post-item__brand";
    brand.textContent = "BENJOHNS";
    article.append(brand);
  }

  article.append(meta, title, summary, link);

  return article;
}

function renderPosts(posts, targetNode, variant = "technical") {
  if (!targetNode) {
    return;
  }

  targetNode.textContent = "";

  if (!Array.isArray(posts) || posts.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "flip-hint";
    emptyState.textContent =
      variant === "technical"
        ? "No technical posts yet. Click the lock to add your first post."
        : "No personal posts yet. Add one in content/blog-posts.json.";
    targetNode.appendChild(emptyState);
    return;
  }

  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  sortedPosts.forEach((post) => {
    if (!post || !post.title || !post.summary || !post.date) {
      return;
    }

    targetNode.appendChild(createPostCard(post, variant));
  });
}

function saveTechnicalPosts() {
  try {
    localStorage.setItem(TECHNICAL_POSTS_KEY, JSON.stringify(technicalPosts));
  } catch (error) {
    console.error("Could not persist technical posts.", error);
  }
}

function loadSavedTechnicalPosts() {
  try {
    const raw = localStorage.getItem(TECHNICAL_POSTS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load saved technical posts.", error);
    return [];
  }
}

function openTechnicalModal() {
  if (!technicalModal) {
    return;
  }

  technicalModal.hidden = false;
  requestAnimationFrame(() => {
    technicalPostTitle?.focus();
  });
}

function closeTechnicalModal() {
  if (!technicalModal) {
    return;
  }

  technicalModal.hidden = true;
  technicalPostForm?.reset();
}

function addTechnicalPostFromForm(event) {
  event.preventDefault();

  const title = technicalPostTitle?.value.trim();
  const body = technicalPostBody?.value.trim();

  if (!title || !body) {
    return;
  }

  technicalPosts.push({
    title,
    summary: body,
    date: new Date().toISOString().slice(0, 10),
    url: "#",
    tags: ["Technical"],
  });

  saveTechnicalPosts();
  renderPosts(technicalPosts, technicalPostsContainer, "technical");
  closeTechnicalModal();
}

function unlockTechnicalEditor() {
  const input = window.prompt("Enter password to unlock technical blog editor:");

  if (!input) {
    return;
  }

  if (input !== TECHNICAL_POST_PASSWORD) {
    window.alert("Incorrect password.");
    return;
  }

  openTechnicalModal();
}

function setAnthropicMode(isEnabled) {
  document.body.classList.toggle("anthropic-mode", isEnabled);

  if (personalBlogSection) {
    personalBlogSection.hidden = !isEnabled;
  }

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isEnabled));
  }
}

async function loadBlogData() {
  try {
    const response = await fetch("./content/blog-posts.json", {
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blog content: ${response.status}`);
    }

    const blogData = await response.json();
    personalPosts = Array.isArray(blogData.personal)
      ? blogData.personal
      : DEFAULT_PERSONAL_POSTS;

    technicalPosts = loadSavedTechnicalPosts();
    renderPosts(technicalPosts, technicalPostsContainer, "technical");
    renderPosts(personalPosts, personalPostsContainer, "personal");
  } catch (error) {
    technicalPosts = loadSavedTechnicalPosts();
    personalPosts = DEFAULT_PERSONAL_POSTS;
    renderPosts(technicalPosts, technicalPostsContainer, "technical");
    renderPosts(personalPosts, personalPostsContainer, "personal");
    console.error(error);
  }
}

function initHiddenToggle() {
  setAnthropicMode(false);

  themeToggle?.addEventListener("click", () => {
    const isActive = document.body.classList.contains("anthropic-mode");
    setAnthropicMode(!isActive);
  });
}

function initTechnicalEditor() {
  closeTechnicalModal();
  unlockTechnicalButton?.addEventListener("click", unlockTechnicalEditor);
  cancelTechnicalPostButton?.addEventListener("click", closeTechnicalModal);
  modalBackdrop?.addEventListener("click", closeTechnicalModal);
  technicalPostForm?.addEventListener("submit", addTechnicalPostFromForm);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && technicalModal && !technicalModal.hidden) {
      closeTechnicalModal();
    }
  });
}

function init() {
  loadBlogData();
  initHiddenToggle();
  initTechnicalEditor();
}

init();
