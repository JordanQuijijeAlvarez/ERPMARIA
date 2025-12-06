import { inject, Injectable } from '@angular/core';
import { HttpEvent, HttpEventType, HttpHandler, HttpHandlerFn, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../servicios/authservicio.service';
import { Router } from '@angular/router';




export const AuthInterceptor : HttpInterceptorFn=(

    req : HttpRequest<any>,
    next:HttpHandlerFn,

):Observable<HttpEvent<unknown>>=>{

  const authService = inject(AuthService);
  const token = authService.getToken();
  if(token){
      req = req.clone({setHeaders:{
        Authorization :`Bearer ${token}`
      }
      });
  }
  return next(req).pipe(catchError(
      (error)=>{

        const estatus=[401,403];

        if(estatus.includes(error.status)){

          authService.logout();       

        };
          
        return throwError(()=>error);

      }

  ));
};

