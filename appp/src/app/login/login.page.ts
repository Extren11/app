import { Component, OnDestroy, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';
import { IUserLogin } from '../models/IUserLogin';
import { UserModel } from '../models/UserModel';
import { lastValueFrom } from 'rxjs';
import { UserDate } from '../models/UserDate';
import { SharedService } from 'src/app/services/shared.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  


  userLoginModal: IUserLogin = {
    email: '',
    password: ''
  };

  public userExists?: UserDate;
  public userList: UserDate[] = [];

  constructor(private route: Router, private _usuarioService: SupabaseService, private sharedService: SharedService) {

  }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.userLoginModalRestart();
  }


  async userLogin(userLoginInfo: IUserLogin) {
    const id = await lastValueFrom(this._usuarioService.getLoginUser(userLoginInfo));
    const miVariable = id;
    console.log('Valor extraido (id usuario)', miVariable);
    console.log(id);
    if (id) {
      console.log("Usuario existe...");
      this.route.navigate(['/tabs/tab2']);
      this.sharedService.updateMiVariable(miVariable);
    } else {
      // NO EXISTE
      console.log("Usuario no existe...");
    }
  }
  


  userLoginModalRestart(): void {
    this.userLoginModal.email = '';
    this.userLoginModal.password = '';
  }
}
