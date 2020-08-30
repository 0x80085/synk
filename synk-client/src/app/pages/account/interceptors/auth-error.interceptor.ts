import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppStateService } from '../../../app-state.service';
import { SocketService } from '../../../socket.service';

@Injectable()
export class RequestLogInterceptor implements HttpInterceptor {

  constructor(private stateService: AppStateService,
    private socketService: SocketService,
  ) { }

  intercept(
    request: HttpRequest<any>, next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log(request.url);


    return next.handle(request).pipe(
      catchError((error: any) =>
        of(error).pipe(
          tap(err => {
            if (err.status === 403) {
              this.stateService.isLoggedInSubject.next(false);
              this.socketService.socket.close();
            }
          })
        ))
    );

  }


}
