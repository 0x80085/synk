import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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

@Injectable()
export class RequestLogInterceptor implements HttpInterceptor {

  constructor(
    private notification: NzNotificationService,
    private authService: AuthService
  ) { }

  intercept(
    request: HttpRequest<any>, next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: any) =>
        of(error).pipe(
          tap(err => {

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
                this.notification.error( apiError.error.error, apiError.error.message,)
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
