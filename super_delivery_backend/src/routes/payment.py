import stripe
import os
from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.order import Order, OrderStatus
from datetime import datetime

payment_bp = Blueprint('payment', __name__)

# Set Stripe API key (in production, use environment variables)
stripe.api_key = os.getenv('STRIPE_SECRET_KEY', 'sk_test_...')  # Replace with actual test key

@payment_bp.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    """Create a payment intent for an order"""
    try:
        data = request.get_json()
        order_id = data.get('order_id')
        
        if not order_id:
            return jsonify({'error': 'Order ID is required'}), 400
        
        # Get the order
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Create payment intent with Stripe
        intent = stripe.PaymentIntent.create(
            amount=int(order.total_amount * 100),  # Stripe expects amount in cents
            currency='usd',
            metadata={
                'order_id': str(order.id),
                'order_number': order.order_number
            }
        )
        
        # Update order with payment intent ID
        order.payment_transaction_id = intent.id
        order.payment_status = 'pending'
        db.session.commit()
        
        return jsonify({
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id
        })
        
    except stripe.error.StripeError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@payment_bp.route('/confirm-payment', methods=['POST'])
def confirm_payment():
    """Confirm payment and update order status"""
    try:
        data = request.get_json()
        payment_intent_id = data.get('payment_intent_id')
        
        if not payment_intent_id:
            return jsonify({'error': 'Payment intent ID is required'}), 400
        
        # Retrieve payment intent from Stripe
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status == 'succeeded':
            # Find the order
            order = Order.query.filter_by(payment_transaction_id=payment_intent_id).first()
            if order:
                # Update order status
                order.payment_status = 'completed'
                order.status = OrderStatus.CONFIRMED
                order.confirmed_at = datetime.utcnow()
                order.payment_method = 'credit_card'
                db.session.commit()
                
                return jsonify({
                    'success': True,
                    'order_id': order.id,
                    'status': order.status.value
                })
            else:
                return jsonify({'error': 'Order not found'}), 404
        else:
            return jsonify({'error': 'Payment not successful'}), 400
            
    except stripe.error.StripeError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@payment_bp.route('/webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhooks for payment status updates"""
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET', 'whsec_...')  # Replace with actual webhook secret
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError:
        return jsonify({'error': 'Invalid signature'}), 400
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        
        # Find and update the order
        order = Order.query.filter_by(payment_transaction_id=payment_intent['id']).first()
        if order:
            order.payment_status = 'completed'
            order.status = OrderStatus.CONFIRMED
            order.confirmed_at = datetime.utcnow()
            db.session.commit()
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        
        # Find and update the order
        order = Order.query.filter_by(payment_transaction_id=payment_intent['id']).first()
        if order:
            order.payment_status = 'failed'
            db.session.commit()
    
    return jsonify({'status': 'success'})

@payment_bp.route('/payment-methods', methods=['GET'])
def get_payment_methods():
    """Get available payment methods"""
    return jsonify({
        'methods': [
            {
                'id': 'card',
                'name': 'Credit/Debit Card',
                'description': 'Pay with your credit or debit card',
                'enabled': True
            },
            {
                'id': 'paypal',
                'name': 'PayPal',
                'description': 'Pay with your PayPal account',
                'enabled': False  # Can be enabled when PayPal integration is added
            },
            {
                'id': 'cash',
                'name': 'Cash on Delivery',
                'description': 'Pay with cash when your order arrives',
                'enabled': True
            }
        ]
    })

