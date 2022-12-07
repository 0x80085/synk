import { Component, Input } from '@angular/core';
import {
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { distinctUntilChanged, tap } from 'rxjs';
import { MediaService } from '../../media.service';

@Component({
  selector: 'app-media-input',
  templateUrl: './media-input.component.html',
  styleUrls: ['./media-input.component.scss'],
})
export class MediaInputComponent {
  @Input() roomName: string;

  allowedMediaProviders = [];
  supportedMediaHostsFormatted = 'TODO';

  allowedMediaProviders$ = this.mediaService.allowedMediaProviders.pipe(
    distinctUntilChanged(),
    tap((it) => (this.allowedMediaProviders = it)),
    tap((_) => {
      this.addMediaform = this.fb.group({
        mediaUrl: [null, [Validators.required, this.validateIsUrl()]],
      });
    }),
    tap(_ => this.supportedMediaHostsFormatted = this.allowedMediaProviders.join(', '))
  );

  addMediaform = null;

  constructor(
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private mediaService: MediaService
  ) {}

  onAddMedia() {
    if (this.addMediaform.invalid) {
      return;
    }

    this.mediaService.addToPlaylist({
      url: this.addMediaform.controls.mediaUrl.value,
      roomName: this.roomName,
      currentTime: null,
    });
    this.addMediaform.controls.mediaUrl.patchValue('');
    this.addMediaform.controls.mediaUrl.reset();
    this.notification.info(
      'Request Submitted',
      'The request to add media to the current list is in progress. You will be updated if the request was (un)succesful'
    );
  }

  validateIsUrl(): ValidatorFn {
    return ({ value }: AbstractControl): ValidationErrors | null => {
      return this.isValidMediaUrl(value);
    };
  }

  isValidMediaUrl(value: string) {
    let validUrl = true;

    try {
      const { host } = new URL(value);
      const extractHostnameRegex =
        /(?<![^\/]\/)\b\w+\.\b\w{2,3}(?:\.\b\w{2})?(?=$|\/)/gm;
      const urlParts = extractHostnameRegex.exec(host);
      const [domain] = urlParts;

      if (this.allowedMediaProviders.indexOf(domain) === -1) {
        throw new Error();
      }
    } catch {
      const isIframe = /(?:<iframe[^>]*)(?:(?:\/>)|(?:>.*?<\/iframe>))/gi.test(value);
      validUrl = isIframe;
    }

    return validUrl ? null : { invalidUrl: { value: value } };
  }
}
