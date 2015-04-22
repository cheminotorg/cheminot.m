

declare module 'qajax' {

  type QajaxOptions = {
    url: string;
    method: string;
    data?: any;
  }

  function qajax(url: String): Q.Promise<XMLHttpRequest>;

  function qajax(options: QajaxOptions): Q.Promise<XMLHttpRequest>;

  module qajax {
    function filterSuccess(response: XMLHttpRequest): Q.Promise<XMLHttpRequest>;
    function toJSON<T>(response: XMLHttpRequest): Q.Promise<T>;
  }

  export = qajax;
}
