import sqlite3
from flask import Blueprint, request, jsonify  # type: ignore
import jwt  # type: ignore
import datetime
from config import Config
from models import create_user, verify_user

auth_bp = Blueprint("auth", __name__)

# 🧾 Register route
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    try:
        create_user(data["username"], data["password"])
        return jsonify({"message": "User registered"}), 201
    except Exception:
        return jsonify({"error": "User already exists"}), 400

# 🔐 Login route
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if verify_user(data["username"], data["password"]):
        token = jwt.encode({
            "username": data["username"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, Config.SECRET_KEY, algorithm="HS256")
        return jsonify({"token": token})
    return jsonify({"error": "Invalid credentials"}), 401

# 🙋‍♂️ Authenticated user info
@auth_bp.route("/me", methods=["GET"])
def me():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    try:
        decoded = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        return jsonify({ "username": decoded["username"] })
    except Exception:
        return jsonify({ "error": "Invalid token" }), 401

# 🛠️ Profile update route
@auth_bp.route("/update", methods=["POST"])
def update_profile():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    try:
        decoded = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        username = decoded["username"]
        data = request.get_json()

        conn = sqlite3.connect(Config.DATABASE)
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users SET name = ?, avatar = ? WHERE username = ?
        """, (data.get("name"), data.get("avatar"), username))
        conn.commit()
        conn.close()

        return jsonify({
            "username": username,
            "name": data.get("name"),
            "avatar": data.get("avatar")
        })
    except Exception:
        return jsonify({ "error": "Invalid token or update failed" }), 401