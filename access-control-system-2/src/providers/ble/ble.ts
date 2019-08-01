import { Injectable, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { BLE } from '@ionic-native/ble';

import { HomePage } from "../../pages/home/home";
import { LoginPage } from "../../pages/login/login";
// import { RegisterPage } from "../../pages/register/register";
import { ScanPage } from "../../pages/scan/scan";

import { App, LoadingController } from 'ionic-angular';
import { BehaviorSubject } from 'rxjs';


export interface User {
  name: string;
  roles: string [];
}

/*
  Generated class for the BleProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BleProvider {



  // this is Nordic's UART service
  bluefruit = {
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',  // receive is from the phone's perspective
    deviceId: "D2:B7:4D:6C:29:0C"
  };
  disableButton: boolean;
  visible = false;
  navigationEvent = new EventEmitter();

  loader: any;

  currentUser: BehaviorSubject<User> = new BehaviorSubject(null);

  constructor(public http: Http,
    public ble: BLE,
    public app: App,
    public loadingController: LoadingController,
 

  ) {
    console.log('Hello BleProvider Provider');


  }

  navigate(pageComponent) {
    this.navigationEvent.next({ page: pageComponent })
  }

  checkBluetooth(): boolean {
    if (this.ble.isEnabled()) {
      return true;
    } 
    return false;
  }



 

  bleConnect(dataIn) {
    this.loader = this.loadingController.create({
      spinner: null,
      // duration: 5000,
      content: 'Please wait...',
      cssClass: 'custom-class custom-loading'
    });

    this.loader.present().then(() => {
      this.ble.connect(this.bluefruit.deviceId).subscribe(data => {

        // var dataIn = stringToBytes(this.makeCMD(this.userData.badgeNumber + "^" + this.userData.firstName + "^" + this.userData.lastName + "^" + this.userData.password));
        this.SendData(this.bluefruit.deviceId, this.bluefruit.serviceUUID, this.bluefruit.txCharacteristic, dataIn);

        this.receiveData(this.bluefruit.deviceId, this.bluefruit.serviceUUID, this.bluefruit.rxCharacteristic);
        // resolve(true);


      }, error => {
        // reject(false);
        alert('You need to be closer to the door');
        this.loader.dismiss();

      }); 

    });
  }

  // send data through ble 
  SendData(deviceId, serviceUUID, txCharacteristic, data): void {
    this.ble.writeWithoutResponse(deviceId, serviceUUID, txCharacteristic, data).then(result => {
      console.log(result);


    }).catch(error => {
      alert(JSON.stringify(error));

    });
  }

  // receive data through ble 
  receiveData(deviceId, serviceUUID, rxCharacteristic): void {

    this.ble.startNotification(deviceId, serviceUUID, rxCharacteristic).subscribe(data => {

      this.processSerial(bytesToString(data));
      this.loader.dismiss();


    }, error => {
      alert('Failed to subscribe');
      this.loader.dismiss();

    });
  }


  bleDisconnect() {
    this.ble.disconnect(this.bluefruit.deviceId);
  }

  // process received command (including data)
  allData: string = "";
  started: boolean = false;
  BGNM: string = "BGNMSG[";
  ENDM: string = "]ENDMSG";
  processSerial(data: string): void {
    this.allData = this.allData + data;
    if (!this.started) {
      if (this.allData.includes(this.BGNM)) {
        this.allData = this.allData.substring(this.allData.indexOf(this.BGNM) + this.BGNM.length);
        this.started = true;
      }
    }
    if (this.started) {
      var endIndex: number = this.allData.indexOf(this.ENDM);
      var bgnIndex: number = this.allData.indexOf(this.BGNM);
      if (endIndex != -1 && (bgnIndex == -1 || endIndex < bgnIndex)) {
        var completedMsg: string = this.allData.substring(0, this.allData.indexOf(this.ENDM));
        this.allData = this.allData.substring(this.allData.indexOf(this.ENDM) + this.ENDM.length);
        this.started = false;
        this.processMessage(completedMsg);
        this.processSerial("");
        return;
      } else if (this.allData.includes(this.BGNM)) {
        this.started = false;
        this.processSerial("");
        return;
      }
    }
  }

  // extract the needs from the received data and do an action
  processMessage(msg: string): void {
    var cmd: string = msg.substring(0, 5);
    var prm: string[] = msg.substring(5).split("^");
    this.ble.disconnect(this.bluefruit.deviceId);


    if (cmd.match("OKCMD")) {
      // this.ble.disconnect(this.bluefruit.deviceId);
      if (prm[0].toString().match("001")) {
        // this.nav.push(ScanPage);
        this.app.getActiveNav().push(ScanPage);

      } else {
        this.visible = !this.visible;
        this.disableButton = true;

        const start = Date.now();
        // let timeOutHandler = setTimeout(

        setTimeout(() => {
            const e = Date.now() - start;
            console.log('Timer End', e);
            this.visible = !this.visible;
            this.disableButton = false;
          }, 1000);
  
          
      }

    } else if (cmd.match("OKADM")) {

    } else if (cmd.match("FLGOT")) {
      this.logout();

    } else if (cmd.includes("LOGOK")) {
      window.localStorage.setItem('badgeNumber', prm[0].toString());
      window.localStorage.setItem('firstName', prm[1].toString());
      window.localStorage.setItem('lastName', prm[2].toString());
      window.localStorage.setItem('isAdmin', prm[3].toString());

      if (prm[3].match("1")) {
        // this.nav.setRoot(AdminPage);
        // this.app.getActiveNav().setRoot(AdminPage);
        this.loginAsAdmin();
        // this.app.getActiveNav().push(HomePage);
        // this.app.getActiveNav().popToRoot();


      }
      else if (prm[3].match("0")) {
        // this.nav.setRoot(HomePage);
        this.loginAsUser();
        // this.app.getActiveNav().popToRoot();
      }
      // this.app.getActiveNav().setRoot(HomePage);
      this.navigate(HomePage);
      


    } else if (cmd.match("ERROR")) {
      

      if (prm[0].toString().match("901")) {
        alert("Account exist - cannot create new account");

      } else if (prm[0].toString().match("902")) {
        alert("Account pending approval – cannot open door");

      } else if (prm[0].toString().match("903")) {
        alert("Account access removed – contact administrator");

      } else if (prm[0].toString().match("904")) {
        alert("Password is incorrect");

      } else if (prm[0].toString().match("905")) {
        alert("Account does not exist");
      }
    }
  }

  logout() {

    window.localStorage.removeItem('badgeNumber');
    window.localStorage.removeItem('password');
    window.localStorage.removeItem('isAdmin');

    this.ble.disconnect(this.bluefruit.deviceId);

    this.currentUser.next(null);

    // this.nav.setRoot(LoginPage);
    this.app.getActiveNav().setRoot(LoginPage);

    this.app.getActiveNav().popToRoot();
    // this.nav.setRoot(LoginPage);
  }

  loginAsUser() {
    this.currentUser.next({
      name: 'Dummy User',
      roles: ['read-content', 'user']
    });
  }

  loginAsAdmin() {
    this.currentUser.next({
      name: 'The Admin',
      roles: ['read-content', 'write-content']
    });
  }

 


  getUserSubject() {
    return this.currentUser.asObservable();
  }


  hasRoles(roles: string[]): boolean {
    for (const oneRole of roles) {
      if(!this.currentUser.value || !this.currentUser.value.roles.includes(oneRole)) {
      return false;
      }
    }
    return true;
  }

}





// ASCII only
function bytesToString(buffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
}



