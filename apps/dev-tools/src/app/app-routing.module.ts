import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppListComponent } from './app-list/app-list.component';
import { FindCapabilitiesComponent } from './find-capabilities/find-capabilities.component';
import { AppDetailsComponent } from './app-details/app-details.component';
import { FilterResultsComponent } from './filter-results/filter-results.component';

const routes: Routes = [
  {path: '', redirectTo: 'app-list', pathMatch: 'full'},
  {
    path: 'find-capabilities',
    children: [
      {path: '', component: FindCapabilitiesComponent},
      {path: 'filter-results', component: FilterResultsComponent, outlet: 'details'}
    ]
  },
  {
    path: 'app-list',
    children: [
      {path: '', component: AppListComponent},
      {path: 'app-detail/:appSymbolicName', component: AppDetailsComponent, outlet: 'details'},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
