import { Component, OnInit } from '@angular/core';
import { Book } from '../../models/book';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-book-search',
  standalone: true,
  imports: [HttpClientModule,  CommonModule, ReactiveFormsModule],
  templateUrl: './book-search.component.html',
  styleUrl: './book-search.component.css'
})
export class BookSearchComponent implements OnInit {

  searchTerm = new FormControl('');
  books: any[] = [];
  loading = false;
  error = '';

  constructor(private httpClient: HttpClient) {}

  ngOnInit(): void {
    this.searchTerm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(query => {
          if (!query?.trim()) {
            this.books = [];
            return of(null);
          }
          this.loading = true;
          this.error = '';
          return this.httpClient.get(
            `https://www.googleapis.com/books/v1/volumes?q=${query}`
          );
        }),
        catchError(err => {
          this.error = 'Failed to fetch books.';
          this.loading = false;
          return of(null);
        })
      )
      .subscribe((res: any) => {
        this.loading = false;
        if (res && res.items) {
          this.books = res.items.map((item: any) => ({
            id: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors || ['Unknown'],
            thumbnail: item.volumeInfo.imageLinks?.thumbnail || ''
          }));
        } else {
          this.books = [];
        }
      });
  }
}