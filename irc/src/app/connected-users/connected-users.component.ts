import {Component, OnDestroy, OnInit} from '@angular/core';
import {io} from "socket.io-client";
import {Router} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import { SharedDataService } from '../shared-data.service';

@Component({
  selector: 'app-connected-users',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './connected-users.component.html',
  styleUrls: ['./connected-users.component.css']
})
export class ConnectedUsersComponent implements OnInit, OnDestroy {
  socket = io("http://localhost:4242/");
  public userConnected: any[] = [];
  public userConnectedInChannel: any[] = [];
  public data: any;
  public inputPseudo: any = false;
  public numberUser: number = 0;
  public numberUserInChannel: number = 0;
  public pseudo = localStorage.getItem('pseudo');
  public currentRoom = localStorage.getItem('roomName');


  pseudoForm = new FormGroup({
    name: new FormControl("")
  });

  constructor(private router: Router, private sharedDataService: SharedDataService) {}

  ngOnInit() {
    this.listenForUsers();
    this.handlePageReload();
    this.refreshPseudo();


    this.sharedDataService.currentData.subscribe(data => {
      if(data){
        this.data = data;
        this.currentRoom = localStorage.getItem('roomName');
        this.userConnectedInChannel = data;
        this.numberUserInChannel = data.length;
      }
    });
  }

  ngOnDestroy() {
    this.socket.off('updateUserList');
    this.socket.off('disconnect');
    this.handleDisconnect();
  }

  listenForUsers() {
    this.socket.on('updateUserList', (users) => {
      this.userConnected = users;
      this.numberUser = this.userConnected.length;
    });

    this.socket.emit('requestUserList');
  }

  handleDisconnect() {
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      localStorage.removeItem('pseudo');
    });
  }

  refreshPseudo(){
    this.socket.on('refreshPseudo', (data) => {
      const newPseudo:any = data.pseudo;
      localStorage.setItem('pseudo', newPseudo);
      this.pseudo = newPseudo;
    });
  }

  updatePseudo(){
    if(this.pseudoForm.value.name?.trim() !== ""){
      this.inputPseudo=false;
      const pseudoName:any = this.pseudoForm.value.name;
      this.socket.emit("updatePseudo", {name: pseudoName, currentPseudo : this.pseudo});
    }
  }

  displayUpdateName(){

    if(this.inputPseudo === false){
      this.inputPseudo=true;
    }else{
      this.inputPseudo=false;
    }
  }

  handlePageReload() {
    if (!localStorage.getItem('pseudo')) {
      this.router.navigate(['/']);
    }
    window.addEventListener('beforeunload', () => {
      localStorage.removeItem('pseudo');
    });
  }
}
