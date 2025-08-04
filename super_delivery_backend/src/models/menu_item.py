from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
from datetime import datetime

class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50))  # e.g., "Appetizers", "Main Course", "Desserts"
    image_url = db.Column(db.String(200))
    is_available = db.Column(db.Boolean, default=True)
    is_vegetarian = db.Column(db.Boolean, default=False)
    is_vegan = db.Column(db.Boolean, default=False)
    is_gluten_free = db.Column(db.Boolean, default=False)
    calories = db.Column(db.Integer)
    preparation_time = db.Column(db.Integer, default=15)  # in minutes
    ingredients = db.Column(db.Text)  # JSON string for ingredients list
    allergens = db.Column(db.Text)  # JSON string for allergens list
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign key to Restaurant
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'), nullable=False)
    
    # Relationships
    order_items = db.relationship('OrderItem', backref='menu_item', lazy=True)

    def __repr__(self):
        return f'<MenuItem {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'category': self.category,
            'image_url': self.image_url,
            'is_available': self.is_available,
            'is_vegetarian': self.is_vegetarian,
            'is_vegan': self.is_vegan,
            'is_gluten_free': self.is_gluten_free,
            'calories': self.calories,
            'preparation_time': self.preparation_time,
            'ingredients': self.ingredients,
            'allergens': self.allergens,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'restaurant_id': self.restaurant_id
        }

