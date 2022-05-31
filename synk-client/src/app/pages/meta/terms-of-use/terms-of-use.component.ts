import { Component } from '@angular/core';

@Component({
  selector: 'app-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./terms-of-use.component.scss']
})
export class TermsOfUseComponent {

  constructor() { }

  hostName = () => {
    const url = new URL(window.location.href);
    return `${url.protocol}//${url.hostname}`
  };

}
