import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AuthService, Channel } from '../../auth.service';

@Component({
  selector: 'app-owned-channels',
  templateUrl: './owned-channels.component.html',
  styleUrls: ['./owned-channels.component.scss']
})
export class OwnedChannelsComponent {

  form = this.formBuilder.group({
    channels: this.formBuilder.array([])
  });

  get channelForms() {
    return this.form.controls["channels"] as FormArray;
  }

  constructor(
    private auth: AuthService,
    private notification: NzNotificationService,
    private formBuilder: FormBuilder) {
  }

  channels$: Observable<Channel[]> = this.auth.userOwnedChannels$.pipe(
    tap(channels => channels.forEach(chan => this.addChannelForm(chan)))
  );

  private addChannelForm(channel: Channel) {
    const channelForm = this.formBuilder.group({
      description: [
        channel.description,
        [
          Validators.required,
          Validators.maxLength(25),
          Validators.minLength(3),
        ]
      ],
      isPublic: [channel.isPublic, Validators.required]
    });
    this.channelForms.push(channelForm);
  }

  deleteChannel(channel: Channel, ev: Event) {
    if (confirm(`You really want to delete ${channel.name}?`)) {
      ev.preventDefault();
      this.auth.deleteChannel(channel.id)
        .pipe(
          tap(() => this.auth.refreshChannels()),
          tap(() => this.notification.success('Success', `Deleted ${channel.name}`)),
          catchError((err) => {
            this.notification.error('Delete failed', 'Try again later');
            return err;
          }))
        .subscribe();
      return false;
    }
  }

  updateChannel(id: string, control: AbstractControl) {
    const formGroup = control as FormGroup;

    const description = formGroup.controls.description.value
    const isPublic = formGroup.controls.isPublic.value

    const updatedChannel = { id, description, isPublic } as Channel;

    this.auth.updateChannel(updatedChannel)
      .pipe(
        tap(() => this.auth.refreshChannels()),
        tap(() => this.notification.success('Success', `Updated `)),
        catchError((err) => {
          this.notification.error('Update failed', 'Try again later');
          return err;
        }))
      .subscribe();
  }

}
