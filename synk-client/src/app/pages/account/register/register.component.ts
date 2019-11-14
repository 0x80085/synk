import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerSuccess = false;

  form: FormGroup;

  submitForm(): void {
    // for (const i in this.validateForm.controls) {
    //   this.validateForm.controls[i].markAsDirty();
    //   this.validateForm.controls[i].updateValueAndValidity();
    // }
    const creds = {
      username: this.form.controls.userName.value,
      password: this.form.controls.password.value
    };

    console.log('submitted');
    this.service.createAccount(creds).subscribe(
      () => {
        this.registerSuccess = true;
      },
      () => {}
    );
  }

  constructor(private fb: FormBuilder, private service: AuthService) {}

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
}
