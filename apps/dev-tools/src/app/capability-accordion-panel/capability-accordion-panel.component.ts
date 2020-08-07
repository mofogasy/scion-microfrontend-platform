import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Application, Capability } from '@scion/microfrontend-platform';
import { DevToolsManifestService } from '../dev-tools-manifest.service';

@Component({
  selector: 'app-provider-accordion-panel',
  templateUrl: './capability-accordion-panel.component.html',
  styleUrls: ['./capability-accordion-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CapabilityAccordionPanelComponent implements OnInit {

  public consumers$: Observable<Application[]>;

  @Input()
  public provider: Capability;

  @HostBinding('class.has-properties')
  public hasProperties: boolean;

  constructor(private _manifestService: DevToolsManifestService) {
  }

  public ngOnInit(): void {
    this.hasProperties = Object.keys(this.provider.properties || {}).length > 0;
    this.consumers$ = this._manifestService.applicationsUsingCapability$(this.provider);
  }
}
