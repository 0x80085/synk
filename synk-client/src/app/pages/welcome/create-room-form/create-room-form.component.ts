import { Component, OnInit } from '@angular/core';
import { OverviewService, ChannelDraft } from '../overview.service';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'app-create-room-form',
  templateUrl: './create-room-form.component.html',
  styleUrls: ['./create-room-form.component.scss']
})
export class CreateRoomFormComponent implements OnInit {
  form: FormGroup = new FormGroup({
    name: new FormControl(''),
    description: new FormControl('')
  });

  constructor(
    private service: OverviewService,
    private fb: FormBuilder,
    private router: Router,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: [null, [Validators.required]],
      description: [null, [Validators.required]]
    });
  }

  onSubmit() {
    console.log('test');

    if (this.form.invalid) {
      this.form.markAsTouched();
      return;
    }

    const results: ChannelDraft = {
      name: this.form.controls.name.value,
      description: this.form.controls.description.value
    };
    console.log(results);
    this.service.createChannel(results).subscribe(
      () => {
        this.router.navigate(['/channel', results.name]);
      },
      err => {
        this.notification.create(
          'error',
          `Couldn't create room`,
          `Something went wrong when trying to create a new room.\n Try again later.`
        );
      }
    );
  }
}
