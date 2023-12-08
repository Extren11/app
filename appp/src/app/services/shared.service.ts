import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private miVariableSource = new BehaviorSubject<any>(null);
  miVariable$ = this.miVariableSource.asObservable();

  private _datosActualizados = new BehaviorSubject<boolean>(false);
  datosActualizados$ = this._datosActualizados.asObservable();

  updateMiVariable(value: any) {
    this.miVariableSource.next(value);
  }

  actualizarDatos() {
    this._datosActualizados.next(true);
  }

}
