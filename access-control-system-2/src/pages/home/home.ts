import { Component, NgZone, OnInit } from "@angular/core";
import { NavController, Platform, AlertController  } from "ionic-angular";
// import {LoginPage} from "../login/login";
// import { BLE } from '@ionic-native/ble';

import { InAppBrowser } from '@ionic-native/in-app-browser';


import { BleProvider } from '../../providers/ble/ble';
import { BeaconProvider } from '../../providers/beacon/beacon';

import { BackgroundMode } from '@ionic-native/background-mode';

import { LocalNotifications } from '@ionic-native/local-notifications';




@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage implements OnInit {
  
  zone: any;


  notificationAlreadyReceived = false;

  userData = { "firstName": "", "lastName": "", "badgeNumber": "", "password": "" };

  // private btn_txt = "Seamless Access is disabled";
  // private buttonColor: string = "light";  

  authenticated = false;

  ngOnInit(): void {
    this.ble.getUserSubject().subscribe(authState => {
      this.authenticated = authState ? true : false;
    });
  }


  constructor(
      private ble: BleProvider,
      public nav: NavController,
      public alertController: AlertController,
      public beacon: BeaconProvider,
      public platform: Platform,
      private iab: InAppBrowser,
    public backgroundMode: BackgroundMode,
    private localNotifications: LocalNotifications

    ) {

    this.userData.firstName = window.localStorage.getItem('firstName');
    this.userData.lastName = window.localStorage.getItem('lastName');
    this.userData.badgeNumber = window.localStorage.getItem('badgeNumber');

  }


  inbox(link) {
    // const target = '_blank';
    // const options = { location: 'no' };
    // const refLink = this.iab.create(link, target, options);
    this.iab.create(link, '_self', { location: 'no' });
  }


  public buttonClicked: boolean = false; //Whatever you want to initialize it as


  seamlessA(): void {
      //do some logic
      this.buttonClicked = !this.buttonClicked;
      this.startBackgroundMode();
  }

  seamlessB(): void {
      //do some logic
      this.buttonClicked = !this.buttonClicked;
      this.stopBackgroundMode();
  }

  startBackgroundMode() {

    this.backgroundMode.on('activate').subscribe(() => {
      console.log('activated');
      // this.backgroundMode.disableWebViewOptimizations(); 
      this.backgroundMode.unlock();
      this.backgroundMode.wakeUp();
      this.backgroundMode.enable();
    });

    if (this.notificationAlreadyReceived === false) {
          this.showNotification();
        }
    this.beacon.uuid = "55555555-5555-5555-5555-555555" + this.userData.badgeNumber;
    this.beacon.onAdvertiseClicked();
  


  }

  stopBackgroundMode() {
    this.beacon.onStopAdvertiseClicked();
    this.hideNotification();
    this.backgroundMode.on('deactivate').subscribe(() => {
      console.log('deactivate');
      this.backgroundMode.disable();
    });
  }

 
  showNotification() {
    let notification = {
      text: 'Seamless Access is enabled',
      sticky: true,

      
    };
    this.localNotifications.schedule(notification);
    this.notificationAlreadyReceived = true;
  }

  hideNotification() {
    this.localNotifications.clearAll();
    this.notificationAlreadyReceived = false;
  }

  openDoor() {
    var dataIn = stringToBytes(this.makeCMD("OPEND" + window.localStorage.getItem('badgeNumber')));
    this.ble.bleConnect(dataIn);

    console.log(this.makeCMD(window.localStorage.getItem('badgeNumber')));
  }

  adminPan() {
    this.presentConfirm();
  }

  presentConfirm() {
    let alert = this.alertController.create({
      title: 'Confirm',
      message: 'This will show the admin panel in the terminal device',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');

          }
        },
        {
          text: 'OK',
          handler: () => {
            console.log('Ok clicked');
            var dataIn = stringToBytes(this.makeCMD("ADMPN" + window.localStorage.getItem('badgeNumber')));
            this.ble.bleConnect(dataIn)

          }
        }
      ]
    });
    alert.present();
  }

  makeCMD(msg: string) {
    return "BGNMSG[" + msg + "]ENDMSG";
  }


  logout() {
    this.ble.logout();
    this.stopBackgroundMode();
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
