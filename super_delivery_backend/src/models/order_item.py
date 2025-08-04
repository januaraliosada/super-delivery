from flask_sqlalchemy import SQLAlchemy
from src.models.user import db

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    unit_price = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    special_instructions = db.Column(db.Text)
    customizations = db.Column(db.Text)  # JSON string for customizations
    
    # Foreign keys
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_item.id'), nullable=False)

    def __repr__(self):
        return f'<OrderItem {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'total_price': self.total_price,
            'special_instructions': self.special_instructions,
            'customizations': self.customizations,
            'order_id': self.order_id,
            'menu_item_id': self.menu_item_id
        }

