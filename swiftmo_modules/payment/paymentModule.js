/*jshint esversion: 6 */
/*Payment module basically is a one hitter that can be used for taking all sorts
of payments: through apps, a cart, donation etc by only dealing with the payment
processing.

takes an object: {
                  chargeType: test or live,
                  price: value,
                  currency:
                  type : cents or euros and cents,
                  serviceType: rental or guide or whatever,
                  confcode: linking to the service,
                  token: stripeToken
                }
*/

const stripe = require('stripe')(process.env.stripeTokenSecret, {apiVersion: '2019-05-16'});

exports.chargeSCA = function (charge, callback){
  (async () => {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1099,
      currency: 'eur',
    });
  })();
}

exports.charge = function(charge, callback){


    //In cent
    let price = function(){
      //e.g. 18992 int:
      if(typeof charge.price === 'number' && charge.price % 1 === 0){
          return charge.price;
        }
      //floating point number:
      else if(typeof charge.price === 'number' && charge.price % 1 !== 0){
          return Math.round(charge.price);
      }
      //string representation of a number:
      else{
        //interger string
        if(charge.price.match(/[\,\.]/g) === null){
          return charge.price;
        }
        //float string
        else if(charge.price.match(/[\,\.]/g).length >= 1){
          //e.g. €189.92
          return parseFloat(charge.price * 100).toFixed(0);
        }
      }
    };

    let stripeToken = function() {
      if(Array.isArray(charge.token)){
        return charge.token[charge.token.length-1];
      }
      else{
        return charge.token;
      }
    };



    let chargeObjectSCA = {
      payment_method : charge.payment_method_id,
      amount: price(),
      currency: charge.currency,
      //source: stripeToken(),
      description: charge.description,
      metadata: {confcode: charge.confcode},
      confirmation_method: 'manual',
      confirm: true
    }

    /*
    stripe.charges.create(chargeObject, function(err, charge) {
      if(err){
        var error = new Error("Card Error: " + err);
        callback(error);
      }
      else{
        callback('success');
      }
    });*/

    let intent = stripe.paymentIntents.create(chargeObjectSCA, function(err, intent){
      if(err){
        var error = new Error("Card Error: " + err);
        callback(error);
      }
      else{
        //callback('success');


        callback(generate_payment_response(intent));
      }
    });

    const generate_payment_response = (intent) => {
      if (
        intent.status === 'requires_action' &&
        intent.next_action.type === 'use_stripe_sdk'
      ) {
        // Tell the client to handle the action
        return {
          requires_action: true,
          payment_intent_client_secret: intent.client_secret
        };
      } else if (intent.status === 'succeeded') {
        // The payment didn’t need any additional actions and completed!
        // Handle post-payment fulfillment
        return {
          success: true
        };
      } else {
        // Invalid status
        return {
          error: 'Invalid PaymentIntent status'
        }
      }
    };

};
