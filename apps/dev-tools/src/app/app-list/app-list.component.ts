import { Component } from '@angular/core';
import { Application, Beans, ManifestService } from '@scion/microfrontend-platform';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.component.html',
  styleUrls: ['./app-list.component.scss']
})
export class AppListComponent {

  public applications$: Observable<Application[]>;
  private _appFilter$ = new BehaviorSubject<string>('');
  public readonly title = 'Application List';

  constructor() {
    this.applications$ = combineLatest([this._appFilter$, Beans.get(ManifestService).lookupApplications$()])
      .pipe(
        map(([appFilter, apps]) => apps
          .filter(app => app.name.toLowerCase().includes(appFilter))
          .sort((app1, app2) => app1.name.localeCompare(app2.name))
        ));
  }

  public trackByFn(app: Application): string {
    return app.symbolicName;
  }

  public onAppFilter(appFilter: string): void {
    this._appFilter$.next(appFilter.toLowerCase());
  }
}
