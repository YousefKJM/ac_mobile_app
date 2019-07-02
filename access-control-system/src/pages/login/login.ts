import { Component, OnInit} from "@angular/core";
import { NavController, AlertController, ToastController, MenuController, LoadingController} from "ionic-angular";
import {HomePage} from "../home/home";
import {RegisterPage} from "../register/register";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BLE } from '@ionic-native/ble';

// this is Nordic's UART service
var bluefruit = {
  serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
  rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',  // receive is from the phone's perspective
  deviceId: "D2:B7:4D:6C:29:0C"
};

// ASCII only
// D2:B7:4D:6C:29:0C
function bytesToString(buffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// ASCII only
function stringToBytes(string) {
  var array = new Uint8Array(string.length);
  for (var i = 0, l = string.length; i < l; i++) {
    array[i] = string.charCodeAt(i);
  }
  return array.buffer;
}

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage implements OnInit {




  signinform: FormGroup;
  userData = { "badgeNumber": "", "password": "" };

  constructor(public nav: NavController, public ble: BLE, public forgotCtrl: AlertController, public menu: MenuController, public toastCtrl: ToastController, public loadingController: LoadingController) {
    this.menu.swipeEnable(false);
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
  login(value: any) {

    if (this.signinform.valid) {
      window.localStorage.setItem('badgeNumber', value.userData.badgeNumber);
      window.localStorage.setItem('password', value.value.userData.password);

      this.loading();

      // this.nav.push(HomePage, { baNumber: this.userData.badgeNumber });
    }


    // this.nav.setRoot(HomePage, { baNumber: this.userData.badgeNumber });
    // this.ble.connect(bluefruit.deviceId);
    // this.ble.autoConnect(bluefruit.deviceId, data => {
    //   console.log('Connected Data: ', JSON.stringify(data));
    // }, (error) => {
    //   console.log('Cannot connect or peripheral disconnected.', JSON.stringify(error));
    // });
    // this.ble.startNotification(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic);
    // this.ble.write(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic, stringToBytes(this.addHash(this.userData.badgeNumber + "^" + this.userData.password)));
    console.log(this.addHash(this.userData.badgeNumber + "^" + this.userData.password));


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

  loading() {
    let loader = this.loadingController.create({
      spinner: null,
      duration: 5000,
      content: 'Please wait...',
      // translucent: true,
      cssClass: 'custom-class custom-loading'
    });

    loader.present().then(() => {
      this.bleConnect().then(() => {
        loader.dismiss();
      });
    });
  }

  bleConnect() {
    return new Promise((resolve, reject) => {

      this.ble.connect(bluefruit.deviceId).subscribe(data => {
        // alert(data.characteristics);
        this.ble.writeWithoutResponse(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic, stringToBytes(this.addHash(this.userData.badgeNumber + "^" + this.userData.password))).then(result => {
          console.log(result);
          resolve(true);
          this.nav.push(HomePage, { bNumber: this.userData.badgeNumber });

        }).catch(error => {
          alert(JSON.stringify(error));
        });

      }, error => {
        reject(true);
        alert('The peripheral is disconnected');
      });

    });

  }

  addHash(msg: string) {
    return "BGNMSG[LOGIN" + msg + "]ENDMSG";
  }

}
