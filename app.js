// @ts-check

/**
 * @typedef {"technical" | "personal"} PostVariant
 */

/**
 * @typedef {{
 *   title: string;
 *   date: string;
 *   summary: string;
 *   url: string;
 *   tags: string[];
 * }} Post
 */

/**
 * @typedef {{
 *   technical: Post[];
 *   personal: Post[];
 * }} BlogData
 */

const technicalPostsContainer = document.getElementById("technicalPosts");
const personalPostsContainer = document.getElementById("personalPosts");
const composeToggle = document.getElementById("composeToggle");
const composeModeNotice = document.getElementById("composeModeNotice");
const technicalEditor = document.getElementById("technicalEditor");
const technicalPostForm = document.getElementById("technicalPostForm");
const technicalPostTitle = document.getElementById("technicalPostTitle");
const technicalPostLink = document.getElementById("technicalPostLink");
const technicalPostBody = document.getElementById("technicalPostBody");
const technicalFormMessage = document.getElementById("technicalFormMessage");
const closeEditorButton = document.getElementById("closeEditorButton");

const TECHNICAL_DRAFTS_KEY = "customTechnicalDrafts";
const COMPOSE_MODE_QUERY_KEY = "compose";
const COMPOSE_MODE_QUERY_VALUE = "technical";
const COMPOSE_MODE_HASH = "#compose-technical";

/** @type {Post[]} */
let publishedTechnicalPosts = [];

/** @type {Post[]} */
let storedTechnicalDrafts = [];

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
  return typeof value === "object" && value !== null;
}

/**
 * @param {string} isoDate
 * @returns {string}
 */
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

/**
 * @param {unknown} value
 * @returns {string[]}
 */
function normalizeTags(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry) => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

/**
 * @param {unknown} value
 * @returns {Post | null}
 */
function normalizePost(value) {
  if (!isRecord(value)) {
    return null;
  }

  const title = typeof value.title === "string" ? value.title.trim() : "";
  const date = typeof value.date === "string" ? value.date.trim() : "";
  const summary = typeof value.summary === "string" ? value.summary.trim() : "";
  const url = typeof value.url === "string" ? value.url.trim() : "#";
  const tags = normalizeTags(value.tags);

  if (title.length === 0 || date.length === 0 || summary.length === 0) {
    return null;
  }

  return {
    title,
    date,
    summary,
    url: url.length > 0 ? url : "#",
    tags,
  };
}

/**
 * @param {unknown} value
 * @param {string} propertyName
 * @returns {Post[]}
 */
function readPostList(value, propertyName) {
  if (!Array.isArray(value)) {
    throw new Error(`${propertyName} must be an array of posts.`);
  }

  return value
    .map((entry) => normalizePost(entry))
    .filter((entry) => entry !== null);
}

/**
 * @param {string} message
 * @returns {HTMLParagraphElement}
 */
function createStateMessage(message) {
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  return paragraph;
}

/**
 * @param {Post} post
 * @param {PostVariant} variant
 * @returns {HTMLElement}
 */
function createPostCard(post, variant) {
  const article = document.createElement("article");
  article.className = `post-card post-card--${variant}`;

  const meta = document.createElement("p");
  meta.className = "post-card__meta";
  meta.textContent = `${formatDate(post.date)}${
    post.tags.length > 0 ? ` · ${post.tags.join(" · ")}` : ""
  }`;

  const title = document.createElement("h3");
  title.className = "post-card__title";

  const hasLinkedDestination = post.url !== "#";

  if (hasLinkedDestination) {
    const titleLink = document.createElement("a");
    titleLink.href = post.url;
    titleLink.textContent = post.title;

    if (post.url.startsWith("http")) {
      titleLink.target = "_blank";
      titleLink.rel = "noreferrer";
    }

    title.appendChild(titleLink);
  } else {
    title.textContent = post.title;
  }

  const summary = document.createElement("p");
  summary.className = "post-card__summary";
  summary.textContent = post.summary;

  article.append(meta, title, summary);

  if (hasLinkedDestination) {
    const link = document.createElement("a");
    link.className = "post-card__link";
    link.href = post.url;
    link.textContent = variant === "technical" ? "Read post" : "Open note";

    if (post.url.startsWith("http")) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }

    article.appendChild(link);
  }

  return article;
}

