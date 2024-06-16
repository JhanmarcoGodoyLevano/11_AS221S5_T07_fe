import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MetadataListComponent } from './metadata/metadata-list/metadata-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: AppComponent },
  { path: 'perfil', component: MetadataListComponent },
  { path: 'configuracion', component: AppComponent },
  { path: 'salir', component: AppComponent },
  // Otras rutas...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}


