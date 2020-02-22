import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.css']
})
export class BackButtonComponent implements OnInit {

  constructor(private location: Location,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
  }


  onBack() {
    const currUrl: string[] = this.route.snapshot['_routerState'].url.substring(1).split('/');
    currUrl.splice(-1, 1);
    this.router.navigate([(currUrl).join('/')]);
  }

}
