import { api } from "./api.js";
import { ui } from "./ui.js";
import { APP_CONFIG } from "./config.js";

export const create = {
  selectedFileBase64: null,
  selectedFileType: "image",
  selectedMimeType: "image/jpeg",

  init() {
    const modal = document.getElementById("createModal");
    const openBtn = document.getElementById("openCreatePostModalBtn");
    const openMobileBtn = document.getElementById("openMobileCreateBtn");
    const closeBtn = document.getElementById("closeCreateModalBtn");
    const fileInput = document.getElementById("mediaFileInput");
    const form = document.getElementById("createPostForm");

    const openModal = () => modal.classList.remove("hidden");
    const closeModal = () => {
      modal.classList.add("hidden");
      this.resetForm();
    };

    openBtn.onclick = openModal;
    openMobileBtn.onclick = openModal;
    closeBtn.onclick = closeModal;

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > APP_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) {
        ui.showToast(`Ukuran file maksimal ${APP_CONFIG.MAX_FILE_SIZE_MB}MB`, "error");
        fileInput.value = "";
        return;
      }

      this.selectedMimeType = file.type;
      this.selectedFileType = file.type.startsWith("video") ? "video" : "image";
      this.selectedFileBase64 = await api.fileToBase64(file);

      // Render Preview
      document.getElementById("uploadPlaceholder").classList.add("hidden");
      const previewCont = document.getElementById("previewContainer");
      previewCont.classList.remove("hidden");

      const img = document.getElementById("imagePreview");
      const vid = document.getElementById("videoPreview");

      if (this.selectedFileType === "video") {
        img.classList.add("hidden");
        vid.classList.remove("hidden");
        vid.src = this.selectedFileBase64;
      } else {
        vid.classList.add("hidden");
        img.classList.remove("hidden");
        img.src = this.selectedFileBase64;
      }
    };

    form.onsubmit = async (e) => {
      e.preventDefault();
      if (!this.selectedFileBase64) {
        ui.showToast("Pilih media terlebih dahulu", "error");
        return;
      }

      const submitBtn = document.getElementById("submitPostBtn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Mengunggah ke Cloud...";

      const postType = document.querySelector('input[name="postTypeRadio"]:checked').value;
      const caption = document.getElementById("captionInput").value;

      try {
        if (postType === "story") {
          await api.post("createStory", {
            media_base64: this.selectedFileBase64,
            media_type: this.selectedFileType,
            mime_type: this.selectedMimeType
          });
          ui.showToast("Story 24 jam berhasil diunggah!");
        } else {
          await api.post("createPost", {
            media_base64: this.selectedFileBase64,
            media_type: this.selectedFileType,
            mime_type: this.selectedMimeType,
            caption
          });
          ui.showToast("Postingan feed berhasil dipublikasikan!");
        }

        closeModal();
        window.location.hash = "#feed";
        window.location.reload();
      } catch (err) {
        ui.showToast(err.message || "Gagal mempublikasikan konten", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Bagikan";
      }
    };
  },

  resetForm() {
    this.selectedFileBase64 = null;
    document.getElementById("createPostForm").reset();
    document.getElementById("uploadPlaceholder").classList.remove("hidden");
    document.getElementById("previewContainer").classList.add("hidden");
    document.getElementById("imagePreview").src = "";
    document.getElementById("videoPreview").src = "";
  }
};