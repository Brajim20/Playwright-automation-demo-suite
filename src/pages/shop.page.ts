import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { ProductCard } from './product-card';
import { effectivePrice } from '../utils/price';

export type SortOption = 'menu_order' | 'popularity' | 'rating' | 'date' | 'price' | 'price-desc';

export class ShopPage extends BasePage {
  async goto(): Promise<void> {
    await this.page.goto('/shop/');
  }

  // ------------------------------------------------------------- product grid
  get productGrid(): Locator {
    return this.page.locator('ul.products');
  }

  get productCards(): Locator {
    return this.productGrid.locator('li.product');
  }

  product(name: string): ProductCard {
    return ProductCard.byName(this.page, name, this.productGrid);
  }

  /**
   * Read every rendered price off the grid, in DOM order.
   *
   * This is the method that gives the sorting test teeth: the old version selected a sort
   * option and then asserted three products were *visible*, which is true in any order.
   */
  async listedPrices(): Promise<number[]> {
    const texts = await this.productCards.locator('.price').allInnerTexts();
    return texts.map(effectivePrice);
  }

  async listedNames(): Promise<string[]> {
    const names = await this.productCards.locator('h3').allInnerTexts();
    return names.map((n) => n.trim());
  }

  // ----------------------------------------------------------------- sorting
  get sortDropdown(): Locator {
    return this.page.getByRole('combobox');
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
    /* WooCommerce submits the ordering form, so wait for the navigation to settle rather
       than sleeping and hoping. */
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ------------------------------------------------------------ price filter
  get priceFilterHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Filter by price' });
  }

  get filterButton(): Locator {
    return this.page.getByRole('button', { name: 'Filter' });
  }

  get priceRangeLabel(): Locator {
    return this.page.locator('.price_label');
  }

  get sliderHandles(): Locator {
    return this.page.locator('.ui-slider-handle');
  }

  /** Drag a jQuery UI slider handle horizontally by `offsetX` pixels. */
  async dragSliderHandle(index: number, offsetX: number): Promise<void> {
    const handle = this.sliderHandles.nth(index);
    await handle.waitFor();
    const box = await handle.boundingBox();
    if (!box) throw new Error(`Slider handle ${index} has no bounding box`);

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX + offsetX, startY, { steps: 10 });
    await this.page.mouse.up();
  }

  /** The min/max currently shown on the filter widget, parsed into numbers. */
  async selectedPriceRange(): Promise<{ min: number; max: number }> {
    const text = await this.priceRangeLabel.innerText();
    const amounts = text.match(/[\d,]+/g)?.map((n) => Number(n.replace(/,/g, ''))) ?? [];
    if (amounts.length < 2) {
      throw new Error(`Could not read a price range from ${JSON.stringify(text)}`);
    }
    return { min: amounts[0], max: amounts[amounts.length - 1] };
  }

  async applyPriceFilter(): Promise<void> {
    await this.filterButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ------------------------------------------------------------- categories
  get categoriesHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Product Categories' });
  }

  categoryLink(name: string): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  /** e.g. "Android (1)" -> 1 */
  async categoryCount(name: string): Promise<number> {
    const row = this.page.getByText(new RegExp(`${name}\\s*\\(\\d+\\)`, 'i')).first();
    const text = await row.innerText();
    const match = text.match(/\((\d+)\)/);
    if (!match) throw new Error(`No count found for category ${name} in ${JSON.stringify(text)}`);
    return Number(match[1]);
  }

  async openCategory(name: string): Promise<void> {
    await this.categoryLink(name).click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
