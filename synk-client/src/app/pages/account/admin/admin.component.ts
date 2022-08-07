import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { map, shareReplay, take, tap } from 'rxjs/operators';

import { AdminService, ChannelOverviewItem, UserAccountInfo, UserInfo } from '../admin.service';
import { Channel } from '../auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  users$: Observable<UserInfo> = this.adminService.getUsers().pipe(shareReplay(1));
  channels$: Observable<Channel[]> = this.adminService.getChannels().pipe(shareReplay(1));
  connections$ = this.adminService.getConnections().pipe(shareReplay(1));

  accounts$: Observable<UserAccountInfo[]> = this.users$.pipe(map(it => it.items));


  form = this.formBuilder.group({
    automatedChannels: this.formBuilder.array([])
  });

  get automatedChannelForms() {
    return this.form.controls["automatedChannels"] as FormArray;
  }

  getFormGroup(control: AbstractControl) {
    return control as FormGroup;
  }

  automatedChannels$ = this.adminService.getAutomatedChannels()
    .pipe(
      tap(channels => channels.forEach(chan => this.addChannelForm(chan))),
      shareReplay(1)
    );

  private addChannelForm(_: ChannelOverviewItem) {
    const channelForm = this.formBuilder.group({
      subredditName: [
        "",
        [
          Validators.required,
          Validators.maxLength(250),
          Validators.minLength(1),
        ]
      ]
    });
    this.automatedChannelForms.push(channelForm);
  }

  constructor(
    private adminService: AdminService,
    private notification: NzNotificationService,
    private formBuilder: FormBuilder) {
  }

  deleteRoom(id: string, name: string) {
    if (confirm(`Sure you want to delete ${name} ??`)) {
      this.adminService.deleteRoom(id)
        .pipe(take(1))
        .subscribe(() => this.notification.success('Success', `Deleted room [${name}]`));
    }
  }

  startScraper(name: string, control: AbstractControl) {
    const formGroup = control as FormGroup;
    const subredditField = formGroup.controls.subredditName as AbstractControl
    const subredditValue = subredditField.value

    if (!subredditValue || subredditValue.trim() == "") {
      return
    }
    this.adminService.startScraper(name, subredditValue)
      .pipe(
        tap(() => this.notification.success('Success', `Started scrape for ${name}, targeting subreddit [${subredditValue}]`)),
        tap(() => subredditField.patchValue(""))
      )
      .subscribe()
  }
  stopScraper() {
    this.adminService.stopScraper()
      .pipe(
        tap(() => this.notification.success('Success', `STOPPED scrape`))
      )
      .subscribe()
  }
  startPlayback(name: string) {
    this.adminService.startPlayback(name)
      .pipe(
        tap(() => this.notification.success('Success', `Started auto-playback`))
      )
      .subscribe()
  }
  stopPlayback(name: string) {
    this.adminService.stopPlayback(name)
      .pipe(
        tap(() => this.notification.success('Success', `Stopped auto-playback`))
      )
      .subscribe()
  }
  clearPlaylist(name: string) {
    this.adminService.clearPlaylist(name)
      .pipe(
        tap(() => this.notification.success('Success', `Cleared playlist`))
      )
      .subscribe()
  }

  playNext(name: string) {
    this.adminService.playNext(name)
      .pipe(
        tap(() => this.notification.success('Success', `Playing next video`))
      )
      .subscribe()
  }

}
