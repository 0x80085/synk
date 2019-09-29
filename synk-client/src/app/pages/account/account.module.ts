import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountComponent } from './account.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { AccountRoutingModule } from './account-routing.module';


@NgModule({
  declarations: [LoginComponent, AccountComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgZorroAntdModule,
    AccountRoutingModule
  ]
})
export class AccountModule { }
