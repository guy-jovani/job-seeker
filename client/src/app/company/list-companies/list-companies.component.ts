import { Component, Input } from '@angular/core';
import { Company } from '../company.model';

@Component({
  selector: 'app-list-companies',
  templateUrl: './list-companies.component.html',
  styleUrls: ['./list-companies.component.scss']
})
export class ListCompaniesComponent {

  @Input() companies: Company[];
  @Input() userId: string = null;

  trackCompanies(index: number, company: Company) {
    return company._id;
  }
}
