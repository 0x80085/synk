import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { debugLog } from 'src/app/utils/custom.operators';
import { AuthService } from '../auth.service';

export class ApiError {
  error: {
    error: string
    message: string
    statusCode: number
  }
  message: string
  statusCode: number
  status: number
}

export const SUPPRESS_ERR_FEEDBACK_HEADER = 'app_suppress_feedback';

@Injectable()
export class RequestLogInterceptor implements HttpInterceptor {

  constructor(
    private notification: NzNotificationService,
    private authService: AuthService
  ) { }

  intercept(
    request: HttpRequest<any>, next: HttpHandler
  ): Observable<HttpEvent<any>> {

    let suppressFeedback = request.headers.has(SUPPRESS_ERR_FEEDBACK_HEADER);

    let clonedRequest = request.clone({ ...request });
    
    if (suppressFeedback) {   
      let newHeaders = request.headers.delete(SUPPRESS_ERR_FEEDBACK_HEADER)
      clonedRequest = request.clone({ ...request, headers: newHeaders });
    }

    return next.handle(clonedRequest).pipe(
      catchError((error: any) =>
        of(error).pipe(
          tap(err => {

            if (suppressFeedback) {
              debugLog('suppressed error', err, true);
              return;
            }

            const apiError = err as ApiError;
            console.log(err);
            switch (apiError.error.statusCode) {
              case 401:
                this.notification.error(`Please login`, `You need to be logged in to access this part`);
                this.authService.logout().subscribe()
                break;
              case 403:
                this.notification.warning(`ಠ_ಠ`, `That is not allowed!`);
                break;
              case 500:
                this.notification.error(`Something went wrong...`, `Here's some tea 🍵`);
                break;
              default:
                if (err.status === 0 || !err.status) {                
                  const title = apiError?.error?.error ||  "Communication error";
                  const msg = apiError?.error?.message || "Are you connected to the internet?";
                  this.notification.error(title, msg);
                  break;
                }
                debugLog('RequestLogInterceptor was not sure what to do.')
                break;
            }

            console.warn("HTTP ERROR occurred");
            console.log(err);
            throw err;
          })
        ))
    );

  }


}
