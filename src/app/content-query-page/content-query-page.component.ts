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
  imageCache: { [key: string]: string } = {};

  // File - Requires download from prov website
  UNUSED_RECORD_TYPES: string[] = ["File"];
  RECORD_TYPES: string[] = ["Document", "Map, Plan, or Drawing", "Photograph or Image", "Volume", "Card"];
  chosen_record_types: string[] = ["Photograph or Image"];

  constructor(private http: HttpClient) {
  }

  constructQueryUrl(): string {
    const queryParams = `query?wt=json&q=(text%3A%22${encodeURIComponent(this.search_request)}%22)%20AND%20((record_form%3A%22${encodeURIComponent(this.selectOneRandomRecordTypes())}%22))%20AND%20(iiif-manifest%3A(*))`;
    return this.API_BASE_URL + queryParams;
  }

  selectOneRandomRecordTypes(): string {
    return this.type_of_record = this.chosen_record_types[Math.floor(Math.random() * this.chosen_record_types.length)];
  }

  SearchQuery(): Promise<any> {
    let queryUrl = this.constructQueryUrl();

    return new Promise((resolve, reject) => {
      this.http.get(queryUrl).subscribe(
        (data: any) => {
          if (data['response']['docs'][0] != undefined) {
            this.results = data['response']['docs'][0];
          } else {
              this.results = undefined;
          }
          resolve(this.results);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  toggleTypeSelection(record_type: string) {
    this.chosen_record_types = [];
    this.chosen_record_types.push(record_type);
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
