import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PositionComponent } from './position.component';
import { PositionResolverService } from './position-resolver.service';
import { DetailsPositionComponent } from './details-position/details-position.component';
import { DetailsCompanyComponent } from 'app/company/details-company/details-company.component';
import { DetailsPositionGuard } from './details-position/details-position.guard';
import { AuthGuard } from 'app/auth/auth.guard';
import { DetailsCompanyGuard } from 'app/company/details-company/details-company.guard';




const routes: Routes = [
  {
    path: 'positions',
    component: PositionComponent,
    canActivate: [AuthGuard],
    resolve: [PositionResolverService]
  },
  {
    path: 'positions/:index',
    component: DetailsPositionComponent,
    canActivate: [AuthGuard, DetailsPositionGuard],
    resolve: [PositionResolverService]
  },
  {
    path: 'positions/:index/company',
    component: DetailsCompanyComponent,
    canActivate: [AuthGuard, DetailsCompanyGuard],
    resolve: [PositionResolverService]
  },
  {
    path: 'positions/:index/company/position',
    component: DetailsPositionComponent,
    canActivate: [AuthGuard, DetailsPositionGuard],
    resolve: [PositionResolverService]
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PositionRoutingModule { }




















