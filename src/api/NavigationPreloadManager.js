export default class NavigationPreloadManager {
  async enable() {
    return false;
  }

  async disable() {
    return true;
  }

  async setHeaderValue() {
    // Service-Worker-Navigation-Preload
  }

  async getState() {
    return { enabled: false, headerValue: false };
  }
}
