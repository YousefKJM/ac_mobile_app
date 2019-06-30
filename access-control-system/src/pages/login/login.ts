import { Component, OnInit} from "@angular/core";
import {NavController, AlertController, ToastController, MenuController} from "ionic-angular";
import {HomePage} from "../home/home";
import {RegisterPage} from "../register/register";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BLE } from '@ionic-native/ble';



@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage implements OnInit {


  badgeNumber: number;
  password: string;

  signinform: FormGroup;
  userData = { "badgeNumber": "", "password": "" };

  constructor(public nav: NavController, public ble: BLE, public forgotCtrl: AlertController, public menu: MenuController, public toastCtrl: ToastController) {
    this.menu.swipeEnable(false);
  }

  ngOnInit() {
    this.signinform = new FormGroup({
      badgeNumber: new FormControl('', [Validators.required, Validators.pattern("[0-9]{6}"), Validators.minLength(6), Validators.maxLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]),
    });
  }

  // go to register page
  register() {
    this.nav.push(RegisterPage);
  }

  // login and go to home page
  login() {


    this.nav.setRoot(HomePage, { baNumber: this.userData.badgeNumber });
  }

  forgotPass() {
    let forgot = this.forgotCtrl.create({
      title: 'Forgot Password?',
      message: "Enter you badge number to reset password.",
      inputs: [
        {
          name: 'number',
          placeholder: 'Badge Number',
          type: 'number'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Send',
          handler: data => {
            console.log('Send clicked');
            let toast = this.toastCtrl.create({
              message: 'Email was sended successfully',
              duration: 3000,
              position: 'top',
              cssClass: 'dark-trans',
              closeButtonText: 'OK',
              showCloseButton: true
            });
            toast.present();
          }
        }
      ]
    });
    forgot.present();
  }

}