/**
 * @param {Post[]} posts
 * @returns {Post[]}
 */
function sortPosts(posts) {
  return [...posts].sort((left, right) => {
    return new Date(right.date).getTime() - new Date(left.date).getTime();
  });
}

/**
 * @param {Post[]} posts
 * @param {HTMLElement | null} targetNode
 * @param {PostVariant} variant
 * @param {string} emptyMessage
 * @returns {void}
 */
function renderPosts(posts, targetNode, variant, emptyMessage) {
  if (!targetNode) {
    return;
  }

  if (posts.length === 0) {
    const emptyState = createStateMessage(emptyMessage);
    emptyState.className = "empty-state";
    targetNode.replaceChildren(emptyState);
    return;
  }

  const sortedPosts = sortPosts(posts);
  const postCards = sortedPosts.map((post) => createPostCard(post, variant));
  targetNode.replaceChildren(...postCards);
}

/**
 * @param {HTMLElement | null} targetNode
 * @param {string} message
 * @returns {void}
 */
function renderErrorState(targetNode, message) {
  if (!targetNode) {
    return;
  }

  const errorState = createStateMessage(message);
  errorState.className = "error-state";
  targetNode.replaceChildren(errorState);
}

/**
 * @param {string} message
 * @param {"success" | "error" | ""} state
 * @returns {void}
 */
function setFormMessage(message, state) {
  if (!technicalFormMessage) {
    return;
  }

  technicalFormMessage.textContent = message;

  if (state.length === 0) {
    delete technicalFormMessage.dataset.state;
    return;
  }

  technicalFormMessage.dataset.state = state;
}

/**
 * @param {string} search
 * @param {string} hash
 * @returns {boolean}
 */
function isComposeModeEnabled(search, hash) {
  const searchParams = new URLSearchParams(search);
  return (
    searchParams.get(COMPOSE_MODE_QUERY_KEY) === COMPOSE_MODE_QUERY_VALUE ||
    hash === COMPOSE_MODE_HASH
  );
}

/**
 * @returns {void}
 */
function applyComposeModeState() {
  const composeModeEnabled = isComposeModeEnabled(
    window.location.search,
    window.location.hash
  );

  if (composeToggle) {
    composeToggle.hidden = !composeModeEnabled;
    composeToggle.setAttribute("aria-expanded", "false");
  }

  if (composeModeNotice) {
    composeModeNotice.hidden = !composeModeEnabled;
  }

  if (!composeModeEnabled && technicalEditor) {
    technicalEditor.hidden = true;
  }
}

/**
 * @returns {void}
 */
function toggleTechnicalEditor() {
  if (!technicalEditor || !composeToggle) {
    return;
  }

  const nextState = technicalEditor.hidden;
  technicalEditor.hidden = !nextState;
  composeToggle.setAttribute("aria-expanded", String(nextState));
  composeToggle.textContent = nextState ? "Hide draft editor" : "Open draft editor";

  if (nextState && technicalPostTitle instanceof HTMLInputElement) {
    technicalPostTitle.focus();
  }

  if (!nextState) {
    setFormMessage("", "");
  }
}

/**
 * @returns {Post[]}
 */
function loadStoredTechnicalDrafts() {
  const rawValue = window.localStorage.getItem(TECHNICAL_DRAFTS_KEY);

  if (rawValue === null) {
    return [];
  }

  const parsedValue = JSON.parse(rawValue);

  if (!Array.isArray(parsedValue)) {
    throw new Error(
      `localStorage key "${TECHNICAL_DRAFTS_KEY}" must contain an array of posts.`
    );
  }

  return parsedValue
    .map((entry) => normalizePost(entry))
    .filter((entry) => entry !== null);
}

