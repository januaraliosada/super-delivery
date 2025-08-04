#!/usr/bin/env python3
import os
from src.main import create_app

# Create the Flask application
app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == "__main__":
    app.run()

