import { Component, ViewChild } from "@angular/core";
import { Platform, Nav, AlertController } from "ionic-angular";

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Keyboard } from '@ionic-native/keyboard';

// import { HomePage } from "../pages/home/home";
import { LoginPage } from "../pages/login/login";
import { BLE } from '@ionic-native/ble';

'use strict';


export interface MenuItem {
    title: string;
    component: any;
    icon: string;
}


// this is Nordic's UART service
var bluefruit = {
  serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
  rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',  // receive is from the phone's perspective
  deviceId: "D2:B7:4D:6C:29:0C"
};

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

      //*** Control Keyboard
      this.keyboard.disableScroll(true);

      this.ble.isEnabled().then(
        success => {
          this.showToast("Bluetooth is enabled");
        },
        error => {
          this.showError("Bluetooth is *not* enabled");
        }
      );

      // this.ble.autoConnect(bluefruit.deviceId, data => {
      //   console.log('Connected Data: ', JSON.stringify(data));
      // }, (error) => {
      //   console.log('Cannot connect or peripheral disconnected.', JSON.stringify(error));
      // });

      // this.ble.enable().then(
      //   success => {
      //     this.showToast("Bluetooth is enabled");
      //   },
      //   error => {
      //     this.showError("The user did *not* enable Bluetooth");
      //   }
      // );

      

   

    });

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


