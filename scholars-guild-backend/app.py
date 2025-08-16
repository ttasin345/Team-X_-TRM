from flask import Flask # type: ignore
from config import Config
from auth import auth_bp
from models import init_db

app = Flask(__name__)
app.config.from_object(Config)
app.register_blueprint(auth_bp, url_prefix="/api/auth")

init_db()

if __name__ == "__main__":
    app.run(debug=True)