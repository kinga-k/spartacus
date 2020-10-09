import * as anonymousConsents from '../../../../helpers/anonymous-consents';
import * as checkoutFlowPersistentUser from '../../../../helpers/checkout-as-persistent-user';
import * as checkoutFlow from '../../../../helpers/checkout-flow';
import * as loginHelper from '../../../../helpers/login';
import { navigation } from '../../../../helpers/navigation';
import * as productSearch from '../../../../helpers/product-search';
import {
  createProductQuery,
  QUERY_ALIAS,
} from '../../../../helpers/product-search';
import {
  cdsHelper,
  strategyRequestAlias,
} from '../../../../helpers/vendor/cds/cds';
import { profileTagHelper } from '../../../../helpers/vendor/cds/profile-tag';

describe('Profile-tag events', () => {
  beforeEach(() => {
    cy.server();
    cdsHelper.setUpMocks(strategyRequestAlias);
    navigation.visitHomePage({
      options: {
        onBeforeLoad: profileTagHelper.interceptProfileTagJs,
      },
    });
    profileTagHelper.waitForCMSComponents();
    anonymousConsents.clickAllowAllFromBanner();
  });
  describe('cart events', () => {
    it('should send a AddedToCart event on adding an item to cart', () => {
      goToProductPage();
      cy.get('cx-add-to-cart button.btn-primary').click();
      cy.get('cx-added-to-cart-dialog .btn-primary');
      cy.window().then((win) => {
        expect(
          profileTagHelper.eventCount(
            win,
            profileTagHelper.EventNames.ADDED_TO_CART
          )
        ).to.equal(1);
        const addedToCartEvent = profileTagHelper.getEvent(
          win,
          profileTagHelper.EventNames.ADDED_TO_CART
        )[0];
        expect(addedToCartEvent.data.productQty).to.eq(1);
        expect(addedToCartEvent.data.productSku).to.eq('280916');
        expect(addedToCartEvent.data.categories).to.contain('577');
        expect(addedToCartEvent.data.categories).to.contain('brand_745');
        expect(addedToCartEvent.data.productCategory).to.eq('brand_745');
        expect(addedToCartEvent.data.productPrice).to.eq(8.2);
      });
    });

    it('should send a CartModified event on modifying the cart', () => {
      goToProductPage();
      cy.get('cx-add-to-cart button.btn-primary').click();
      cy.get('cx-added-to-cart-dialog .btn-primary').click();
      cy.get('cx-cart-item cx-item-counter').getByText('+').click();
      cy.route(
        'GET',
        `${Cypress.env('OCC_PREFIX')}/${Cypress.env(
          'BASE_SITE'
        )}/users/anonymous/carts/*`
      ).as('getRefreshedCart');
      cy.wait('@getRefreshedCart');
      cy.window().then((win) => {
        expect(
          profileTagHelper.eventCount(
            win,
            profileTagHelper.EventNames.MODIFIED_CART
          )
        ).to.equal(1);
        const modifiedCart = profileTagHelper.getEvent(
          win,
          profileTagHelper.EventNames.MODIFIED_CART
        )[0];
        expect(modifiedCart.data.productQty).to.eq(2);
        expect(modifiedCart.data.productSku).to.eq('280916');
        expect(modifiedCart.data.categories).to.contain('577');
        expect(modifiedCart.data.categories).to.contain('brand_745');
        expect(modifiedCart.data.productCategory).to.eq('brand_745');
      });
    });

    it('should send a RemovedFromCart event on removing an item from the cart', () => {
      goToProductPage();
      cy.get('cx-add-to-cart button.btn-primary').click();
      cy.get('cx-added-to-cart-dialog .btn-primary').click();
      cy.get('cx-add-to-cart button.btn-primary').click();
      cy.get('cx-added-to-cart-dialog .btn-primary').click();
      cy.get('cx-cart-item-list').get('.cx-remove-btn > .link').click();
      cy.route(
        'GET',
        `${Cypress.env('OCC_PREFIX')}/${Cypress.env(
          'BASE_SITE'
        )}/users/anonymous/carts/*`
      ).as('getRefreshedCart');
      cy.wait('@getRefreshedCart');
      cy.window().then((win) => {
        expect(
          profileTagHelper.eventCount(
            win,
            profileTagHelper.EventNames.REMOVED_FROM_CART
          )
        ).to.equal(1);
        const removedFromCart = profileTagHelper.getEvent(
          win,
          profileTagHelper.EventNames.REMOVED_FROM_CART
        )[0];
        expect(removedFromCart.data.productSku).to.eq('280916');
        expect(removedFromCart.data.categories).to.contain('577');
        expect(removedFromCart.data.categories).to.contain('brand_745');
        expect(removedFromCart.data.productCategory).to.eq('brand_745');
      });
    });
  });

  it('should send a product detail page view event when viewing a product', () => {
    cy.route('GET', `**reviews*`).as('lastRequest');
    const productSku = 280916;
    const productName = 'Web Camera (100KpixelM CMOS, 640X480, USB 1.1) Black';
    const productPrice = 8.2;
    const productCategory = 'brand_745';
    const productCategoryName = 'Canyon';
    goToProductPage();
    cy.wait('@lastRequest');
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.PRODUCT_DETAILS_PAGE_VIEWED
        )
      ).to.equal(1);
      const productViewedEvent = profileTagHelper.getEvent(
        win,
        profileTagHelper.EventNames.PRODUCT_DETAILS_PAGE_VIEWED
      )[0];
      expect(productViewedEvent.data.productSku).to.equal(`${productSku}`);
      expect(productViewedEvent.data.productName).to.equal(productName);
      expect(productViewedEvent.data.productPrice).to.equal(productPrice);
      expect(productViewedEvent.data.productCategory).to.equal(productCategory);
      expect(productViewedEvent.data.productCategoryName).to.equal(
        productCategoryName
      );
    });
  });

  it('should send a search page view event when viewing a search page', () => {
    cy.get('cx-searchbox input').type('camera{enter}');
    createProductQuery(QUERY_ALIAS.CAMERA, 'camera', 10);
    cy.wait(`@${QUERY_ALIAS.CAMERA}`);
    profileTagHelper.waitForCMSComponents();
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.KEYWORD_SEARCH
        )
      ).to.equal(1);
      const keywordSearchEvent = profileTagHelper.getEvent(
        win,
        profileTagHelper.EventNames.KEYWORD_SEARCH
      )[0];
      expect(keywordSearchEvent.data.numResults).to.equal(145);
      expect(keywordSearchEvent.data.searchTerm).to.equal('camera');
    });
  });

  it('should send a CartPageViewed event when viewing the cart page', () => {
    goToProductPage();
    cy.get('cx-add-to-cart button.btn-primary').click();
    cy.get('cx-added-to-cart-dialog .btn-primary').click();
    cy.location('pathname', { timeout: 10000 }).should(
      'include',
      `/electronics-spa/en/USD/cart`
    );
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.CART_PAGE_VIEWED
        )
      ).to.equal(1);
    });
  });

  it('should send an OrderConfirmation event when viewing the order confirmation page', () => {
    loginHelper.loginAsDefaultUser();
    checkoutFlowPersistentUser.goToProductPageFromCategory();
    checkoutFlowPersistentUser.addProductToCart();
    checkoutFlowPersistentUser.addPaymentMethod();
    cy.wait(0).then(() => {
      checkoutFlowPersistentUser.addShippingAddress();
    });
    checkoutFlowPersistentUser.selectShippingAddress();
    checkoutFlowPersistentUser.selectDeliveryMethod();
    checkoutFlowPersistentUser.selectPaymentMethod();
    cy.location('pathname', { timeout: 10000 }).should(
      'include',
      `checkout/review-order`
    );
    checkoutFlowPersistentUser.verifyAndPlaceOrder();
    cy.location('pathname', { timeout: 10000 }).should(
      'include',
      `order-confirmation`
    );
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.ORDER_CONFIRMATION_PAGE_VIEWED
        )
      ).to.equal(1);
    });
  });

  it('should send a Category View event when a Category View occurs', () => {
    cy.route('GET', `**/products/search**`).as('lastRequest');
    const productCategory = '575';
    const productCategoryName = 'Digital Cameras';
    cy.get('cx-category-navigation cx-generic-link a')
      .contains('Cameras')
      .click({ force: true });
    cy.location('pathname', { timeout: 10000 }).should('include', `c/575`);
    cy.wait('@lastRequest');
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.CATEGORY_PAGE_VIEWED
        )
      ).to.equal(1);
      const categoryViewedEvent = profileTagHelper.getEvent(
        win,
        profileTagHelper.EventNames.CATEGORY_PAGE_VIEWED
      )[0];
      expect(categoryViewedEvent.data.productCategory).to.equal(
        productCategory
      );
      expect(categoryViewedEvent.data.productCategoryName).to.equal(
        productCategoryName
      );
    });
  });

  it('should send 2 Category Views event when going to a Category, going to a different page type, and then back to the same category', () => {
    cy.route('GET', `**/products/search**`).as('lastRequest');

    cy.get('cx-category-navigation cx-generic-link a')
      .contains('Cameras')
      .click({ force: true });
    cy.location('pathname', { timeout: 10000 }).should('include', `c/575`);
    cy.wait('@lastRequest');
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.CATEGORY_PAGE_VIEWED
        )
      ).to.equal(1);
    });
    cy.get('cx-searchbox input').type('camera{enter}');
    createProductQuery(QUERY_ALIAS.CAMERA, 'camera', 10);
    cy.wait(`@${QUERY_ALIAS.CAMERA}`);

    cy.route('GET', `**/products/search**`).as('lastRequest2'); //waiting for the same request a 2nd time doesn't work
    cy.get('cx-category-navigation cx-generic-link a')
      .contains('Cameras')
      .click({ force: true });
    cy.location('pathname', { timeout: 10000 }).should('include', `c/575`);
    cy.wait('@lastRequest2');
    cy.window().then((win2) => {
      expect(
        profileTagHelper.eventCount(
          win2,
          profileTagHelper.EventNames.CATEGORY_PAGE_VIEWED
        )
      ).to.equal(2);
    });
  });

  it('should send 1 Category View event when going to a Category and clicking a facet', () => {
    cy.route('GET', `**/products/search**`).as('lastRequest');

    cy.get('cx-category-navigation cx-generic-link a')
      .contains('Cameras')
      .click({ force: true });
    cy.location('pathname', { timeout: 10000 }).should('include', `c/575`);
    cy.wait('@lastRequest');
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.CATEGORY_PAGE_VIEWED
        )
      ).to.equal(1);
    });
    productSearch.clickFacet('Stores', '');

    cy.window().then((win2) => {
      expect(
        profileTagHelper.eventCount(
          win2,
          profileTagHelper.EventNames.CATEGORY_PAGE_VIEWED
        )
      ).to.equal(1);
    });
  });

  it('should send a Navigated event when a navigation occurs', () => {
    const categoryPage = checkoutFlow.waitForPage(
      'CategoryPage',
      'getCategory'
    );
    cy.get(
      'cx-page-slot cx-banner img[alt="Save Big On Select SLR & DSLR Cameras"]'
    ).click();
    cy.wait(`@${categoryPage}`).its('status').should('eq', 200);
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(win, profileTagHelper.EventNames.NAVIGATED)
      ).to.equal(1);
    });
  });
});

