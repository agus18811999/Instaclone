import { api } from "./api.js";
import { state } from "./state.js";
import { APP_CONFIG } from "./config.js";

export const stories = {
  async loadStories() {
    try {
      const res = await api.get("getStories");
      this.renderStrip(res.stories || []);
    } catch (e) {
      console.error("Gagal load stories", e);
    }
  },

  renderStrip(storyGroups) {
    const strip = document.getElementById("storiesStrip");
    if (!storyGroups.length) {
      strip.classList.add("hidden");
      return;
    }
    strip.classList.remove("hidden");

    strip.innerHTML = storyGroups.map((group, idx) => `
      <div class="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer story-user-badge" data-index="${idx}">
        <div class="story-ring-unseen">
          <img src="${group.avatarUrl}" class="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-black" />
        </div>
        <span class="text-xs truncate w-16 text-center">${group.username}</span>
      </div>
    `).join("");

    strip.querySelectorAll(".story-user-badge").forEach((badge) => {
      badge.onclick = () => {
        const index = parseInt(badge.getAttribute("data-index"), 10);
        this.openViewer(storyGroups[index]);
      };
    });
  },

  openViewer(userStoryGroup) {
    state.currentViewingStories = userStoryGroup.stories;
    state.activeStoryIndex = 0;

    const modal = document.getElementById("storyViewerModal");
    modal.classList.remove("hidden");

    document.getElementById("storyUserAvatar").src = userStoryGroup.avatarUrl;
    document.getElementById("storyUsername").textContent = userStoryGroup.username;

    this.renderCurrentStoryItem();

    document.getElementById("closeStoryViewerBtn").onclick = () => {
      this.closeViewer();
    };

    document.getElementById("storyMediaContainer").onclick = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX > rect.width / 2) {
        this.nextStory();
      } else {
        this.prevStory();
      }
    };
  },

  renderCurrentStoryItem() {
    clearTimeout(state.storyTimer);
    const story = state.currentViewingStories[state.activeStoryIndex];
    if (!story) {
      this.closeViewer();
      return;
    }

    const img = document.getElementById("storyImage");
    const vid = document.getElementById("storyVideo");
    const progressContainer = document.getElementById("storyProgressBars");

    // Render bars
    progressContainer.innerHTML = state.currentViewingStories.map((_, i) => `
      <div class="h-1 flex-1 bg-white/40 rounded-full overflow-hidden">
        <div class="h-full bg-white transition-all duration-linear ${i < state.activeStoryIndex ? 'w-full' : i === state.activeStoryIndex ? 'w-0 progress-active' : 'w-0'}"></div>
      </div>
    `).join("");

    if (story.mediaType === "video") {
      img.classList.add("hidden");
      vid.classList.remove("hidden");
      vid.src = story.mediaUrl;
      vid.currentTime = 0;
      vid.play();
    } else {
      vid.classList.add("hidden");
      img.classList.remove("hidden");
      img.src = story.mediaUrl;
    }

    // Trigger animasi bar progress
    setTimeout(() => {
      const activeBar = progressContainer.querySelector(".progress-active");
      if (activeBar) {
        activeBar.style.transitionDuration = `${APP_CONFIG.STORY_DURATION_MS}ms`;
        activeBar.style.width = "100%";
      }
    }, 50);

    state.storyTimer = setTimeout(() => {
      this.nextStory();
    }, APP_CONFIG.STORY_DURATION_MS);
  },

  nextStory() {
    if (state.activeStoryIndex < state.currentViewingStories.length - 1) {
      state.activeStoryIndex++;
      this.renderCurrentStoryItem();
    } else {
      this.closeViewer();
    }
  },

  prevStory() {
    if (state.activeStoryIndex > 0) {
      state.activeStoryIndex--;
      this.renderCurrentStoryItem();
    }
  },

  closeViewer() {
    clearTimeout(state.storyTimer);
    document.getElementById("storyViewerModal").classList.add("hidden");
    const vid = document.getElementById("storyVideo");
    vid.pause();
    vid.src = "";
  }
};