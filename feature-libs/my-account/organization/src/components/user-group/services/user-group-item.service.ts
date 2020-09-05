import { Injectable } from '@angular/core';
import { RoutingService } from '@spartacus/core';
import { Observable } from 'rxjs';
import { Budget, UserGroup, UserGroupService } from '../../../core/index';
import { OrganizationItemService } from '../../shared/organization-item.service';
import { UserGroupFormService } from '../form/user-group-form.service';
import { CurrentUserGroupService } from './current-user-group.service';

@Injectable({
  providedIn: 'root',
})
export class UserGroupItemService extends OrganizationItemService<UserGroup> {
  constructor(
    protected currentItemService: CurrentUserGroupService,
    protected routingService: RoutingService,
    protected formService: UserGroupFormService,
    protected userGroupService: UserGroupService
  ) {
    super(currentItemService, routingService, formService);
  }

  load(code: string): Observable<Budget> {
    this.userGroupService.load(code);
    return this.userGroupService.get(code);
  }

  protected update(code, value: Budget) {
    this.userGroupService.update(code, value);
  }

  protected create(value: Budget) {
    this.userGroupService.create(value);
  }

  protected getDetailsRoute(): string {
    return 'userGroupDetails';
  }
}