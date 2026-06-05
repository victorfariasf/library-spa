import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OpenLibraryExternal {
  private readonly apiUrl = 'https://newsapi.org/v2/everything';
  private readonly apiKey = "15abea57795b43d89a1dad8147b23ced";

  constructor(private http: HttpClient) {}

  getLiteratureNews(): Observable<any> {
    const params = new HttpParams()
      .set('q', 'Livros')
      .set('language', 'pt')
      .set('sortBy', 'publishedAt')
      .set('pageSize', 10)
      .set('apiKey', this.apiKey);

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => response.articles)
    );
  }

  searchNews(query: string): Observable<any> {
    const params = new HttpParams()
      .set('q', query)
      .set('language', 'en')
      .set('sortBy', 'publishedAt')
      .set('pageSize', 12)
      .set('apiKey', this.apiKey);

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => response.articles)
    );
  }
}
