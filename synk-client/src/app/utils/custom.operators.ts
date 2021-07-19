import { MonoTypeOperatorFunction } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * This operator `console.log`s the observable's value passing through the stream if window.debug is set to true
 * @param msg  logs message to ID where the log came from
 * @param doLogInput logs Observable value passing through
 */
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
