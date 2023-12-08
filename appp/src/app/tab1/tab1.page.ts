import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserModel } from 'src/app/models/UserModel';
import { SupabaseService } from 'src/app/services/supabase.service';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { UserDate } from '../models/UserDate';
import { SharedService } from 'src/app/services/shared.service';
import { FichaModel } from '../models/FichaModel';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  
})
export class Tab1Page implements OnInit {
  editingMode = false;

  private _miVariable = new BehaviorSubject<string>(''); // Puedes ajustar el tipo de dato según corresponda
  miVariable$ = this._miVariable.asObservable();
  editing = false; 
  ficha: any = {};

  ficharegister: FichaModel = {  

    ciego: false,
    movilidadreducida: false ,
    tea:false ,
    id:''
    
  };

  userInfoReceived$: Observable<UserDate>| null = null;private _fichaMedicaService: any;
  idUserHtmlRouterLink: any;
  email!: string;
  userList: any;

  constructor(private router: Router, private _supabaseService: SupabaseService, private sharedService: SharedService) {

  
    this.sharedService.miVariable$.subscribe(miVariable => {
      this.userInfoReceived$ = this._supabaseService.getUser(miVariable);
      console.log('Valor de miVariable (id usuario) en Tab1Page:', miVariable);
      this.sharedService.miVariable$.subscribe(miVariable => {
        if (miVariable) {
          // Consulta si existe una ficha médica
          this._supabaseService.verificarExistenciaFicha(miVariable).subscribe(fichaMedicaExiste => {
            if (fichaMedicaExiste) {
              // Si existe una ficha médica, obtén los datos y permite la edición
              this._supabaseService.getFicha(miVariable).subscribe(ficha => {
                this.ficharegister.ciego = ficha.ciego;
                this.ficharegister.movilidadreducida = ficha.movilidadreducida;
                this.ficharegister.tea = ficha.tea;
              });
            } else {
              // Si no existe una ficha médica, crea una ficha médica predeterminada y permite la edición
              const ficha = {
                id: miVariable, 
                ciego: false,
                movilidadreducida: false,
                tea: false,
              };
              this._supabaseService.crearficha(ficha).subscribe(result => {
                console.log('Ficha médica creada con éxito');
                // Una vez creada la ficha, muestra los valores en los checkbox
                this.ficharegister = ficha;
              });
            }
          });
        } else {
          console.log('Usuario no existe. No se puede verificar la ficha médica.');
        }
      });
  })
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }


  ionViewWillEnter() {
    this.getUserType();
  }

  async getUserType() {
    this.userList = this._supabaseService.getUserType(this.email);
    console.log(this.userList);
  }
  

  toggleEditing() {
    this.editing = !this.editing;
  }
  bottonEditFicha() {
    this.sharedService.miVariable$.subscribe((miVariable) => {
      this.userInfoReceived$ = this._supabaseService.getUser(miVariable);
      console.log('Valor de miVariable (id usuario) en Tab1Page:', miVariable);
  
      // Verifica que miVariable no sea nulo o indefinido
      if (miVariable) {
        // Crea un objeto 'ficha' con los valores de los checkboxes
        const ficha = {
          id_ficha:miVariable,
          id: miVariable,
          ciego: this.ficharegister.ciego,
          movilidadreducida: this.ficharegister.movilidadreducida,
          tea: this.ficharegister.tea,
        };
  
        // Lógica para guardar los cambios de 'ficha'
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

}

  
  



