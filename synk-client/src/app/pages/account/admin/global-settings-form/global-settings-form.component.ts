import { Component } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, catchError, exhaustMap, of, tap } from 'rxjs';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-global-settings-form',
  templateUrl: './global-settings-form.component.html',
  styleUrls: ['./global-settings-form.component.scss']
})
export class GlobalSettingsFormComponent {
  refreshDataSubject = new BehaviorSubject(true);

  labels: string[];

  globalSettings$ = this.refreshDataSubject.pipe(
    exhaustMap(() => this.adminService.getGlobalSettings()),
    tap((_) => this.settingsForm.reset()),
    tap((_) => this.listOfControl = []),
    tap((_) => Object.keys(this.settingsForm.controls).forEach(it => this.settingsForm.removeControl(it))),
    tap((data) => {
      this.labels=Object.keys(data)
      Object.values(data).forEach((it, index) => {
        this.addField();
        Object.values(this.settingsForm.controls)[index].setValue(it);
      });
    })
  );

  settingsForm = this.formBuilder.group([]);

  listOfControl: Array<{ id: number; controlInstance: string }> = [];

  constructor(
    private adminService: AdminService,
    private notification: NzNotificationService,
    private formBuilder: FormBuilder
  ) {}


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
    this.settingsForm.addControl(
      this.listOfControl[index - 1].controlInstance,
      new FormControl(null,  /*  Validators.required*/ )
    );
  }

  removeField(i: any, e: MouseEvent): void {
    e.preventDefault();
    if (this.listOfControl.length > 1) {
      const index = this.listOfControl.indexOf(i);
      this.listOfControl.splice(index, 1);
      this.settingsForm.removeControl(i.controlInstance);
    }
  }

  submitForm(): void {
    if (this.settingsForm.valid) {
      this.updateGlobalSettings();
    } else {
      Object.values(this.settingsForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  private updateGlobalSettings() {
    let newSettings = {};
    this.labels.forEach((it, i) => newSettings[it] = Object.values(this.settingsForm.controls)[i].value)

    this.adminService
      .patchGlobalSettings(newSettings)
      .pipe(
        tap(() =>
          this.notification.success('Saved!', 'Updated the Global Settings')
        ),
        tap(() => this.refreshDataSubject.next(true)),
        catchError((error) => {
          this.notification.error('Oh no!', 'Could not save the Global Settings');
          console.log(error);
          return of();
        })
      )
      .subscribe();
  }
}
