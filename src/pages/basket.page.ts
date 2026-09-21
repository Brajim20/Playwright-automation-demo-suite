import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { effectivePrice } from '../utils/price';

export class BasketPage extends BasePage {
  async goto(): Promise<void> {
    await this.page.goto('/basket/');
  }

  get rows(): Locator {
    return this.page.locator('tr.cart_item');
  }

  row(productName: string): Locator {
    return this.rows.filter({ hasText: productName });
  }

  async itemNames(): Promise<string[]> {
    const names = await this.rows.locator('td.product-name').allInnerTexts();
    return names.map((n) => n.trim());
  }

  async lineTotal(productName: string): Promise<number> {
    return effectivePrice(await this.row(productName).locator('td.product-subtotal').innerText());
  }

  async orderTotal(): Promise<number> {
    return effectivePrice(await this.page.locator('.order-total').innerText());
  }

  removeButton(productName: string): Locator {
    return this.row(productName).locator('a.remove');
  }

  async removeItem(productName: string): Promise<void> {
    const before = await this.rows.count();
    await this.removeButton(productName).click();
    /* Wait for the row to actually go, rather than sleeping. */
    await this.page.waitForFunction(
      (expected) => document.querySelectorAll('tr.cart_item').length === expected,
      before - 1,
    );
  }

  // ---------------------------------------------------------------- coupons
  get couponInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Coupon:' });
  }

  get applyCouponButton(): Locator {
    return this.page.getByRole('button', { name: 'Apply Coupon' });
  }

  async applyCoupon(code: string): Promise<void> {
    await this.couponInput.fill(code);
    await this.applyCouponButton.click();
  }

  get notice(): Locator {
    return this.page.locator('.woocommerce-error, .woocommerce-message, .woocommerce-info');
  }

  // -------------------------------------------------------------- checkout
  get proceedToCheckoutLink(): Locator {
    return this.page.getByRole('link', { name: 'Proceed to Checkout' });
  }

  get emptyBasketMessage(): Locator {
    return this.page.getByText('Your basket is currently empty');
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
