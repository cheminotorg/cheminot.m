declare module 'zanimo' {

  function Zanimo(el: HTMLElement, attr: string, value: string, duration: number, easing?: string): Q.Promise<HTMLElement>;

  module Zanimo {
  }

  export = Zanimo;
}
