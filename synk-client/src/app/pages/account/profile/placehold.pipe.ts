import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../auth.service';

@Pipe({
  name: 'placehold'
})
export class PlaceholdPipe implements PipeTransform {

  // till satyr.io fixes https problem

  transform = (user: User): string =>
    user
      ? `https://via.placeholder.com/400x300/c0ffee?text=${user.userName}`
      : `https://via.placeholder.com/400x300/c0ffee`

}
