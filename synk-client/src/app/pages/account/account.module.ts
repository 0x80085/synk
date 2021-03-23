import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputModule } from 'ng-zorro-antd/input';

import { AdminComponent } from './admin/admin.component';
import { OwnedChannelsComponent } from './profile/owned-channels/owned-channels.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
import { PlaceholdPipe } from './profile/placehold.pipe';
import { UsernamePipe } from './profile/username.pipe';
import { RequestLogInterceptor } from './interceptors/auth-error.interceptor';
import { CreateRoomFormComponent } from './create-room-form/create-room-form.component';

@NgModule({
  declarations: [
    CreateRoomFormComponent,
    LoginComponent,
    ProfileComponent,
    RegisterComponent,
    PlaceholdPipe,
    UsernamePipe,
    OwnedChannelsComponent,
    AdminComponent],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzPaginationModule,
    NzListModule,
    NzDividerModule,
    NzCardModule,
    NzFormModule,
    NzEmptyModule,
    NzButtonModule,
    NzInputModule,
    NzCheckboxModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: RequestLogInterceptor, multi: true },
  ]
})
export class AccountModule { }
