function starsKey(startId: string, endId: string): string {
  return [startId, endId].join('|');
}

function decomposeStarsKey(key: string): [string, string] {
  let [startId, endId] = key.split('|');
  return [startId, endId];
}

export function isStarred(startId: string, endId: string): boolean {
  let maybeStars = localStorage.getItem("stars");
  let stars =  maybeStars ? JSON.parse(maybeStars) : [];
  return stars.some((s: string) => starsKey(startId, endId) === s);
}

export function unstars(startId: string, endId: string): void {
  let maybeStars = localStorage.getItem("stars");
  let stars =  maybeStars ? JSON.parse(maybeStars) : {};
  let updated = stars.filter((s: string) => starsKey(startId, endId) != s)
  localStorage.setItem("stars", JSON.stringify(updated));
}

export function hasStars(): boolean {
  return starred().length > 0;
}

export function stars(startId: string, endId: string): void {
  let maybeStars = localStorage.getItem("stars");
  let stars =  maybeStars ? JSON.parse(maybeStars) : [];
  stars.push(starsKey(startId, endId));
  localStorage.setItem("stars", JSON.stringify(stars));
}

export function starred(): {startId: string, endId: string}[] {
  let maybeStars = localStorage.getItem("stars");
  let stars =  maybeStars ? JSON.parse(maybeStars) : [];
  return stars.map((key: string) => {
    let [startId, endId] = decomposeStarsKey(key);
    return {
      startId: startId,
      endId: endId
    };
  });
}
