import { Component, HostBinding, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { Dimension } from '@scion/toolkit/observable';

interface TitledComponent {
  title: string | Observable<string>;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public primaryTitle: string;
  public isMenuBarLeft = true;
  public detailsTitle: string;
  public showPrimary = true;
  public showDetails: boolean;
  public showSash = false;  // TODO: remove


  @HostBinding('class.top')
  public get top(): boolean {
    return !this.isMenuBarLeft;
  }

  @HostBinding('class.left')
  public get left(): boolean {
    return this.isMenuBarLeft;
  }

  constructor(router: Router) {
    router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showDetails = !!event.url.match(/\(details:.*\)/);
        if (!this.showDetails) {
          this.showPrimary = true;
        }
      });
  }

  public ngOnInit(): void {
    // workaround for sashbox with Angular 9
    setTimeout(() => this.showSash = true, 100);
  }

  public onDimensionChange(dimension: Dimension): void {
    this.isMenuBarLeft = dimension.clientHeight < dimension.clientWidth;
  }

  public onShowPrimaryClicked(): void {
    this.showPrimary = true;
  }

  public onHidePrimaryClicked(): void {
    this.showPrimary = false;
  }

  public onActivatePrimary(component: TitledComponent): void {
    this.updateTitle(component, title => this.primaryTitle = title);
  }

  public onActivateDetails(component: TitledComponent): void {
    this.updateTitle(component, title => this.detailsTitle = title);
  }

  private updateTitle(component: TitledComponent, setter: (title: string) => void): void {
    if (component.title === undefined) {
      setter('No title specified');
    } else if (typeof component.title === 'string') {
      setter(component.title);
    } else {
      component.title.subscribe(title => setter(title));
    }
  }
}
