import fetch, { Headers, Request, Response } from 'node-fetch';

if (!global.fetch) {
  // @ts-ignore
  global.fetch = fetch;
}

if (!global.Headers) {
  // @ts-ignore
  global.Headers = Headers;
}

if (!global.Request) {
  // @ts-ignore
  global.Request = Request;
}

if (!global.Response) {
  // @ts-ignore
  global.Response = Response;
}
