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

  paginateMetadataList(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedMetadataList = this.metadataList.slice(start, end);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.paginateMetadataList();
  }

  totalPages(): number {
    return Math.ceil(this.metadataList.length / this.itemsPerPage);
  }

  toggleActiveInactive(): void {
    this.showActive = !this.showActive;
    this.loadMetadata();
  }

  addMetadata(): void {
    this.showForm = true;
  }

  submitMetadata(): void {
    if (!this.newMetadataUrl) {
      Swal.fire('Advertencia', 'No has agregado ningún metadato', 'warning');
      return;
    }

    const newMetadata: ICreateMetadata = {
      url: this.newMetadataUrl,
      features: { metadata: {} },
    };

    this.metadataService.addMetadata(newMetadata).subscribe(
      () => {
        this.newMetadataUrl = '';
        this.loadMetadata();
        Swal.fire('¡Éxito!', 'Metadato agregado correctamente', 'success');
      },
      (error) => {
        console.error('Error al añadir el metadato:', error);
        Swal.fire('¡Error!', 'Hubo un problema al agregar el metadato', 'error');
      }
    );
  }

  confirmActivateMetadata(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Estás a punto de activar este metadato.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.activateMetadata(id);
      }
    });
  }

  confirmDeactivateMetadata(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Estás a punto de desactivar este metadato.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deactivateMetadata(id);
      }
    });
  }

  activateMetadata(id: number): void {
    this.metadataService.activateMetadata(id).subscribe(
      (response) => {
        console.log(`Metadato ${id} activado`, response);
        this.loadMetadata();
        Swal.fire('¡Éxito!', 'Metadato activado correctamente', 'success');
      },
      (error) => console.error('Error al activar metadato:', error)
    );
  }

  deactivateMetadata(id: number): void {
    this.metadataService.deactivateMetadata(id).subscribe(
      (response) => {
        console.log(`Metadato ${id} desactivado`, response);
        this.loadMetadata();
        Swal.fire('¡Éxito!', 'Metadato desactivado correctamente', 'success');
      },
      (error) => console.error('Error al desactivar metadato:', error)
    );
  }

  editMetadata(id: number): void {
    console.log('Edit metadata with ID:', id);
    const metadata = this.metadataList.find(metadata => metadata.id === id);
    if (metadata) {
        // Dividir la fecha y hora de publicación en dos campos separados
        this.selectedMetadata = { 
            ...metadata,
            publicationDate: this.formatDate(metadata.publicationDate), // Obtener solo la fecha
            publicationTime: this.formatTime(metadata.publicationDate)  // Obtener solo la hora
        };
        this.originalMetadata = { ...metadata }; // Guardar copia del metadato original
        this.showEditForm = true;
    }
}

// Método para obtener solo la fecha de la cadena de fecha y hora
formatDate(dateTimeString: string): string {
    return dateTimeString.split('T')[0];
}

// Método para obtener solo la hora de la cadena de fecha y hora
formatTime(dateTimeString: string): string {
    return dateTimeString.split('T')[1].substring(0, 5); // Obtener solo las primeras 5 posiciones (hh:mm)
}

updateMetadata(): void {
  console.log('Update metadata:', this.selectedMetadata);

  // Reunir la fecha y hora en un solo campo "publicationDate"
  this.selectedMetadata.publicationDate = `${this.selectedMetadata.publicationDate}T${this.selectedMetadata.publicationTime}`;

  if (JSON.stringify(this.selectedMetadata) === JSON.stringify(this.originalMetadata)) {
      Swal.fire('Información', 'No se han realizado cambios', 'info');
      return;
  }

  // Parsear los campos feeds y authors si son cadenas JSON
  try {
      this.selectedMetadata.feeds = JSON.parse(this.selectedMetadata.feeds);
      this.selectedMetadata.authors = JSON.parse(this.selectedMetadata.authors);
  } catch (error) {
      console.error('Error parsing feeds or authors:', error);
      Swal.fire('¡Error!', 'Hubo un problema al parsear los datos', 'error');
      return;
  }

  Swal.fire({
      title: '¿Estás seguro?',
      text: 'Estás a punto de actualizar este metadato.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
  }).then((result) => {
      if (result.isConfirmed) {
          this.metadataService.updateMetadata(this.selectedMetadata).subscribe(
              (response) => {
                  console.log('Metadata updated successfully:', response);
                  this.loadMetadata();
                  this.showEditForm = false;
                  Swal.fire('¡Éxito!', 'Metadato actualizado correctamente', 'success');
              },
              (error) => {
                  console.error('Error updating metadata:', error);
                  Swal.fire('¡Error!', 'Hubo un problema al actualizar el metadato', 'error');
              }
          );
      }
  });
}
  
  truncateTitle(title: string, maxLength: number): string {
    return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
  }

  displayFeeds(feeds: string): string[] {
    if (!feeds || feeds === '[]') {
      return ['Sin Feeds'];
    }
    try {
      const parsedFeeds = JSON.parse(feeds);
      const maxLength = 30;
      const formattedFeeds = parsedFeeds.map((feed: { link: string }) => {
        let formattedLink = feed.link;
        if (formattedLink.length > maxLength) {
          formattedLink = formattedLink.substring(0, maxLength) + '...';
        }
        return formattedLink;
      });
      return formattedFeeds;
    } catch (e) {
      console.error('Error parsing feeds:', e);
      return ['Invalid feeds format'];
    }
  }

  displayAuthors(authors: string): string {
    if (!authors || authors === '[]') {
      return 'Sin Autores';
    }
    try {
      const parsedAuthors = JSON.parse(authors);
      const authorNames = parsedAuthors.map((author: any) => author.name);
      const maxLength = 22;
      let formattedAuthors = authorNames.join(', ');
      if (formattedAuthors.length > maxLength) {
        formattedAuthors = formattedAuthors.substring(0, maxLength) + '...';
      }
      return formattedAuthors;
    } catch (e) {
      console.error('Error parsing authors:', e);
      return 'Invalid authors format';
    }
  }
}