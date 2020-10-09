import { Injectable } from '@angular/core';
import { EntitiesModel } from '@spartacus/core';
import {
  ResponsiveTableConfiguration,
  TableLayout,
} from '@spartacus/storefront';
import { OrganizationListService } from '../organization-list/organization-list.service';
import { BaseItem } from '../organization.model';

@Injectable()
export abstract class OrganizationSubListService<
  T extends BaseItem
> extends OrganizationListService<T> {
  /**
   * The default table structure for sub lists is only showing tables with vertical layout.
   */
  protected defaultTableStructure: ResponsiveTableConfiguration = {
    options: { layout: TableLayout.VERTICAL },
  };

  protected ghostData = {
    values: [{}, {}, {}],
    pagination: {
      totalPages: 1,
      sort: ' ',
    },
    sorts: [],
  } as EntitiesModel<T>;

  // TODO: abstract
  assign(_key: string, ..._args: any) {}
  unassign(_key: string, ..._args: any) {}

  /**
   * As we can't filter with the backend API, we do this client side.
   */
  protected filterSelected(list: EntitiesModel<T>): EntitiesModel<T> {
    if (!list) {
      return list;
    }

    const { pagination, sorts, values } = list;

    return {
      pagination,
      sorts,
      values: values.filter((value) => value.selected),
    };
  }
}
