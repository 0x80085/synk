import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { AccountRoutingModule } from './account-routing.module';
import { RegisterComponent } from './register/register.component';
import { PlaceholdPipe } from './profile/placehold.pipe';
import { UsernamePipe } from './profile/username.pipe';
import { OwnedChannelsComponent } from './profile/owned-channels/owned-channels.component';


@NgModule({
  declarations: [LoginComponent, ProfileComponent, RegisterComponent, PlaceholdPipe, UsernamePipe, OwnedChannelsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    AccountRoutingModule
  ]
})
export class AccountModule { }
