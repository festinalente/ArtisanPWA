/**
  * @param cartcode takes a cartcode string linked to a particular session
  * @param {string} targetElement Takes a querySelector string
  */
function initStripeCartCode(parent, thenDo){

  let stripe = Stripe('stripeTokenPublic'),
      elements = stripe.elements(),
      card = elements.create('card');

  // Add an instance of the card UI component into the `card-element` <div>
  card.mount(parent.querySelector('.card-element'));

  card.addEventListener('change', function(event) {
    var displayError = parent.querySelector('.card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  });

  function stripeTokenHandler(token) {
    // Insert the token ID into the form so it gets submitted to the server
    const formData = new FormData(parent);
    formData.append('stripeTokenSCA', token.paymentMethod.id);

    //self instantiates:
    (function sendForm(){
      formxhr(formData, '/globalPayment', function(callback){
        var cb = JSON.parse(callback);
        if(cb.error){
          parent.querySelector('.card-errors').textContent = cb.error;
        }
        else if(cb.requires_action === true){
          handleAction(cb);
        }
        else{
          parent.querySelector('.paynowNew').classList.add('paynowAnimate');
          parent.querySelector('.card-errors').textContent = 'Payment successful';
          parent.querySelector('.card-errors').classList.add('green');

          xhr({cartcode: cart.returnCartCode()}, '/checkorder', function(callback){
            document.querySelector('#orderConfirmation').innerHTML = callback;

              folder2.shortcut('2');
            //if(thenDo){
            //thenDo clears sales objects
              //thenDo();
              resetHtmlEl();
            //}
          });
        }
      });
      return false;
    } )();
  }

  function resetHtmlEl(){
    parent.querySelector('.card-errors').textContent = 'Payment successful';
    parent.querySelector('.card-errors').classList.remove('green');
    parent.querySelector('.paymentBtn').disabled = false;
  }

  //Write another function which sends the payment intent confirming the payment.
  //Then does the normal success thing as above.

  function handleAction(response) {


    stripe.handleCardAction(response.payment_intent_client_secret).then(
      function(result) {
        if (result.error) {
          // Inform the user if there was an error
          var errorElement = parent.querySelector('.card-errors');
          errorElement.textContent = result.error.message;
        } else {
          // Send the token to your server
          result.cartcode = response.cartcode;

          //stripeTokenHandler(result);
          confirmIntent(result);
        }
      });
  }

  function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  }

  function confirmIntent(intent){
    xhr(intent, '/confirmPaymentIntent', function(callback){

      if(IsJsonString(callback)){
        var cb = JSON.parse(callback);
        if(cb.error){
          parent.querySelector('.card-errors').textContent = cb.error;
        }
        if(cb.requires_action === true){

          handleAction(cb);
        }
      }
      else{
        parent.querySelector('.paynowNew').classList.add('paynowAnimate');
        parent.querySelector('.card-errors').textContent = 'Payment successful';
        parent.querySelector('.card-errors').classList.add('green');
      //  document.querySelector('.orderConfirmation').innerHTML = callback;
      }
    });
  }

  function createToken() {

    parent.querySelector('.paymentBtn').disabled = true;
    /*
    stripe.createToken(card).then(function(result) {
      if (result.error) {
        // Inform the user if there was an error
        var errorElement = document.getElementById('card-errors');
        errorElement.textContent = result.error.message;
      } else {
        // Send the token to your server
        stripeTokenHandler(result.token);
      }
    });*/

    stripe.createPaymentMethod('card', card).then(function(result){

      if (result.error) {

        // Inform the user if there was an error
        parent.querySelector('.card-errors').textContent = result.error.message;
      } else {

        // Send the token to your server
        stripeTokenHandler(result);
      }
    });



  }

  parent.addEventListener('submit', function(e) {
    e.preventDefault();

    createToken();
  });
}
