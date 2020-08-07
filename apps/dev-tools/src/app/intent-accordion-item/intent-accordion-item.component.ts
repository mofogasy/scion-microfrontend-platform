import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
import { Intention } from '@scion/microfrontend-platform';

@Component({
  selector: 'app-intent-accordion-item',
  templateUrl: './intent-accordion-item.component.html',
  styleUrls: ['./intent-accordion-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntentAccordionItemComponent implements OnChanges {

  public unhandled$: Observable<boolean>;

  @Input()
  public intent: Intention;

  constructor() {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // this.unhandled$ = this._manifestRegistryService.capabilityProviders$(this.intent.metadata.id)
    //   .pipe(map(providers => providers.length === 0));
  }
}
