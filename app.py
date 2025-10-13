import random
import json
from flask import Flask, render_template, request, make_response, jsonify

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/random-image')
def random_image():
    # Return a random Lorem Picsum image
    width = 200
    height = 200
    img_url = f"https://picsum.photos/{width}/{height}"
    return jsonify({'url': img_url})


if __name__ == '__main__':
    app.run(debug=True)