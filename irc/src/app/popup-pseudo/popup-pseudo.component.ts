import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import { io } from "socket.io-client";
import {Router} from '@angular/router';
@Component({
  selector: 'app-popup-pseudo',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './popup-pseudo.component.html',
  styleUrl: './popup-pseudo.component.css'
})


export class PopupPseudoComponent implements OnInit {

  constructor(private router: Router) { }

  socket = io("http://localhost:4242/");

  personForm = new FormGroup({
    name: new FormControl("")
  });

  ngOnInit() {
    localStorage.setItem('roomName', "none");
  }

  sendForm(){

    const pseudo = this.personForm.value.name

    if(pseudo?.trim() === ""){

    }else{
      this.socket.emit("pseudo", (pseudo));
      localStorage.setItem('pseudo', <string>(pseudo));
      this.router.navigate([`/accueil/${pseudo}`]);
    }
  }

}
