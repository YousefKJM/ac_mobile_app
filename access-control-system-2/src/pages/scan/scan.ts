import {Component} from "@angular/core";
import { NavController, PopoverController, NavParams } from "ionic-angular";
import { LoginPage } from "../login/login";


@Component({
  selector: 'page-scan',
  templateUrl: 'scan.html'
})

export class ScanPage {

  constructor(
    public nav: NavController,
    public popoverCtrl: PopoverController,
    public navParams: NavParams) {

  }

  // go to home page
    doScan() {
      this.nav.setRoot(LoginPage); 
    }
}

