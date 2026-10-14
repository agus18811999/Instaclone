export const ui = {
  showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    const bgColor = type === "error" ? "bg-red-500" : "bg-neutral-800 dark:bg-white dark:text-black";

    toast.className = `${bgColor} text-white text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all duration-300 transform translate-y-4 opacity-0`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove("translate-y-4", "opacity-0");
    }, 10);

    setTimeout(() => {
      toast.classList.add("opacity-0");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  renderFeedSkeleton() {
    const container = document.getElementById("feedList");
    container.innerHTML = Array(3).fill(0).map(() => `
      <div class="border border-neutral-200 dark:border-darkBorder rounded-xl p-4 space-y-4 bg-white dark:bg-darkCard">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full skeleton"></div>
          <div class="space-y-2 flex-1">
            <div class="w-24 h-3 rounded skeleton"></div>
            <div class="w-16 h-2 rounded skeleton"></div>
          </div>
        </div>
        <div class="w-full h-80 rounded-lg skeleton"></div>
        <div class="space-y-2">
          <div class="w-3/4 h-3 rounded skeleton"></div>
          <div class="w-1/2 h-3 rounded skeleton"></div>
        </div>
      </div>
    `).join("");
  }
};