// For some reason these two events interfere with eachother. Only 1 needs to click the allow all banner
// and the next will then have consent granted
describe('Consent Changed and homepageviewed events', () => {
  beforeEach(() => {
    cy.server();
    cdsHelper.setUpMocks(strategyRequestAlias);
    navigation.visitHomePage({
      options: {
        onBeforeLoad: profileTagHelper.interceptProfileTagJs,
      },
    });
    profileTagHelper.waitForCMSComponents();
  });
  it('should wait for a user to accept consent and then send a ConsentChanged event', () => {
    anonymousConsents.clickAllowAllFromBanner();
    cy.window().then((win) => {
      expect(
        profileTagHelper.eventCount(
          win,
          profileTagHelper.EventNames.CONSENT_CHANGED
        )
      ).to.equal(1);
    });
  });

  it('should send a HomePageViewed event when viewing the homepage', () => {
    cy.reload();
    profileTagHelper.waitForCMSComponents().then(() => {
      cy.window().then((win) => {
        expect(
          profileTagHelper.eventCount(
            win,
            profileTagHelper.EventNames.HOME_PAGE_VIEWED
          )
        ).to.equal(1);
      });
    });
  });
});

function goToProductPage(): Cypress.Chainable<number> {
  const productPagePath = 'ProductPage';
  const productPage = checkoutFlow.waitForPage(
    productPagePath,
    'getProductPage'
  );
  cy.get('.Section4 cx-banner').first().find('img').click({ force: true });
  return cy.wait(`@${productPage}`).its('status').should('eq', 200);
}
