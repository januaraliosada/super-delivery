from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
from datetime import datetime
from enum import Enum

class OrderStatus(Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY_FOR_PICKUP = "ready_for_pickup"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(20), unique=True, nullable=False)
    status = db.Column(db.Enum(OrderStatus), default=OrderStatus.PENDING)
    
    # Customer information
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    delivery_address = db.Column(db.String(200), nullable=False)
    customer_phone = db.Column(db.String(20))
    special_instructions = db.Column(db.Text)
    
    # Restaurant information
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'), nullable=False)
    
    # Driver information
    driver_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    # Pricing
    subtotal = db.Column(db.Float, nullable=False)
    delivery_fee = db.Column(db.Float, default=0.0)
    tax_amount = db.Column(db.Float, default=0.0)
    tip_amount = db.Column(db.Float, default=0.0)
    discount_amount = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, nullable=False)
    
    # Timing
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    confirmed_at = db.Column(db.DateTime)
    estimated_delivery_time = db.Column(db.DateTime)
    delivered_at = db.Column(db.DateTime)
    
    # Payment
    payment_method = db.Column(db.String(50))  # e.g., "credit_card", "paypal", "cash"
    payment_status = db.Column(db.String(20), default="pending")  # "pending", "completed", "failed"
    payment_transaction_id = db.Column(db.String(100))
    
    # Relationships
    order_items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='order', lazy=True)

    def __repr__(self):
        return f'<Order {self.order_number}>'

    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'status': self.status.value if self.status else None,
            'customer_id': self.customer_id,
            'delivery_address': self.delivery_address,
            'customer_phone': self.customer_phone,
            'special_instructions': self.special_instructions,
            'restaurant_id': self.restaurant_id,
            'driver_id': self.driver_id,
            'subtotal': self.subtotal,
            'delivery_fee': self.delivery_fee,
            'tax_amount': self.tax_amount,
            'tip_amount': self.tip_amount,
            'discount_amount': self.discount_amount,
            'total_amount': self.total_amount,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'estimated_delivery_time': self.estimated_delivery_time.isoformat() if self.estimated_delivery_time else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'payment_transaction_id': self.payment_transaction_id
        }

