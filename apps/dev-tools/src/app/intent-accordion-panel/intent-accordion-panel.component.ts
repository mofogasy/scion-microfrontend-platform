import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Application, Intention } from '@scion/microfrontend-platform';
import { DevToolsManifestService } from '../dev-tools-manifest.service';

@Component({
  selector: 'app-intent-accordion-panel',
  templateUrl: './intent-accordion-panel.component.html',
  styleUrls: ['./intent-accordion-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntentAccordionPanelComponent implements OnInit {

  public providers$: Observable<Application[]>;

  @Input()
  public intent: Intention;

  constructor(private _manifestService: DevToolsManifestService) {
  }

  public ngOnInit(): void {
    this.providers$ = this._manifestService.applicationsHandlingIntent$(this.intent);
  }
}
