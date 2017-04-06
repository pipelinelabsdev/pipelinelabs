$(document).ready(function() {
	
	var PublishableKey = 'pk_live_krAhQJ96SR0mqNE9zOhdIzG7'; // Replace with your API publishable key
	//PublishableKey = 'pk_test_CfcJ9lW47Olc3usaECejalRt'; // test key
	
	
	$('#cancel-plan').on('click', function(e) {
		var r = confirm("Are you sure you want to cancel your membership?");
		if(r == true) {
			// AJAX - you would send 'token' to your server here.
            $.post('/membership/cancel')
                // Assign handlers immediately after making the request,
                .done(function(data, textStatus, jqXHR) {
                    $('p#success-message').html('Your account has been cancelled.');
                })
                .fail(function() {
	               $('p#cancel-error-message').html('We could not cancel your account. Please contact support for assistance.' );
                });
		}
	});
	


	
	
		/* Upgrade form */
		
		var $form = $('#payment-form');
		$form.on('submit', payWithStripe);
		
		/* If you're using Stripe for payments */
		function payWithStripe(e) {
		    e.preventDefault();
		
		    /* Visual feedback */
		    $form.find('[type=submit]').html('Validating <i class="fa fa-spinner fa-pulse"></i>');
		
		    
		    Stripe.setPublishableKey(PublishableKey);
		    
		    /* Create token */
		    var expiry = $form.find('[name=cardExpiry]').payment('cardExpiryVal');
		    var ccData = {
		        number: $form.find('[name=cardNumber]').val().replace(/\s/g,''),
		        cvc: $form.find('[name=cardCVC]').val(),
		        exp_month: expiry.month, 
		        exp_year: expiry.year
		    };
		    console.log(ccData);
		    console.log(PublishableKey);
		    Stripe.card.createToken(ccData, function stripeResponseHandler(status, response) {
		        if (response.error) {
		            /* Visual feedback */
		            $form.find('[type=submit]').html('Try again');
		            /* Show Stripe errors on the form */
		            $form.find('.payment-errors').text(response.error.message);
		            $form.find('.payment-errors').closest('.row').show();
		        } else {
		            /* Visual feedback */
		            $form.find('[type=submit]').html('Processing <i class="fa fa-spinner fa-pulse"></i>');
		            /* Hide Stripe errors on the form */
		            $form.find('.payment-errors').closest('.row').hide();
		            $form.find('.payment-errors').text("");
		            // response contains id and card, which contains additional card details            
		            var token = response.id;
		            // AJAX - you would send 'token' to your server here.
		           	var plan_type = $('#plan_type').val();
		           	
		           	if(plan_type == 2) {
		           
			            $.post('/companies/savesubscription', {
			                    token: token
			                })
			                // Assign handlers immediately after making the request,
			                .done(function(data, textStatus, jqXHR) {
			                    $form.find('[type=submit]').html('Payment successful <i class="fa fa-check"></i>').prop('disabled', true);
			                    
			                    window.setTimeout(function() {
				                    
				                    window.location.href = '/companies/company_private_dashboard';
				                    return false;
				                    
				                }, 3000);
			                })
			                .fail(function(jqXHR, textStatus, errorThrown) {
			                    $form.find('[type=submit]').html('There was a problem with your credit card.').removeClass('success').addClass('error');
			                    /* Show Stripe errors on the form */
			                    $form.find('.payment-errors').text('Please try again.');
			                    $form.find('.payment-errors').closest('.row').show();
			                });
					}
					else if(plan_type == 1) {
						
						$.post('/companies/savesubscriptionpayment', {
			                    token: token
			                })
			                // Assign handlers immediately after making the request,
			                .done(function(data, textStatus, jqXHR) {
			                    $form.find('[type=submit]').html('Payment successful <i class="fa fa-check"></i>').prop('disabled', true);
			                    
			                    window.setTimeout(function() {
				                    
				                    window.location.href = '/companies/company_private_dashboard';
				                    return false;
				                    
				                }, 3000);
			                })
			                .fail(function(jqXHR, textStatus, errorThrown) {
			                    $form.find('[type=submit]').html('There was a problem with your credit card.').removeClass('success').addClass('error');
			                    /* Show Stripe errors on the form */
			                    $form.find('.payment-errors').text('Please try again.');
			                    $form.find('.payment-errors').closest('.row').show();
			                });
						
					}
		        }
		    });
		}
		/* Fancy restrictive input formatting via jQuery.payment library*/
		$('input[name=cardNumber]').payment('formatCardNumber');
		$('input[name=cardCVC]').payment('formatCardCVC');
		$('input[name=cardExpiry').payment('formatCardExpiry');
		
		/* Form validation using Stripe client-side validation helpers */
		jQuery.validator.addMethod("cardNumber", function(value, element) {
		    return this.optional(element) || Stripe.card.validateCardNumber(value);
		}, "Please specify a valid credit card number.");
		
		jQuery.validator.addMethod("cardExpiry", function(value, element) {    
		    /* Parsing month/year uses jQuery.payment library */
		    value = $.payment.cardExpiryVal(value);
		    return this.optional(element) || Stripe.card.validateExpiry(value.month, value.year);
		}, "Invalid expiration date.");
		
		jQuery.validator.addMethod("cardCVC", function(value, element) {
		    return this.optional(element) || Stripe.card.validateCVC(value);
		}, "Invalid CVC.");
		
		validator = $form.validate({
		    rules: {
		        cardNumber: {
		            required: true,
		            cardNumber: true            
		        },
		        cardExpiry: {
		            required: true,
		            cardExpiry: true
		        },
		        cardCVC: {
		            required: true,
		            cardCVC: true
		        }
		    },
		    highlight: function(element) {
		        $(element).closest('.form-control').removeClass('success').addClass('error');
		    },
		    unhighlight: function(element) {
		        $(element).closest('.form-control').removeClass('error').addClass('success');
		    },
		    errorPlacement: function(error, element) {
		        $(element).closest('.form-group').append(error);
		    }
		});
		
		paymentFormReady = function() {
		    if ($form.find('[name=cardNumber]').hasClass("success") &&
		        $form.find('[name=cardExpiry]').hasClass("success") &&
		        $form.find('[name=cardCVC]').val().length > 1) {
		        return true;
		    } else {
		        return false;
		    }
		}
		
		$form.find('[type=submit]').prop('disabled', true);
		var readyInterval = setInterval(function() {
		    if (paymentFormReady()) {
		        $form.find('[type=submit]').prop('disabled', false);
		        clearInterval(readyInterval);
		    }
		}, 250);
		
	
});