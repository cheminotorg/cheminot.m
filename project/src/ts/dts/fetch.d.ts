declare function fetch<T>(input: fetch.Request | string, init?: fetch.RequestOptions): Promise<fetch.Response<T>>;

declare module fetch {

  interface Headers {
  }

  interface Request {
  }

  interface RequestOptions {
  }

  interface Response<T> {
  }
}


declare module 'node-fetch' {
  export = fetch;
}
