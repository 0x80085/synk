import { Component, OnInit } from '@angular/core';
import { OverviewService, ChannelDraft } from '../overview.service';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators
} from '@angular/forms';

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

  constructor(private service: OverviewService, private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: [null, [Validators.required]],
      description: [null, [Validators.required]]
    });
  }

  onSubmit() {
    console.log('test');

    const results: ChannelDraft = {
      name: this.form.controls.name.value,
      description: this.form.controls.description.value
    };
    console.log(results);
    this.service.createChannel(results);
  }
}
