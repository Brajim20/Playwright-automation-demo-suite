import { test, expect } from '../../src/fixtures/test-fixtures';

/* Each test starts from an empty basket so they can run in any order, in parallel. */
test.use({ storageState: { cookies: [], origins: [] } });

const PRODUCT = 'Selenium Ruby';
const SECOND_PRODUCT = 'Thinking in HTML';

test.describe('Basket', () => {
  test.beforeEach(async ({ shopPage }) => {
    await shopPage.goto();
  });

  test('adding a product puts it in the basket at its listed price @smoke', async ({
    shopPage,
    basketPage,
  }) => {
    const card = shopPage.product(PRODUCT);
    const listedPrice = await card.price();

    await card.addToBasket();
    await basketPage.goto();

    await expect(basketPage.row(PRODUCT)).toBeVisible();
    /* Carrying the listed price through to the basket line is the behaviour under test.
       Reading it off the card rather than hard-coding ₹500.00 means a price change on the
       site does not turn into a false failure here. */
    expect(await basketPage.lineTotal(PRODUCT)).toBe(listedPrice);
  });

  test('the basket total is the sum of its lines @regression', async ({ shopPage, basketPage }) => {
    await shopPage.product(PRODUCT).addToBasket();
    await shopPage.product(SECOND_PRODUCT).addToBasket();

    await basketPage.goto();
    await expect(basketPage.rows).toHaveCount(2);

    const lines = [await basketPage.lineTotal(PRODUCT), await basketPage.lineTotal(SECOND_PRODUCT)];
    expect(await basketPage.orderTotal()).toBe(lines[0] + lines[1]);
  });

  test('removing a product takes it out of the basket @regression', async ({
    shopPage,
    basketPage,
  }) => {
    await shopPage.product(PRODUCT).addToBasket();
    await shopPage.product(SECOND_PRODUCT).addToBasket();

    await basketPage.goto();
    await basketPage.removeItem(PRODUCT);

    await expect(basketPage.row(PRODUCT)).toHaveCount(0);
    await expect(basketPage.row(SECOND_PRODUCT)).toBeVisible();
  });

  test('an invalid coupon is rejected and leaves the total untouched @regression', async ({
    shopPage,
    basketPage,
  }) => {
    await shopPage.product(PRODUCT).addToBasket();
    await basketPage.goto();

    const totalBefore = await basketPage.orderTotal();
    await basketPage.applyCoupon('definitely-not-a-real-coupon');

    await expect(basketPage.notice).toContainText(/coupon.*does not exist|Sorry, this coupon/i);
    /* Rejecting the code is only half of it -- the money must not move. */
    expect(await basketPage.orderTotal()).toBe(totalBefore);
  });
});
