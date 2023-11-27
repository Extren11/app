import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private miVariableSource = new BehaviorSubject<any>(null);
  miVariable$ = this.miVariableSource.asObservable();

  updateMiVariable(value: any) {
    this.miVariableSource.next(value);
  }
}
