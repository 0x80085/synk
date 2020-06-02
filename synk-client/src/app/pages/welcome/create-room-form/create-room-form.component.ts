import { Component, OnInit } from '@angular/core';
import { OverviewService, ChannelDraft } from '../overview.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'app-create-room-form',
  templateUrl: './create-room-form.component.html',
  styleUrls: ['./create-room-form.component.scss']
})
export class CreateRoomFormComponent implements OnInit {
  form: FormGroup;

  constructor(
    private service: OverviewService,
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
          Validators.pattern(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/)
        ]
      ],
      description: [
        null,
        [Validators.required, Validators.maxLength(250), Validators.minLength(5)]
      ],
      remember: [true]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const results: ChannelDraft = {
      name: this.form.controls.name.value,
      description: this.form.controls.description.value
    };
    this.service.createChannel(results).subscribe(
      () => {
        this.router.navigate(['/channel', results.name]);
      },
      err => {
        if (err.status === 403) {
          this.notification.create(
            'error',
            `Login to create a room`,
            `Only known users may create a room.`
          );
          return;
        }
        this.notification.create(
          'error',
          `Couldn't create room`,
          `Something went wrong when trying to create a new room.\n Try again later.`
        );
      }
    );
  }
}
