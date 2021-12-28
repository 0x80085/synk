import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, VALIDNAME_RGX } from '../auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  form: FormGroup;

  registerSuccess = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private service: AuthService,
    private notification: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      username: [
        null,
        [
          Validators.required,
          Validators.maxLength(15),
          Validators.minLength(3),
          Validators.pattern(VALIDNAME_RGX)
        ]
      ],
      password: [
        null,
        [
          Validators.required,
          Validators.maxLength(20),
          Validators.minLength(5)]
      ]
    });
  }

  submitForm(): void {
    this.touchform();

    if (this.form.invalid) {
      return;
    }

    const creds = {
      username: this.form.controls.username.value.trim(),
      password: this.form.controls.password.value.trim()
    };

    this.isSubmitting = true;

    this.service.createAccount(creds).subscribe(
      () => {
        this.registerSuccess = true;
        this.isSubmitting = false;
      },
      err => {
        console.error(err);
        this.notification.create(
          'error',
          'Registration failed',
          `
          Something went wrong... (???)
        `
        );
        this.isSubmitting = false;
        this.registerSuccess = false;
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
