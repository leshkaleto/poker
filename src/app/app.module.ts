import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {environment} from '../environments/environment';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';
import {NgxsModule} from "@ngxs/store";
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppState} from "./store/app.state";
import {NgxWebstorageModule} from "ngx-webstorage";
import {AngularFireModule} from "@angular/fire/compat";
import {RoomComponent} from './pages/room/room.component';
import {LoginComponent} from './pages/login/login.component';
import {PreloadAllModules, RouterModule} from "@angular/router";
import {RoomGuard} from "./pages/room/room.guard";
import {NgxsReduxDevtoolsPluginModule} from "@ngxs/devtools-plugin";
import {ChangeNameModalComponent} from './pages/room/change-name-modal/change-name-modal.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatCardModule} from "@angular/material/card";
import {LoginGuard} from "./pages/login/login.guard";
import {IsVotedCardPipe} from "./pipes/is-voted-card.pipe";
import {MatIconModule} from "@angular/material/icon";
import {IsShowVotePipe} from "./pipes/is-show-vote.pipe";

const routes = [
    {
        path: '',
        component: LoginComponent,
        canActivate: [LoginGuard]
    },
    {
        path: 'room/:id',
        component: RoomComponent,
        canActivate: [RoomGuard]
    },
    {
        path: '**',
        redirectTo: ''
    },
];

@NgModule({
    declarations: [
        AppComponent,
        RoomComponent,
        LoginComponent,
        ChangeNameModalComponent,
        IsVotedCardPipe,
        IsShowVotePipe
    ],
    imports: [
        BrowserModule,
        AngularFireModule.initializeApp(environment.firebase),
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideFirestore(() => getFirestore()),
        NgxWebstorageModule.forRoot(),
        NgxsModule.forRoot([AppState], {
            developmentMode: !environment.production
        }),
        NgxsReduxDevtoolsPluginModule.forRoot(),
        NgbModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes, {
            preloadingStrategy: PreloadAllModules,
            useHash: true,
            relativeLinkResolution: 'legacy',
        }),
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatIconModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
