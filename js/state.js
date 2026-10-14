export const state = {
  currentUser: JSON.parse(localStorage.getItem("insta_user")) || null,
  activeRoute: "feed",
  theme: localStorage.getItem("insta_theme") || "light",
  feedPosts: [],
  activePostComments: [],
  currentViewingStories: [],
  activeStoryIndex: 0,
  storyTimer: null,

  setCurrentUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem("insta_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("insta_user");
    }
  },

  setTheme(newTheme) {
    this.theme = newTheme;
    localStorage.setItem("insta_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
};