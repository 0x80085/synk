import { MonoTypeOperatorFunction } from 'rxjs';
import { tap } from 'rxjs/operators';

export function doLog<T>(msg: string, doLogInput = false): MonoTypeOperatorFunction<T> {
  return input$ => input$.pipe(
    tap((input) => {
      debugLog(msg, input, doLogInput);
    })
  );
}

export function debugLog(msg: string, extra?: any, logExtra = false) {
  if ((window as any).debug) {
    console.log(msg);
    if (logExtra && extra) {
      console.log(extra);
    }
  }
}
