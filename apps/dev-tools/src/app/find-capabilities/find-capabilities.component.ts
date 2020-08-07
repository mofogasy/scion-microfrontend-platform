import { Component, OnDestroy } from '@angular/core';
import { Qualifier } from '@scion/microfrontend-platform';
import { Filter, KeyValuePair } from './filter-field/filter-field.component';
import { ManifestFilterStore } from './manifest-filter-store.service';

@Component({
  selector: 'app-find-capabilities',
  templateUrl: './find-capabilities.component.html',
  styleUrls: ['./find-capabilities.component.scss']
})
export class FindCapabilitiesComponent implements OnDestroy {

  public readonly title = 'Find Capabilities';

  constructor(private _manifestFilterStore: ManifestFilterStore) {
  }

  public onTypeFilterChanged(typeFilters: Filter[]): void {
    this._manifestFilterStore.updateTypeFilters(typeFilters as string[]);
  }

  public onQualifierFilterChanged(qualifierFilters: Filter[]): void {
    const qualifier: Qualifier = qualifierFilters.length ? (qualifierFilters as KeyValuePair[])
        .reduce((aggregate, value) => {
          return value.key ? Object.assign(aggregate, {[value.key]: value.value}) : aggregate;
        }, {} as Qualifier)
      : null;
    this._manifestFilterStore.updateQualifierFilter(qualifier);
  }

  public onAppFilterChanged(appFilters: Filter[]): void {
    this._manifestFilterStore.updateAppFilters(appFilters as string[]);
  }

  public ngOnDestroy(): void {
    this._manifestFilterStore.destroy();
  }
}
