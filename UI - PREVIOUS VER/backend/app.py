from flask import Flask
from flask_cors import CORS
from models.db import test_connection
from routes.auth import auth_bp
from routes.admin import admin_bp

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5174"])

app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)

@app.route("/api/health")
def health():
    return {"status": "ok", "service": "SR Comsoft API"}

if __name__ == "__main__":
    test_connection()
    app.run(debug=True, port=5000)