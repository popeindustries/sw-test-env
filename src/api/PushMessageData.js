import { Blob } from 'buffer';

/**
 * @implements MockPushMessageData
 */
export default class PushMessageData {
  /**
   * @param { Object } [data]
   */
  constructor(data) {
    this._data = data ?? {};
  }

  arrayBuffer() {
    return new ArrayBuffer(20);
  }

  blob() {
    return new Blob([this.text()]);
  }

  json() {
    return this._data;
  }

  text() {
    return JSON.stringify(this._data);
  }
}
