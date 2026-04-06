const siteShell = document.querySelector(".site-shell");
const portfolioFace = document.getElementById("portfolioFace");
const blogFace = document.getElementById("blogFace");
const flipButton = document.getElementById("flipButton");
const returnButton = document.getElementById("returnButton");
const technicalPostsContainer = document.getElementById("technicalPosts");
const personalPostsContainer = document.getElementById("personalPosts");
const flipTriggerSection = document.getElementById("flipTrigger");

let canFlip = false;

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

function createPostCard(post) {
  const article = document.createElement("article");
  article.className = "post-item";

  const safeUrl = post.url && post.url.trim().length > 0 ? post.url : "#";
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const meta = document.createElement("p");
  meta.className = "post-item__meta";
  meta.textContent = `${formatDate(post.date)}${
    tags.length ? ` · ${tags.join(" · ")}` : ""
  }`;

  const title = document.createElement("h3");
  title.textContent = post.title;

  const summary = document.createElement("p");
  summary.textContent = post.summary;

  const link = document.createElement("a");
  link.href = safeUrl;
  link.textContent = "Read post";

  if (safeUrl.startsWith("http")) {
    link.target = "_blank";
    link.rel = "noreferrer";
  }

  article.append(meta, title, summary, link);

  return article;
}

function renderPosts(posts, targetNode) {
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

    targetNode.appendChild(createPostCard(post));
  });
}

function setFlipAvailability(isAvailable) {
  canFlip = isAvailable;

  if (flipButton) {
    flipButton.disabled = !isAvailable;
  }

  if (!flipTriggerSection) {
    return;
  }

  const previousHint = flipTriggerSection.querySelector(".flip-hint");
  if (previousHint) {
    previousHint.remove();
  }

  const hint = document.createElement("p");
  hint.className = "flip-hint";
  hint.textContent = isAvailable
    ? "Flip unlocked. Press the button to enter blog mode."
    : "Scroll to the page bottom to unlock the flip.";
  flipTriggerSection.appendChild(hint);
}

function isAtPageBottom() {
  const threshold = 32;
  const viewportBottom = window.scrollY + window.innerHeight;
  return viewportBottom >= document.documentElement.scrollHeight - threshold;
}

function flipToBlog() {
  if (!siteShell || !canFlip) {
    return;
  }

  siteShell.classList.add("is-flipped");
  document.body.classList.add("blog-mode");
  blogFace?.setAttribute("aria-hidden", "false");
  portfolioFace?.setAttribute("aria-hidden", "true");
}

function flipToPortfolio() {
  if (!siteShell) {
    return;
  }

  siteShell.classList.remove("is-flipped");
  document.body.classList.remove("blog-mode");
  blogFace?.setAttribute("aria-hidden", "true");
  portfolioFace?.setAttribute("aria-hidden", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
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

    renderPosts(blogData.technical, technicalPostsContainer);
    renderPosts(blogData.personal, personalPostsContainer);
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

function initFlipBehavior() {
  setFlipAvailability(isAtPageBottom());

  window.addEventListener("scroll", () => {
    setFlipAvailability(isAtPageBottom());
  });

  flipButton?.addEventListener("click", flipToBlog);
  returnButton?.addEventListener("click", flipToPortfolio);
}

function init() {
  loadBlogData();
  initFlipBehavior();
}

init();
