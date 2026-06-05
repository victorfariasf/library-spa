import { Component } from '@angular/core';
import { OpenLibraryExternal } from '../service/open-library-external';
import {CommonModule} from "@angular/common";
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule],
  templateUrl: './news-page.html',
  styleUrl: './news-page.sass',
})
export class NewsPage {

  public newsList: any[] = [];
  public loading = true;

  constructor(private openLibraryExternal: OpenLibraryExternal, private spinner: NgxSpinnerService) {}

  ngOnInit() {
    this.spinner.show();
    this.openLibraryExternal.getLiteratureNews().subscribe(rsp => {
      this.newsList = rsp;
      console.log(this.newsList);
      this.spinner.hide();
    });
  }
}
