export default {
  //NAVIGATION
  HOME: '(//a[@class="nav-link"])[1]',
  CONTACT: "//a[contains(text(),'Contact')]",
  ABOUT: "//a[contains(text(),'About us')]",
  CART: "//a[contains(text(),'Cart')]",
  LOGIN: "//a[contains(text(),'Log in')]",
  SIGNUP: "//a[contains(text(),'Sign up')]",

  //CONTACT FORM
  contact_email_input: "#recipient-email",
  contact_name_input: "#recipient-name",
  contact_message_input: "#message-text",
  contact_send_button: "#exampleModal .modal-footer button",

  //ABOUT US MODAL
  aboutUs_modal: "#videoModal",
  aboutUs_modal_body: "#videoModal .modal-body",
};
