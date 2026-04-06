const technicalPostsContainer = document.getElementById("technicalPosts");
const personalPostsContainer = document.getElementById("personalPosts");
const themeToggle = document.getElementById("themeToggle");
const personalBlogSection = document.getElementById("personalBlogSection");

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
    emptyState.textContent = "No posts yet. Add one in content/blog-posts.json.";
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

    renderPosts(blogData.technical, technicalPostsContainer, "technical");
    renderPosts(blogData.personal, personalPostsContainer, "personal");
  } catch (error) {
    const message = document.createElement("p");
    message.className = "flip-hint";
    message.textContent =
      "Could not load posts. Check content/blog-posts.json format.";

    technicalPostsContainer?.appendChild(message.cloneNode(true));
    personalPostsContainer?.appendChild(message);
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

function init() {
  loadBlogData();
  initHiddenToggle();
}

init();
