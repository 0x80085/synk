import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { RegisterComponent } from './register/register.component';
import { PlaceholdPipe } from './profile/placehold.pipe';
import { UsernamePipe } from './profile/username.pipe';
import { OwnedChannelsComponent } from './profile/owned-channels/owned-channels.component';
import { RouterModule } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestLogInterceptor } from './interceptors/auth-error.interceptor';


@NgModule({
  declarations: [LoginComponent, ProfileComponent, RegisterComponent, PlaceholdPipe, UsernamePipe, OwnedChannelsComponent, AdminComponent],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: RequestLogInterceptor, multi: true },
  ]
})
export class AccountModule { }
