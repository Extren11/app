import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { SharedService } from '../services/shared.service';
import { ListaModel } from '../models/ListaModel';
import { BehaviorSubject } from 'rxjs';
import { LugarModel } from '../models/LugarModel';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  userInfoReceived$: any;
  lugaresFavoritos: string[] = [];
  nombreLugar: string = '';

  private _miVariable = new BehaviorSubject<string>('');
  miVariable$ = this._miVariable.asObservable();
  editing = false;
  list: any = {};

  lugarregister: LugarModel = {
    id_list: '',
    nombre: '',
    id_l: '',
    cordenadas:''
  };

  listaregister: ListaModel = {
    id_list: '',
    nombre: '',
    id: ''
  };

  constructor(
    private navCtrl: NavController,
    private alertController: AlertController,
    private router: Router,
    private _supabaseService: SupabaseService,
    private sharedService: SharedService
  ) {
    this.sharedService.miVariable$.subscribe((miVariable) => {
      this.userInfoReceived$ = this._supabaseService.getUser(miVariable);

      this._supabaseService.verificarLista(miVariable).subscribe((listafav) => {
        if (listafav) {
          this._supabaseService.getLista(miVariable).subscribe((list) => {
            this.listaregister.nombre = list.nombre;
          });
        } else {
          const list = {
            id_list: miVariable,
            nombre: 'favoritos',
            id: miVariable
          };

          this._supabaseService.crearLista(list).subscribe((result) => {
            console.log('Lista creada con éxito');
            this.listaregister = list;
          });
        }
      });
    });
  }


    ngOnInit() {
      // Obtén el ID de la lista actual, ya sea a través de un parámetro de ruta o de otra manera
      this.sharedService.miVariable$.subscribe(miVariable => {
        this.userInfoReceived$ = this._supabaseService.getUser(miVariable);
        console.log('Valor de miVariable (id usuario) en Tab1Page:', miVariable);
        if (miVariable) {
          // Llama a la función en tu servicio para obtener los lugares de la lista por su ID
          this._supabaseService.getLugaresListaId(miVariable).subscribe((lugares: LugarModel[]) => {
            // Filtra los lugares para mostrar solo aquellos cuyo id_list coincida con el de la lista actual
            this.lugaresFavoritos = lugares.filter(lugar => lugar.id_list === miVariable).map(lugar => lugar.nombre);
        });
      }
    });
  }


  async confirmarEliminarLugar(lugar: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar el lugar "${lugar}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarLugar(lugar);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarLugar(lugar: string) {
    this.sharedService.miVariable$.subscribe((miVariable) => {
      if (miVariable) {
        this._supabaseService.eliminarLugar(miVariable, lugar).subscribe(
          (data: any) => {
            console.log('Lugar eliminado de la base de datos con éxito:', data);
  
            // Luego, elimina el lugar de la lista local para que desaparezca instantáneamente
            this.lugaresFavoritos = this.lugaresFavoritos.filter((item) => item !== lugar);
  
            this.router.navigate(['/tabs/tab3']);
          },
          (error) => {
            console.error('Error al eliminar el lugar de la base de datos:', error);
          }
        );
      } else {
        console.error('No se proporcionó un ID de usuario válido.');
      }
    });
  }

  irAdestino(lugar: string) {
    // Obtén la coordenada del lugar correspondiente al destino desde la base de datos o donde se encuentre
    // Puedes hacer una llamada a tu servicio Supabase para obtener el destino del lugar
    // y luego navegar al tab2.page con la coordenada del destino
    this.sharedService.miVariable$.subscribe((miVariable) => {
      if (miVariable) {
        this._supabaseService.getDestino(miVariable, lugar).subscribe((destino: string) => {
          // Asegúrate de tener el destino en el formato correcto (latitud, longitud)
          const destinoCoords = destino.split(',').map(coord => parseFloat(coord.trim()));
          if (destinoCoords.length === 2 && !isNaN(destinoCoords[0]) && !isNaN(destinoCoords[1])) {
            // Navega al tab2.page y establece el destino
            this.router.navigate(['/tabs/tab2'], { queryParams: { destino: destino } });
          } else {
            console.error('Coordenadas de destino inválidas.');
          }
        });
      } else {
        console.error('No se proporcionó un ID de usuario válido.');
      }
    });
  }
}
