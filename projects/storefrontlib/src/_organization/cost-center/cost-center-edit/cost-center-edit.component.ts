import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  CostCenter,
  CostCenterService,
  GlobalMessageService,
  GlobalMessageType,
  RoutingService,
} from '@spartacus/core';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { CostCenterFormComponentService } from '../cost-center-form/cost-center-form.component.service';

@Component({
  selector: 'cx-cost-center-edit',
  templateUrl: './cost-center-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostCenterEditComponent {
  form: FormGroup;
  protected formKey: string;
  /**
   * The code is used to update the cost center.
   */
  protected costCenterCode: string;

  protected code$: Observable<string> = this.router.parent.params.pipe(
    map((routingData) => routingData['code']),
    tap((code) => (this.costCenterCode = code))
  );

  costCenter$: Observable<CostCenter> = this.code$.pipe(
    tap((code) => this.costCenterService.loadCostCenter(code)),
    switchMap((code) => this.costCenterService.get(code))
  );

  constructor(
    // we can't do without the router as the routingService
    // is unable to resolve the parent routing params
    protected router: ActivatedRoute,
    protected routingService: RoutingService,
    protected costCenterService: CostCenterService,

    protected globalMessageService: GlobalMessageService,
    protected costCenterFormService: CostCenterFormComponentService
  ) {}

  initForm(costCenter: CostCenter): FormGroup {
    this.formKey = this.createFormKey(costCenter);
    if (this.costCenterFormService.has(this.formKey)) {
      this.showFormRestoredMessage();
    }

    if (this.costCenterFormService.has(this.formKey)) {
      this.form = this.costCenterFormService.getForm(costCenter, this.formKey);
    }
    return this.form;
  }

  protected createFormKey(costCenter: CostCenter): string {
    return `cost-center-edit-${costCenter.code}-${costCenter.unit?.uid}`;
  }

  protected showFormRestoredMessage(): void {
    this.globalMessageService.add(
      { key: 'form.restored' },
      GlobalMessageType.MSG_TYPE_INFO
    );
  }

  protected removeForm(): void {
    this.form.reset();
    this.costCenterFormService.removeForm(this.formKey);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
    } else {
      this.form.disable();
      this.costCenterService.update(this.costCenterCode, this.form.value);
      this.removeForm();

      this.routingService.go({
        cxRoute: 'costCenterDetails',
        params: this.form.value,
      });
    }
  }
}