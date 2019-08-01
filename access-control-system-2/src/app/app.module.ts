import {ErrorHandler, NgModule} from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule} from "ionic-angular";
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {IonicStorageModule} from '@ionic/storage';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {Keyboard} from '@ionic-native/keyboard';

import {MyApp} from "./app.component";
import { BLE } from '@ionic-native/ble';
import { IBeacon } from '@ionic-native/ibeacon';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { BackgroundMode } from '@ionic-native/background-mode';
import { HttpModule } from '@angular/http';

// import { LocalNotifications } from '@ionic-native/local-notifications';
// import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';


import {HomePage} from "../pages/home/home";
import {LoginPage} from "../pages/login/login";
import {RegisterPage} from "../pages/register/register";
import {ScanPage} from "../pages/scan/scan";

import { BleProvider } from '../providers/ble/ble';
import { BeaconProvider } from '../providers/beacon/beacon';

import { HasRoleDirective } from '../directives/has-role/has-role';


import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation } from '@ionic-native/geolocation';
import { LocalNotifications } from '@ionic-native/local-notifications';





// import services
// end import services
// end import services

// import pages
// end import pages

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    ScanPage,
    HasRoleDirective
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    IonicModule.forRoot(MyApp, {
      scrollPadding: false,
      scrollAssist: true,
      autoFocusAssist: false
    }),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    ScanPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Keyboard,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    BLE,
    IBeacon,
    InAppBrowser,
    BackgroundMode,
    BleProvider,
    BeaconProvider,
    LocalNotifications,
    BackgroundGeolocation,
    Geolocation,


  ]
})

export class AppModule {
}
