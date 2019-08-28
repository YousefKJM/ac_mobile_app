import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Platform } from "ionic-angular";
import 'rxjs/add/operator/map';
import { IBeacon, IBeaconPluginResult } from '@ionic-native/ibeacon';


/*
  Generated class for the BeaconProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/


@Injectable()
export class BeaconProvider {

  private isAdvertisingAvailable: boolean = null;

  private _uuid: string = '55555555-5555-5555-5555-555555555555';

  public get uuid(): string {
    return this._uuid;
  }
  public set uuid(value: string) {
    this._uuid = value;
  }
  private major: number = 11;
  private minor: number = 11;
  // private rssi: number = -68;

  constructor(
    public http: Http,
    public platform: Platform,
    private readonly ibeacon: IBeacon,

    ) {
    console.log('Hello BeaconProvider Provider');
  }

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

  public isAdvertising(): boolean {
    if (this.ibeacon.isAdvertising()) {
      return true;
    }
    return false;
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

}
