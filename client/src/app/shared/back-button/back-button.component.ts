

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrls: ['./back-button.component.scss']
})
export class BackButtonComponent implements OnInit {

  previousUrl: string;

  constructor(private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() { }


  onBack() {
    const currUrl: string[] = this.route.snapshot['_routerState'].url.substring(1).split('/');
    if (currUrl[0] === 'my-jobs') {
      currUrl.splice(-2, 2);
    } else {
      currUrl.splice(-1, 1);
    }
    this.router.navigate([(currUrl).join('/')]);
  }

}
