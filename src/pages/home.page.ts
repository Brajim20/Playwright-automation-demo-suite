import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { ProductCard } from './product-card';

export class HomePage extends BasePage {
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  // ------------------------------------------------------------------ banner
  get bannerSlider(): Locator {
    return this.page.locator('[id^="n2-ss-"]').first();
  }

  get nextSlideButton(): Locator {
    return this.page.locator('#n2-ss-6-arrow-next');
  }

  get previousSlideButton(): Locator {
    return this.page.locator('#n2-ss-6-arrow-previous');
  }

  slideImage(name: string): Locator {
    return this.page.getByRole('img', { name, exact: true });
  }

  async nextSlide(): Promise<void> {
    await this.nextSlideButton.click();
  }

  async previousSlide(): Promise<void> {
    await this.previousSlideButton.click();
  }

  // ----------------------------------------------------------- new arrivals
  get newArrivalsHeading(): Locator {
    return this.page.getByRole('heading', { name: 'New Arrivals' });
  }

  /** The widget row that holds the three featured products. */
  get newArrivals(): Locator {
    return this.page.locator('.products').first();
  }

  product(name: string): ProductCard {
    return ProductCard.byName(this.page, name);
  }

  // ----------------------------------------------------------------- footer
  get footer(): Locator {
    return this.page.locator('.footer-widgets');
  }

  get subscribeHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Subscribe Here' });
  }

  get subscribeEmailInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Your email address' });
  }

  get subscribeButton(): Locator {
    return this.page.getByRole('button', { name: 'Subscribe' });
  }

  get subscribeWidget(): Locator {
    return this.page.locator('[id^="mc4wp_form_widget"]');
  }

  async subscribe(email: string): Promise<void> {
    await this.subscribeEmailInput.fill(email);
    await this.subscribeButton.click();
  }
}
