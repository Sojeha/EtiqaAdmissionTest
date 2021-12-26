import { Injectable } from '@angular/core';
import { Student } from './student';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class StudentListService {
  // Node/Express API
  REST_API: string = 'http://localhost:3000';
  // Http Header
  httpHeaders = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private httpClient: HttpClient) { }

  // Add
  AddStudent(data: Student): Observable<any> {
    return this.httpClient.post(`${this.REST_API}/add-student`, data)
      .pipe(
        catchError(this.handleError)
      )
  }

  // Get all objects
  GetStudents() {
    return this.httpClient.get(`${this.REST_API}/students`);
  }

  // Update
  updateStudent(data:any): Observable<any> {
    return this.httpClient.post(`${this.REST_API}/update-student?id=${data.id}&grade=${data.grade}&classname=${data.classname}&course_name=${JSON.stringify(data.course_name)}`, { headers: this.httpHeaders })
      .pipe(
        catchError(this.handleError)
      )
  }

  // Delete
  deleteStudent(id:any): Observable<any> {
    return this.httpClient.post(`${this.REST_API}/delete-student?id=${id}`, { headers: this.httpHeaders}).pipe(
        catchError(this.handleError)
      )
  }
  // Error 
  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Handle client error
      errorMessage = error.error.message;
    } else {
      // Handle server error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }
}