import { Component, OnInit, Injector } from "@angular/core";
import { NavController, AlertController, ToastController, LoadingController  } from "ionic-angular";
import {LoginPage} from "../login/login";
// import {ScanPage} from "../scan/scan";
import { BleProvider } from '../../providers/ble/ble';


import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage implements OnInit {

  ble: BleProvider;
  
  signupform: FormGroup;
  userData = { "firstName": "", "lastName": "", "badgeNumber": "", "password": ""};

  constructor(public nav: NavController,
    // private ble: BleProvider,
    // private ble: BleProviderNProvider,
    injector: Injector,
     public alertController: AlertController,
     public toastCtrl: ToastController, 
     public loadingController: LoadingController) {
    this.ble = injector.get(BleProvider);
  }

  // method to validate the input based on specific rules in the registration form
  ngOnInit() {
    this.signupform = new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*'), Validators.minLength(2), Validators.maxLength(20)]),
      lastName: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*'), Validators.minLength(2), Validators.maxLength(20)]),
      badgeNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]*'), Validators.minLength(5), Validators.maxLength(6)]),
      password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&])/), Validators.minLength(6), Validators.maxLength(16)]),
    });
  }


  // register then navigate to scan page
  register() {
    
    var dataIn = stringToBytes(this.makeCMD(this.userData.badgeNumber + "^" + this.userData.firstName + "^" + this.userData.lastName + "^" + this.userData.password));
    this.ble.bleConnect(dataIn)
    // this.loading();

    console.log(this.makeCMD(this.userData.badgeNumber + "^" + this.userData.firstName + "^" + this.userData.lastName + "^" + this.userData.password));
  }

  // do processing on command to send
  makeCMD(msg: string) {
    return "BGNMSG[CREAT" + msg + "]ENDMSG";
  }

  // go to login page
  login() {
    this.nav.setRoot(LoginPage);
  }

  // helper method to show a custom alert.  
  showAlert(title, message) {
    let alert = this.alertController.create({
      title: title,
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }
}

// ASCII only
function stringToBytes(string) {
  var array = new Uint8Array(string.length);
  for (var i = 0, l = string.length; i < l; i++) {
    array[i] = string.charCodeAt(i);
  }
  return array.buffer;
}

