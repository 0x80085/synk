import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from '../../account/auth.service';
import { AccountService, ChannelDraft } from '../account.service';

export const VALID_CHANNELNAME_RGX = new RegExp(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/);

@Component({
  selector: 'app-create-room-form',
  templateUrl: './create-room-form.component.html',
  styleUrls: ['./create-room-form.component.scss']
})
export class CreateRoomFormComponent implements OnInit {
  form: FormGroup;
  isSubmitting: boolean;

  constructor(
    private service: AccountService,
    private auth: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private notification: NzNotificationService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: [
        null,
        [
          Validators.required,
          Validators.maxLength(25),
          Validators.minLength(3),
          Validators.pattern(VALID_CHANNELNAME_RGX)
        ]
      ],
      description: [
        null,
        [Validators.maxLength(250)]
      ],
      isPublic: true
    });
  }

  onSubmit() {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    const results: ChannelDraft = {
      name: this.form.controls.name.value.trim(),
      description: this.form.controls.description.value.trim(),
      isPublic: this.form.controls.isPublic.value,
    };
    this.service.createChannel(results).subscribe(
      () => {
        this.notification.success("Channel registered", "You are now the proud owner of a brand new Synk channel.")
        this.auth.refreshChannels();
        this.router.navigate(['/channel', results.name]);
       this.isSubmitting = false
      },
      err => {
        // if (err.status === 403) {
        //   this.notification.create(
        //     'error',
        //     `Login to create a channel`,
        //     `Only known users may create a channel.`
        //   );
        //   return;
        // }
        // this.notification.create(
        //   'error',
        //   `Couldn't create channel`,
        //   `Something went wrong when trying to create a new channel.\n Try again later.`
        // );
       this.isSubmitting = false
      }
    );
  }
}
