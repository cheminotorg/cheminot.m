
declare module 'Zanimo' {

  function z(el: HTMLElement, attr: string, value: string, duration: number, easing?: string): Q.Promise<HTMLElement>;

  module z {
  }

  export = z;
}
