from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
from datetime import datetime

class Restaurant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    address = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    cuisine_type = db.Column(db.String(50))
    rating = db.Column(db.Float, default=0.0)
    delivery_fee = db.Column(db.Float, default=0.0)
    minimum_order = db.Column(db.Float, default=0.0)
    estimated_delivery_time = db.Column(db.Integer, default=30)  # in minutes
    is_active = db.Column(db.Boolean, default=True)
    image_url = db.Column(db.String(200))
    opening_hours = db.Column(db.String(100))  # JSON string for complex hours
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign key to User (restaurant owner)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    menu_items = db.relationship('MenuItem', backref='restaurant', lazy=True, cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='restaurant', lazy=True)
    reviews = db.relationship('Review', backref='restaurant', lazy=True)

    def __repr__(self):
        return f'<Restaurant {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'address': self.address,
            'phone': self.phone,
            'email': self.email,
            'cuisine_type': self.cuisine_type,
            'rating': self.rating,
            'delivery_fee': self.delivery_fee,
            'minimum_order': self.minimum_order,
            'estimated_delivery_time': self.estimated_delivery_time,
            'is_active': self.is_active,
            'image_url': self.image_url,
            'opening_hours': self.opening_hours,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'owner_id': self.owner_id
        }

