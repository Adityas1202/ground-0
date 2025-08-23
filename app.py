from flask import Flask, render_template, request, redirect, url_for
import sqlite3

app = Flask(__name__)

# --- Database Setup ---
def init_db():
    conn = sqlite3.connect("mediease.db")
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS bookings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    location TEXT NOT NULL,
                    test TEXT NOT NULL,
                    date TEXT NOT NULL
                )''')
    conn.commit()
    conn.close()

init_db()

# --- Routes ---
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/test-booking")
def test_booking():
    return render_template("test-booking.html")

@app.route("/appointments")
def appointments():
    return render_template("appointments.html")

@app.route("/other-services")
def other_services():
    return render_template("other-services.html")

# --- Handle form submission ---
@app.route("/book-test", methods=["POST"])
def book_test():
    name = request.form["name"]
    location = request.form["location"]
    test = request.form["test"]
    date = request.form["date"]

    # Save booking into SQLite
    conn = sqlite3.connect("mediease.db")
    c = conn.cursor()
    c.execute("INSERT INTO bookings (name, location, test, date) VALUES (?, ?, ?, ?)",
              (name, location, test, date))
    conn.commit()
    conn.close()

    return f"<h2>Booking Confirmed!</h2><p>{name}, your {test} is scheduled on {date} at {location}.</p>"

if __name__ == "__main__":
    app.run(debug=True)
