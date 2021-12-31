import { Component, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';

import { AuthService, User } from '../auth.service';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { catchError, finalize, tap } from 'rxjs/operators';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  changePasswordForm: FormGroup;

  @ViewChild('changePasswordFormTemplate', { read: TemplateRef }) changePasswordFormRef: TemplateRef<any>;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private auth: AuthService,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private notification: NzNotificationService,

  ) {
  }

  me$: Observable<User> = this.auth.getUser();

  onLogout() {
    this.auth.logout().pipe(
      tap(() => {
        this.notification.success('Member logged out', 'Come back soon!');
        this.router.navigate(['/account', 'login']);
      }),
      catchError((e) => {
        console.log(e);

        this.notification.error("Not logged out...", e.message || "Something went wrong")
        return of(e)
      })

    )
      .subscribe();
  }

  onClickChangePassword() {

    if (!this.changePasswordForm) {
      this.changePasswordForm = this.fb.group({
        oldPassword: [
          null,
          [
            Validators.required,
            Validators.maxLength(20),
            Validators.minLength(5)]
        ],
        newPassword: [
          null,
          [
            Validators.required,
            Validators.maxLength(20),
            Validators.minLength(5)]
        ]
      });
    }

    const authServiceRef = this.auth;
    const formRef = this.changePasswordForm;
    const toastServiceRef = this.notification;

    const modal: NzModalRef = this.modal.create({
      nzTitle: 'Change password',
      nzContent: this.changePasswordFormRef,
      nzFooter: [
        {
          label: 'Cancel',
          onClick: () => modal.destroy()
        },
        {
          label: 'Submit',
          type: 'primary',
          danger: true,
          loading: false,
          onClick() {
            this.loading = true;

            if (formRef.invalid) {
              console.log('invalid form');
              setTimeout(() => (this.loading = false), 200);
              toastServiceRef.warning('Check your input', 'Invalid password')
              return
            }

            const oldPassword = formRef.controls.oldPassword.value;
            const newPassword = formRef.controls.newPassword.value;

            authServiceRef.changePassword(oldPassword, newPassword).pipe(
              tap(() => {
                toastServiceRef.success('Changed password succesfully', 'Save it somewhere secure, there\'s no reset!');
                formRef.controls.oldPassword.patchValue('');
              }),
              catchError((e) => {
                console.log(e);
        
                this.notification.error("Password not changed..", e.error.message || "Something went wrong")
                return of(e)
              }),
              finalize(() => this.loading = false)
            ).subscribe();
          }
        }
      ]
    });



  }

  onDeleteAccount() {
    if (confirm("WARNING: This permanently deletes your account and any channel or other relation linked to it.")) {
      this.auth.deleteAccount().pipe(
        tap(() => {
          this.router.navigate(['/account', 'register']);
          this.notification.success("Account deleted", "Sorry to see you go, come back anytime!");
        }),
        catchError(err => {
          console.log(err);

          this.notification.error("Account NOT deleted...", err.error.message || "Something went wrong")
          return of(err)
        })
      )
        .subscribe()
    }
  }

}
