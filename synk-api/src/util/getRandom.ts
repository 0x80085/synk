export function getRandom(list: any[]) {
    const randIndex = Math.floor(Math.random() * list.length);
    return list[randIndex];
  }