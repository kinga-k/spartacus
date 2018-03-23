import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRouting from '../../../routing/store';

@Component({
  selector: 'y-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressFormComponent {
  @Input() parent: FormGroup;

  @Input() countries$: Observable<any>;

  constructor(protected store: Store<fromRouting.State>) {}

  addAddress() {}

  back() {
    this.store.dispatch(
      new fromRouting.Go({
        path: ['/cart']
      })
    );
  }
}
