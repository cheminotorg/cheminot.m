function starsKey(start: string, end: string): string {
  return [start, end].join('|');
}

export function isStarred(start: string, end: string): boolean {
  let maybeStars = localStorage.getItem("stars");
  let stars =  maybeStars ? JSON.parse(maybeStars) : [];
  return stars.some((s: string) => starsKey(start, end) === s);
}

export function unstars(start: string, end: string): void {
  let maybeStars = localStorage.getItem("stars");
  let stars =  maybeStars ? JSON.parse(maybeStars) : {};
  let updated = stars.filter((s: string) => starsKey(start, end) != s)
  localStorage.setItem("stars", JSON.stringify(updated));
}

export function stars(start: string, end: string): void {
  let maybeStars = localStorage.getItem("stars");
  let stars =  maybeStars ? JSON.parse(maybeStars) : [];
  stars.push(starsKey(start, end));
  localStorage.setItem("stars", JSON.stringify(stars));
}
