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


@NgModule({
  declarations: [LoginComponent, ProfileComponent, RegisterComponent, PlaceholdPipe, UsernamePipe, OwnedChannelsComponent],
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule
  ]
})
export class AccountModule { }
