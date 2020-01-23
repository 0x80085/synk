import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  isLoginSuccess = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
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

    this.auth.login(creds).subscribe(
      ob => {
        this.isLoginSuccess = true;
        this.isLoginSuccess = true;

        this.auth.getUser().subscribe();
      },
      err => {
        this.notification.create(
          'error',
          'Login failed',
          `
          ${err.status === 404 ? 'user not found' : '??'}
        `
        );
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
