import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, shareReplay } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetaService {

  version$ = this.http.get<{ version: string }>(`${environment.api}/version`).pipe(
    map(({ version }) => version),
    shareReplay(1)
  );

  constructor(private http: HttpClient) { }
}
