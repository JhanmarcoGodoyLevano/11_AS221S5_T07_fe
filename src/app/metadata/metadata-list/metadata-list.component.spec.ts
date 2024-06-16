import { Component, OnInit } from '@angular/core';
import { MetadataService } from '../../services/metadata.service';
import { IMetadata, ICreateMetadata } from '../../interfaces/metadata.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-metadata-list',
  templateUrl: './metadata-list.component.html',
  styleUrls: ['./metadata-list.component.css'],
})
export class MetadataListComponent implements OnInit {
  metadataList: IMetadata[] = [];
  paginatedMetadataList: IMetadata[] = [];
  showActive = true;
  showForm = false;
  showEditForm = false;
  newMetadataUrl: string = '';
  currentPage = 1;
  itemsPerPage = 4;
  selectedMetadata: IMetadata = {
    id: 0,
    title: '',
    publicationDate: '',
    publicationTime: '',
    imageUrl: '',
    feeds: '',
    authors: '',
    active: ''
  };
  originalMetadata: IMetadata = { ...this.selectedMetadata };

  constructor(private metadataService: MetadataService) {}

  ngOnInit(): void {
    this.loadMetadata();
  }

  loadMetadata(): void {
    if (this.showActive) {
      this.metadataService.findAllActive().subscribe(
        (data) => {
          this.metadataList = data;
          this.currentPage = 1;
          this.paginateMetadataList();
          console.log('Active metadatos recuperados:', this.metadataList);
        },
        (error) => {
          console.error('Error al obtener los metadatos activos:', error);
        }
      );
    } else {
      this.metadataService.findAllInactive().subscribe(
        (data) => {
          this.metadataList = data;
          this.currentPage = 1;
          this.paginateMetadataList();
          console.log('Inactive metadatos recuperados:', this.metadataList);
        },
        (error) => {
          console.error('Error al obtener los metadatos inactivos:', error);
        }
      );
    }
  }
}