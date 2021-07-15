import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppStateService } from '../../../app-state.service';
import { SocketService } from '../../../socket.service';

@Injectable()
export class RequestLogInterceptor implements HttpInterceptor {

  constructor(private stateService: AppStateService,
    private socketService: SocketService,
    private notification: NzNotificationService
  ) { }

  intercept(
    request: HttpRequest<any>, next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: any) =>
        of(error).pipe(
          tap(err => {

            switch (err.status) {
              case 401:
                this.notification.error(`Please login`, `You need to be logged in to access this part`);
                this.socketService.socket.disconnect();
                this.stateService.isLoggedInSubject.next(false);
                this.stateService.userSubject.next(null);
                break;
              case 403:
                this.notification.warning(`ಠ_ಠ`, `That is not allowed!`);
                break;
              case 500:
                this.notification.error(`Something went wrong...`, `Here's some tea 🍵`);
                break;
              default:
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
