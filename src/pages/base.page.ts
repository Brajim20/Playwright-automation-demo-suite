import type { Locator, Page } from '@playwright/test';

/**
 * Everything every page of the site shares: the masthead, the primary nav and the cart link.
 *
 * Page objects expose *locators and intent*, never assertions. Keeping `expect` out of the
 * page object is what lets one object serve a happy-path test and a negative test without
 * growing a flag for each.
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ------------------------------------------------------------------ header
  get siteLogo(): Locator {
    return this.page.locator('#site-logo').getByRole('link', { name: 'Automation Practice Site' });
  }

  get searchBox(): Locator {
    return this.page.getByRole('textbox', { name: 'Search' });
  }

  get cartLink(): Locator {
    return this.page.locator('#site-header').getByRole('link', { name: /items/ });
  }

  navLink(name: 'Home' | 'Shop' | 'My Account' | 'Test Cases' | 'AT Site' | 'Demo Site'): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  // ----------------------------------------------------------------- actions
  async clickLogo(): Promise<void> {
    await this.siteLogo.click();
  }

  async search(term: string): Promise<void> {
    await this.searchBox.fill(term);
    await this.searchBox.press('Enter');
  }

  async openShop(): Promise<void> {
    await this.navLink('Shop').click();
  }

  async openMyAccount(): Promise<void> {
    await this.navLink('My Account').click();
  }
}
