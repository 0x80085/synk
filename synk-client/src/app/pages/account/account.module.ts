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
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { AdminComponent } from './admin/admin.component';
import { OwnedChannelsComponent } from './profile/owned-channels/owned-channels.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';
import { PlaceholdPipe } from './profile/placehold.pipe';
import { UsernamePipe } from './profile/username.pipe';
import { RequestLogInterceptor } from './interceptors/auth-error.interceptor';
import { CreateRoomFormComponent } from './create-room-form/create-room-form.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NZ_ICONS } from 'src/app/icons';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { InvidiousUrlFormComponent } from './admin/invidious-url-form/invidious-url-form.component';
import { GlobalSettingsFormComponent } from './admin/global-settings-form/global-settings-form.component';

@NgModule({
  declarations: [
    CreateRoomFormComponent,
    LoginComponent,
    ProfileComponent,
    RegisterComponent,
    PlaceholdPipe,
    UsernamePipe,
    OwnedChannelsComponent,
    AdminComponent,
    InvidiousUrlFormComponent,
    GlobalSettingsFormComponent],
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
    NzCollapseModule,
    NzTableModule,
    NzDescriptionsModule,
    NzTypographyModule,
    NzGridModule,
    NzToolTipModule,
    NzAvatarModule,
    NzModalModule,
    NzIconModule.forRoot(NZ_ICONS),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: RequestLogInterceptor, multi: true },
  ]
})
export class AccountModule { }
