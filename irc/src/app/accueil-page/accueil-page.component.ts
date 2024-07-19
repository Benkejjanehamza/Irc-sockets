import { Component } from '@angular/core';
import {AllChannelComponent} from "../all-channel/all-channel.component";
import {AllSaloonComponent} from "../all-saloon/all-saloon.component";
import {ConnectedUsersComponent} from "../connected-users/connected-users.component";

@Component({
  selector: 'app-accueil-page',
  standalone: true,
  imports: [AllChannelComponent, AllSaloonComponent, ConnectedUsersComponent],
  templateUrl: './accueil-page.component.html',
  styleUrl: './accueil-page.component.css'
})
export class AccueilPageComponent {

}
