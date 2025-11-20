import {Component, inject} from '@angular/core';
import {NgOptimizedImage, CommonModule} from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

// @ts-ignore
import { Inventory, InventoryItem  } from '../inventory';
import { Signal } from '@angular/core';
let allItems: any[] = [];

@Component({
  selector: 'app-inventory-page',
  imports: [
    NgOptimizedImage,
    CommonModule
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
}




