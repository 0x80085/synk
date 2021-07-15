import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  isLoginSuccess = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
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
          Validators.pattern(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/)
        ]
      ],
      password: [
        null,
        [Validators.required, Validators.maxLength(20), Validators.minLength(5)]
      ]
    });
  }

  submitForm(): void {
    this.touchform();

    if (this.form.invalid) {
      return;
    }

    const creds = {
      username: this.form.controls.username.value,
      password: this.form.controls.password.value
    };

    this.isSubmitting = true;

    this.auth.login(creds).subscribe(
      () => {
        this.isLoginSuccess = true;
        this.isSubmitting = false;

        this.auth.getUser().subscribe();
      },
      err => {
        this.notification.create(
          'error',
          'Login failed',
          `
          ${err.status === 404
            ? 'No user with those credentials was found'
            : `Hmm... That didn't work`}
        `
        );
        this.isSubmitting = false;
        this.isLoginSuccess = false;
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
