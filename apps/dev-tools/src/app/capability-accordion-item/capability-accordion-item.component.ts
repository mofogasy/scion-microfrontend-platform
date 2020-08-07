import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { Capability, Qualifier } from '@scion/microfrontend-platform';

@Component({
  selector: 'app-provider-accordion-item',
  templateUrl: './capability-accordion-item.component.html',
  styleUrls: ['./capability-accordion-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapabilityAccordionItemComponent implements OnChanges, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _inputChange$ = new Subject<void>();

  public execQualifier: Qualifier;

  @Input()
  public appSymbolicName;

  @Input()
  public provider: Capability;

  constructor(cd: ChangeDetectorRef) {
    // this._inputChange$
    //   .pipe(
    //     switchMap(() => manifestRegistryService.capabilities$(PlatformCapabilityTypes.Popup, this.createExecQualifier())),
    //     map((capabilities: Capability[]) => capabilities.length > 0),
    //     takeUntil(this._destroy$),
    //   )
    //   .subscribe((executable: boolean) => {
    //     this.execQualifier = (executable ? this.createExecQualifier() : null);
    //     cd.markForCheck();
    //   });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this._inputChange$.next();
  }

  public onCapabilityExecute(event: MouseEvent): void {
    if (!this.execQualifier) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // TODO: open popup?
  }

  // private createExecQualifier(): Qualifier {
  //   return {
  //     entity: 'provider',
  //     action: 'execute',
  //     type: this.provider.type,
  //     capabilityId: this.provider.metadata.id,
  //   };
  // }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
