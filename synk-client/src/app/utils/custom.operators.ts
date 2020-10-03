import { MonoTypeOperatorFunction } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export function doLog<T>(msg: string, doLogInput = false): MonoTypeOperatorFunction<T> {
  return input$ => input$.pipe(
    tap((input) => {
      if (environment.production) {
        return;
      }
      console.log(msg);
      if (doLogInput) {
        console.log(input);
      }
    })
  );
}
