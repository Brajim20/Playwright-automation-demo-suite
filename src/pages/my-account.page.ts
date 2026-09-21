import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';
import type { TestUser } from '../utils/test-data';

export class MyAccountPage extends BasePage {
  async goto(): Promise<void> {
    await this.page.goto('/my-account/');
  }

  // ------------------------------------------------------------- login form
  get loginHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Login' });
  }

  get usernameInput(): Locator {
    return this.page.locator('#username');
  }

  get passwordInput(): Locator {
    return this.page.locator('#password');
  }

  get rememberMeCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Remember me' });
  }

  get loginButton(): Locator {
    return this.page.getByRole('button', { name: 'Login' });
  }

  get lostPasswordLink(): Locator {
    return this.page.getByRole('link', { name: 'Lost your password?' });
  }

  async login(email: string, password: string): Promise<void> {
    await this.usernameInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // ---------------------------------------------------------- register form
  get registerHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Register' });
  }

  get registerEmailInput(): Locator {
    return this.page.locator('#reg_email');
  }

  get registerPasswordInput(): Locator {
    return this.page.locator('#reg_password');
  }

  get registerButton(): Locator {
    return this.page.getByRole('button', { name: 'Register' });
  }

  /**
   * One clean pass: fill, submit, wait for the dashboard.
   *
   * The original spec filled the password twice with two different values, double-clicked
   * Register, clicked Login, then repeated the whole sequence -- a "poke it until it goes
   * green" artifact rather than a description of how a user registers.
   */
  async register(user: TestUser): Promise<void> {
    await this.registerEmailInput.fill(user.email);
    await this.registerPasswordInput.fill(user.password);
    await this.registerButton.click();
    await this.dashboardIntro.waitFor({ state: 'visible' });
  }

  // ---------------------------------------------------------- lost password
  get lostPasswordInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Username or email' });
  }

  get resetPasswordButton(): Locator {
    return this.page.getByRole('button', { name: 'Reset Password' });
  }

  async requestPasswordReset(identifier: string): Promise<void> {
    await this.lostPasswordInput.fill(identifier);
    await this.resetPasswordButton.click();
  }

  // --------------------------------------------------------------- feedback
  /** WooCommerce renders both validation errors and success notices in this region. */
  get notice(): Locator {
    return this.page.locator('.woocommerce-error, .woocommerce-message, .woocommerce-info');
  }

  // -------------------------------------------------------------- dashboard
  get dashboardIntro(): Locator {
    return this.page.getByText('From your account dashboard');
  }

  get greeting(): Locator {
    return this.page.getByText(/^Hello /);
  }

  get logoutLink(): Locator {
    return this.page.getByRole('link', { name: 'Logout' });
  }

  dashboardNavLink(
    name: 'Dashboard' | 'Orders' | 'Downloads' | 'Addresses' | 'Account Details' | 'Logout',
  ): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  async openDashboardSection(
    name: 'Dashboard' | 'Orders' | 'Downloads' | 'Addresses' | 'Account Details',
  ): Promise<void> {
    await this.dashboardNavLink(name).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
    await this.loginButton.waitFor({ state: 'visible' });
  }

  async isLoggedIn(): Promise<boolean> {
    return this.logoutLink.isVisible();
  }
}
