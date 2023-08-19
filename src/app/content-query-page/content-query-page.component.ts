import {Component} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {parseJson} from "@angular/cli/src/utilities/json-file";
import {delay} from "rxjs";

@Component({
  selector: 'app-content-query-page',
  templateUrl: './content-query-page.component.html',
  styleUrls: ['./content-query-page.component.css']
})
export class ContentQueryPageComponent {
  search_request: string = '';
  type_of_record: string = '';
  results: any = [];
  API_BASE_URL: string = 'https://api.prov.vic.gov.au/search/';
  query_url: string = '';
  imageCache: { [key: string]: string } = {};

  RECORD_TYPES: string[] = ["File", "Document", "Map, Plan, Or Drawing", "Photograph or Image", "Volume", "Card",];
  chosen_record_types: string[] = ["Photograph or Image"];

  constructor(private http: HttpClient) {
  }

  constructQueryUrl(): string {
    const queryParams = `query?wt=json&q=(text%3A%22${encodeURIComponent(this.search_request)}%22)%20AND%20((record_form%3A%22${encodeURIComponent(this.selectOneRandomRecordTypes())}%22))%20AND%20(iiif-manifest%3A(*))`;
    return this.query_url = this.API_BASE_URL + queryParams;
  }

  selectOneRandomRecordTypes(): string {
    return this.type_of_record = this.chosen_record_types[Math.floor(Math.random() * this.chosen_record_types.length)];
  }

  SearchQuery() {
    if (!this.chosen_record_types.includes(this.type_of_record) && this.chosen_record_types.length == 0) {
      this.toggleTypeSelection('Photograph or Image') // Default
    }
    const queryUrl = this.constructQueryUrl();

    this.http.get<any>(queryUrl).subscribe({
      next: (data) => {
        if (data['response']['docs'][0] != undefined) {
          this.results = data['response']['docs'][0];
          console.log(this.results)
        } else {
          this.results = undefined;
          console.log(this.results)
        }


        if (this.results == undefined) {
          this.toggleTypeSelection(this.type_of_record);
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  toggleTypeSelection(record_type: string) {
    if (this.chosen_record_types.includes(record_type)) {
      this.chosen_record_types = this.chosen_record_types.filter(f => f !== record_type);
    } else {
      this.chosen_record_types.push(record_type);
    }
  }

  getImageURLFromManifest(url_to_manifest: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.get(url_to_manifest).subscribe(
        (manifest: any) => {
          let imageURL: any = manifest['sequences'][0]['rendering']['@id']
          console.log(imageURL);
          resolve(imageURL);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async downloadPDFFromManifest(pdfURLDownloadLink: any) {
    try {
      const imageURL = await this.getImageURLFromManifest(pdfURLDownloadLink['iiif-manifest']);
      console.log(imageURL); // Use the data returned from the HTTP request
      window.open(imageURL);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
}
