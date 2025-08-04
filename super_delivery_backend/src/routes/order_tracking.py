from flask import Blueprint, jsonify, request
from src.models.user import db
from src.models.order import Order
from src.models.restaurant import Restaurant
from src.routes.error_handler import APIError, log_info, log_error
from datetime import datetime, timedelta
import json

order_tracking_bp = Blueprint('order_tracking', __name__)

@order_tracking_bp.route('/orders/<int:order_id>/tracking', methods=['GET'])
def get_order_tracking(order_id):
    """Get real-time tracking information for an order"""
    try:
        order = Order.query.get(order_id)
        if not order:
            raise APIError("Order not found", 404)
        
        # Get restaurant information
        restaurant = Restaurant.query.get(order.restaurant_id)
        
        # Calculate estimated times based on order status
        tracking_info = {
            'order_id': order.id,
            'status': order.status.value,
            'created_at': order.created_at.isoformat(),
            'updated_at': order.updated_at.isoformat(),
            'restaurant': {
                'name': restaurant.name if restaurant else 'Unknown Restaurant',
                'phone': restaurant.phone if restaurant else None,
                'address': restaurant.address if restaurant else None
            },
            'delivery_address': order.delivery_address,
            'total_amount': float(order.total_amount),
            'estimated_delivery_time': order.estimated_delivery_time,
            'driver_info': None,
            'timeline': []
        }
        
        # Add driver information if assigned
        if order.driver_id:
            from src.models.user import User
            driver = User.query.get(order.driver_id)
            if driver:
                tracking_info['driver_info'] = {
                    'name': driver.first_name + ' ' + driver.last_name,
                    'phone': driver.phone,
                    'rating': 4.5  # Mock rating for now
                }
        
        # Generate timeline based on order status
        timeline = []
        base_time = order.created_at
        
        # Order placed
        timeline.append({
            'status': 'placed',
            'title': 'Order Placed',
            'description': 'Your order has been received and is being processed',
            'timestamp': base_time.isoformat(),
            'completed': True
        })
        
        # Order confirmed
        if order.status.value in ['confirmed', 'preparing', 'ready', 'picked_up', 'delivered']:
            confirm_time = base_time + timedelta(minutes=2)
            timeline.append({
                'status': 'confirmed',
                'title': 'Order Confirmed',
                'description': f'Restaurant has confirmed your order',
                'timestamp': confirm_time.isoformat(),
                'completed': True
            })
        
        # Preparing
        if order.status.value in ['preparing', 'ready', 'picked_up', 'delivered']:
            prep_time = base_time + timedelta(minutes=5)
            timeline.append({
                'status': 'preparing',
                'title': 'Preparing Your Order',
                'description': 'The restaurant is preparing your delicious meal',
                'timestamp': prep_time.isoformat(),
                'completed': True
            })
        
        # Ready for pickup
        if order.status.value in ['ready', 'picked_up', 'delivered']:
            ready_time = base_time + timedelta(minutes=15)
            timeline.append({
                'status': 'ready',
                'title': 'Ready for Pickup',
                'description': 'Your order is ready and waiting for the driver',
                'timestamp': ready_time.isoformat(),
                'completed': True
            })
        
        # Picked up
        if order.status.value in ['picked_up', 'delivered']:
            pickup_time = base_time + timedelta(minutes=20)
            timeline.append({
                'status': 'picked_up',
                'title': 'Out for Delivery',
                'description': 'Your order is on its way to you',
                'timestamp': pickup_time.isoformat(),
                'completed': True
            })
        
        # Delivered
        if order.status.value == 'delivered':
            delivery_time = base_time + timedelta(minutes=order.estimated_delivery_time or 30)
            timeline.append({
                'status': 'delivered',
                'title': 'Delivered',
                'description': 'Your order has been delivered. Enjoy your meal!',
                'timestamp': delivery_time.isoformat(),
                'completed': True
            })
        else:
            # Add estimated delivery time
            estimated_delivery = base_time + timedelta(minutes=order.estimated_delivery_time or 30)
            timeline.append({
                'status': 'delivered',
                'title': 'Estimated Delivery',
                'description': 'Your order will be delivered around this time',
                'timestamp': estimated_delivery.isoformat(),
                'completed': False,
                'estimated': True
            })
        
        tracking_info['timeline'] = timeline
        
        log_info(f"Retrieved tracking info for order {order_id}")
        return jsonify({
            'success': True,
            'tracking': tracking_info
        })
        
    except APIError:
        raise
    except Exception as e:
        log_error(f"Error fetching tracking info for order {order_id}: {str(e)}", exc_info=True)
        raise APIError("Failed to fetch order tracking information", 500)

@order_tracking_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """Update order status for real-time tracking"""
    try:
        order = Order.query.get(order_id)
        if not order:
            raise APIError("Order not found", 404)
        
        data = request.json
        if not data or 'status' not in data:
            raise APIError("Status is required", 400)
        
        new_status = data['status']
        valid_statuses = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled']
        
        if new_status not in valid_statuses:
            raise APIError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}", 400)
        
        # Update order status
        from src.models.order import OrderStatus
        order.status = OrderStatus(new_status)
        order.updated_at = datetime.utcnow()
        
        # Add driver assignment if provided
        if 'driver_id' in data and data['driver_id']:
            order.driver_id = data['driver_id']
        
        # Add delivery notes if provided
        if 'notes' in data:
            order.special_instructions = data['notes']
        
        db.session.commit()
        
        log_info(f"Updated order {order_id} status to {new_status}")
        return jsonify({
            'success': True,
            'message': f'Order status updated to {new_status}',
            'order': {
                'id': order.id,
                'status': order.status.value,
                'updated_at': order.updated_at.isoformat()
            }
        })
        
    except APIError:
        raise
    except Exception as e:
        db.session.rollback()
        log_error(f"Error updating order {order_id} status: {str(e)}", exc_info=True)
        raise APIError("Failed to update order status", 500)

