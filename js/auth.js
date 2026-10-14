import { api } from "./api.js";
import { state } from "./state.js";
import { ui } from "./ui.js";

export const auth = {
  init() {
    this.bindEvents();
    this.checkSession();
  },

  bindEvents() {
    const toggleAuthBtn = document.getElementById("toggleAuthBtn");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const authSwitchText = document.getElementById("authSwitchText");

    toggleAuthBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isLoginVisible = !loginForm.classList.contains("hidden");
      loginForm.classList.toggle("hidden", isLoginVisible);
      registerForm.classList.toggle("hidden", !isLoginVisible);
      authSwitchText.innerHTML = isLoginVisible
        ? 'Sudah punya akun? <a href="#" id="toggleBackBtn" class="text-brand font-semibold hover:underline">Masuk</a>'
        : 'Belum punya akun? <a href="#" id="toggleBackBtn" class="text-brand font-semibold hover:underline">Daftar sekarang</a>';
      
      document.getElementById("toggleBackBtn").onclick = (ev) => {
        ev.preventDefault();
        toggleAuthBtn.click();
      };
    });

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const identity = document.getElementById("loginIdentity").value;
      const password = document.getElementById("loginPassword").value;
      const submitBtn = document.getElementById("loginBtn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Memverifikasi...";

      try {
        const res = await api.post("login", { identity, password });
        if (res.error) throw new Error(res.error);
        state.setCurrentUser(res.user);
        ui.showToast("Login berhasil! Selamat datang, " + res.user.username);
        window.location.reload();
      } catch (err) {
        ui.showToast(err.message, "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Masuk";
      }
    });

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        email: document.getElementById("regEmail").value,
        full_name: document.getElementById("regFullName").value,
        username: document.getElementById("regUsername").value,
        password: document.getElementById("regPassword").value
      };

      const submitBtn = document.getElementById("regBtn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Mendaftarkan...";

      try {
        const res = await api.post("register", payload);
        if (res.error) throw new Error(res.error);
        state.setCurrentUser(res.user);
        ui.showToast("Pendaftaran sukses!");
        window.location.reload();
      } catch (err) {
        ui.showToast(err.message, "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Daftar";
      }
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
      state.setCurrentUser(null);
      window.location.reload();
    });
  },

  checkSession() {
    const authView = document.getElementById("authView");
    const appView = document.getElementById("appView");

    if (state.currentUser && state.currentUser.token) {
      authView.classList.add("hidden");
      appView.classList.remove("hidden");
      document.getElementById("navAvatar").src = state.currentUser.avatarUrl;
      document.getElementById("navAvatarMobile").src = state.currentUser.avatarUrl;
    } else {
      authView.classList.remove("hidden");
      appView.classList.add("hidden");
    }
  }
};