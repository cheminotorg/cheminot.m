declare module 'mdl-ripple' {

  export default function init(el: HTMLElement, options?: RippleOptions): Ripple;

  interface Ripple {
    downgrade(): void;
    trigger(e : Event): void;
  }

  interface RippleOptions {
    background?: string;
    duration?: number;
    ignoreEvents?: boolean;
  }
}
