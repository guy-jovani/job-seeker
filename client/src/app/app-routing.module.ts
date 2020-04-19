import { NgModule } from '@angular/core';

import { Routes, RouterModule, PreloadAllModules, UrlSegment } from '@angular/router';
import { ErrorsComponent } from './errors/errors.component';
import { HomeComponent } from './home/home.component';


const authRoutesMatcher = (url: UrlSegment[]) => {
  return ['login', 'reset', 'reset-password', 'signup'].includes(url[0].path) ?
            { consumed: [] } : null;
};

const userRoutesMatcher = (url: UrlSegment[]) => {
  return ['my-details', 'my-jobs', 'my-applicants'].includes(url[0].path) ?
            { consumed: [] } : null;
};

const companyRoutesMatcher = (url: UrlSegment[]) => {
  return ['companies'].includes(url[0].path) ?
            { consumed: [] } : null;
};

const employeeRoutesMatcher = (url: UrlSegment[]) => {
  return ['people'].includes(url[0].path) ?
            { consumed: [] } : null;
};

const jobRoutesMatcher = (url: UrlSegment[]) => {
  return ['jobs'].includes(url[0].path) ?
            { consumed: [] } : null;
};

const routes: Routes = [
  {
    path: '', pathMatch: 'full',
    component: HomeComponent,
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule)
  },
  {
    matcher: authRoutesMatcher,
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    matcher: companyRoutesMatcher,
    loadChildren: () => import('./company/company.module').then(m => m.CompanyModule)
  },
  {
    matcher: jobRoutesMatcher,
    loadChildren: () => import('./job/job.module').then(m => m.JobModule)
  },
  {
    matcher: employeeRoutesMatcher,
    loadChildren: () => import('./employees/employees.module').then(m => m.EmployeesModule)
  },
  {
    matcher: userRoutesMatcher,
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  },
  {
    path: '**', component: ErrorsComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
