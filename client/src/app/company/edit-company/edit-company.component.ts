import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import {switchMap } from 'rxjs/operators';

import { Company } from '../company.model';
import * as fromApp from '../../store/app.reducer';
import * as CompanyActions from '../store/company.actions';
import { Employee } from '../../employees/employee.model';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-edit-company',
  templateUrl: './edit-company.component.html',
  styleUrls: ['./edit-company.component.css']
})
export class EditCompanyComponent implements OnInit {
  edit: boolean;
  index: number;
  errorMessages: string[];
  authState: Subscription;
  // user: Company;
  company: Company;
  imagePreview: string;
  companyForm: FormGroup;
 
  @ViewChild('name', {static: true, read: ElementRef}) nameInput: ElementRef;
  @ViewChild('image', {static: true, read: ElementRef}) imageInput: ElementRef;

  constructor(
    private store: Store<fromApp.AppState>,
    private router: Router,
    private route: ActivatedRoute
  ){}

  ngOnInit() {
    this.companyForm = new FormGroup({
      'name': new FormControl(null, [Validators.required]),
      'description': new FormControl(null),
      'website': new FormControl(null),
      'image': new FormControl(null, { asyncValidators : [mimeType]}),
    });

    this.authState = this.store.select('auth')
      .subscribe(authState => {
        if(authState.messages){
          for(let msg of authState.messages){
            this.errorMessages.push(msg)
          }
        } else {
          this.errorMessages = [];
        }
        this.company = <Company> authState.user;
        this.nameInput.nativeElement.focus();
        this.nameInput.nativeElement.blur();
        this.initForm();
      }); 

    // this.authState = this.store.select('auth')
    //   .pipe(
    //     switchMap(authState => {
    //       this.company = <Company> authState.user;
    //       return this.store.select('company');
    //     })).
    //     subscribe(companyState => {
    //       if(companyState.messages){
    //         for(let msg of companyState.messages){
    //           this.errorMessages.push(msg)
    //         }
    //       } else {
    //         this.errorMessages = [];
    //       }
    //       this.nameInput.nativeElement.focus();
    //       this.nameInput.nativeElement.blur();
    //       const currUrl = this.route.snapshot['_routerState'].url.substring(1).split('/');
    //       if(currUrl[1] !== 'register'){
    //         // if(currUrl[0] === 'my-details' && this.employee){
    //         //   this.company = companyState.companies
    //         //       .filter(comp => comp.creatorId === this.employee._id)[currUrl[1]];
    //         // } else {
    //           this.company = companyState.companies[currUrl[1]];
    //         }
    //         this.initForm();
    //       // }
    //     }); 
  }

  initForm(){
    this.companyForm.setValue({
      'name': this.company.name,
      'description': this.company.description || "",
      'website': this.company.website || "",
      'image': this.company.image || "",
    });   
  }

  handleImageInput(event: Event){
    const file = (event.target as HTMLInputElement).files[0]; 
    if (file) {
      this.companyForm.patchValue({ image: file });
      this.companyForm.get("image").updateValueAndValidity();
      const reader = new FileReader();
      reader.readAsDataURL(file); // read file as data url
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.imagePreview = reader.result as string;
      }
    }
  }

  onSubmit(){
    const name = this.companyForm.value.name;
    const description = this.companyForm.value.description ? this.companyForm.value.description : undefined;
    const website = this.companyForm.value.website ? this.companyForm.value.website : undefined;
    const newCompany = new Company({name});
    if(description) newCompany.description = description;
    if(website) newCompany.website = website;
    if(this.companyForm.value.image){
      newCompany.image = this.companyForm.value.image;
    }
    newCompany._id = this.company._id;
    this.store.dispatch(new CompanyActions.UpdateSingleCompanyInDb(newCompany));
  }

  onCancel(){
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  onRemoveImage(){
    this.companyForm.patchValue({ image: '' })
    this.imageInput.nativeElement.value = '';
    this.imagePreview = "";
  }

  onDelete(){
    // this.store.dispatch(new EmployeeActions.DeleteEmployeeFromDB(this.index));
  }

  ngOnDestroy(){
    if(this.authState){
      this.authState.unsubscribe();
    }
  }

  onClose(){
    this.store.dispatch(new CompanyActions.ClearError());
  }
}
