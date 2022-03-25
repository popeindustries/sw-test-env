const RE_ABSOLUTE = /^https?/;

/**
 * Fetch function factory
 * @param { string } origin
 */
export default function fetchFactory(origin = '') {
  /**
   * @param { Request | string } url
   * @param { import('node-fetch').RequestInit } options
   */
  return function (url, options) {
    /** @type { Request | undefined } */
    let request;

    if (typeof url !== 'string') {
      request = url;
      url = url.url;
    }
    if (!RE_ABSOLUTE.test(url)) {
      url = new URL(url, origin).href;
    }
    if (request) {
      const { body, headers = {}, method = 'GET', redirect = 'follow' } = request;

      url = new Request(url, { body, headers, method, redirect });
    }

    // @ts-ignore
    return fetch(url, options);
  };
}
