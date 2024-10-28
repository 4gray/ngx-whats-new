import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxWhatsNewComponent } from 'projects/ngx-whats-new/src/public-api';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxWhatsNewComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
