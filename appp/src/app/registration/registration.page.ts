// Código TypeScript
import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';
import { UserModel } from '../models/UserModel';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {

  constructor(
    private supabaApi: SupabaseService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {}

  userRegisterModal: UserModel = {
    nombre: '',
    apellido: '',
    email: '',
    password: ''
  };
  
  async bottonCrearUsuario() {
    if (!this.validarFormulario()) {
      // Muestra una alerta de error si el formulario no es válido
      this.presentAlert('Error', 'Por favor, completa todos los campos correctamente.');
      return;
    }

    try {
      await this.supabaApi.createUsuario(this.userRegisterModal).toPromise();
      
      // Muestra una alerta de éxito
      this.presentAlert('Registro Exitoso', '¡Usuario creado con éxito!');

      // Redirige a la página de inicio de sesión u otra página según tus necesidades
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      // Manejar el error según tus necesidades
    }
  }

  validarFormulario(): boolean {
    // Realiza validaciones adicionales si es necesario
    return this.userRegisterModal.nombre.trim() !== '' &&
           this.userRegisterModal.apellido.trim() !== '' &&
           this.userRegisterModal.email.trim() !== '' &&
           this.userRegisterModal.password.trim() !== '';
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }
}