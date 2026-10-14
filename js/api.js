import { API_ENDPOINT } from "./config.js";
import { state } from "./state.js";

export const api = {
  async get(action, params = {}) {
    const url = new URL(API_ENDPOINT);
    url.searchParams.append("action", action);
    if (state.currentUser && state.currentUser.token) {
      url.searchParams.append("token", state.currentUser.token);
    }
    for (const key in params) {
      url.searchParams.append(key, params[key]);
    }

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        mode: "cors"
      });
      return await response.json();
    } catch (err) {
      console.error(`API GET [${action}] Error:`, err);
      throw err;
    }
  },

  async post(action, payload = {}) {
    try {
      const bodyData = {
        action,
        token: state.currentUser ? state.currentUser.token : null,
        ...payload
      };

      // Mengirim text/plain mencegah CORS Preflight OPTIONS error di GAS
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(bodyData)
      });
      return await response.json();
    } catch (err) {
      console.error(`API POST [${action}] Error:`, err);
      throw err;
    }
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
};