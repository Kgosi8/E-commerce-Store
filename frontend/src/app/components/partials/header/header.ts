import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatIconModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

}
