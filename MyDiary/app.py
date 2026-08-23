import os
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import sqlite3
load_dotenv()

app = Flask(__name__)

DATABASE = "diary.db"


def create_database():
    connection = sqlite3.connect(DATABASE)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


create_database()


@app.route("/")
def home():

    if not session.get("logged_in"):
        return redirect(url_for("login"))

    return render_template("index.html")

@app.route("/api/pages")
def get_pages():
    if not session.get("logged_in"):
        return jsonify({"error": "Unauthorized"}), 401
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row

    pages = connection.execute(
        "SELECT * FROM pages ORDER BY id"
    ).fetchall()

    connection.close()
    
    return [dict(page) for page in pages]

@app.route("/api/pages", methods=["POST"])
def create_page():
    if not session.get("logged_in"):
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json

    title = data.get("title", "Untitled")
    content = data.get("content", "")

    connection = sqlite3.connect(DATABASE)

    connection.execute(
        """
        INSERT INTO pages (title, content, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
        """,
        (title, content)
    )

    new_page_id = connection.execute(
        "SELECT last_insert_rowid()"
    ).fetchone()[0]

    connection.commit()
    connection.close()
    
    return jsonify({
        "message": "Page created successfully",
        "id": new_page_id
    })
@app.route("/api/pages/<int:page_id>", methods=["PUT"])
def update_page(page_id):
    if not session.get("logged_in"):
        return jsonify({"error": "Unauthorized"}), 401
    data = request.json

    title = data.get("title", "")
    content = data.get("content", "")

    connection = sqlite3.connect(DATABASE)

    connection.execute(
        """
        UPDATE pages
        SET title = ?, content = ?, updated_at = datetime('now')
        WHERE id = ?
        """,
        (title, content, page_id)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Page updated successfully"
    })
@app.route("/api/pages/<int:page_id>", methods=["DELETE"])
def delete_page(page_id):
    if not session.get("logged_in"):
        return jsonify({"error": "Unauthorized"}), 401
    connection = sqlite3.connect(DATABASE)

    connection.execute(
        "DELETE FROM pages WHERE id = ?",
        (page_id,)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "message": "Page deleted successfully"
    })
@app.route("/api/search")
def search_pages():
    if not session.get("logged_in"):
        return jsonify({"error": "Unauthorized"}), 401

    search_text = request.args.get("q", "").strip()

    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row

    pages = connection.execute(
        """
        SELECT *
        FROM pages
        WHERE title LIKE ?
           OR content LIKE ?
        ORDER BY id
        """,
        (f"%{search_text}%", f"%{search_text}%")
    ).fetchall()

    connection.close()

    return jsonify([dict(page) for page in pages])
app.secret_key =  os.getenv("SECRET_KEY")


@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        password = request.form.get("password")

        if password == os.getenv("DIARY_PASSWORD"):

            session["logged_in"] = True

            return redirect(url_for("home"))

        return render_template(
            "login.html",
            error="Incorrect password"
        )

    return render_template("login.html")
@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("login"))
@app.route("/api/calendar")
def calendar_pages():

    if not session.get("logged_in"):
        return jsonify({"error": "Unauthorized"}), 401

    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row

    pages = connection.execute(
        """
        SELECT id, title, created_at
        FROM pages
        ORDER BY created_at
        """
    ).fetchall()

    connection.close()

    return jsonify([dict(page) for page in pages])
if __name__ == "__main__":
    app.run(debug=True)