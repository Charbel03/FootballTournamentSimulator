import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Country, CountryDTO } from '../interfaces/countries';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  
  private apiUrl = 'https://restcountries.com/v3.1';

  constructor(private http: HttpClient) {}

  getCountries(): Observable<Country[]> {
    return this.http.get<CountryDTO[]>(`${this.apiUrl}/all?fields=name,flags`)
      .pipe(
        map((countries) => countries.map((country) => new Country(country)))
      );
  }

}
