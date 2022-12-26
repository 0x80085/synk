export function shuffle(array: any[]) {
    // Taken from https://bost.ocks.org/mike/shuffle/
    let amount = array.length;
    let current: any = null;
    let index = 0;
    while (amount) {
      index = Math.floor(Math.random() * amount--);
      current = array[amount];
      array[amount] = array[index];
      array[index] = current;
    }
    return array;
  }