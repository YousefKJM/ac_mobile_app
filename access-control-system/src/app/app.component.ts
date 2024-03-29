import { Component, ViewChild } from "@angular/core";
import { Platform, Nav, AlertController } from "ionic-angular";

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';

import { HomePage } from "../pages/home/home";
import { AdminPage } from '../pages/admin/admin';
import { LoginPage } from "../pages/login/login";
import { BLE } from '@ionic-native/ble';

'use strict';


export interface MenuItem {
    title: string;
    component: any;
    icon: string;
}


@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginPage;

  appMenuItems: Array<MenuItem>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public keyboard: Keyboard,
    public ble: BLE,
    public alertController: AlertController
  ) {
    this.initializeApp();

    // this.appMenuItems = [
    //   {title: 'Home', component: HomePage, icon: 'home'},
    //   {title: 'Local Weather', component: LocalWeatherPage, icon: 'partly-sunny'}
    // ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.

      //*** Control Splash Screen
      // this.splashScreen.show();
      // this.splashScreen.hide();

      //*** Control Status Bar
      this.statusBar.styleDefault();
      this.statusBar.overlaysWebView(false);
      // this.statusBar.hide();
      // this.statusBar.overlaysWebView(true);

      //*** Control Keyboard
      this.keyboard.disableScroll(true);

      this.ble.isEnabled().then(
        success => {
          this.checkPreviousAuthorization();
        },
        error => {
          // this.showError("Bluetooth is *not* enabled");
          this.ble.enable().then(
            success => {
              this.checkPreviousAuthorization();
            },
            error => {
              alert("You cannot proceed without enabling Bluetooth");
              this.rootPage = LoginPage;
            }
          );

        }
      );


    });

  }

  checkPreviousAuthorization(): void {
    if ((window.localStorage.getItem('badgeNumber') === "undefined" || window.localStorage.getItem('badgeNumber') === null) &&
      (window.localStorage.getItem('password') === "undefined" || window.localStorage.getItem('password') === null)) {
      this.rootPage = LoginPage;
    } else {
      if (window.localStorage.getItem('isAdmin').match("1")) {
        this.rootPage = AdminPage;

      } else {
        this.rootPage = HomePage;

      }
    }
  } 

  async showError(error) {
    const alert = await this.alertController.create({
      title: "Error",
      message: error,
      buttons: ["OK"]
    });
    await alert.present();
  }

  async showToast(msj) {
    const toast = await this.alertController.create({
      message: msj,
      // duration: 1000
    });
    await toast.present();
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  logout() {
    this.nav.setRoot(LoginPage);
  }
  
}


