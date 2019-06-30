import {Component} from "@angular/core";
import { NavController, PopoverController, NavParams } from "ionic-angular";
import {Storage} from '@ionic/storage';
import {LoginPage} from "../login/login";



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  public frName: string;
  public laName: string;
  public baNumber: number;




  userData = { "firstName": "", "lastName": "", "badgeNumber": "", "password": "" };


  constructor(private storage: Storage, public nav: NavController, public popoverCtrl: PopoverController, public navParams: NavParams) {

    this.frName = this.navParams.get('frName');
    this.laName = this.navParams.get('laName');
    this.baNumber = this.navParams.get('baNumber');

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
    
  }

  logout() {
    this.nav.setRoot(LoginPage);
  }

}

//
