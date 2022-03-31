/**
 * @implements MockNavigationPreloadManager
 */
export default class NavigationPreloadManager {
  constructor() {
    this.enabled = false;
    this.headerValue = 'Service-Worker-Navigation-Preload';
  }

  async enable() {
    this.enabled = true;
    return;
  }

  async disable() {
    this.enabled = false;
    return;
  }

  /**
   * @param { string } headerValue
   */
  async setHeaderValue(headerValue) {
    this.headerValue = headerValue;
  }

  async getState() {
    return { enabled: this.enabled, headerValue: this.headerValue };
  }
}
