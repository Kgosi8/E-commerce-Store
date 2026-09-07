import { Injectable } from '@angular/core';
import { PopUploadResponse } from '../../interfaces/pop-upload-response';
import { HttpClient } from '@angular/common/http';
import { HttpEventType } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs';

export interface UploadProgress {
  progress: number; // Progress percentage (0-100)
  completed: boolean; // Indicates if the upload is completed
  response?: PopUploadResponse; // Optional response from the server after upload
}

@Injectable({
  providedIn: 'root',
})
export class PopService {

  constructor(private http: HttpClient) {}

  private readonly apiUrl = 'http://localhost:5000/api/orders';

  uploadPOP(orderId: string, file:File): Observable<UploadProgress> {
    const formData = new FormData();
    formData.append('pop', file);

    return this.http.post(
      `${this.apiUrl}/${orderId}/pop`,
      formData,
      {reportProgress: true, observe: 'events'}
    ).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress= event.total? Math.round(100 * event.loaded / event.total): 0;
          return { progress, completed: false };
        }
        if (event.type === HttpEventType.Response) {
          return{
            progress: 100,
            completed: true,
            response: event.body as PopUploadResponse
          };
        }

        return { progress: 0, completed: false };
      })
    );
  }
  
}
