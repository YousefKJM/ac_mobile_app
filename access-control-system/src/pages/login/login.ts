import { Component, OnInit} from "@angular/core";
import { NavController, AlertController, ToastController, MenuController, LoadingController} from "ionic-angular";
import {HomePage} from "../home/home";
import {RegisterPage} from "../register/register";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BLE } from '@ionic-native/ble';
import { AdminPage } from '../admin/admin';

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
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage implements OnInit {




  signinform: FormGroup;
  userData = { "firstName": "", "lastName": "","badgeNumber": "", "password": "" };

  constructor(public nav: NavController,
     public ble: BLE, 
     public forgotCtrl: AlertController,
      public menu: MenuController, 
      public toastCtrl: ToastController,
      public alertController: AlertController,
       public loadingController: LoadingController) {
    this.menu.swipeEnable(false);
  }

  ngOnInit() {
    this.signinform = new FormGroup({
      badgeNumber: new FormControl('', [Validators.required, Validators.pattern("[0-9]*"), Validators.minLength(5), Validators.maxLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(16)]),
    });
  }

  // go to register page
  register(value: any) {
    this.nav.push(RegisterPage);
  }

  // login and go to home page
  login() {

    this.loading();
    // this.nav.push(HomePage);

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

        this.ble.writeWithoutResponse(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic, stringToBytes(this.addHash(this.userData.badgeNumber + "^" + this.userData.password))).then(result => {
          console.log(result);

        }).catch(error => {
          alert(JSON.stringify(error));
          this.ble.disconnect(bluefruit.deviceId);

        });

        this.ble.startNotification(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic).subscribe(data => {

          this.processSerial(bytesToString(data));



        }, error => {
          this.showAlert('Unexpected Error', 'Failed to subscribe');
            // this.ble.disconnect(bluefruit.deviceId);

        });
        resolve(true);


      }, error => {
        reject(true);
        alert('The peripheral is disconnected');
        // this.ble.disconnect(bluefruit.deviceId);

      });
    });

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
    
    // alert(prm[0] +" "+ prm[1])
    if (cmd.includes("LOGOK")) {

      

      this.ble.disconnect(bluefruit.deviceId);

      window.localStorage.setItem('badgeNumber', prm[0].toString());
      window.localStorage.setItem('firstName', prm[1].toString());
      window.localStorage.setItem('lastName', prm[2].toString());
      window.localStorage.setItem('isAdmin', prm[3].toString());

      if(prm[3].match("1")) {
        this.ble.disconnect(bluefruit.deviceId);
        this.nav.push(AdminPage);
      }
      else if (prm[3].match("0")) {
        this.ble.disconnect(bluefruit.deviceId);
        this.nav.push(HomePage);

      }





    } else if (cmd.includes("ERROR")) {
      if(prm[0].toString().match("904")) {
      // this.showAlert("Exist", "Account Exist, cannot create new account")
        alert("Password is incorrect");
        this.ble.disconnect(bluefruit.deviceId);

    } else if (prm[0].toString().match("905")) {
        alert("Account does not exist");
        this.ble.disconnect(bluefruit.deviceId);

    }
  }
  }

  addHash(msg: string) {
    return "BGNMSG[LOGIN" + msg + "]ENDMSG";
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
