import { api } from "./api.js";
import { APP_CONFIG } from "./config.js";

export const explore = {
  async loadExplore() {
    const grid = document.getElementById("exploreGrid");
    grid.innerHTML = `<p class="col-span-3 text-center py-12 text-sm text-neutral-400">Memuat eksplorasi...</p>`;
    try {
      const res = await api.get("getExplore");
      const items = res.explore || [];
      grid.innerHTML = items.map((item) => `
        <div class="relative group aspect-square bg-neutral-200 dark:bg-neutral-800 cursor-pointer overflow-hidden rounded-md">
          <img src="${item.mediaUrl}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
            <i class="fa-solid fa-heart mr-2"></i>
          </div>
        </div>
      `).join("");
    } catch (e) {
      grid.innerHTML = `<p class="col-span-3 text-center py-12 text-sm text-red-500">Gagal memuat explore</p>`;
    }
  },

  initSearch() {
    const input = document.getElementById("searchInput");
    const results = document.getElementById("searchResults");
    let timer;

    input.addEventListener("input", (e) => {
      clearTimeout(timer);
      const query = e.target.value.trim();
      if (!query) {
        results.innerHTML = "";
        return;
      }

      timer = setTimeout(async () => {
        results.innerHTML = `<p class="text-xs text-neutral-400 py-3">Mencari...</p>`;
        try {
          const res = await api.get("search", { query });
          const users = res.results || [];
          if (users.length === 0) {
            results.innerHTML = `<p class="text-xs text-neutral-400 py-3">Tidak ada hasil ditemukan</p>`;
            return;
          }
          results.innerHTML = users.map((u) => `
            <div class="flex items-center space-x-3 py-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 px-2 rounded-xl" onclick="window.location.hash='#profile?user=${u.username}'">
              <img src="${u.avatarUrl}" class="w-10 h-10 rounded-full object-cover" />
              <div>
                <p class="font-bold text-sm">${u.username}</p>
                <p class="text-xs text-neutral-400">${u.fullName}</p>
              </div>
            </div>
          `).join("");
        } catch (err) {
          results.innerHTML = `<p class="text-xs text-red-500 py-3">Error mencari pengguna</p>`;
        }
      }, APP_CONFIG.SEARCH_DEBOUNCE_MS);
    });
  }
};