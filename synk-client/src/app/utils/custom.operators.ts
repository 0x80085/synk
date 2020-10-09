import { MonoTypeOperatorFunction } from 'rxjs';
import { tap } from 'rxjs/operators';

export function doLog<T>(msg: string, doLogInput = false): MonoTypeOperatorFunction<T> {
  return input$ => input$.pipe(
    tap((input) => {
      debugLog(msg);
      if (doLogInput) console.log(input);
    })
  );
}

export function debugLog(msg: string) {
  if (!(window as any).debug) {
    return;
  }
  console.log(msg);
}
