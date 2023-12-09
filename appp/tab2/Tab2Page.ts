import { SupabaseService } from '../services/supabase.service';
import { SharedService } from '../services/shared.service';
import { AlertController, NavController } from '@ionic/angular';
import { ListaModel } from '../models/ListaModel';
import { LugarModel } from '../models/LugarModel';
import { BehaviorSubject, from } from 'rxjs';
import { Router } from '@angular/router';

import { ViewChild, ElementRef, Component } from '@angular/core';

declare var google:any;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})

export class Tab2Page {
  direccion: string = '';

  ubicacionInicio: string = '';
  ubicacionDestino: string = '';


  map: any;

  @ViewChild('map', { read: ElementRef, static: false })
  mapRef!: ElementRef;

  listaId: string = '';
  ubicacionActual = null;
  destino = null;
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
    id_l: '',
    cordenadas:''
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

  ionViewDidEnter(){
    this.showMap();
  }

  showMap() {
    const options = {
      center: this.ubicacionActual || new google.maps.LatLng(-17.824858, 31.053028),
      zoom: 15,
      disableDefaultUI: true
    };
    this.map = new google.maps.Map(this.mapRef.nativeElement, options);

    // Colocar marcador si hay ubicación actual
    if (this.ubicacionActual) {
      const marker = new google.maps.Marker({
        position: this.ubicacionActual,
        map: this.map,
        title: 'Ubicación Actual'
      });
    }
  }

  buscarRuta() {
    if (this.ubicacionInicio && this.ubicacionDestino) {
      const inicio = this.ubicacionInicio.split(',').map(coord => parseFloat(coord.trim()));
      const destino = this.ubicacionDestino.split(',').map(coord => parseFloat(coord.trim()));

      if (inicio.length === 2 && destino.length === 2 && !isNaN(inicio[0]) && !isNaN(inicio[1]) && !isNaN(destino[0]) && !isNaN(destino[1])) {
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer();

        const mapOptions = {
          center: new google.maps.LatLng(inicio[0], inicio[1]),
          zoom: 15,
          disableDefaultUI: true
        };

        this.map = new google.maps.Map(this.mapRef.nativeElement, mapOptions);
        directionsRenderer.setMap(this.map);

        const request = {
          origin: new google.maps.LatLng(inicio[0], inicio[1]),
          destination: new google.maps.LatLng(destino[0], destino[1]),
          travelMode: google.maps.TravelMode.DRIVING // Puedes cambiarlo a WALKING para rutas a pie
        };

        directionsService.route(request, (result: any, status: string) => {
          if (status == 'OK') {
            directionsRenderer.setDirections(result);
          } else {
            console.error('Error al calcular la ruta:', status);
          }
        });
      } else {
        console.error('Coordenadas de inicio o destino inválidas. Por favor, ingrese latitud y longitud separadas por coma.');
      }
    } else {
      console.error('Por favor, ingrese las coordenadas de inicio y destino.');
    }
  }

  buscarCoordenadas() {
    if (this.direccion) {
      const coordenadas = this.direccion.split(',').map(coord => parseFloat(coord.trim()));
      if (coordenadas.length === 2 && !isNaN(coordenadas[0]) && !isNaN(coordenadas[1])) {
        // Validar que las coordenadas sean válidas (latitud, longitud)
        this.ubicacionActual = new google.maps.LatLng(coordenadas[0], coordenadas[1]);
        this.showMap(); // Centrar el mapa en las nuevas coordenadas
      } else {
        // Mostrar mensaje de error si las coordenadas no son válidas
        console.error('Coordenadas inválidas. Por favor, ingrese latitud y longitud separadas por coma.');
      }
    } else {
      // Mostrar mensaje de error si la dirección está vacía
      console.error('Por favor, ingrese las coordenadas.');
    }
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
          handler: (data: { cordenadas: string, nombre: string }) => {
            const nombreLugar = data.nombre;
            if (nombreLugar) {
              this.sharedService.miVariable$.subscribe((miVariable) => {
                if (miVariable) {
                  const lugar = {
                    id_list: miVariable,
                    nombre: nombreLugar,
                    cordenadas: this.ubicacionDestino
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