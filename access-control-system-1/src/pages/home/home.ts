import { Component, NgZone } from "@angular/core";
import { NavController, PopoverController, NavParams, LoadingController, AlertController, Platform, Events  } from "ionic-angular";
import {LoginPage} from "../login/login";
import { BLE } from '@ionic-native/ble';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { IBeacon, IBeaconPluginResult } from '@ionic-native/ibeacon';

import { BackgroundMode } from '@ionic-native/background-mode';





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
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  // @ViewChild('open', {read: ElementRef}) open;

  
  zone: any;


  private isAdvertisingAvailable: boolean = null;

  private uuid: string = '55555555-5555-5555-5555-555555555555';
  private major: number = 11;
  private minor: number = 11;
  private rssi: number = -68;

  userData = { "firstName": "", "lastName": "", "badgeNumber": "", "password": "" };
  disableButton: boolean;
  visible = false;



  constructor(public ble: BLE,
      public nav: NavController,
      public popoverCtrl: PopoverController,
      public navParams: NavParams, 
      public loadingController: LoadingController,
      public alertController: AlertController,
    // public beaconProvider: BeaconProvider,
      public platform: Platform,
      public events: Events,
      private iab: InAppBrowser,
      private readonly ibeacon: IBeacon,
    ) {

    this.userData.firstName = window.localStorage.getItem('firstName');
    this.userData.lastName = window.localStorage.getItem('lastName');
    this.userData.badgeNumber = window.localStorage.getItem('badgeNumber');
    // this.userData.password = window.localStorage.getItem('password');


    this.zone = new NgZone({ enableLongStackTrace: false });

    this.fetchIsAdvertisingAvailable();
    this.enableDebugLogs();
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

//-----------------------------------------------------------------
  public enableDebugLogs(): void {
    this.platform.ready().then(async () => {
      this.ibeacon.enableDebugLogs();
      this.ibeacon.enableDebugNotifications();
    });
  }

  public fetchIsAdvertisingAvailable(): void {
    this.platform.ready().then(async () => {
      this.isAdvertisingAvailable = await this.ibeacon.isAdvertisingAvailable();
      console.debug(`AdvertisingPage::fetchIsAdvertisingAvailable::isAdvertisingAvailable=>${this.isAdvertisingAvailable}`);
    });
  }


public onAdvertiseClicked(): void {
    this.platform.ready().then(() => {
      this.startBleAdvertising();
    });
  }

  public onStopAdvertiseClicked(): void {
    this.platform.ready().then(() => {
      const beaconRegion = this.ibeacon.BeaconRegion('nullBeaconRegion', this.uuid, this.major, this.minor);
      this.ibeacon.stopAdvertising(beaconRegion)
        .then(() => {
          console.debug(`AdvertisingPage::onStopAdvertiseClicked::SUCCESS=>`);
        })
        .catch((reason: any) => {
          console.debug(`AdvertisingPage::onStopAdvertiseClicked::FAIL::reason=>`, reason);
        });
    });
  }

  public startBleAdvertising(): void {

    // Request permission to use location on iOS
    this.ibeacon.requestAlwaysAuthorization();

    this.ibeacon.enableDebugLogs();

    // create a new delegate and register it with the native layer
    let delegate = this.ibeacon.Delegate();

    // Event when advertising starts (there may be a short delay after the request)
    // The property 'region' provides details of the broadcasting Beacon
    delegate.peripheralManagerDidStartAdvertising().subscribe((pluginResult: IBeaconPluginResult) => {
      console.debug(`AdvertisingPage::startBleAdvertising::peripheralManagerDidStartAdvertising::pluginResult=>`, pluginResult);
    });

    // Event when bluetooth transmission state changes
    // If 'state' is not set to BluetoothManagerStatePoweredOn when advertising cannot start
    delegate.peripheralManagerDidUpdateState().subscribe((pluginResult: IBeaconPluginResult) => {
      console.debug(`AdvertisingPage::startBleAdvertising::peripheralManagerDidUpdateState::pluginResult=>`, pluginResult);
    });

    const beaconRegion = this.ibeacon.BeaconRegion('nullBeaconRegion', this.uuid, this.major, this.minor);
    this.ibeacon.startAdvertising(beaconRegion);
  }

//-----------------------------------------------------------------

  inbox(link) {

    const target = '_blank';
    const options = { location: 'no' };
    // const refLink = this.iab.create(link, target, options);
    this.iab.create(link, '_self', { location: 'no' });

  }


  openDoor() {

    this.loading();
    // this.ble.write(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic, stringToBytes(this.addHash("")));
    console.log(this.addHash("^the door is opened"));
    // this.ble.disconnect(bluefruit.deviceId);
  }


  logout() {

    window.localStorage.removeItem('badgeNumber');
    window.localStorage.removeItem('password');
    // this.ble.disconnect(bluefruit.deviceId);
    // this.backgroundMode.disable();



    this.nav.setRoot(LoginPage);
    this.nav.popToRoot();   
    // this.nav.setRoot(LoginPage);

    // this.platform.ready().then(() => {
      const beaconRegion = this.ibeacon.BeaconRegion('nullBeaconRegion', this.uuid, this.major, this.minor);
      this.ibeacon.stopAdvertising(beaconRegion)
        .then(() => {
          console.debug(`AdvertisingPage::onStopAdvertiseClicked::SUCCESS=>`);
        })
        .catch((reason: any) => {
          console.debug(`AdvertisingPage::onStopAdvertiseClicked::FAIL::reason=>`, reason);
        });
    // });
  }

  loading() {
    let loader = this.loadingController.create({
      spinner: null,
      duration: 6000,
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
        this.ble.writeWithoutResponse(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic, stringToBytes(this.addHash(window.localStorage.getItem('badgeNumber')))).then(result => {
          console.log(result);
          resolve(true);
          // this.nav.push(HomePage, { bNumber: this.userData.badgeNumber });


        }).catch(error => {
          alert(JSON.stringify(error));
        });

        this.ble.startNotification(bluefruit.deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic).subscribe(data => {

          this.processSerial(bytesToString(data));
          resolve(true);



        }, error => {
          this.showAlert('Unexpected Error', 'Failed to subscribe');
        });

      }, error => {
        reject(true);
        alert('You need to be closer to the door');
      });

    });

  }

  addHash(msg: string) {
    return "BGNMSG[OPEND" + msg + "]ENDMSG";
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
      this.ble.disconnect(bluefruit.deviceId);
      this.visible = !this.visible;
      this.disableButton = true;

      setTimeout(() => {
        this.visible = !this.visible;
        this.disableButton = false;
      }, 5000);
      
    } else if (cmd.includes("ERROR")) {
        if (prm[0].toString().match("901")) {
          // this.showAlert("Exist", "Account Exist, cannot create new account")
          alert("Account exist – cannot create new account");
          this.ble.disconnect(bluefruit.deviceId);
        }
        else if (prm[0].toString().match("902")) {
          alert("Account pending approval – cannot open door");
          this.ble.disconnect(bluefruit.deviceId);
        }
        else if (prm[0].toString().match("903")) {
          alert("Account access removed – contact administrator");
          this.ble.disconnect(bluefruit.deviceId);
        }
    }
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

//
