import {Component, OnInit} from '@angular/core';
import {Store} from "@ngxs/store";
import {STORAGE_FIELD_USER_KEY} from "./store/app.state";
import {Login, Logout} from "./store/app.actions";
import {LocalStorageService} from "ngx-webstorage";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    constructor(
        private store: Store,
        private storageService: LocalStorageService
    ) {
    }

    ngOnInit() {
        this.store.dispatch(new Login());
        this.storageService.observe(STORAGE_FIELD_USER_KEY).subscribe((userKey: string) => {
            if (!userKey) {
                this.store.dispatch(new Logout());
                this.store.dispatch(new Login());
            }
        })
    }
}
