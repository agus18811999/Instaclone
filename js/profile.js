import { api } from "./api.js";
import { state } from "./state.js";
import { ui } from "./ui.js";

export const profile = {
  async loadProfile(targetUsername) {
    const username = targetUsername || (state.currentUser ? state.currentUser.username : "");
    const header = document.getElementById("profileHeader");
    const grid = document.getElementById("profileGrid");

    header.innerHTML = `<div class="w-full text-center py-6 text-sm text-neutral-400">Memuat profil...</div>`;
    grid.innerHTML = "";

    try {
      const res = await api.get("getProfile", { username });
      const p = res.profile;

      header.innerHTML = `
        <div class="w-20 h-20 md:w-36 md:h-36 rounded-full overflow-hidden border border-neutral-200 dark:border-darkBorder flex-shrink-0">
          <img src="${p.avatarUrl}" class="w-full h-full object-cover" />
        </div>
        <div class="space-y-4 flex-1">
          <div class="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
            <h2 class="text-xl font-bold">${p.username}</h2>
            ${p.isSelf
              ? `<button id="editBioBtn" class="px-4 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-sm font-semibold rounded-lg hover:bg-neutral-200">Edit Profil</button>`
              : `<button id="followActionBtn" class="px-6 py-1.5 ${p.isFollowing ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white' : 'bg-brand text-white'} text-sm font-semibold rounded-lg transition">${p.isFollowing ? 'Mengikuti' : 'Ikuti'}</button>`
            }
          </div>
          <div class="flex space-x-6 text-sm">
            <span><strong>${p.postsCount}</strong> postingan</span>
            <span><strong id="profFollowerCount">${p.followerCount}</strong> pengikut</span>
            <span><strong>${p.followingCount}</strong> mengikuti</span>
          </div>
          <div>
            <h3 class="font-bold text-sm">${p.fullName}</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">${p.bio || ""}</p>
          </div>
        </div>
      `;

      if (!p.isSelf) {
        const btn = document.getElementById("followActionBtn");
        btn.onclick = async () => {
          const prevState = p.isFollowing;
          p.isFollowing = !prevState;
          p.followerCount += p.isFollowing ? 1 : -1;
          document.getElementById("profFollowerCount").textContent = p.followerCount;
          btn.className = `px-6 py-1.5 ${p.isFollowing ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white' : 'bg-brand text-white'} text-sm font-semibold rounded-lg transition`;
          btn.textContent = p.isFollowing ? "Mengikuti" : "Ikuti";

          try {
            await api.post("toggleFollow", { targetUserId: p.userId });
          } catch (e) {
            p.isFollowing = prevState;
            btn.textContent = p.isFollowing ? "Mengikuti" : "Ikuti";
            ui.showToast("Gagal follow/unfollow", "error");
          }
        };
      } else {
        document.getElementById("editBioBtn").onclick = () => {
          const newBio = prompt("Ubah Bio:", p.bio);
          if (newBio !== null) {
            api.post("updateProfile", { bio: newBio }).then(() => {
              ui.showToast("Profil diperbarui");
              profile.loadProfile(p.username);
            });
          }
        };
      }

      // Tab switcher Posts vs Saved
      const renderGrid = (items) => {
        if (!items || items.length === 0) {
          grid.innerHTML = `<p class="col-span-3 text-center py-12 text-sm text-neutral-400">Tidak ada konten untuk ditampilkan</p>`;
          return;
        }
        grid.innerHTML = items.map((item) => `
          <div class="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-md overflow-hidden cursor-pointer">
            <img src="${item.mediaUrl}" loading="lazy" class="w-full h-full object-cover hover:scale-105 transition duration-300" />
          </div>
        `).join("");
      };

      renderGrid(p.posts);

      document.getElementById("tabPostsBtn").onclick = (e) => {
        document.getElementById("tabPostsBtn").className = "py-3 border-b-2 border-black dark:border-white flex items-center space-x-2";
        document.getElementById("tabSavedBtn").className = "py-3 text-neutral-400 flex items-center space-x-2";
        renderGrid(p.posts);
      };

      document.getElementById("tabSavedBtn").onclick = (e) => {
        document.getElementById("tabSavedBtn").className = "py-3 border-b-2 border-black dark:border-white flex items-center space-x-2";
        document.getElementById("tabPostsBtn").className = "py-3 text-neutral-400 flex items-center space-x-2";
        renderGrid(p.savedPosts || []);
      };

    } catch (err) {
      header.innerHTML = `<div class="w-full text-center py-6 text-sm text-red-500">Gagal memuat profil</div>`;
    }
  }
};