import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';





export class ServerErrorsInterceptor implements HttpInterceptor {

  // handleError = (errorRes: any) => {
  //   let messages: any[] = [];
  //   if (!errorRes.error || !errorRes.error.errors) {
  //     messages = ['an unknown error occured'];
  //   } else {
  //     for (const err of errorRes.error.errors) {
  //       messages.push(err['msg']);
  //     }
  //   }
  //   return messages;
  // }

  // getFailureMessages = (errors: [{ [msg: string]: string }]) => {
  //   const messages: any[] = [];
  //   for (const err of errors) {
  //     messages.push(err['msg']);
  //   }
  //   return messages;
  // }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error['error']['messages']);
      })
    );
  }
}


