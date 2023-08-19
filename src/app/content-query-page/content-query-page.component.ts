import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
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
        this.results = data['response']['docs'][0];
        console.log(this.results);

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

  getImageURLFromManifest(url_to_manifest: string): string {
    if (this.imageCache[url_to_manifest]) {
      return this.imageCache[url_to_manifest]
    } else {
      this.http.get<any>(url_to_manifest).subscribe({
          next: (manifest) => {
            this.imageCache[url_to_manifest] = manifest['iiif-manifest'];
            console.log(manifest['iiif-manifest']);
            return manifest['iiif-manifest'];
          },
          error: (error) => {
            this.imageCache[url_to_manifest] = '';
            console.error('Error fetching manifest JSON:', error);
          },
          complete: () => {
          }
        }
      );
    }

    return '';
  }

  downloadPDFFromManifest(pdfURLDownloadLink: any) {
    console.log(pdfURLDownloadLink);
    const anchor = document.createElement('a');
    const manifest: any = this.getImageURLFromManifest(pdfURLDownloadLink['iiif-manifest']);
    anchor.href = manifest['sequences'][0]['rendering']['@id'];
    anchor.download = pdfURLDownloadLink['_id'] + ".pdf"; // filename
    console.log(anchor);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
