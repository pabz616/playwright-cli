export default {
  // NAVIGATION
  HOME: "text=Home",
  CONTACT: 'a.nav-link:has-text("Contact")',
  ABOUT_US: 'a.nav-link:has-text("About us")',
  CART: 'a.nav-link:has-text("Cart")',
  LOG_IN: 'a.nav-link:has-text("Log in")',
  SIGN_UP: "#signin2",

  // CAROUSEL
  ACTIVE_SLIDE: ".carousel-inner .carousel-item.active",
  PREV_BUTTON: "a.carousel-control-prev",
  NEXT_BUTTON: "a.carousel-control-next",
  INDICATORS: ".carousel-indicators li",

  // PRODUCT BROWSING
  PHONES_CATEGORY: 'a#itemc:has-text("Phones")',
  LAPTOPS_CATEGORY: 'a#itemc:has-text("Laptops")',
  MONITORS_CATEGORY: 'a#itemc:has-text("Monitors")',
  PRODUCT_CARDS: "#tbodyid .card",
  PRODUCT_IMAGE: "img",
  PRODUCT_TITLE: ".card-title a",
  PRODUCT_PRICE: ".card-text",
  FIRST_PRODUCT_TITLE: "#tbodyid .card .card-title a",

  // PRODUCT DETAILS
  PRODUCT_NAME: ".name",
  PRODUCT_PRICE_CONTAINER: ".price-container",
  PRODUCT_DESCRIPTION: "#more-information",
  ADD_TO_CART_BUTTON: 'a.btn-success:has-text("Add to cart")',

  // SHOPPING CART
  CART_TABLE: ".table-responsive",
  CART_ROWS: "#tbodyid tr",
  CART_PIC_HEADER: "table thead th:has-text('Pic')",
  CART_TITLE_HEADER: "table thead th:has-text('Title')",
  CART_PRICE_HEADER: "table thead th:has-text('Price')",
  CART_DELETE_HEADER: "table thead th:has-text('x')",
  CART_TOTAL: "#totalp",
  PLACE_ORDER_BUTTON: 'button:has-text("Place Order")',
  ORDER_MODAL: "#orderModal",
  NAME_INPUT: "#name",
  COUNTRY_INPUT: "#country",
  CITY_INPUT: "#city",
  CARD_INPUT: "#card",
  MONTH_INPUT: "#month",
  YEAR_INPUT: "#year",
  PURCHASE_BUTTON: 'button:has-text("Purchase")',
  SUCCESS_ALERT: ".sweet-alert h2",

  // STATIC PAGES
  CONTACT_MODAL: "#exampleModal",
  CONTACT_CLOSE_BUTTON: "#exampleModal .close",
  VIDEO_MODAL: "#videoModal",
  RECIPIENT_EMAIL: "#recipient-email",
  RECIPIENT_NAME: "#recipient-name",
  MESSAGE_TEXT: "#message-text",
  SEND_MESSAGE_BUTTON: 'button:has-text("Send message")',
  VIDEO_MODAL_BODY: "#videoModal .modal-body",

  // USER AUTHENTICATION
  LOG_IN_MODAL: "#logInModal",
  LOG_IN_CLOSE_BUTTON: "#logInModal .close",
  LOGIN_USERNAME: "#loginusername",
  LOGIN_PASSWORD: "#loginpassword",
  LOG_IN_BUTTON: 'button:has-text("Log in")',
  LOG_OUT_BUTTON: 'a.nav-link:has-text("Log out")',

  // USER IS AUTHENTICATED
  NAME_OF_USER: "#nameofuser",
  
  // USER ACCOUNT CREATION
  SIGN_IN_MODAL: "#signInModal",
  SIGN_IN_CLOSE_BUTTON: "#signInModal .close",
  SIGN_USERNAME: '//input[@id="sign-username"]',
  SIGN_PASSWORD: '//input[@id="sign-password"]',
  SIGN_UP_BUTTON: "#signInModal button.btn-primary",
};
