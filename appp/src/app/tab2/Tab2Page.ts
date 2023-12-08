import { Component } from '@angular/core';
import { Map, tileLayer, Marker, marker, LatLngTuple } from 'leaflet';
import { SupabaseService } from '../services/supabase.service';
import { SharedService } from '../services/shared.service';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController, NavController } from '@ionic/angular';
import 'leaflet-routing-machine';
import * as L from 'leaflet';
import { ListaModel } from '../models/ListaModel';
import { LugarModel } from '../models/LugarModel';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  direccion: string = '';
  private map!: Map;
  listaId: string = '';
  ubicacionActual: LatLngTuple | null = null;
  destino: LatLngTuple | null = null;
  private routingControl: any;
  private marker: any;

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
    cordenadas: '',
    id_l: ''
  };

  listaregister: ListaModel = {
    id_list: '',
    nombre: '',
    id: ''
  };

  constructor(
    private sharedService: SharedService,
    private navCtrl: NavController,
    private alertController: AlertController,
    private router: Router,
    private _supabaseService: SupabaseService,
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

  ngOnInit(): void {
    this.map = new Map('map').setView([0, 0], 13);
    tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    this.obtenerUbicacionActual();
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

  private async obtenerUbicacionActual(): Promise<void> {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.ubicacionActual = [position.coords.latitude, position.coords.longitude];
      this.map.setView(this.ubicacionActual, 13);
      this.actualizarMarcador(this.ubicacionActual);
    } catch (error) {
      console.error('Error al obtener la ubicación actual:', error);
    }
  }

  buscarDireccion(): void {
    if (!this.direccion) {
      console.error('Por favor, ingrese una dirección.');
      return;
    }

    const coordenadas: LatLngTuple = this.direccion.split(',').map(Number) as LatLngTuple;

    if (this.validarCoordenadas(coordenadas)) {
      this.centrarMapaYMostrarMarcador(coordenadas);
    } else {
      console.error('Formato de coordenadas no válido.');
    }
  }

  validarCoordenadas(coordenadas: LatLngTuple): boolean {
    return (
      coordenadas &&
      coordenadas.length === 2 &&
      !isNaN(coordenadas[0]) &&
      !isNaN(coordenadas[1])
    );
  }

  centrarMapaYMostrarMarcador(coordenadas: LatLngTuple): void {
    if (!this.map || !this.ubicacionActual) {
      return;
    }

    this.map.setView(coordenadas, 13);
    this.actualizarMarcador(coordenadas);
  }

  private actualizarMarcador(coordenadas: LatLngTuple): void {
    if (this.marker) {
      this.marker.removeFrom(this.map);
    }

    this.marker = marker(coordenadas).addTo(this.map);
  }

  async agregarLugar() {
    const alert = await this.alertController.create({
      header: 'Agregar Lugar',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre del lugar'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Agregar',
          handler: (data: { cordenadas:string ,nombre: string }) => {
            const nombreLugar = data.nombre;
            if (nombreLugar) {
              this.sharedService.miVariable$.subscribe((miVariable) => {
                if (miVariable) {
                  const lugar = {
                    id_list: miVariable,
                    nombre: nombreLugar,
                    cordenadas : this.direccion
                  };

                  this._supabaseService.crearlugar(lugar).subscribe(
                    (data: any) => {
                      console.log('Lugar guardado con éxito:', data);
                      this.lugaresFavoritos.push(nombreLugar);
                      this.router.navigate(['/tabs/tab3']);
                      
                    },
                    (error) => {
                      console.error('Error al guardar el lugar:', error);
                    }
                  );
                } else {
                  console.error('No se proporcionó un ID de usuario válido.');
                }
              });
            } else {
              console.error('El nombre del lugar es obligatorio.');
            }
          }
        }
      ]
    });

    await alert.present();
  }



}
