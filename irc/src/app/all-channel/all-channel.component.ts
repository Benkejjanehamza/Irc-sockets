import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { io } from "socket.io-client";
import { NgForOf, NgIf } from "@angular/common";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AllCommunicationService } from "../all-communication-service/all-communication-service.component";
import { Subscription } from "rxjs";
import { SharedDataService } from '../shared-data.service';
@Component({
  selector: 'app-all-channel',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './all-channel.component.html',
  styleUrls: ['./all-channel.component.css']
})
export class AllChannelComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  socket = io("http://localhost:4242/");
  pseudo = localStorage.getItem('pseudo');
  openLi = false;
  public channelsData: any[] = [];
  public message: any;
  public commande: any;
  previousRoom:any;
  public userInChannel: any;
  public popupUsers: any = false;
  public inputChannelName: any = false;
  public userConnectedInChannel: any;
  dynamicValue = "";
  public actuelRoom: any;
  public allChannel : any;
  public messageChannel: any[] = ["none"];
  public channelList: any[] = [];
  public typingUsers: string[] = [];
  private subscription: Subscription | undefined;
  private typingTimeout: any;
  public usernameTyping: { username: string } = { username: '' };
  public isWriting: boolean = false;
  public isCreator: boolean = false;
  public userConnected: any[] = [];
  public showChannel: boolean = false;

  constructor(private allCommunicationService: AllCommunicationService,  private sharedDataService: SharedDataService) {}

  messageForm = new FormGroup({
    message: new FormControl("")
  });

  channelNameForm = new FormGroup({
    name: new FormControl("")
  });
  ngOnInit() {
    this.getCurrentChannel();
    this.getMessage();
    this.initTyping();
    this.listenRoomUpdate()
    this.listenForUsers();
    this.setupSocketConnection();
    this.getSaloon();

    this.subscription = this.allCommunicationService.callFunction$.subscribe(() => {
      this.actuelRoom = localStorage.getItem('roomName');
      this.getPreviousMessage();
      this.checkIfCreator();
    });

    this.socket.on('typing', (data: any) => {
      if (!this.typingUsers.includes(data.username)) {
        this.typingUsers.push(data.username);
      }
    });

    this.socket.on('stop typing', (data: any) => {
      this.typingUsers = this.typingUsers.filter(username => username !== data.username);
    });
  }

  sendData() {
    const data = this.userConnectedInChannel;
    this.sharedDataService.changeData(data);
  }

  listenForUsers() {
    this.socket.on('updateUserList', (users) => {
      this.userConnected = users;
    });
    this.socket.emit('requestUserList');
  }

  updateUserInChanel() {

    if(this.userInChannel){
      const matchedUsers = this.userConnected.filter(user => this.userInChannel.includes(user.pseudo));
      const matchedPseudos = matchedUsers.map(user => user.pseudo);
      this.userConnectedInChannel = matchedPseudos;
    }

  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  getPreviousMessage() {
    this.socket.emit("get-previous-message");
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closePopUp(){
    this.popupUsers = false;
  }

  sendMessage() {

    this.commande = this.dynamicValue;
    this.message = this.messageForm.value.message;
    this.actuelRoom = localStorage.getItem('roomName');

    if (this.message.trim() === "") {
      this.dynamicValue = "";
      return;
    }

    if (this.commande.startsWith('/nick')) {

      const commandeValue =this.dynamicValue.split(' ');

      if(commandeValue[1]){
        this.socket.emit("updatePseudo", {name: commandeValue[1], currentPseudo : this.pseudo});
        this.dynamicValue = "";
        this.openLi = false;
        return;
      }

    } else if (this.commande.startsWith('/list')) {

      const commandeValue = this.dynamicValue.split(' ');
      this.showChannel = true;

      if (commandeValue[1]) {

        const searchValue = commandeValue[1].toLowerCase();
        this.channelList = this.allChannel
          .filter((channel: any) => channel.name.toLowerCase().includes(searchValue))
          .map((channel: any) => channel.name);

      } else {

        this.channelList = this.allChannel.map((channel: any) => channel.name);

      }

      this.dynamicValue = "";
      this.openLi = false;
      return;

    } else if (this.commande.startsWith('/create')) {

      const commandeValue =this.dynamicValue.split(' ');

      if(commandeValue[1]){
        this.socket.emit("create-room", { channel: commandeValue[1], username: this.pseudo, creator: true });
        this.socket.emit("message", { message: `${ this.pseudo} created the channel ${commandeValue[1]}`, username: "System", room: "all" });
        this.openLi = false;
        this.dynamicValue = "";
        return;
      }

    } else if (this.commande.startsWith('/delete')) {

      const currentRoom = localStorage.getItem('roomName');
      const commandeValue =this.dynamicValue.split(' ');

      if(commandeValue[1]){
        this.socket.emit("delete-room", { name: commandeValue[1] });
        this.socket.emit("message", { message: `${this.pseudo} delete the channel ${commandeValue[1]}`, username: "System", room: "all" });
      }else{
        this.socket.emit("delete-room", { name: currentRoom });
        this.socket.emit("message", { message: `${this.pseudo} delete the channel ${currentRoom}`, username: "System", room: "all" });
      }

      this.openLi = false;
      this.dynamicValue = "";
      localStorage.setItem('roomName', "none");

      setTimeout(() => {
        this.messageChannel = ["none"];
      }, 500);

      this.getSaloon();
      return;

    } else if (this.commande.startsWith('/join')) {

      const commandeValue =this.dynamicValue.split(' ');

      if(commandeValue[1]){
        this.joinRoom(commandeValue[1])
      }

      this.openLi = false;
      this.dynamicValue = "";
      return;

    } else if (this.commande.startsWith('/users')) {

      this.popupUsers = true;
      this.openLi = false;
      this.dynamicValue = "";
      return;

    } else if (this.commande.startsWith('/msg')) {

      console.log("commande msg sélectionnée");

    }else if (this.commande.startsWith('/leave')) {

      const currentRoom = localStorage.getItem('roomName');
      const commandeValue =this.dynamicValue.split(' ');

      if(commandeValue[1]){
        this.socket.emit("message", { message: `${this.pseudo} left the channel ${commandeValue[1]}`, username: "System", room: commandeValue[1] });
      }else{
        this.socket.emit("message", { message: `${this.pseudo} left the channel ${currentRoom}`, username: "System", room:currentRoom });
      }

      this.openLi = false;
      this.dynamicValue = "";
      localStorage.setItem('roomName', "none");

      setTimeout(() => {
        this.messageChannel = ["none"];
      }, 500);


      this.getSaloon();
      this.sendData();
      return;

    }


    this.socket.emit("message", { message: this.message, username: this.pseudo, room: this.actuelRoom });
    this.dynamicValue = "";
    this.socket.emit('stopTyping', { username: this.pseudo, room: this.actuelRoom });
  }

  getMessage() {
    this.socket.on('getMessage', (value: any) => {
      this.messageChannel = value;
      this.scrollToBottom();
    });
  }

  closeListeChannel(){
    this.showChannel = false;
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;
    if (inputValue.startsWith('/')) {
      this.openLi = true;
    } else {
      this.openLi = false;
    }

    this.socket.emit('typing', { username: this.pseudo, room: this.actuelRoom });

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.isWriting = false;
      this.socket.emit('stopTyping', { username: this.pseudo, room: this.actuelRoom });
    }, 2000);
  }

  initTyping() {
    this.socket.on('sendTyping', (data) => {
      if (data) {
        this.isWriting = true;
        this.usernameTyping = data;
      }
    });

    this.socket.on('sendStopTyping', (data) => {
      if (data) {
        this.isWriting = false;
        this.usernameTyping = data;
      }
    });
  }

  changeInput(inputClick: any) {
    this.openLi = false;
    this.dynamicValue = inputClick;
  }

  getCurrentChannel() {
    this.socket.on('channels', (channels) => {

      this.channelsData = channels;
      let usersByChannel: { [key: string]: string[] } = {};

      if (Array.isArray(this.channelsData)) {
        this.channelsData.forEach(channel => {
          if (Array.isArray(channel.users)) {
            usersByChannel[channel.name] = channel.users;
            this.userInChannel = usersByChannel[this.actuelRoom];
          }
        });
      }

      this.socket.emit("userChannelConnected", { currentConnected: usersByChannel });
      this.checkIfCreator();
      this.updateUserInChanel();
      this.sendData()
    });
  }

  setupSocketConnection() {
    this.socket.on("room_list", (rooms: any) => {
      this.allChannel = rooms;
    });

    this.socket.on('channels', (channels) => {
      this.allChannel = channels;
    });
  }

  getSaloon() {
    this.socket.emit("get-room");
  }

  checkIfCreator() {
    const currentRoom = this.channelsData.find(channel => channel.name === this.actuelRoom);
    this.isCreator = currentRoom && currentRoom.username === this.pseudo && currentRoom.creator;
  }

  deleteChannel() {
    const currentRoom = localStorage.getItem('roomName');
    this.socket.emit("delete-room", { name: currentRoom });
    this.socket.emit("message", { message: `${this.pseudo} deleted the channel ${currentRoom}`, username: "System", room: "all" });

    setTimeout(() => {
      this.messageChannel = ["none"];
    }, 500);

    localStorage.setItem('roomName', "none");
    this.getSaloon();
  }

  updateChannelName(){

    if(this.channelNameForm.value.name?.trim()!==""){
      const newChannelName:any = this.channelNameForm.value.name;
      const currentRoom = localStorage.getItem('roomName');
      this.socket.emit("updateChannelName", {name: newChannelName, currentRoom : currentRoom});
      this.socket.emit("message", { message: `${this.pseudo} changed the channel name ${currentRoom} by ${ newChannelName}`, username: "System", room: "all" });
      this.inputChannelName = false;
    }

  }
  displayUpdateChannelName(){

    if(this.inputChannelName === false){
      this.inputChannelName = true;
    }else{
      this.inputChannelName = false;
    }
  }
  listenRoomUpdate() {
    this.socket.on('list_channel', (data) => {

      if (data.newRoom) {
        localStorage.setItem('roomName', data.newRoom);
      }

      const updatedChannel = this.channelsData.find(channel => channel.id === data.updateChannel.id);
      if (updatedChannel) {
        updatedChannel.name = data.updateChannel.name;
      } else {
        this.channelsData.push(data.updateChannel);
      }
      this.channelsData = [...this.channelsData];
    });
  }

  joinRoom(name: any) {

    if(name === this.previousRoom){
      return;
    } else {
      this.socket.emit("message", { message: `${this.pseudo} left the channel ${this.previousRoom}`, username: "System", room: this.previousRoom });
      localStorage.setItem('roomName', name);
      const currentRoom = localStorage.getItem('roomName');
      const pseudo = localStorage.getItem('pseudo');
      this.socket.emit("join-room", { channel: name, username: pseudo });

      this.triggerFunctionInAllChannel();

      this.socket.emit("message", { message: `${pseudo} joined the channel ${currentRoom}`, username: "System", room: currentRoom });

      this.previousRoom = currentRoom;
    }
  }

  triggerFunctionInAllChannel() {
    this.allCommunicationService.callFunction();
  }


}
