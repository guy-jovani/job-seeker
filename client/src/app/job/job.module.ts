
import { NgModule } from '@angular/core';

import { JobComponent } from './job.component';
import { EditJobComponent } from './edit-job/edit-job.component';
import { ListJobsComponent } from './list-jobs/list-jobs.component';
import { JobRoutingModule } from './job-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { DetailsJobComponent } from './details-job/details-job.component';





@NgModule({
  declarations: [
    JobComponent,
    EditJobComponent,
    ListJobsComponent,
    DetailsJobComponent,
  ],
  imports: [
    SharedModule,
    JobRoutingModule,
  ],
  exports: [
    JobComponent,
    ListJobsComponent
  ]
})
export class JobModule {}