/**
 * @param {Post[]} drafts
 * @returns {void}
 */
function saveStoredTechnicalDrafts(drafts) {
  window.localStorage.setItem(TECHNICAL_DRAFTS_KEY, JSON.stringify(drafts));
}

/**
 * @returns {Post[]}
 */
function getRenderedTechnicalPosts() {
  return [...publishedTechnicalPosts, ...storedTechnicalDrafts];
}

/**
 * @returns {Promise<BlogData>}
 */
async function fetchBlogData() {
  const response = await fetch("./content/blog-posts.json", {
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load content/blog-posts.json with status ${response.status}.`
    );
  }

  /** @type {unknown} */
  const blogData = await response.json();

  if (!isRecord(blogData)) {
    throw new Error("content/blog-posts.json must be a JSON object.");
  }

  return {
    technical: readPostList(blogData.technical, "technical"),
    personal: readPostList(blogData.personal, "personal"),
  };
}

/**
 * @returns {Promise<void>}
 */
async function loadBlogData() {
  try {
    const blogData = await fetchBlogData();
    publishedTechnicalPosts = blogData.technical;
    renderPosts(
      blogData.personal,
      personalPostsContainer,
      "personal",
      "No notes yet."
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load site content.";
    renderErrorState(technicalPostsContainer, message);
    renderErrorState(personalPostsContainer, message);
    return;
  }

  try {
    storedTechnicalDrafts = loadStoredTechnicalDrafts();
  } catch (error) {
    storedTechnicalDrafts = [];
    const message =
      error instanceof Error ? error.message : "Could not load local drafts.";
    setFormMessage(message, "error");
  }

  renderPosts(
    getRenderedTechnicalPosts(),
    technicalPostsContainer,
    "technical",
    "No published technical writing yet."
  );
}

/**
 * @param {SubmitEvent} event
 * @returns {void}
 */
function addTechnicalDraft(event) {
  event.preventDefault();

  if (
    !(technicalPostTitle instanceof HTMLInputElement) ||
    !(technicalPostLink instanceof HTMLInputElement) ||
    !(technicalPostBody instanceof HTMLTextAreaElement)
  ) {
    return;
  }

  const title = technicalPostTitle.value.trim();
  const url = technicalPostLink.value.trim();
  const summary = technicalPostBody.value.trim();

  if (title.length === 0 || summary.length === 0) {
    setFormMessage("Title and summary are required.", "error");
    return;
  }

  storedTechnicalDrafts = [
    ...storedTechnicalDrafts,
    {
      title,
      date: new Date().toISOString().slice(0, 10),
      summary,
      url: url.length > 0 ? url : "#",
      tags: ["Draft"],
    },
  ];

  try {
    saveStoredTechnicalDrafts(storedTechnicalDrafts);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not persist the draft to localStorage.";
    setFormMessage(message, "error");
    return;
  }

  renderPosts(
    getRenderedTechnicalPosts(),
    technicalPostsContainer,
    "technical",
    "No published technical writing yet."
  );

  if (technicalPostForm instanceof HTMLFormElement) {
    technicalPostForm.reset();
  }

  setFormMessage(
    "Draft saved locally. Move it into content/blog-posts.json when you want it published.",
    "success"
  );
}

/**
 * @returns {void}
 */
function initTechnicalEditor() {
  applyComposeModeState();

  composeToggle?.addEventListener("click", toggleTechnicalEditor);
  closeEditorButton?.addEventListener("click", toggleTechnicalEditor);
  technicalPostForm?.addEventListener("submit", addTechnicalDraft);
}

/**
 * @returns {void}
 */
function init() {
  initTechnicalEditor();
  loadBlogData();
}

init();
