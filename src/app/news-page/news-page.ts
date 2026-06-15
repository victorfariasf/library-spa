import { Component, OnInit, inject } from '@angular/core';
import { OpenLibraryExternal } from '../service/open-library-external';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-page.html',
  styleUrl: './news-page.sass',
})
export class NewsPage implements OnInit {
  private readonly openLibraryExternal = inject(OpenLibraryExternal);

  public newsList: any[] = [];
  public loading = true;
  public error = '';

  ngOnInit(): void {
    this.loading = true;
    this.openLibraryExternal
      .getLiteratureNews()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (rsp) => {
          this.newsList = rsp;
        },
        error: () => {
          this.error = 'Não foi possível carregar as notícias agora.';
          this.newsList = [];
        },
      });
  }
}
