import {Component, OnInit} from "@angular/core";
import { NavController, AlertController, ToastController, LoadingController  } from "ionic-angular";
import {LoginPage} from "../login/login";
// import {HomePage} from "../home/home";
import {ScanPage} from "../scan/scan";
import { BLE } from '@ionic-native/ble';
import { FormControl, FormGroup, Validators } from '@angular/forms';



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
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage implements OnInit {
  
  lastName: string;
  badgeNumber: number;
  password: string;

  signupform: FormGroup;
  userData = { "firstName": "", "lastName": "", "badgeNumber": "", "password": "" };
  constructor(public nav: NavController, public ble: BLE, public alertController: AlertController, public toastCtrl: ToastController, public loadingController: LoadingController) {
    // this.checkBluetooth();
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*'), Validators.minLength(4), Validators.maxLength(10)]),
      lastName: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*'), Validators.minLength(4), Validators.maxLength(10)]),
      badgeNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]*'), Validators.minLength(5), Validators.maxLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]),
    });
  }



  // register and go to home page
  register() {
    console.log(this.userData.firstName);
    console.log(this.userData.lastName);
    console.log(this.userData.badgeNumber);
    console.log(this.userData.password);

    this.loading();

    console.log(this.addHash(this.userData.badgeNumber + "^" + this.userData.firstName + "^" + this.userData.lastName + "^" + this.userData.password));
    // this.ble.disconnect(bluefruit.deviceId);
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
    return new Promise((resolve) => {

      this.ble.connect(bluefruit.deviceId).subscribe(data => {
      // alert(data.characteristics);
        this.ble.writeWithoutResponse(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic, stringToBytes(this.addHash(this.userData.badgeNumber + "^" + this.userData.firstName + "^" + this.userData.lastName + "^" + this.userData.password))).then(result => {
          console.log(result);
          this.nav.push(ScanPage, { fName: this.userData.firstName, lName: this.userData.lastName, bNumber: this.userData.badgeNumber});

        }).catch(error => {
            alert(JSON.stringify(error));
        });

      }, error => {
        alert('The peripheral is disconnected');
        resolve(true);
      });

    });

  }

  async presentAlert(txt: string) {
    const alert = await this.alertController.create({
      title: 'Alert',
      message: txt,
      buttons: ['OK']
    });

    await alert.present();
  }

  // go to login page
  login() {
    this.nav.setRoot(LoginPage);
  }

  addHash(msg: string) {
    return "BGNMSG[CREAT"+ msg +"]ENDMSG";
  }
}
