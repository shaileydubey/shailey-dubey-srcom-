from flask import Blueprint, request, jsonify
import jwt
from config import JWT_SECRET
from models.db import get_db

admin_bp = Blueprint("admin", __name__)

def get_current_user(request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        conn = get_db()
        cursor = conn.cursor(dictionary=True, buffered=True)
        cursor.execute("SELECT * FROM users WHERE id = %s", (payload["user_id"],))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        return user
    except:
        return None

def admin_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user(request)
        if not user or user["role"] != "admin":
            return jsonify({"error": "Unauthorized"}), 403
        return f(*args, **kwargs)
    return decorated

@admin_bp.route("/api/admin/stats", methods=["GET"])
@admin_required
def get_stats():
    conn = get_db()
    cursor = conn.cursor(dictionary=True, buffered=True)
    cursor.execute("SELECT COUNT(*) as total_users FROM users")
    total_users = cursor.fetchone()["total_users"]
    cursor.close()
    conn.close()
    return jsonify({
        "totalUsers": total_users,
        "totalCalls": 0,
        "creditsUsed": 0,
    })

@admin_bp.route("/api/admin/users", methods=["GET"])
@admin_required
def get_users():
    conn = get_db()
    cursor = conn.cursor(dictionary=True, buffered=True)
    cursor.execute("SELECT id, name, email, role, is_active FROM users")
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(users)

@admin_bp.route("/api/admin/users/<int:user_id>/status", methods=["PUT"])
@admin_required
def toggle_status(user_id):
    conn = get_db()
    cursor = conn.cursor(dictionary=True, buffered=True)
    cursor.execute("SELECT is_active FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    if not user:
        return jsonify({"error": "User not found"}), 404
    new_status = 0 if user["is_active"] else 1
    cursor.execute("UPDATE users SET is_active = %s WHERE id = %s", (new_status, user_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"success": True, "is_active": new_status})

@admin_bp.route("/api/admin/users/<int:user_id>/credits", methods=["PUT"])
@admin_required
def add_credits(user_id):
    data = request.get_json()
    amount = int(data.get("amount", 0))
    if amount <= 0:
        return jsonify({"error": "Invalid amount"}), 400
    conn = get_db()
    cursor = conn.cursor(buffered=True)
    cursor.execute("UPDATE users SET credits = COALESCE(credits, 0) + %s WHERE id = %s", (amount, user_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"success": True})