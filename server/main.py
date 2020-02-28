from flask import Flask

@app.route("/")
def client():
    return app.send_static_file("client.html")
