import { Routes, RouterModule } from '@angular/router';
import { PopupPseudoComponent} from "./popup-pseudo/popup-pseudo.component";
import {AccueilPageComponent} from "./accueil-page/accueil-page.component";

export const routes: Routes = [
  {
    path: '',
    component: PopupPseudoComponent
  },
  {
    path: 'accueil/:username',
    component:AccueilPageComponent
  },
];
