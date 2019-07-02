import {Component} from "@angular/core";
import { NavController, PopoverController, NavParams, LoadingController } from "ionic-angular";
import {Storage} from '@ionic/storage';
import {LoginPage} from "../login/login";
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
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  public frName: string;
  public laName: string;
  public baNumber: number;
  badgeNumber: string;




  userData = { "firstName": "", "lastName": "", "badgeNumber": "", "password": "" };


  constructor(public ble: BLE, private storage: Storage, public nav: NavController, public popoverCtrl: PopoverController, public navParams: NavParams, public loadingController: LoadingController) {

    this.badgeNumber = window.localStorage.getItem('firstName');
    this.badgeNumber = window.localStorage.getItem('lastName');
    this.badgeNumber = window.localStorage.getItem('badgeNumber');
    this.badgeNumber = window.localStorage.getItem('password');


  }

  ionViewWillEnter() {
    // this.search.pickup = "Rio de Janeiro, Brazil";
    // this.search.dropOff = "Same as pickup";
    // this.storage.get('pickup').then((val) => {
    //   if (val === null) {
    //     this.search.name = "Rio de Janeiro, Brazil"
    //   } else {
    //     this.search.name = val;
    //   }
    // }).catch((err) => {
    //   console.log(err)
    // });
  }

  openDoor() {
    // this.ble.connect(bluefruit.deviceId);
    // this.ble.autoConnect(bluefruit.deviceId, data => {
    //   console.log('Connected Data: ', JSON.stringify(data));
    // }, (error) => {
    //   console.log('Cannot connect or peripheral disconnected.', JSON.stringify(error));
    // });
    // this.ble.startNotification(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic);
    this.loading();
    // this.ble.write(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic, stringToBytes(this.addHash("")));
    console.log(this.addHash("^the door is opened"));
    // this.ble.disconnect(bluefruit.deviceId);
  }

  logout() {

    window.localStorage.removeItem('badgeNumber');
    window.localStorage.removeItem('password');

    this.nav.setRoot(LoginPage);
    this.nav.popToRoot();   
    // this.nav.setRoot(LoginPage);
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
        this.ble.writeWithoutResponse(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic, stringToBytes(this.addHash(""))).then(result => {
          console.log(result);
          resolve(true);
          // this.nav.push(HomePage, { bNumber: this.userData.badgeNumber });
          alert('The door is opened');


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
    return "BGNMSG[OPEND" + msg + "]ENDMSG";
  }

}

//
