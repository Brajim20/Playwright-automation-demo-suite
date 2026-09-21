/**
 * Fixture markup that mirrors the WooCommerce shop grid.
 *
 * Used with `page.route(...)` so the shop page object can be exercised against a known
 * catalogue -- no live site, no network, no flake. It is also how the suite tests states the
 * real site will not produce on demand: an empty grid, a backend 500.
 */

export interface FixtureProduct {
  name: string;
  price: number;
  salePrice?: number;
}

function card({ name, price, salePrice }: FixtureProduct): string {
  const priceMarkup =
    salePrice === undefined
      ? `<span class="price"><span class="amount">&#8377;${price.toFixed(2)}</span></span>`
      : `<span class="price"><del><span class="amount">&#8377;${price.toFixed(2)}</span></del> ` +
        `<ins><span class="amount">&#8377;${salePrice.toFixed(2)}</span></ins></span>`;

  return `
    <li class="product">
      ${salePrice === undefined ? '' : '<span class="onsale">Sale!</span>'}
      <h3>${name}</h3>
      ${priceMarkup}
      <a href="#" class="add_to_cart_button">Add to basket</a>
    </li>`;
}

export function shopPageHtml(products: FixtureProduct[]): string {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Shop</title></head>
  <body>
    <div id="site-header">
      <div id="site-logo"><a href="/">Automation Practice Site</a></div>
      <a href="/basket/">0 items</a>
    </div>
    <h2>Filter by price</h2>
    <button type="button">Filter</button>
    <div class="price_label">Price: &#8377;150 &mdash; &#8377;700</div>
    <h2>Product Categories</h2>
    <ul class="products">
      ${products.map(card).join('\n')}
    </ul>
  </body>
</html>`;
}

export function serverErrorHtml(): string {
  return `<!doctype html>
<html lang="en">
  <head><title>WordPress &rsaquo; Error</title></head>
  <body><div id="error-page"><p>There has been a critical error on this website.</p></div></body>
</html>`;
}
