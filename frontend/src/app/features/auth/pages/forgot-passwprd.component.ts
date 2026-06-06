import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../../core/authentication/services/auth.service";

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports:[CommonModule,FormsModule,RouterLink],
    templateUrl: './forgot-password.component.html'
})

export class ForgotPasswordComponet{
    username='';
    newPassword='';
    confirmPassword='';
    error='';
    success='';

    constructor(private authService: AuthService){}

    onReset():void{
        this.error='';
        this.success='';
        if(!this.username || !this.newPassword || !this.confirmPassword){
            this.error = 'All fields are required';
            return
        }
        if(this.newPassword !== this.confirmPassword){
            this.error = "Password do not match";
            return;
        }
        if(this.newPassword.length<6){
           this.error = "Password must be at least 6 characters long";
        }

        const ok = this.authService.resetPassword(this.username, this.newPassword);
        if(ok){
            this.success = 'Password rest successfuly, You can now login';
            this.username = '';
            this.newPassword = '';
            this.confirmPassword = '';
        } else{
            this.error = 'Username not found'
        }
    }
}