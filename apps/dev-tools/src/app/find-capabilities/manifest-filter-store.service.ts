import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { Beans, Capability, ManifestObjectFilter, ManifestService, Qualifier } from '@scion/microfrontend-platform';
import { debounceTime, map, takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ManifestFilterStore {
  private _destroy$ = new Subject<void>();
  private _update$ = new Subject<void>();
  private _map = new Map<ManifestObjectFilter, FilterValue>();
  private _apps = new Set<string>();
  private _types = new Set<string>();
  private _qualifier: Qualifier;

  public results$(): Observable<Capability[]> {
    return this._update$.pipe(
      debounceTime(100),
      map(() => Array.from(this._map.values())
        .map(filter => filter.lastResult || [])
        .reduce((array, apps) => [...apps, ...array], [])
        .sort((p1, p2) => compare(p1, p2))
        // TODO: improve filtering
        .filter((provider, index, array) => {
          if (index < array.length - 1) {
            const other = array[index + 1];
            return !(provider.metadata.appSymbolicName === other.metadata.appSymbolicName
              && provider.type === other.type
              && isEqualQualifier(provider.qualifier, other.qualifier)
            );
          }
          return true;
        })
      )
    );
  }

  public addApp(app: string): void {
    if (this._apps.has(app)) {
      return;
    }
    Array.from(this._map.keys()).forEach(filter => {
      if (filter.appSymbolicName === undefined) {
        this.removeFilter(filter);
      }
      this.addFilter({appSymbolicName: app, type: filter.type, qualifier: filter.qualifier});
    });

    if (!this._map.size) {
      this.addFilter({appSymbolicName: app});
    }
    this._apps.add(app);
  }

  private addFilter(filter: ManifestObjectFilter): void {
    this._map.set(filter, {
      subscription: Beans.get(ManifestService).lookupCapabilities$(filter)
        .pipe(takeUntil(this._destroy$))
        .subscribe(result => {
          this._map.get(filter).lastResult = result;
          this._update$.next();
        })
    });
  }

  private removeFilter(filter: ManifestObjectFilter): void {
    const filterValue: FilterValue = this._map.get(filter);
    if (filterValue) {
      filterValue.subscription.unsubscribe();
      this._map.delete(filter);
      this._update$.next();
      return;
    }
    throw new Error(`[AppFilterComponent]: no filter found for removing. Filter: ${filter}`);
  }

  public addType(type: string): void {
    if (this._types.has(type)) {
      return;
    }
    Array.from(this._map.keys()).forEach(filter => {
      if (filter.type === undefined) {
        this.removeFilter(filter);
      }
      this.addFilter({appSymbolicName: filter.appSymbolicName, type, qualifier: filter.qualifier});
    });
    if (!this._map.size) {

      this.addFilter({type});
    }
    this._types.add(type);
  }

  public addQualifier(qualifier: Qualifier): void {
    Array.from(this._map.keys()).forEach(filter => {
      if (filter.qualifier === undefined) {
        this.removeFilter(filter);
      }
      this.addFilter({appSymbolicName: filter.appSymbolicName, type: filter.type, qualifier});
    });
    if (!this._map.size) {
      this.addFilter({qualifier});
    }
    this._qualifier = qualifier;
  }

  public removeApp(app: string): void {
    this._apps.delete(app);
    Array.from(this._map.keys()).forEach(filter => {
      if (filter.appSymbolicName === app) {
        this.removeFilter(filter);
      }
      if (this._apps.size === 0 && (this._types.size || this._qualifier)) {
        this.addFilter({type: filter.type, qualifier: filter.qualifier});
      }
    });
  }

  public removeType(type: string): void {
    this._types.delete(type);
    Array.from(this._map.keys()).forEach(filter => {
      if (filter.type === type) {
        this.removeFilter(filter);
      }
      if (this._types.size === 0 && (this._apps.size || this._qualifier)) {
        this.addFilter({appSymbolicName: filter.appSymbolicName, qualifier: filter.qualifier});
      }
    });
  }

  public removeQualifier(): void {
    Array.from(this._map.keys()).forEach(filter => {
      this.removeFilter(filter);
      if (this._types.size || this._apps.size) {
        this.addFilter({appSymbolicName: filter.appSymbolicName, type: filter.type});
      }
    });
  }

  public destroy(): void {
    this._destroy$.next();
  }

  public updateTypeFilters(typeFilters: string[]): void {
    typeFilters.forEach(type => this.addType(type));
    Array.from(this._types.values())
      .filter(type => !typeFilters.includes(type))
      .forEach(type => this.removeType(type));
  }

  public updateQualifierFilter(qualifier: Qualifier): void {
    this.removeQualifier();
    if (qualifier) {
      this.addQualifier(qualifier);
    }
  }

  public updateAppFilters(appFilters: string[]): void {
    appFilters.forEach(app => this.addApp(app));
    Array.from(this._apps.values())
      .filter(app => !appFilters.includes(app))
      .forEach(app => this.removeApp(app));
  }
}

interface FilterValue {
  subscription: Subscription;
  lastResult?: Capability[];
}

function compare(p1: Capability, p2: Capability): number {
  return p1.metadata.appSymbolicName.localeCompare(p2.metadata.appSymbolicName) || p1.type.localeCompare(p2.type);
}

// TODO: export from microfrontend-platform or put into utils
export function isEqualQualifier(qualifier1: Qualifier, qualifier2: Qualifier): boolean {
  qualifier1 = qualifier1 || {};
  qualifier2 = qualifier2 || {};

  // Test if qualifier2 has all required entries
  if (!Object.keys(qualifier1).every(key => qualifier2.hasOwnProperty(key))) {
    return false;
  }

  // Test if qualifier2 has no additional entries
  if (!Object.keys(qualifier2).every(key => qualifier1.hasOwnProperty(key))) {
    return false;
  }

  // Test if values match
  return Object.keys(qualifier1).every(key => qualifier1[key] === qualifier2[key]);
}
