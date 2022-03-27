/**
 * @implements MockContentIndex
 */
export default class ContentIndex {
  constructor() {
    /** @type { Map<string, ContentDescription> } */
    this._items = new Map();
  }

  /**
   * Register item
   * @param { ContentDescription } description
   */
  async add(description) {
    this._items.set(description.id, description);
  }

  /**
   * Unregister item
   * @param { string } id
   */
  async delete(id) {
    this._items.delete(id);
  }

  /**
   * @returns { Promise<Array<ContentDescription>> }
   */
  async getAll() {
    return Array.from(this._items.values());
  }
}
