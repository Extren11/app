import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';
import { UserModel } from '../models/UserModel';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {

  constructor(private supabaApi: SupabaseService, private router: Router) { }

  ngOnInit() {
  }

  userRegisterModal: UserModel = {
    
    nombre: '',
    apellido: '',
    email: '',
    password: ''
  };
  
  bottonCrearUsuario(){
    this.supabaApi.createUsuario(this.userRegisterModal).subscribe(
      (data: any) => {
        this.router.navigate(['/login'])
        return data;
        
      }
    )
    
  }
}
