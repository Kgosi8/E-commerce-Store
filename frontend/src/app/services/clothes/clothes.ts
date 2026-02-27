import { Injectable } from '@angular/core';
import { Clothes } from '../../shared/models/clothes';
import { sample_clothes } from '../../data';

@Injectable({
  providedIn: 'root',
})
export class Clothes_Service {

  constructor() {}

  getAll(): Clothes[] {
    return sample_clothes;
    
  }
  
}
