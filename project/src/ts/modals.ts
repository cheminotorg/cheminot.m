

export function show(selector: string)  {
  var picker = <HTMLElement> document.querySelector(selector);
  var modals = <HTMLElement> document.querySelector('.modals');
  picker.classList.add('fade-in');
  modals.classList.add('fade-in');
}

export function hide(selector: string) {
  var picker = <HTMLElement> document.querySelector(selector);
  var modals = <HTMLElement> document.querySelector('.modals');
  modals.classList.remove('fade-in');
  picker.classList.remove('fade-in');
}
