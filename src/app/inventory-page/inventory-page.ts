import {Component, inject} from '@angular/core';
import {NgOptimizedImage, CommonModule} from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

// @ts-ignore
import { Inventory, InventoryItem  } from '../inventory';
import { Signal } from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
let allItems: any[] = [];

@Component({
  selector: 'app-inventory-page',
  imports: [
    NgOptimizedImage,
    CommonModule,
    FormsModule
  ],
  templateUrl: './inventory-page.html',
  styleUrl: './inventory-page.css',
})

export class InventoryPage {

  ngOnInit() {
    this.inventoryService.login().subscribe(result => {
      if (result.access_token) {
        console.log(" Angular: Login successful!", result);
      } else {
        console.log(" Angular: Login failed:", result);
      }

      });
  }
  private inventoryService = inject(Inventory);
  inventoryItems: Signal<any[]> = this.inventoryService.getInventory();

  showCreateProduct = false;

  openCreateProduct() {
    this.showCreateProduct = true;
  }

  closeCreateProduct() {
    this.showCreateProduct = false;
  }

  formData: any = {};
  selectedFile: File | null = null;

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }




  createProduct() {
    const data = new FormData();
    for (const key of Object.keys(this.formData)) {
      data.append(key, this.formData[key]);
    }
    if (this.selectedFile) {
      data.append('image', this.selectedFile);
    }
    fetch('http://localhost:5000/api/createProduct', {
      method: 'POST',
      body: data,
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          this.showCreateProduct = false;
          // evt. opnieuw inventory ophalen
        } else {
          alert('Maken product mislukt!');
        }
      });
  }






}




