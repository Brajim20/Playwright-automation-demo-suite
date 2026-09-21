import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';
import type { BillingDetails } from '../utils/test-data';

export type PaymentMethod =
  'Direct Bank Transfer' | 'Check Payments' | 'Cash on Delivery' | 'PayPal';

export class CheckoutPage extends BasePage {
  async goto(): Promise<void> {
    await this.page.goto('/checkout/');
  }

  // ------------------------------------------------------- returning customer
  get returningCustomerToggle(): Locator {
    return this.page.getByRole('link', { name: 'Click here to login' });
  }

  get inlineLoginForm(): Locator {
    return this.page.locator('form.login');
  }

  /**
   * Expand the "Returning customer?" panel and sign in.
   *
   * The toggle is a JS slide-down, so the reliable signal is the form becoming visible --
   * the old spec clicked the link twice in a row with a 1s sleep between, which is the same
   * idea expressed as a guess.
   */
  async loginAsReturningCustomer(email: string, password: string): Promise<void> {
    await this.returningCustomerToggle.click();
    await this.inlineLoginForm.waitFor({ state: 'visible' });

    await this.inlineLoginForm.getByRole('textbox', { name: 'Username or email' }).fill(email);
    await this.inlineLoginForm.locator('input[type="password"]').fill(password);
    await this.inlineLoginForm.getByRole('button', { name: 'Login' }).click();
    await this.billingHeading.waitFor({ state: 'visible' });
  }

  // ------------------------------------------------------------------ billing
  get billingHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Billing Details' });
  }

  get additionalInfoHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Additional Information' });
  }

  get firstNameInput(): Locator {
    return this.page.locator('#billing_first_name');
  }

  get lastNameInput(): Locator {
    return this.page.locator('#billing_last_name');
  }

  get emailInput(): Locator {
    return this.page.locator('#billing_email');
  }

  get phoneInput(): Locator {
    return this.page.locator('#billing_phone');
  }

  get addressInput(): Locator {
    return this.page.locator('#billing_address_1');
  }

  get cityInput(): Locator {
    return this.page.locator('#billing_city');
  }

  get postcodeInput(): Locator {
    return this.page.locator('#billing_postcode');
  }

  get orderNotesInput(): Locator {
    return this.page.locator('#order_comments');
  }

  async fillBillingDetails(details: BillingDetails): Promise<void> {
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    await this.phoneInput.fill(details.phone);
    await this.addressInput.fill(details.address);
    await this.cityInput.fill(details.city);
    await this.postcodeInput.fill(details.postcode);
    await this.orderNotesInput.fill(details.orderNotes);
  }

  // ------------------------------------------------------------------ order
  get orderSummaryHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Your order' });
  }

  get orderReviewRows(): Locator {
    return this.page.locator('.shop_table tbody tr');
  }

  paymentMethodOption(method: PaymentMethod): Locator {
    return this.page.getByRole('radio', { name: method });
  }

  get paymentMethods(): Locator {
    return this.page.locator('.wc_payment_methods li');
  }

  get placeOrderButton(): Locator {
    return this.page.getByRole('button', { name: 'Place order' });
  }

  async selectPaymentMethod(method: PaymentMethod): Promise<void> {
    await this.paymentMethodOption(method).check();
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
    await this.orderConfirmation.waitFor({ state: 'visible' });
  }

  // ----------------------------------------------------------- confirmation
  get orderConfirmation(): Locator {
    return this.page.getByText('Thank you. Your order has been received.');
  }

  get orderNumber(): Locator {
    return this.page.locator('.order strong').first();
  }

  get orderDetailsHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Order Details' });
  }

  get customerDetailsHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Customer Details' });
  }

  async orderNumberText(): Promise<string> {
    return (await this.orderNumber.innerText()).trim();
  }
}
