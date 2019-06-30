import {Component} from "@angular/core";
import { NavController, PopoverController, NavParams } from "ionic-angular";
import {Storage} from '@ionic/storage';

import {HomePage} from "../home/home";
import { BLE } from '@ionic-native/ble';


// this is Nordic's UART service
var bluefruit = {
  serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
  rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',  // receive is from the phone's perspective
  deviceId: "D2:B7:4D:6C:29:0C"
};


@Component({
  selector: 'page-scan',
  templateUrl: 'scan.html'
})

export class ScanPage {

  public fName: string;
  public lName: string;
  public bNumber: number;



  userData = { "firstName": "", "lastName": "", "badgeNumber": "", "password": "" };


  constructor(public ble: BLE, private storage: Storage, public nav: NavController, public popoverCtrl: PopoverController, public navParams: NavParams
) {
    this.fName = this.navParams.get('fName');
    this.lName = this.navParams.get('lName');
    this.bNumber = this.navParams.get('bNumber');

  }

  // go to home page
    doScan() {
      this.nav.setRoot(HomePage, { frName: this.fName, laName: this.lName, baNumber: this.bNumber}); 
      this.ble.disconnect(bluefruit.deviceId);


    }
}

//
