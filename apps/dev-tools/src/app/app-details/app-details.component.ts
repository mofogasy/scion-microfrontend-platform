import { Component, OnDestroy } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, OperatorFunction, Subject } from 'rxjs';
import { Application, Beans, Capability, Intention, ManifestService } from '@scion/microfrontend-platform';
import { distinctUntilChanged, filter, map, takeUntil, tap } from 'rxjs/operators';
import { DevToolsManifestService } from '../dev-tools-manifest.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-app-details',
  templateUrl: './app-details.component.html',
  styleUrls: ['./app-details.component.scss']
})
export class AppDetailsComponent implements OnDestroy {

  public app$: Observable<Application>;
  public providers$: Observable<Capability[]>;
  public intentions$: Observable<Intention[]>;
  public requiresApplications$: Observable<Application[]>;
  public requiredByApplications$: Observable<Application[]>;

  private _title$: Subject<string> = new Subject<string>();
  private _providerFilter$ = new BehaviorSubject<string>(null);
  private _intentionFilter$ = new BehaviorSubject<string>(null);
  private _destroy$ = new Subject<void>();
  private _unsubscribe$ = new Subject<void>();

  constructor(private _route: ActivatedRoute, private _manifestService: DevToolsManifestService) {
    this.installApplicationChangedListener();
  }

  private installApplicationChangedListener(): void {
    this._route.paramMap
      .pipe(
        map(paramMap => paramMap.get('appSymbolicName')),
        distinctUntilChanged(),
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe((appSymbolicName: string) => {
        this._unsubscribe$.next();

        this.app$ = Beans.get(ManifestService).lookupApplications$()
          .pipe(
            map(apps => apps.find(app => app.symbolicName === appSymbolicName)),
            tap(app => this._title$.next(app.name))
          );

        this.providers$ = combineLatest([
          this._providerFilter$,
          this._manifestService.capabilities$({appSymbolicName})
        ]).pipe(
          filterCapabilities(),
          takeUntil(this._unsubscribe$)
        );

        this.intentions$ = combineLatest([
          this._intentionFilter$,
          this._manifestService.intentions$({appSymbolicName})
        ]).pipe(
          filterIntents(),
          takeUntil(this._unsubscribe$)
        );

        this.requiresApplications$ = this._manifestService.applicationsRequiredBy$(appSymbolicName).pipe(takeUntil(this._unsubscribe$));
        this.requiredByApplications$ = this._manifestService.applicationsRequiring$(appSymbolicName).pipe(takeUntil(this._unsubscribe$));
      });
  }

  public get title(): Observable<string> {
    return this._title$.asObservable();
  }

  public onCapabilityFilter(filterText: string): void {
    this._providerFilter$.next(filterText);
  }

  public onIntentFilter(filterText: string): void {
    this._intentionFilter$.next(filterText);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  public trackByFn(app: Application): string {
    return app.symbolicName;
  }
}

function filterCapabilities(): OperatorFunction<[string, Capability[]], Capability[]> {
  return map(([filterText, capabilities]: [string, Capability[]]): Capability[] => {
    if (!filterText) {
      return capabilities;
    }

    // TODO: Filterfield umbauen, um regexp-Filterungen zu unterstützen
    const filterRegExp = toFilterRegExp(filterText);
    return capabilities.filter(capability => (
      filterRegExp.test(capability.type) ||
      filterRegExp.test(capability.private ? 'private' : 'public') ||
      Object.keys(capability.qualifier || {}).some(key => filterRegExp.test(key)) ||
      Object.values(capability.qualifier || {}).some(value => filterRegExp.test(`${value}`))),
    );
  });
}

function filterIntents(): OperatorFunction<[string, Intention[]], Intention[]> {
  return map(([filterText, intents]: [string, Intention[]]): Intention[] => {
    if (!filterText) {
      return intents;
    }

    const filterRegExp = toFilterRegExp(filterText);
    return intents.filter(intent => (
      filterRegExp.test(intent.type) ||
      Object.keys(intent.qualifier || {}).some(key => filterRegExp.test(key)) ||
      Object.values(intent.qualifier || {}).some(value => filterRegExp.test(`${value}`))),
    );
  });
}

/**
 * Creates a regular expression of the given filter text.
 */
function toFilterRegExp(filterText: string): RegExp | null {
  if (!filterText) {
    return null;
  }

  // Escape the user filter input and add wildcard support
  const escapedString = filterText.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  return new RegExp(escapedString, 'i');
}
