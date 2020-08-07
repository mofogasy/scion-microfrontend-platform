import { Component, Input, OnInit } from '@angular/core';
import { Application, Beans, ManifestService } from '@scion/microfrontend-platform';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-app-list-item',
  templateUrl: './app-list-item.component.html',
  styleUrls: ['./app-list-item.component.scss']
})
export class AppListItemComponent implements OnInit {

  @Input()
  public app: Application;
  public intentionCount$: Observable<number>;
  public providerCount$: Observable<number>;

  public ngOnInit(): void {
    this.intentionCount$ =  Beans.get(ManifestService).lookupIntentions$({appSymbolicName: this.app.symbolicName})
      .pipe(map(intentions => intentions.length));
    this.providerCount$ =  Beans.get(ManifestService).lookupCapabilities$({appSymbolicName: this.app.symbolicName})
      .pipe(map(providers => providers.length));
  }

}
