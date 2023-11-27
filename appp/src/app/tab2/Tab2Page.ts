import { Component } from '@angular/core';
import { Map, tileLayer, Marker, marker, LatLngTuple } from 'leaflet';
import { SupabaseService } from '../services/supabase.service';
import { SharedService } from '../services/shared.service';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  direccion: string = '';
  private map!: Map;

  listaId: string = '';

  constructor(
    private _supabaseService: SupabaseService,
    private sharedService: SharedService
  ) {
    // Código existente
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
    if (!this.map) {
      return;
    }

    this.map.setView(coordenadas, 13);
    const markerItem = marker(coordenadas).addTo(this.map);
  }
  agregarLugar(): void {
    if (!this.direccion) {
      console.error('Por favor, ingrese una dirección.');
      return;
    }

    const coordenadas: LatLngTuple = this.direccion.split(',').map(Number) as LatLngTuple;

    if (this.validarCoordenadas(coordenadas)) {
      this.centrarMapaYMostrarMarcador(coordenadas);
      this.guardarLugarEnSupabase(coordenadas);
    } else {
      console.error('Formato de coordenadas no válido.');
    }
  }

  private guardarLugarEnSupabase(coordenadas: LatLngTuple): void {
    if (!this.listaId) {
      console.error('ID de lista no válido.');
      return;
    }

    const lugar = {
      id_list: this.listaId,
      nombre: `Lugar en ${coordenadas[0]}, ${coordenadas[1]}`,
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
}