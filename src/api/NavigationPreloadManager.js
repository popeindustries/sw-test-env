/**
 * @implements MockNavigationPreloadManager
 */
export default class NavigationPreloadManager {
  async enable() {
    return;
  }

  async disable() {
    return;
  }

  async setHeaderValue() {
    // Service-Worker-Navigation-Preload
  }

  async getState() {
    return { enabled: false, headerValue: '' };
  }
}
