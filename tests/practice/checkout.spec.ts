import { authenticatedTest as test, expect } from '../../src/fixtures/test-fixtures';
import { buildBillingDetails } from '../../src/utils/test-data';

/* Checkout runs as the account created by the `setup` project. */

const PRODUCT = 'Selenium Ruby';

test.describe('Checkout', () => {
  test.beforeEach(async ({ shopPage, basketPage }) => {
    await shopPage.goto();
    await shopPage.product(PRODUCT).addToBasket();
    await basketPage.goto();
    await basketPage.proceedToCheckout();
  });

  test('the checkout form renders billing, order summary and payment methods @smoke', async ({
    checkoutPage,
  }) => {
    await expect(checkoutPage.billingHeading).toBeVisible();
    await expect(checkoutPage.additionalInfoHeading).toBeVisible();
    await expect(checkoutPage.orderSummaryHeading).toBeVisible();

    for (const field of [
      checkoutPage.firstNameInput,
      checkoutPage.lastNameInput,
      checkoutPage.phoneInput,
      checkoutPage.addressInput,
      checkoutPage.cityInput,
      checkoutPage.postcodeInput,
    ]) {
      await expect(field).toBeVisible();
    }

    const methods = await checkoutPage.paymentMethods.allInnerTexts();
    expect(methods.join(' ')).toMatch(/Direct Bank Transfer/i);
    expect(methods.join(' ')).toMatch(/Cash on Delivery/i);
  });

  test('submitting with an empty billing form is rejected @regression', async ({
    checkoutPage,
    page,
  }) => {
    await checkoutPage.firstNameInput.fill('');
    await checkoutPage.lastNameInput.fill('');
    await checkoutPage.selectPaymentMethod('Cash on Delivery');
    await checkoutPage.placeOrderButton.click();

    await expect(page.locator('.woocommerce-error')).toBeVisible();
    await expect(checkoutPage.orderConfirmation).toBeHidden();
  });

  test('a complete order is placed and confirmed @smoke', async ({ checkoutPage }) => {
    const billing = buildBillingDetails();

    await test.step('Fill the billing form', async () => {
      await checkoutPage.fillBillingDetails(billing);
    });

    await test.step('Pay cash on delivery', async () => {
      await checkoutPage.selectPaymentMethod('Cash on Delivery');
      await checkoutPage.placeOrder();
    });

    await test.step('The confirmation echoes what was submitted', async () => {
      await expect(checkoutPage.orderConfirmation).toBeVisible();
      await expect(checkoutPage.orderDetailsHeading).toBeVisible();
      await expect(checkoutPage.customerDetailsHeading).toBeVisible();

      /* An order number that is actually a number -- the old test only checked that the
         label "Order Number:" was on screen, which it is even when the value is blank. */
      expect(await checkoutPage.orderNumberText()).toMatch(/\d+/);
    });
  });
});