@order_tracking_bp.route('/orders/customer/<int:customer_id>/active', methods=['GET'])
def get_customer_active_orders(customer_id):
    """Get active orders for a customer for tracking"""
    try:
        # Get orders that are not delivered or cancelled
        active_statuses = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up']
        orders = Order.query.filter(
            Order.customer_id == customer_id,
            Order.status.in_([OrderStatus(status) for status in active_statuses])
        ).order_by(Order.created_at.desc()).all()
        
        active_orders = []
        for order in orders:
            restaurant = Restaurant.query.get(order.restaurant_id)
            
            order_info = {
                'id': order.id,
                'status': order.status.value,
                'created_at': order.created_at.isoformat(),
                'updated_at': order.updated_at.isoformat(),
                'restaurant_name': restaurant.name if restaurant else 'Unknown Restaurant',
                'total_amount': float(order.total_amount),
                'estimated_delivery_time': order.estimated_delivery_time,
                'delivery_address': order.delivery_address
            }
            active_orders.append(order_info)
        
        log_info(f"Retrieved {len(active_orders)} active orders for customer {customer_id}")
        return jsonify({
            'success': True,
            'active_orders': active_orders
        })
        
    except Exception as e:
        log_error(f"Error fetching active orders for customer {customer_id}: {str(e)}", exc_info=True)
        raise APIError("Failed to fetch active orders", 500)

@order_tracking_bp.route('/orders/restaurant/<int:restaurant_id>/pending', methods=['GET'])
def get_restaurant_pending_orders(restaurant_id):
    """Get pending orders for a restaurant"""
    try:
        # Get orders that need restaurant attention
        pending_statuses = ['pending', 'confirmed', 'preparing']
        orders = Order.query.filter(
            Order.restaurant_id == restaurant_id,
            Order.status.in_([OrderStatus(status) for status in pending_statuses])
        ).order_by(Order.created_at.asc()).all()
        
        pending_orders = []
        for order in orders:
            from src.models.user import User
            customer = User.query.get(order.customer_id)
            
            order_info = {
                'id': order.id,
                'status': order.status.value,
                'created_at': order.created_at.isoformat(),
                'customer_name': f"{customer.first_name} {customer.last_name}" if customer else 'Unknown Customer',
                'customer_phone': customer.phone if customer else None,
                'total_amount': float(order.total_amount),
                'delivery_address': order.delivery_address,
                'special_instructions': order.special_instructions,
                'items': []
            }
            
            # Get order items
            from src.models.order_item import OrderItem
            from src.models.menu_item import MenuItem
            order_items = OrderItem.query.filter_by(order_id=order.id).all()
            
            for item in order_items:
                menu_item = MenuItem.query.get(item.menu_item_id)
                if menu_item:
                    order_info['items'].append({
                        'name': menu_item.name,
                        'quantity': item.quantity,
                        'price': float(item.price),
                        'customizations': item.customizations
                    })
            
            pending_orders.append(order_info)
        
        log_info(f"Retrieved {len(pending_orders)} pending orders for restaurant {restaurant_id}")
        return jsonify({
            'success': True,
            'pending_orders': pending_orders
        })
        
    except Exception as e:
        log_error(f"Error fetching pending orders for restaurant {restaurant_id}: {str(e)}", exc_info=True)
        raise APIError("Failed to fetch pending orders", 500)

@order_tracking_bp.route('/orders/driver/<int:driver_id>/assigned', methods=['GET'])
def get_driver_assigned_orders(driver_id):
    """Get orders assigned to a driver"""
    try:
        # Get orders assigned to this driver that are not delivered
        active_statuses = ['ready', 'picked_up']
        orders = Order.query.filter(
            Order.driver_id == driver_id,
            Order.status.in_([OrderStatus(status) for status in active_statuses])
        ).order_by(Order.created_at.asc()).all()
        
        assigned_orders = []
        for order in orders:
            restaurant = Restaurant.query.get(order.restaurant_id)
            from src.models.user import User
            customer = User.query.get(order.customer_id)
            
            order_info = {
                'id': order.id,
                'status': order.status.value,
                'created_at': order.created_at.isoformat(),
                'restaurant': {
                    'name': restaurant.name if restaurant else 'Unknown Restaurant',
                    'address': restaurant.address if restaurant else None,
                    'phone': restaurant.phone if restaurant else None
                },
                'customer': {
                    'name': f"{customer.first_name} {customer.last_name}" if customer else 'Unknown Customer',
                    'phone': customer.phone if customer else None
                },
                'delivery_address': order.delivery_address,
                'total_amount': float(order.total_amount),
                'special_instructions': order.special_instructions
            }
            assigned_orders.append(order_info)
        
        log_info(f"Retrieved {len(assigned_orders)} assigned orders for driver {driver_id}")
        return jsonify({
            'success': True,
            'assigned_orders': assigned_orders
        })
        
    except Exception as e:
        log_error(f"Error fetching assigned orders for driver {driver_id}: {str(e)}", exc_info=True)
        raise APIError("Failed to fetch assigned orders", 500)

