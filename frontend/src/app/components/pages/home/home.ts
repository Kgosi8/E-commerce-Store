import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Clothes } from '../../../shared/models/clothes';
import { Clothes_Service } from '../../../services/clothes/clothes';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  clothesList: Clothes[] = [];

  constructor(private clothesService: Clothes_Service) {
    this.clothesList = this.clothesService.getAll();
  }

}
