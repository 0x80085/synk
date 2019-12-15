import { Component, OnInit } from '@angular/core';

import { AuthService } from '../auth.service';
import { tap, map } from 'rxjs/operators';
import { merge } from 'rxjs';
import { AppStateService } from 'src/app/app-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {


  constructor(private auth: AuthService, private router : Router) { }

  me = this.auth.getUser().pipe(
    map(res => {
      console.log(res);
      return res;
    })
  );

  ngOnInit() {
  }

  onLogout() {
    this.auth.logout().subscribe(e => {
      console.log(e);
      console.log('logout success');
      this.router.navigate(['/account', '/login'])
    });
  }

}
