import { Component, OnInit, NgZone } from "@angular/core";
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
  
  lastName: string;
  badgeNumber: number;
  password: string;
  num: number;

  signupform: FormGroup;
  userData = { "firstName": "", "lastName": "", "badgeNumber": "", "password": "" };
  constructor(public nav: NavController,
     public ble: BLE, 
     public alertController: AlertController,
     public toastCtrl: ToastController, 
     public loadingController: LoadingController,
     private ngZone: NgZone) {
    // this.checkBluetooth();
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*'), Validators.minLength(4), Validators.maxLength(20)]),
      lastName: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*'), Validators.minLength(4), Validators.maxLength(20)]),
      badgeNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]*'), Validators.minLength(5), Validators.maxLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]),
    });
  }


 processSerial(data: string, value: any): void {
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
      this.processMessage(completedMsg, value);
      this.processSerial("", value);
      return;
    } else if (allData.includes(BGNM)) {
      started = false;
      this.processSerial("", value);
      return;
    }
  }
}

  processMessage(msg: string, value: any): void {
    var cmd: string = msg.substring(0, 5);
    var prm = new Array(msg.substring(5).split("^"));
    if (cmd.includes("OKCMD")) {
      // this.showAlert("Welcome", "Account Created" )
      
      alert("Account created");
          if (this.signupform.valid) {
      window.localStorage.setItem('firstName', value.userData.firstName);
      window.localStorage.setItem('lastName', value.userData.lastName);
      window.localStorage.setItem('badgeNumber', value.userData.badgeNumber);
      window.localStorage.setItem('password', value.userData.password);

      this.nav.push(ScanPage);
    }
    } else if (cmd.includes("ERROR")) {
      // this.showAlert("Exist", "Account Exist, cannot create new account")
      alert("Account exist, cannot create new account");
    }
  }





  // register and go to home page
  register(value: any) {
    console.log(this.userData.firstName);
    console.log(this.userData.lastName);
    console.log(this.userData.badgeNumber);
    console.log(this.userData.password);

    // this.processSerial(this.addHash("OKCMD001"))
    // if (this.signupform.valid) {
    //   window.localStorage.setItem('firstName', value.userData.firstName);
    //   window.localStorage.setItem('lastName', value.userData.lastName);
    //   window.localStorage.setItem('badgeNumber', value.userData.badgeNumber);
    //   window.localStorage.setItem('password', value.userData.password);

    //   this.loading();

      // this.nav.push(HomePage, { baNumber: this.userData.badgeNumber });
    // }



    this.loading(value);
    console.log(this.addHash(this.userData.badgeNumber + "^" + this.userData.firstName + "^" + this.userData.lastName + "^" + this.userData.password));
    }


  loading(value: any) {
    let loader = this.loadingController.create({
      spinner: null,
      duration: 5000,
      content: 'Please wait...',
      // translucent: true,
      cssClass: 'custom-class custom-loading'
    });

    loader.present().then(() => {
      this.bleConnect(value).then(() => {
        loader.dismiss();
      });
    });
  }

  bleConnect(value: any) {
    return new Promise((resolve, reject) => {

      this.ble.connect(bluefruit.deviceId).subscribe(data => {

        this.ble.writeWithoutResponse(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic, stringToBytes(this.addHash(this.userData.badgeNumber + "^" + this.userData.firstName + "^" + this.userData.lastName + "^" + this.userData.password))).then(result => {
          console.log(result);
          // this.ble.read(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic).then(
          //   buffer => {
          //     var data = new Uint8Array(buffer);
          //     console.log('Result: ' + data[0]);
          //     this.ngZone.run(() => {
          //       alert(bytesToString(data[0]));
          //     });
          //   }
          // );
        
          // resolve(true);

          // this.ble.read(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic).then(
          //   buffer => {
          //     let data = new Uint8Array(buffer);
          //     // alert(bytesToString(data))
          //     // console.log('dimmer characteristic ' + data[0]);

          //   }
          // )

        }).catch(error => {
          alert(JSON.stringify(error));
        });

        this.ble.startNotification(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic).subscribe( data => {
            // alert("test");
            // this.ble.disconnect(bluefruit.deviceId);
          this.processSerial(bytesToString(data), value);
          resolve(true);
          this.nav.push(ScanPage, { fName: this.userData.firstName, lName: this.userData.lastName, bNumber: this.userData.badgeNumber });
          this.ble.disconnect(bluefruit.deviceId);


          }, error =>  { this.showAlert('Unexpected Error', 'Failed to subscribe'); 
        });
      // alert(data.characteristics);

      }, error => {
          reject(true);
          alert('The peripheral is disconnected');
      });

    });

  }

  // extractCMD(data){
  //   let cmd: any;
  //   cmd = processSerial(data);
  //   // if (data.includes("OKCMD001")){
  //   //   // this.showAlert("Welcome", "Account Created" )
  //   //   alert("Account Created")
  //   // } else if (data.includes("ERROR901")) {
  //   //   // this.showAlert("Exist", "Account Exist, cannot create new account")
  //   //   alert("Account Exist, cannot create new account");

      
  //   // }
  // }




  showAlert(title, message) {
    let alert = this.alertController.create({
      title: title,
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
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
