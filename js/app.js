import { state } from "./state.js";
import { auth } from "./auth.js";
import { feed } from "./feed.js";
import { stories } from "./stories.js";
import { explore } from "./explore.js";
import { profile } from "./profile.js";
import { create } from "./create.js";
import { api } from "./api.js";

const app = {
  init() {
    // Terapkan tema awal
    state.setTheme(state.theme);
    this.initThemeToggle();

    // Inisialisasi Auth
    auth.init();

    if (state.currentUser) {
      // Inisialisasi Fitur
      create.init();
      explore.initSearch();
      this.initRouter();
    }
  },

  initThemeToggle() {
    const btn = document.getElementById("themeToggleBtn");
    const icon = document.getElementById("themeIcon");
    const label = document.getElementById("themeLabel");

    const updateUI = (theme) => {
      icon.className = theme === "dark" ? "fa-solid fa-sun text-xl" : "fa-solid fa-moon text-xl";
      label.textContent = theme === "dark" ? "Mode Terang" : "Mode Gelap";
    };

    updateUI(state.theme);

    btn.onclick = () => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      state.setTheme(nextTheme);
      updateUI(nextTheme);
    };
  },

  initRouter() {
    const handleRoute = () => {
      const hash = window.location.hash || "#feed";
      const [route, queryStr] = hash.split("?");
      const params = new URLSearchParams(queryStr || "");

      // Sembunyikan semua views
      document.getElementById("sectionFeed").classList.add("hidden");
      document.getElementById("sectionExplore").classList.add("hidden");
      document.getElementById("sectionSearch").classList.add("hidden");
      document.getElementById("sectionNotifications").classList.add("hidden");
      document.getElementById("sectionProfile").classList.add("hidden");

      switch (route) {
        case "#feed":
          document.getElementById("sectionFeed").classList.remove("hidden");
          feed.loadFeed();
          stories.loadStories();
          break;
        case "#explore":
          document.getElementById("sectionExplore").classList.remove("hidden");
          explore.loadExplore();
          break;
        case "#search":
          document.getElementById("sectionSearch").classList.remove("hidden");
          break;
        case "#notifications":
          document.getElementById("sectionNotifications").classList.remove("hidden");
          this.loadNotifications();
          break;
        case "#profile":
          document.getElementById("sectionProfile").classList.remove("hidden");
          profile.loadProfile(params.get("user"));
          break;
        default:
          window.location.hash = "#feed";
      }
    };

    window.addEventListener("hashchange", handleRoute);

    // Bind nav buttons
    document.querySelectorAll("[data-nav]").forEach((btn) => {
      btn.onclick = () => {
        const target = btn.getAttribute("data-nav");
        window.location.hash = `#${target}`;
      };
    });

    handleRoute();
  },

  async loadNotifications() {
    const list = document.getElementById("notificationsList");
    list.innerHTML = `<p class="text-xs text-neutral-400 py-4 text-center">Memuat notifikasi...</p>`;
    try {
      const res = await api.get("getNotifications");
      const notifications = res.notifications || [];
      if (!notifications.length) {
        list.innerHTML = `<p class="text-sm text-neutral-400 py-8 text-center">Belum ada notifikasi</p>`;
        return;
      }
      list.innerHTML = notifications.map((n) => `
        <div class="flex items-center justify-between p-3 border border-neutral-100 dark:border-darkBorder rounded-xl bg-white dark:bg-darkCard">
          <div class="flex items-center space-x-3">
            <img src="${n.senderAvatar}" class="w-9 h-9 rounded-full object-cover" />
            <p class="text-sm">
              <span class="font-bold">${n.senderUsername}</span>
              ${n.type === 'LIKE' ? 'menyukai postingan Anda.' : n.type === 'COMMENT' ? 'mengomentari postingan Anda.' : 'mulai mengikuti Anda.'}
            </p>
          </div>
          <span class="text-[10px] text-neutral-400">${new Date(n.createdAt).toLocaleDateString("id-ID")}</span>
        </div>
      `).join("");
    } catch (e) {
      list.innerHTML = `<p class="text-xs text-red-500 py-4 text-center">Gagal memuat notifikasi</p>`;
    }
  }
};

document.addEventListener("DOMContentLoaded", () => app.init());