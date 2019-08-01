import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { BleProvider } from '../../providers/ble/ble';

/**
 * Generated class for the HasRoleDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[has-role]' // Attribute selector
})
export class HasRoleDirective implements OnInit {

  @Input('has-role') roles: string[];
  

  constructor(
    private ble: BleProvider,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {
    console.log('Hello HasRoleDirective Directive');
  }

  ngOnInit() {
    this.ble.getUserSubject().subscribe(_ => {
      if(this.ble.hasRoles(this.roles)) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }

}
