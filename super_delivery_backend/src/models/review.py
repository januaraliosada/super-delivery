from flask_sqlalchemy import SQLAlchemy
from src.models.user import db
from datetime import datetime

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    comment = db.Column(db.Text)
    food_rating = db.Column(db.Integer)  # 1-5 stars for food quality
    delivery_rating = db.Column(db.Integer)  # 1-5 stars for delivery service
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    def __repr__(self):
        return f'<Review {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'rating': self.rating,
            'comment': self.comment,
            'food_rating': self.food_rating,
            'delivery_rating': self.delivery_rating,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'customer_id': self.customer_id,
            'restaurant_id': self.restaurant_id,
            'order_id': self.order_id,
            'driver_id': self.driver_id
        }

