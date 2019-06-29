import {Component} from "@angular/core";
import {NavController, PopoverController} from "ionic-angular";
import {Storage} from '@ionic/storage';

import {HomePage} from "../home/home";


@Component({
  selector: 'page-scan',
  templateUrl: 'scan.html'
})

export class ScanPage {

  constructor(private storage: Storage, public nav: NavController, public popoverCtrl: PopoverController) {
  }

  // go to home page
    doScan() {
      this.nav.setRoot(HomePage); 
    }
}

//
