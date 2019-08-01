import { Component, OnInit } from "@angular/core";
import { NavController, AlertController, ToastController, LoadingController  } from "ionic-angular";
import {LoginPage} from "../login/login";
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

var allData: string = "";
var started: boolean = false;
const BGNM: string = "BGNMSG[";
const ENDM: string = "]ENDMSG";

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
  
  // lastName: string;
  // badgeNumber: number;
  // password: string;
  // num: number;

  signupform: FormGroup;
  userData = { "firstName": "", "lastName": "", "badgeNumber": "", "password": ""};
  constructor(public nav: NavController,
     public ble: BLE, 
     public alertController: AlertController,
     public toastCtrl: ToastController, 
     public loadingController: LoadingController) {
    // this.checkBluetooth();
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*'), Validators.minLength(4), Validators.maxLength(20)]),
      lastName: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*'), Validators.minLength(4), Validators.maxLength(20)]),
      badgeNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]*'), Validators.minLength(5), Validators.maxLength(6)]),
      password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&])/), Validators.minLength(6), Validators.maxLength(16)]),
      // ^ (?=.* [a - z])(?=.* [A - Z])(?=.*\d)(?=.* [#$ ^+=!* ()@%&]).$
    });
  }







  // register and go to home page
  register() {

    this.loading();
    // this.nav.push(ScanPage);


    console.log(this.addHash(this.userData.badgeNumber + "^" + this.userData.firstName + "^" + this.userData.lastName + "^" + this.userData.password));
    
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

        this.ble.writeWithoutResponse(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic, stringToBytes(this.addHash(this.userData.badgeNumber + "^" + this.userData.firstName + "^" + this.userData.lastName + "^" + this.userData.password))).then(result => {
          console.log(result);

        }).catch(error => {
          alert(JSON.stringify(error));
        });

        this.ble.startNotification(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic).subscribe( data => {

          this.processSerial(bytesToString(data));
          resolve(true);


          }, error =>  { this.showAlert('Unexpected Error', 'Failed to subscribe'); 

        });
      // alert(data.characteristics);


      }, error => {
          reject(error);
          alert('You need to be closer to the door');
      });

    });

  }


  showAlert(title, message) {
    let alert = this.alertController.create({
      title: title,
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }



  // go to login page
  login() {
    this.nav.setRoot(LoginPage);
  }

  addHash(msg: string) {
    return "BGNMSG[CREAT"+ msg +"]ENDMSG";
  }

  processSerial(data: string): void {
    allData = allData + data;
    if (!started) {
      if (allData.includes(BGNM)) {
        allData = allData.substring(allData.indexOf(BGNM) + BGNM.length);
        started = true;
      }
    }
    if (started) {
      var endIndex: number = allData.indexOf(ENDM);
      var bgnIndex: number = allData.indexOf(BGNM);
      if (endIndex != -1 && (bgnIndex == -1 || endIndex < bgnIndex)) {
        var completedMsg: string = allData.substring(0, allData.indexOf(ENDM));
        allData = allData.substring(allData.indexOf(ENDM) + ENDM.length);
        started = false;
        this.processMessage(completedMsg);
        this.processSerial("");
        return;
      } else if (allData.includes(BGNM)) {
        started = false;
        this.processSerial("");
        return;
      }
    }
  }

  processMessage(msg: string): void {
    var cmd: string = msg.substring(0, 5);
    var prm: string[] = msg.substring(5).split("^");
    if (cmd.includes("OKCMD")) {
      // this.showAlert("Welcome", "Account Created" )
      // alert("Account created");
      this.ble.disconnect(bluefruit.deviceId);
      this.nav.push(ScanPage);

      // window.localStorage.setItem('firstName', this.userData.firstName);
      // window.localStorage.setItem('lastName', this.userData.lastName);
      // window.localStorage.setItem('badgeNumber', this.userData.badgeNumber);
      // window.localStorage.setItem('password', this.userData.password);

    
    } else if (cmd.includes("ERROR")) {
        if (prm[0].toString().includes("901")) {
          this.ble.disconnect(bluefruit.deviceId);
          alert("Account exist - cannot create new account");
        }
      } 
  } 



}
