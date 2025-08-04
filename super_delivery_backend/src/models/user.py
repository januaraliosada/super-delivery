from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum

db = SQLAlchemy()

class UserType(Enum):
    CUSTOMER = "customer"
    RESTAURANT_OWNER = "restaurant_owner"
    DRIVER = "driver"
    ADMIN = "admin"

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    phone = db.Column(db.String(20))
    user_type = db.Column(db.Enum(UserType), nullable=False, default=UserType.CUSTOMER)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    profile_image_url = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Driver-specific fields
    driver_license = db.Column(db.String(50))
    vehicle_type = db.Column(db.String(50))
    vehicle_plate = db.Column(db.String(20))
    is_available = db.Column(db.Boolean, default=False)  # For drivers
    current_location_lat = db.Column(db.Float)
    current_location_lng = db.Column(db.Float)
    
    # Customer-specific fields
    default_address = db.Column(db.String(200))
    
    # Relationships
    customer_orders = db.relationship('Order', foreign_keys='Order.customer_id', backref='customer', lazy=True)
    driver_orders = db.relationship('Order', foreign_keys='Order.driver_id', backref='driver', lazy=True)
    restaurants = db.relationship('Restaurant', backref='owner', lazy=True)
    reviews_given = db.relationship('Review', foreign_keys='Review.customer_id', backref='customer', lazy=True)
    reviews_received = db.relationship('Review', foreign_keys='Review.driver_id', backref='reviewed_driver', lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'user_type': self.user_type.value if self.user_type else None,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'profile_image_url': self.profile_image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'driver_license': self.driver_license,
            'vehicle_type': self.vehicle_type,
            'vehicle_plate': self.vehicle_plate,
            'is_available': self.is_available,
            'current_location_lat': self.current_location_lat,
            'current_location_lng': self.current_location_lng,
            'default_address': self.default_address
        }
