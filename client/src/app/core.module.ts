import { NgModule } from '@angular/core';
import { AuthInterceptor } from './auth/auth-interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ServerErrorsInterceptor } from './shared/server-errors-interceptor';




@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ServerErrorsInterceptor, multi: true },
  ],
})
export class CoreModule {}



