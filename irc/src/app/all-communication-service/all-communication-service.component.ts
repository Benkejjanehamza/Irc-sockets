import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AllCommunicationService {
  private callFunctionSource = new Subject<void>();

  callFunction$ = this.callFunctionSource.asObservable();

  callFunction() {
    this.callFunctionSource.next();
  }
}
