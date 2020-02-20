import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PositionComponent } from './position.component';
import { PositionResolverService } from './position-resolver.service';
import { DetailsPositionComponent } from './details-position/details-position.component';
import { DetailsCompanyComponent } from 'app/company/details-company/details-company.component';
import { DetailsPositionGuard } from './details-position/details-position.guard';
import { AuthGuard } from 'app/auth/auth.guard';




const routes: Routes = [
  {
    path: 'positions',
    component: PositionComponent,
    canActivate: [AuthGuard],
    resolve: [PositionResolverService],
    children: [
      {
        path: ':index', component: DetailsPositionComponent, canActivate: [DetailsPositionGuard],
      },
      {
        path: ':index/company', component: DetailsCompanyComponent, canActivate: [DetailsPositionGuard],
      },
      {
        path: ':index/company/position', component: DetailsPositionComponent, canActivate: [DetailsPositionGuard],
      },
    ]
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PositionRoutingModule { }




















