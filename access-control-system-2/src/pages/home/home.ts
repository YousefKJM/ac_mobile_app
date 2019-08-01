import { Component, NgZone, OnInit } from "@angular/core";
import { NavController, Platform, AlertController  } from "ionic-angular";
// import {LoginPage} from "../login/login";
// import { BLE } from '@ionic-native/ble';

import { InAppBrowser } from '@ionic-native/in-app-browser';


import { BleProvider } from '../../providers/ble/ble';
import { BeaconProvider } from '../../providers/beacon/beacon';

import { BackgroundMode } from '@ionic-native/background-mode';
// import { BackGroundMode } from '@ionic-native/background-mode-fixed';


// import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
import { LocalNotifications } from '@ionic-native/local-notifications';
// import { Geolocation } from '@ionic-native/geolocation';
// import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse} from "@ionic-native/background-geolocation";



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage implements OnInit {

  // @ViewChild('open', {read: ElementRef}) open;
  
  zone: any;


  // config: BackgroundGeolocationConfig = {
  //   desiredAccuracy: 10,
  //   stationaryRadius: 20,
  //   distanceFilter: 30,
  //   debug: true, //  enable this hear sounds for background-geolocation life-cycle.
  //   stopOnTerminate: false, // enable this to clear background location settings when the app terminates
  // };

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
      // public ble: BLE,
      private ble: BleProvider,
      public nav: NavController,
      // public loadingController: LoadingController,
      public alertController: AlertController,
      public beacon: BeaconProvider,
      public platform: Platform,
      // public events: Events,
      private iab: InAppBrowser,
    public backgroundMode: BackgroundMode,
    // private backgroundGeolocation: BackgroundGeolocation,
    // private backgroundGeolocation: BackgroundGeolocationOriginal,
    private localNotifications: LocalNotifications

    ) {


    this.userData.firstName = window.localStorage.getItem('firstName');
    this.userData.lastName = window.localStorage.getItem('lastName');
    this.userData.badgeNumber = window.localStorage.getItem('badgeNumber');
    // this.userData.password = window.localStorage.getItem('password');

    this.zone = new NgZone({ enableLongStackTrace: false });

    // this.platform.pause.subscribe(e => {
    //   this.stopBackgroundMode();
    // });

    // window.addEventListener('beforeunload', () => {
    //   this.stopBackgroundMode();
    // });




    // this.btn_txt = 'Seamless Access is disabled';
    // this.buttonColor = "light";  


    // this.backgroundMode.on('activate').subscribe(() => {
    //   console.log('activated');

    //   if (this.notificationAlreadyReceived === false) {
    //     this.showNotification();

    //   }
    // });

    // this.backgroundGeolocation.configure(this.config)
    //   .subscribe((location: BackgroundGeolocationResponse) => {

    //     console.log(location);
    //     this.showNotification(location)
    //     // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
    //     // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
    //     // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
    //     this.backgroundGeolocation.finish(); // FOR IOS ONLY

    //   });

  }

  // ionViewWillEnter() {
  //   // this.backgroundMode.enable();
  //   // this.platform.ready().then(() => {
  //   this.startBleAdvertising();
  //   // });
  // }

  // ionViewWillLeave() {
  //   // this.backgroundMode.enable();
  //   // this.platform.ready().then(() => {
  //   this.startBleAdvertising();
  //   // });
  // }

  // ionViewDidLoad() {
  // }
  // startBackgroundGeolocation() {
  //   // start recording location
  //   this.backgroundGeolocation.start();
  // }

  

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
      // this.startBackgroundGeolocation();
  }

  
  

  seamlessB(): void {
      //do some logic
      this.buttonClicked = !this.buttonClicked;
      this.stopBackgroundMode();
      // this.stopBackgroundGeolocation();
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

  // stopBackgroundGeolocation() {
  //   // If you wish to turn OFF background-tracking, call the #stop method.
  //   this.backgroundGeolocation.stop();
  //   this.notificationAlreadyReceived = false;
  //   this.beacon.onStopAdvertiseClicked();

  // }


  // startBackgroundGeolocation() {
  //   const config: BackgroundGeolocationConfig = {
  //     desiredAccuracy: 10,
  //     stationaryRadius: 20,
  //     distanceFilter: 30,
  //     debug: true, //  enable this hear sounds for background-geolocation life-cycle.
  //     stopOnTerminate: false, // enable this to clear background location settings when the app terminates
  //     notificationTitle: 'Testing GeoLocation',
  //     notificationText: 'Successfully Implemented',
  //   };

  //   this.backgroundGeolocation.configure(config)
  //     .subscribe((location: BackgroundGeolocationResponse) => {

  //       console.log(location);
  //       // this.backgroundMode.enable();
  //       // this.showNotification();
  //       if (this.notificationAlreadyReceived === false) {
  //         this.showNotification();
  //       }
  //       this.beacon.uuid = "55555555-5555-5555-5555-555555" + this.userData.badgeNumber;
  //       this.beacon.onAdvertiseClicked();
  //       // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
  //       // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
  //       // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
  //       // this.backgroundGeolocation.finish(); // FOR IOS ONLY

  //     });
  //   // start recording location
  //   this.backgroundGeolocation.start();
  // }

  // seamless(): void {
  //   if (this.buttonColor.match("light")) {
  //     //do some logic
  //     this.btn_txt = "Seamless Access is enabled";
  //     this.buttonColor = "dark";

  //     if (this.notificationAlreadyReceived === false) {
  //       this.showNotification();
  //     }
  //     this.beacon.uuid = "55555555-5555-5555-5555-555555" + this.userData.badgeNumber;
  //     this.beacon.onAdvertiseClicked();

  //   this.backgroundMode.on('activate').subscribe(() => {
  //     console.log('activated');
  //       // this.backgroundMode.disableWebViewOptimizations(); 
  //       this.backgroundMode.enable();
  //       this.backgroundMode.unlock();
  //       this.backgroundMode.wakeUp();
  //   });
  //     // this.startBackgroundGeolocation();
  //   } else if (this.buttonColor.match("dark")) {
  //       this.btn_txt = "Seamless Access is disabled";
  //       this.buttonColor = "light";

  //       this.beacon.onStopAdvertiseClicked();
  //     this.backgroundMode.on('deactivate').subscribe(() => {
  //       console.log('deactivate');
  //       this.backgroundMode.disable();
  //     });
  //       // this.stopBackgroundGeolocation();
  //       this.hideNotification();
  //   }
  // }



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
