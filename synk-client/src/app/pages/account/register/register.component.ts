import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerSuccess = false;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: AuthService,
    private notification: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      userName: [
        null,
        [
          Validators.required,
          Validators.maxLength(15),
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/)
        ]
      ],
      password: [
        null,
        [Validators.required, Validators.maxLength(20), Validators.minLength(5)]
      ],
      remember: [true]
    });
  }

  submitForm(): void {
    this.touchform();

    if (this.form.invalid) {
      return;
    }

    const creds = {
      username: this.form.controls.userName.value,
      password: this.form.controls.password.value
    };

    this.service.createAccount(creds).subscribe(
      () => {
        this.registerSuccess = true;
      },
      err => {
        this.notification.create(
          'error',
          'Registration failed',
          `
          AAaaaaah
        `
        );
      }
    );
  }

  private touchform() {
    for (const i of Object.keys(this.form.controls)) {
      this.form.controls[i].markAsDirty();
      this.form.controls[i].updateValueAndValidity();
    }
  }
}
