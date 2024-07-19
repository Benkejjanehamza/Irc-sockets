import { Component, ElementRef, Renderer2, OnInit } from '@angular/core';
import { NgOptimizedImage, CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { io } from "socket.io-client";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {AllCommunicationService} from "../all-communication-service/all-communication-service.component";

@Component({
  selector: 'app-all-saloon',
  standalone: true,
  imports: [
    NgOptimizedImage,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './all-saloon.component.html',
  styleUrl: './all-saloon.component.css',
})
export class AllSaloonComponent implements OnInit {
  public channelsData: any;

  roomForm = new FormGroup({
    name: new FormControl("")
  });


  username!: string;
  previousRoom:any;
  dynamicValue = "";
  socket = io("http://localhost:4242/");

  constructor(private route: ActivatedRoute, private el: ElementRef, private renderer: Renderer2, private allCommunicationService: AllCommunicationService) {
    this.route.params.subscribe(params => {
      this.username = params['username'];
    });
  }

  triggerFunctionInAllChannel() {
    this.allCommunicationService.callFunction();
  }

  ngOnInit() {
    this.setupSocketConnection();
    this.getSaloon();
  }

  setupSocketConnection() {
    this.socket.on("room_list", (rooms: any) => {
      this.channelsData = rooms;
    });

    this.socket.on('channels', (channels) => {
      this.channelsData = channels;
    });
  }

  getSaloon() {
    this.socket.emit("get-room");
  }

  createSalon() {
    const element = this.el.nativeElement.querySelector('.hiddenPopup');
    const displayStyle = window.getComputedStyle(element).display;

    if (displayStyle === 'none') {
      this.renderer.setStyle(element, 'display', 'flex');
    } else {
      this.renderer.setStyle(element, 'display', 'none');
    }
  }

  sendFormRoom() {
    const element = this.el.nativeElement.querySelector('.hiddenPopup');
    const roomName: any = this.roomForm.value.name;

    if (roomName.trim() === "") {
      this.dynamicValue = "";
      return;
    }

    this.renderer.setStyle(element, 'display', 'none');
    this.socket.emit("create-room", { channel: roomName, username: this.username, creator: true });
    localStorage.setItem('roomName', roomName);
    this.joinRoom(roomName);
    this.getSaloon();

    this.socket.emit("message", { message: `${this.username} created the channel ${roomName}`, username: "System", room: "all" });
  }

  joinRoom(name: any) {
    if(name === this.previousRoom){
      return;
    } else {
      this.socket.emit("message", { message: `${this.username} left the channel ${this.previousRoom}`, username: "System", room: this.previousRoom });
      localStorage.setItem('roomName', name);
      const currentRoom = localStorage.getItem('roomName');
      const pseudo = localStorage.getItem('pseudo');
      this.socket.emit("join-room", { channel: name, username: pseudo });

      this.triggerFunctionInAllChannel();

      this.socket.emit("message", { message: `${pseudo} joined the channel ${currentRoom}`, username: "System", room: currentRoom });

      this.previousRoom = currentRoom;
    }
  }
}
