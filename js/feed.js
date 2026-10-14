import { api } from "./api.js";
import { state } from "./state.js";
import { ui } from "./ui.js";

export const feed = {
  async loadFeed() {
    ui.renderFeedSkeleton();
    try {
      const res = await api.get("getFeed");
      state.feedPosts = res.feed || [];
      this.render();
    } catch (err) {
      ui.showToast("Gagal memuat feed", "error");
    }
  },

  render() {
    const container = document.getElementById("feedList");
    if (state.feedPosts.length === 0) {
      container.innerHTML = `
        <div class="text-center py-16 border border-neutral-200 dark:border-darkBorder rounded-xl bg-white dark:bg-darkCard">
          <i class="fa-solid fa-camera text-4xl text-neutral-400 mb-3"></i>
          <h3 class="font-bold text-lg">Belum Ada Postingan</h3>
          <p class="text-sm text-neutral-500">Jadilah yang pertama mengunggah momen hari ini!</p>
        </div>`;
      return;
    }

    container.innerHTML = state.feedPosts.map((post) => `
      <article class="border border-neutral-200 dark:border-darkBorder rounded-xl bg-white dark:bg-darkCard overflow-hidden" data-post-id="${post.postId}">
        <!-- Post Header -->
        <div class="flex items-center justify-between p-3.5 border-b border-neutral-100 dark:border-darkBorder">
          <div class="flex items-center space-x-3 cursor-pointer user-profile-link" data-username="${post.username}">
            <img src="${post.avatarUrl}" class="w-9 h-9 rounded-full object-cover border border-neutral-200 dark:border-darkBorder" />
            <div>
              <p class="font-bold text-sm hover:underline">${post.username}</p>
              <p class="text-[11px] text-neutral-400">${new Date(post.createdAt).toLocaleDateString("id-ID")}</p>
            </div>
          </div>
        </div>

        <!-- Post Media -->
        <div class="relative bg-black flex items-center justify-center max-h-[500px]">
          ${post.mediaType === 'video'
            ? `<video src="${post.mediaUrl}" controls class="w-full max-h-[500px] object-cover"></video>`
            : `<img src="${post.mediaUrl}" loading="lazy" class="w-full max-h-[500px] object-cover" />`
          }
        </div>

        <!-- Action Buttons -->
        <div class="p-3.5 space-y-2">
          <div class="flex items-center justify-between text-2xl">
            <div class="flex items-center space-x-4">
              <button class="btn-like transition ${post.hasLiked ? 'heart-active' : 'text-neutral-700 dark:text-neutral-200'}">
                <i class="${post.hasLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
              </button>
              <button class="btn-comment text-neutral-700 dark:text-neutral-200">
                <i class="fa-regular fa-comment"></i>
              </button>
            </div>
            <button class="btn-save text-neutral-700 dark:text-neutral-200">
              <i class="${post.hasSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'}"></i>
            </button>
          </div>

          <p class="font-bold text-sm"><span class="likes-count">${post.likesCount}</span> suka</p>

          <div class="text-sm">
            <span class="font-bold mr-2">${post.username}</span>
            <span class="text-neutral-800 dark:text-neutral-200">${post.caption}</span>
          </div>

          <button class="btn-view-comments text-xs text-neutral-400 font-medium">
            Lihat semua ${post.commentsCount} komentar
          </button>
        </div>
      </article>
    `).join("");

    this.bindInteractions();
  },

  bindInteractions() {
    document.querySelectorAll("article[data-post-id]").forEach((card) => {
      const postId = card.getAttribute("data-post-id");
      const post = state.feedPosts.find((p) => p.postId === postId);
      if (!post) return;

      // Optimistic Like
      const likeBtn = card.querySelector(".btn-like");
      const likesCountEl = card.querySelector(".likes-count");
      likeBtn.onclick = async () => {
        const previousState = post.hasLiked;
        post.hasLiked = !previousState;
        post.likesCount += post.hasLiked ? 1 : -1;

        // Render langsung di DOM
        likesCountEl.textContent = post.likesCount;
        likeBtn.className = `btn-like transition ${post.hasLiked ? "heart-active" : "text-neutral-700 dark:text-neutral-200"}`;
        likeBtn.innerHTML = `<i class="${post.hasLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"}"></i>`;

        try {
          await api.post("toggleLike", { postId, postAuthorId: post.userId });
        } catch (e) {
          // Rollback bila gagal
          post.hasLiked = previousState;
          post.likesCount += post.hasLiked ? 1 : -1;
          likesCountEl.textContent = post.likesCount;
          ui.showToast("Gagal menyimpan like", "error");
        }
      };

      // Optimistic Bookmark/Save
      const saveBtn = card.querySelector(".btn-save");
      saveBtn.onclick = async () => {
        const previousState = post.hasSaved;
        post.hasSaved = !previousState;
        saveBtn.innerHTML = `<i class="${post.hasSaved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"}"></i>`;

        try {
          await api.post("toggleSave", { postId });
        } catch (e) {
          post.hasSaved = previousState;
          saveBtn.innerHTML = `<i class="${post.hasSaved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"}"></i>`;
          ui.showToast("Gagal menyimpan post", "error");
        }
      };

      // Buka Komentar
      const openComment = () => feed.openCommentsDrawer(post);
      card.querySelector(".btn-comment").onclick = openComment;
      card.querySelector(".btn-view-comments").onclick = openComment;

      // Profile click navigation
      card.querySelector(".user-profile-link").onclick = () => {
        window.location.hash = `#profile?user=${post.username}`;
      };
    });
  },

  async openCommentsDrawer(post) {
    const modal = document.getElementById("commentsModal");
    const list = document.getElementById("commentsList");
    modal.classList.remove("hidden");
    list.innerHTML = `<p class="text-sm text-neutral-400 text-center py-8">Memuat komentar...</p>`;

    try {
      const res = await api.get("getPostComments", { postId: post.postId });
      const comments = res.comments || [];
      if (comments.length === 0) {
        list.innerHTML = `<p class="text-sm text-neutral-400 text-center py-8">Belum ada komentar. Jadilah yang pertama!</p>`;
      } else {
        list.innerHTML = comments.map((c) => `
          <div class="flex space-x-3 text-sm">
            <img src="${c.avatarUrl}" class="w-8 h-8 rounded-full object-cover" />
            <div class="flex-1">
              <span class="font-bold mr-2">${c.username}</span>
              <span>${c.text}</span>
              <p class="text-[10px] text-neutral-400 mt-1">${new Date(c.createdAt).toLocaleDateString("id-ID")}</p>
            </div>
          </div>
        `).join("");
      }
    } catch (e) {
      list.innerHTML = `<p class="text-sm text-red-500 text-center py-8">Gagal memuat komentar</p>`;
    }

    // Submit New Comment
    const form = document.getElementById("commentForm");
    form.onsubmit = async (e) => {
      e.preventDefault();
      const input = document.getElementById("commentTextInput");
      const text = input.value;
      input.value = "";

      try {
        const res = await api.post("addComment", {
          postId: post.postId,
          postAuthorId: post.userId,
          text
        });
        if (res.comment) {
          post.commentsCount += 1;
          this.openCommentsDrawer(post);
          this.render(); // update badge jumlah komentar
        }
      } catch (err) {
        ui.showToast("Gagal mengirim komentar", "error");
      }
    };

    document.getElementById("closeCommentsModalBtn").onclick = () => {
      modal.classList.add("hidden");
    };
  }
};