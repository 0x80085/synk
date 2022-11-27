import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, catchError, exhaustMap, of, tap } from 'rxjs';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-invidious-url-form',
  templateUrl: './invidious-url-form.component.html',
  styleUrls: ['./invidious-url-form.component.scss'],
})
export class InvidiousUrlFormComponent implements OnInit {
  refreshInvidiousDataSubject = new BehaviorSubject(true);

  invidiousUrls$ = this.refreshInvidiousDataSubject.pipe(
    exhaustMap(() => this.adminService.getInvidiousUrls()),
    tap((_) => this.invidiousUrlsForm.reset()),
    tap((_) => this.listOfControl = []),
    tap((_) => Object.keys(this.invidiousUrlsForm.controls).forEach(it => this.invidiousUrlsForm.removeControl(it))),
    tap((data) => {
      data.forEach((it, index) => {
        this.addField();
        Object.values(this.invidiousUrlsForm.controls)[index].setValue(it);
      });
    })
  );

  invidiousUrlsForm = this.formBuilder.group([]);

  listOfControl: Array<{ id: number; controlInstance: string }> = [];

  constructor(
    private adminService: AdminService,
    private notification: NzNotificationService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.addField();
  }

  addField(e?: MouseEvent): void {
    if (e) {
      e.preventDefault();
    }
    const id =
      this.listOfControl.length > 0
        ? this.listOfControl[this.listOfControl.length - 1].id + 1
        : 0;

    const control = {
      id,
      controlInstance: `url_control_${id}`,
    };
    const index = this.listOfControl.push(control);
    this.invidiousUrlsForm.addControl(
      this.listOfControl[index - 1].controlInstance,
      new FormControl(null, Validators.required)
    );
  }

  removeField(i: any, e: MouseEvent): void {
    e.preventDefault();
    if (this.listOfControl.length > 1) {
      const index = this.listOfControl.indexOf(i);
      this.listOfControl.splice(index, 1);
      this.invidiousUrlsForm.removeControl(i.controlInstance);
    }
  }

  submitForm(): void {
    if (this.invidiousUrlsForm.valid) {
      this.updateInvidiousUrls();
    } else {
      Object.values(this.invidiousUrlsForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  private updateInvidiousUrls() {
    const newUrls = Object.values(this.invidiousUrlsForm.controls).map(
      (control) => control.value
    );
    this.adminService
      .patchInvidiousUrls(newUrls)
      .pipe(
        tap(() =>
          this.notification.success('Saved!', 'Updated the Invidious URLs')
        ),
        tap(() => this.refreshInvidiousDataSubject.next(true)),
        catchError((error) => {
          this.notification.error('Oh no!', 'Could not save the Invidous URLs');
          console.log(error);
          return of();
        })
      )
      .subscribe();
  }
}
