// Type definitions for Mithril
// Project: http://lhorie.github.io/mithril/
// Definitions by: Leo Horie <https://github.com/lhorie>, Chris Bowdon <https://github.com/cbowdon>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

//Mithril type definitions for Typescript

declare module "mithril" {


    function m(selector: string, attributes: Object, children?: any): m.VirtualElement;
    function m(selector: string, children?: any): m.VirtualElement;

    module m {

        function prop(value?: any): (value?: any) => any;
        function withAttr(property: string, callback: (value: any) => void): (e: Event) => any;
        function module<T>(rootElement: Node, module: m.Module<T>): void;
        function trust(html: string): String;
        function render(rootElement: Element, children?: any): void;
        function render(rootElement: HTMLDocument, children?: any): void;
        function redraw(force?: boolean): void;
        function route<T>(rootElement: Element, defaultRoute: string, routes: { [key: string]: m.Module<T> }): void;
        function route<T>(rootElement: HTMLDocument, defaultRoute: string, routes: { [key: string]: m.Module<T> }): void;
        function route(path: string, params?: any, shouldReplaceHistory?: boolean): void;
        function route(): string;
        function route(element: Element, isInitialized: boolean): void;
        function request(options: m.XHROptions): m.Promise;
        function deferred(): m.Deferred;
        function sync(promises: m.Promise[]): m.Promise;
        function startComputation(): void;
        function endComputation(): void;

        module route {
            function param(name: string): string;
            var mode: string;
        }

        interface VirtualElement {
            tag: string;
            attrs: Object;
            children: any;
        }

        interface Module<T> {
            controller(): T;
            view(ctrl: T): Array<any>;
        }

        interface Deferred {
            resolve(value?: any): void;
            reject(value?: any): void;
            promise: Promise;
        }

        interface Promise {
            (value?: any): any;
            then(successCallback?: (value: any) => any, errorCallback?: (value: any) => any): Promise;
        }

        interface XHROptions {
            method: string;
            url: string;
            user?: string;
            password?: string;
            data?: any;
            background?: boolean;
            unwrapSuccess?(data: any): any;
            unwrapError?(data: any): any;
            serialize?(dataToSerialize: any): string;
            deserialize?(dataToDeserialize: string): any;
            extract?(xhr: XMLHttpRequest, options: XHROptions): string;
            type?(data: Object): void;
            config?(xhr: XMLHttpRequest, options: XHROptions): XMLHttpRequest;
        }
    }

    export = m;
}
