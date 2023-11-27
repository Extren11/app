import { Component } from '@angular/core';
import { Map, tileLayer, Marker, marker, LatLngTuple } from 'leaflet';
import { SupabaseService } from '../services/supabase.service';
import { SharedService } from '../services/shared.service';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController } from '@ionic/angular';
import 'leaflet-routing-machine';
import * as L from 'leaflet';

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

  constructor(
    private _supabaseService: SupabaseService,
    private sharedService: SharedService,
    private alertController: AlertController
  ) {
    this.sharedService.miVariable$.subscribe((miVariable) => {
      this.listaId = miVariable;
    });
  }

  ngOnInit(): void {
    this.map = new Map('map').setView([0, 0], 13);
    tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.obtenerUbicacionActual();
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

  async agregarLugar(): Promise<void> {
    if (!this.direccion) {
      console.error('Por favor, ingrese una dirección.');
      return;
    }

    const aliasPrompt = await this.alertController.create({
      header: 'Guardar Lugar',
      message: 'Ingrese un alias para este lugar:',
      inputs: [
        {
          name: 'alias',
          type: 'text',
          placeholder: 'Alias'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Operación cancelada');
          }
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.alias) {
              const coordenadas: LatLngTuple = this.direccion.split(',').map(Number) as LatLngTuple;

              if (this.validarCoordenadas(coordenadas)) {
                this.centrarMapaYMostrarMarcador(coordenadas);
                this.destino = coordenadas;
                this.guardarLugarEnSupabase(coordenadas, data.alias);
              } else {
                console.error('Formato de coordenadas no válido.');
              }
            } else {
              console.error('Alias no proporcionado.');
            }
          }
        }
      ]
    });

    await aliasPrompt.present();
  }

  private guardarLugarEnSupabase(coordenadas: LatLngTuple, alias: string): void {
    if (!this.listaId) {
      console.error('ID de lista no válido.');
      return;
    }

    const lugar = {
      id_list: this.listaId,
      nombre: `${alias} (${coordenadas[0]}, ${coordenadas[1]})`,
      coordenadas: `${coordenadas[0]}, ${coordenadas[1]}`
    };

    this._supabaseService.crearlugar(lugar).subscribe(
      (data: any) => {
        console.log('Lugar guardado con éxito:', data);
      },
      (error) => {
        console.error('Error al guardar el lugar:', error);
      }
    );
  }

  buscarRuta(): void {
    if (!this.destino || !this.direccion || !this.ubicacionActual) {
      console.error('Por favor, seleccione un destino válido.');
      return;
    }

    if (!this.routingControl) {
      this.routingControl = (L as any).routing.control({
        waypoints: [
          (L as any).routing.waypoint([this.ubicacionActual[0], this.ubicacionActual[1]]),
          (L as any).routing.waypoint([this.destino[0], this.destino[1]])
        ],
        routeWhileDragging: true
      }).addTo(this.map);
    } else {
      if (this.routingControl) {
        this.routingControl.setWaypoints([
          (L as any).routing.waypoint([this.ubicacionActual[0], this.ubicacionActual[1]]),
          (L as any).routing.waypoint([this.destino[0], this.destino[1]])
        ]);
      }
    }
  }
}
