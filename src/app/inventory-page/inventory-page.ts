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
  categoryData: any = {};
  categories: any[] = [];
  groups: any[] = [];
  filteredItems: any[] = [];
  groupData: any = {};
  router: any;







  get productsToDisplay() {

    return this.filteredItems.length ? this.filteredItems : this.inventoryItems();
  }
  get totalQty(): number {
    const items = this.productsToDisplay;
    return items.reduce((sum, item) => {
      return sum + (Number(item.qty_available) || 0);
    }, 0);
  }

  get totalPrice(): number {
    const items = this.productsToDisplay;
    return items.reduce((sum, item) => {
      const qty = Number(item.qty_available) || 0;
      const price = Number(item.list_price) || 0;
      return sum + qty * price;
    }, 0);
  }

  ngOnInit() {
    this.inventoryService.login().subscribe(result => {
      if (result.access_token) {
        console.log(" Angular: Login successful!", result);
      } else {
        console.log(" Angular: Login failed:", result);
      }
      this.loadCategories();
      this.loadGroups();


      });

  }

  private inventoryService = inject(Inventory);
  inventoryItems: Signal<any[]> = this.inventoryService.getInventory();

  showCreateProduct = false;
  showCreateCategory = false;



  clearfilter() {
    this.filteredItems = [];
  }



  filterByGroup(group: any) {
    this.filteredItems = this.inventoryItems().filter(item =>
      item.x_frontend_group === group.x_name
    );
  }
  filterByCategory(category: any) {
    this.filteredItems = this.inventoryItems().filter(item =>
      item.x_frontend_category === category.x_name
    );
  }
  openCreateCategory() {
    this.showCreateCategory = true;
  }

  closeCreateCategory() {
    this.showCreateCategory = false;
  }

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
    this.inventoryService.createProduct(data).then((result: { success: any; }) => {
      if (result.success) {
        this.showCreateProduct = false;
        location.reload();
      } else {
        alert('Maken product mislukt!');
      }
    });
  }
  groupedCategories: { [groupId: number]: any[] } = {};
  loadCategories() {
    this.inventoryService.getCategories().then((categories: any[]) => {
      this.categories = categories;

      this.groupedCategories = {};
      categories.forEach(cat => {
        const groupId = cat.x_group_id?.[0]; // Odoo standaard: [id, name]
        if (!this.groupedCategories[groupId]) {
          this.groupedCategories[groupId] = [];
        }
        this.groupedCategories[groupId].push(cat);
      });
    });
  }
  loadGroups() {
    this.inventoryService.getGroups().then((data: any[]) => {
      this.groups = data;

    });
  }
    createCategory()
    {
      const data = new FormData();
      data.append('name', this.categoryData.display_name);
      data.append('group_id', this.categoryData.group_id);
      if (this.categoryData.parent_id) {
        data.append('parent_id', this.categoryData.parent_id);
      }
      this.inventoryService.createCategory(data).then((result: { success: any; }) => {
        if (result.success) {
          this.showCreateCategory = false;
          this.loadCategories();
        } else {
          alert('Maken categorie mislukt!');
        }
      });
    }
    createGroup() {
      const data = new FormData();
      data.append('name', this.groupData.name)
      this.inventoryService.createGroup(data).then((result: { success: any; }) => {
        if (result.success) {
          this.showCreateCategory = false;
          this.loadGroups();

        } else {
          alert('Maken groep mislukt!');
        }
        });
      }

  goToEdit(item: any) {
    this.router.navigate(['/edit', item.id]);
  }


  archiveProducts() {
    const idsToArchive = this.productsToDisplay
      .filter(item => item.qty_available === 0)
      .map(item => item.id);

    if (idsToArchive.length === 0) {
      alert('Geen producten om te archiveren.');
      return;
    }

    const data = new FormData();
    data.append('ids', JSON.stringify(idsToArchive));

    this.inventoryService.archiveProducts(data).then((result: { success: any; }) => {
      if (result.success) {
        alert('Producten succesvol gearchiveerd!');
        location.reload();
      } else {
        alert('Archiveren van producten mislukt!');
      }
    });
  }
}
