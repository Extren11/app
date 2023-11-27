import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { IUserLogin } from "src/app/models/IUserLogin";
import { UserModel } from '../models/UserModel';
import { UserDate } from '../models/UserDate';
import { FichaModel } from '../models/FichaModel';


@Injectable({ providedIn: 'root'})
export class SupabaseService {

    supabaseUrl = "https://xnwykoaqowwvbgfcwzwo.supabase.co/rest/v1/"
    supabaseHeaders = new HttpHeaders().set('apikey', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhud3lrb2Fxb3d3dmJnZmN3endvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTcwNzg1ODgsImV4cCI6MjAxMjY1NDU4OH0.pWARQ_UhwVPvkPrc478NRQeWZ6q2939l6tJ--NEDyNU")

    constructor(private _http: HttpClient) { }

 /////////////////////////////////////////////REGISTER///////////////////////////////////////////////

    createUsuario(body: any){
        return this._http.post<any>(this.supabaseUrl+'usuarios',body , { headers: this.supabaseHeaders});
    }







 /////////////////////////////////////////////lOGIN//////////////////////////////////////////////////


    //Funcion para logear, retorna el id si el usuario existe para logearse
    getLoginUser(iUserLogin: IUserLogin): Observable<string | any> {
        return this._http.get<any>(this.supabaseUrl + "usuarios?email=eq." + iUserLogin.email + "&password=eq." + iUserLogin.password, { headers: this.supabaseHeaders }).pipe(
            map((user) => {
                const miVariable = user[0].id;
                console.log('Valor extraído de Supabase:', miVariable);
                console.log(user[0]);
                return user[0].id;
            }), catchError((err) => {
                console.log(err)
                return err;
            })
        );
    }


 /////////////////////////////////////////TAB3(LISTA DE LUAGRES)///////////////////////////////////////////////////////////////

    verificarLista(id: string): Observable<any> {
    return this._http.get<any>(this.supabaseUrl + 'lista?id=eq.' + id, { headers: this.supabaseHeaders }).pipe(
      map((lista) => {
        return lista.length > 0;
      }),
      catchError((err) => {
        console.log(err);
        return of(false); 
      })
    );
  }

  getLista(miVariable: string): Observable<any> {
    console.log('Valor id_list:', miVariable);
        return this._http.get<any>(this.supabaseUrl+'lista?id+eq.'+miVariable, { headers: this.supabaseHeaders}).pipe(
            map((data: any[]) => {
    // Filtra los datos para obtener solo el registro con el ID deseado
              const usuarioEspecifico = data.find((usuario) => usuario.id === miVariable);
              console.log('Datos del usuario en cuestión lista :', usuarioEspecifico);
            return usuarioEspecifico;
            })
        );
    }



    crearLista(body: any){
        return this._http.post<any>(this.supabaseUrl+'lista',body, { headers: this.supabaseHeaders});
    }

    crearlugar(lugar: any){
        return this._http.post<any>(this.supabaseUrl+'lugar',lugar, { headers: this.supabaseHeaders});
    }
    

    getLugaresListaId(miVariable: string): Observable<any> {
        console.log('Valor id_list:', miVariable);
            return this._http.get<any>(this.supabaseUrl+'lugar?id_list+eq.'+miVariable, { headers: this.supabaseHeaders})
    }

    eliminarLugar(miVariable: string, lugar: string): Observable<any> {
        return this._http.delete<any>(this.supabaseUrl+'lugar?id_list=eq.' + miVariable+'&nombre=eq.'+lugar,{ headers: this.supabaseHeaders})
    }
    




 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    crearficha(body: any){
        return this._http.post<any>(this.supabaseUrl+'ficha',body , { headers: this.supabaseHeaders});
    }



    //Obtiene informacion del usuario logeado.
    //Params id 
    getUser(id: string): Observable<UserDate> {
        return this._http.get<UserDate[]>(this.supabaseUrl + 'usuarios?id=eq.' + id, { headers: this.supabaseHeaders, responseType: 'json' }).pipe(
            map( (userInfo) => {
                return userInfo[0];
            })
        );
    }   
    
    getUserType(id: string){
        return this._http.get<any>(this.supabaseUrl +"usuarios?id=eq."+id+"&select=id,nombre,email", { headers: this.supabaseHeaders}).pipe(
            map((userInfo) => {
                console.log(userInfo);
                return userInfo;
            })
        )
    }

    verificarExistenciaFicha(id: string): Observable<any> {
        return this._http.get<any>(this.supabaseUrl + 'ficha?id=eq.' + id, { headers: this.supabaseHeaders }).pipe(
          map((ficha) => {
            return ficha.length > 0;
          }),
          catchError((err) => {
            console.log(err);
            return of(false); // Emite un observable con un valor booleano
          })
        );
      }
    
      

      getFicha(miVariable: string): Observable<any> {
        console.log('Valor id_ficha:', miVariable);
        return this._http.get<any>(this.supabaseUrl+'ficha?id+eq.'+miVariable, { headers: this.supabaseHeaders}).pipe(
            map((data: any[]) => {
              // Filtra los datos para obtener solo el registro con el ID deseado
              const usuarioEspecifico = data.find((usuario) => usuario.id === miVariable);
              console.log('Datos del usuario en cuestión:', usuarioEspecifico);
              return usuarioEspecifico;
            })
          );
        }


    editarFicha(ficha: any): Observable<any> {
        console.log('Valor id_ficha:', ficha.id);
        return this._http.put(this.supabaseUrl + 'ficha?id_ficha=eq.' + ficha.id, ficha, { headers: this.supabaseHeaders })
          .pipe(
            catchError((error: any) => {
              console.error('Error al editar la ficha médica:', error);
              return throwError(error);
            })
          );
      }
      
}