import { NgModule } from '@angular/core';

import { Routes, RouterModule, PreloadAllModules, UrlSegment } from '@angular/router';
import { ErrorsComponent } from './errors/errors.component';
import { HomeComponent } from './home/home.component';


const authRoutesMatcher = (url: UrlSegment[]) => {
  return ['login', 'reset', 'reset-password', 'signup'].includes(url[0].path) ?
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
    path: '**', component: ErrorsComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
