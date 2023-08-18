import { Component } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {parseJson} from "@angular/cli/src/utilities/json-file";

@Component({
  selector: 'app-content-query-page',
  templateUrl: './content-query-page.component.html',
  styleUrls: ['./content-query-page.component.css']
})
export class ContentQueryPageComponent {
  search_request: string = '';
  type_of_record: string = '';
  results: any = null;
  API_BASE_URL: string = 'https://api.prov.vic.gov.au/search/';
  query_url: string = '';

  RECORD_TYPES: string[] = ["File", "Document", "Map, Plan, Or Drawing", "Photograph or Image", "Volume", "Card",];
  chosen_record_types: string[] = ["Photograph or Image"];

  constructor(private http: HttpClient) {}

  constructQueryUrl(): string {
    const queryParams = `query?wt=json&q=(text%3A%22${encodeURIComponent(this.search_request)}%22)%20AND%20((record_form%3A%22${encodeURIComponent(this.selectOneRandomRecordTypes())}%22))%20AND%20(iiif-manifest%3A(*))`;
    return this.query_url = this.API_BASE_URL + queryParams;
  }

  selectOneRandomRecordTypes(): string {
    return this.chosen_record_types[Math.floor(Math.random() * this.chosen_record_types.length)];
  }

  SearchQuery() {
    console.log(this.search_request)

    const queryUrl = this.constructQueryUrl();

    this.http.get<any>(queryUrl).subscribe(
      (data) => {
        this.results = data;
        console.log(data); // Display the response data in the console
      },
      (error) => {
        console.error(error); // Display any errors in the console
      }
    );
  }

  toggleTypeSelection(record_type: string) {
    if (this.chosen_record_types.includes(record_type)) {
      this.chosen_record_types = this.chosen_record_types.filter(f => f !== record_type);
    } else {
      this.chosen_record_types.push(record_type);
    }
  }
}