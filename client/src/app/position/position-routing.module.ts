import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PositionComponent } from './position.component';
import { PositionResolverService } from './position-resolver.service';
import { DetailsPositionComponent } from './details-position/details-position.component';
import { DetailsCompanyComponent } from 'app/company/details-company/details-company.component';
import { DetailsCompanyGuard } from 'app/company/details-company/details-company.guard';




const routes: Routes = [
  {
    path: 'positions',
    component: PositionComponent,
    resolve: [PositionResolverService],
    children: [
      {
        path: ':index', component: DetailsPositionComponent
      },
      {
        path: ':index/company', component: DetailsCompanyComponent
      },
      {
        path: ':index/company/position', component: DetailsPositionComponent
      },
    ]
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PositionRoutingModule { }




















