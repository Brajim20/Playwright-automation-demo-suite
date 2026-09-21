import type { Locator, Page } from '@playwright/test';
import { effectivePrice } from '../utils/price';

/**
 * A component object for a single product tile.
 *
 * The suite used to assert on the tile's flattened text, e.g.
 *   getByText('Sale! Thinking in HTML ₹450.00 ₹400.00 Add to basket')
 * which breaks the moment a sale ends, a price changes or the theme reorders the tile.
 * Locating the card by its product-name heading and then reaching for named sub-parts
 * survives all three.
 */
export class ProductCard {
  readonly root: Locator;

  constructor(root: Locator) {
    this.root = root;
  }

  /**
   * Find a card by product name.
   *
   * @param page  the page under test
   * @param name  product name, matched as a case-insensitive substring
   * @param scope optional container to search inside (e.g. the "New arrivals" widget), so the
   *              same object works on the home page and the shop grid
   */
  static byName(page: Page, name: string, scope?: Locator): ProductCard {
    const container = scope ?? page.locator('body');
    const root = container
      .locator('li.product')
      .filter({ has: page.getByRole('heading', { name }) })
      .first();
    return new ProductCard(root);
  }

  get title(): Locator {
    return this.root.getByRole('heading').first();
  }

  get priceBlock(): Locator {
    return this.root.locator('.price').first();
  }

  get addToBasketButton(): Locator {
    return this.root.getByRole('link', { name: 'Add to basket' });
  }

  get viewBasketButton(): Locator {
    return this.root.getByRole('link', { name: 'View Basket' });
  }

  get saleBadge(): Locator {
    return this.root.locator('.onsale');
  }

  async name(): Promise<string> {
    return (await this.title.innerText()).trim();
  }

  /** The amount the customer pays -- the sale price when the product is discounted. */
  async price(): Promise<number> {
    return effectivePrice(await this.priceBlock.innerText());
  }

  async addToBasket(): Promise<void> {
    await this.addToBasketButton.click();
    /* WooCommerce swaps the button for "View Basket" once the AJAX add resolves. Waiting on
       that swap is the real signal -- it is what the old `waitForTimeout(2000)` was guessing at. */
    await this.viewBasketButton.waitFor({ state: 'visible' });
  }
}
