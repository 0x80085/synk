import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WelcomeComponent } from './pages/welcome/welcome.component';
import { ChannelComponent } from './pages/channel/channel.component';
import { RegisterComponent } from './pages/account/register/register.component';
import { ProfileComponent } from './pages/account/profile/profile.component';
import { LoginComponent } from './pages/account/login/login.component';
import { PlayerDebugComponent } from './pages/channel/player-debug/player-debug.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: '', component: WelcomeComponent },
  { path: 'channel/:name', component: ChannelComponent },
  { path: 'debug', component: PlayerDebugComponent },
  { path: 'account/new', component: RegisterComponent },
  { path: 'account/me', component: ProfileComponent },
  { path: 'account/login', component: LoginComponent },
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
