import { Directive, Input } from '@angular/core';

interface TableRowTemplateContext<TItem extends object> {
  $implicit: TItem;
  joshiesStronglyTypedTableRow: TItem;
  index: number;
}

@Directive({
  selector: 'ng-template[joshiesStronglyTypedTableRow]',
  standalone: true,
})
export class StronglyTypedTableRowDirective<TItem extends object> {
  @Input('joshiesStronglyTypedTableRow') data!: TItem[];

  static ngTemplateContextGuard<TContextItem extends object>(
    dir: StronglyTypedTableRowDirective<TContextItem>,
    ctx: unknown,
  ): ctx is TableRowTemplateContext<TContextItem> {
    return true;
  }
}
