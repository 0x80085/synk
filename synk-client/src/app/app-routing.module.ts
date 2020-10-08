import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ChannelComponent } from './pages/channel/channel.component';
import { RegisterComponent } from './pages/account/register/register.component';
import { ProfileComponent } from './pages/account/profile/profile.component';
import { LoginComponent } from './pages/account/login/login.component';
import { PlayerDebugComponent } from './pages/channel/player-debug/player-debug.component';
import { AdminComponent } from './pages/account/admin/admin.component';
import { AdminRouteGuard } from './pages/account/admin-route.guard';
import { AboutComponent } from './pages/meta/about/about.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'channel/:name', component: ChannelComponent },
  { path: 'debug', component: PlayerDebugComponent },
  { path: 'account/new', component: RegisterComponent },
  { path: 'account/me', component: ProfileComponent },
  { path: 'account/login', component: LoginComponent },
  { path: 'account/admin', component: AdminComponent, canActivate: [AdminRouteGuard] },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [AdminRouteGuard]
})
export class AppRoutingModule { }
