import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../auth.service';

@Pipe({
  name: 'username'
})
export class UsernamePipe implements PipeTransform {

  transform(user: User): string {
    return user ? user.username : `errrrr`;
  }

}
