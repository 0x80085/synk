import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../auth.service';

@Pipe({
  name: 'placehold'
})
export class PlaceholdPipe implements PipeTransform {

  transform(user: User): string | null {

    return user ? `http://satyr.io/400x300/c0ffee?text=${user.userName}` : `http://satyr.io/105x60?text=uh+oh`;
  }

}
