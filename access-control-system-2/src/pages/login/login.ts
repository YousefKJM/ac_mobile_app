import { Component, OnInit, Injector} from "@angular/core";
import { NavController, AlertController, ToastController, MenuController, LoadingController} from "ionic-angular";
// import {HomePage} from "../home/home";
import {RegisterPage} from "../register/register";
import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { BLE } from '@ionic-native/ble';
// import { ScanPage } from "../scan/scan";
import { BleProvider } from '../../providers/ble/ble';



@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage implements OnInit {

  ble: BleProvider;

  signinform: FormGroup;
  userData = { "firstName": "", "lastName": "","badgeNumber": "", "password": "" };

  constructor(public nav: NavController,
    //  public ble: BLE, 
    // private ble: BleProvider,
    // private ble: BleProviderNProvider,
    public forgotCtrl: AlertController,
    public menu: MenuController, 
    public toastCtrl: ToastController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    injector: Injector
) {
    this.ble = injector.get(BleProvider);
  }

  ngOnInit() {
    this.signinform = new FormGroup({
      badgeNumber: new FormControl('', [Validators.required, Validators.pattern("[0-9]*"), Validators.minLength(5), Validators.maxLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(16)]),
    });
  }

  // go to register page
  register() {
    this.nav.push(RegisterPage);
  }

  // login and go to home page
  login() {
    var dataIn = stringToBytes(this.makeCMD(this.userData.badgeNumber + "^" + this.userData.password));
    this.ble.bleConnect(dataIn);
    // this.loading();

    // if (this.userData.badgeNumber == "798688") {
    //   this.ble.loginAsAdmin();i
    //   this.nav.setRoot(HomePage);

    // } else {
    //   this.ble.loginAsUser();
    //   this.nav.setRoot(HomePage);
    // }

    console.log(this.makeCMD(this.userData.badgeNumber + "^" + this.userData.password));
  }

  makeCMD(msg: string) {
    return "BGNMSG[LOGIN" + msg + "]ENDMSG";
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


