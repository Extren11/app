import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserDate } from '../models/UserDate';
import { SharedService } from 'src/app/services/shared.service';
import { FichaModel } from '../models/FichaModel';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  editing = false;
  ficha: any = {};
  nuevosDatos: any = {
    nombre: '',
    apellido: '',
    email: '',
  };

  ficharegister: FichaModel = {
    ciego: false,
    movilidadreducida: false,
    tea: false,
    id: '',
  };

  userInfoReceived$: Observable<UserDate> | null = null;

  constructor(
    private router: Router,
    private _supabaseService: SupabaseService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.sharedService.miVariable$.subscribe((miVariable) => {
      this.userInfoReceived$ = this._supabaseService.getUser(miVariable);

      if (miVariable) {
        this._supabaseService
          .verificarExistenciaFicha(miVariable)
          .subscribe((fichaMedicaExiste) => {
            if (fichaMedicaExiste) {
              this._supabaseService.getFicha(miVariable).subscribe((ficha) => {
                this.ficharegister.ciego = ficha.ciego;
                this.ficharegister.movilidadreducida = ficha.movilidadreducida;
                this.ficharegister.tea = ficha.tea;
              });
            } else {
              const ficha = {
                id: miVariable,
                ciego: false,
                movilidadreducida: false,
                tea: false,
              };
              this._supabaseService.crearficha(ficha).subscribe((result) => {
                console.log('Ficha médica creada con éxito');
                this.ficharegister = ficha;
              });
            }
          });
      } else {
        console.log('Usuario no existe. No se puede verificar la ficha médica.');
      }
    });
  }

  ionViewWillEnter() {
    this.getUserType();
  }

  async getUserType() {
    // Your implementation for getUserType
  }

  toggleEditing() {
    this.editing = !this.editing;
  }

  bottonEditFicha() {
    this.sharedService.miVariable$.subscribe((miVariable) => {
      this.userInfoReceived$ = this._supabaseService.getUser(miVariable);

      if (miVariable) {
        const ficha = {
          id: miVariable,
          ciego: this.ficharegister.ciego,
          movilidadreducida: this.ficharegister.movilidadreducida,
          tea: this.ficharegister.tea,
        };

        this._supabaseService.editarFicha(ficha).subscribe(
          (data: any) => {
            console.log('Cambios en la ficha médica guardados con éxito:', data);
            this.router.navigate(['/tabs/tab1']);
          },
          (error) => {
            console.error('Error al guardar los cambios en la ficha médica:', error);
          }
        );
      } else {
        console.error('No se proporcionó un ID de usuario válido.');
      }
    });
  }

  editarDatosPersonales() {
    this.sharedService.miVariable$.subscribe((miVariable) => {
      if (miVariable) {
        this._supabaseService.editarDatosPersonales(miVariable, this.nuevosDatos).subscribe(
          (data: any) => {
            console.log('Cambios en los datos personales guardados con éxito:', data);
            this.userInfoReceived$ = this._supabaseService.getUser(miVariable);
          },
          (error) => {
            console.error('Error al guardar los cambios en los datos personales:', error);
          }
        );
      } else {
        console.error('No se proporcionó un ID de usuario válido.');
      }
    });
  }
}


  
  



