from flask import Flask, render_template, request, jsonify
from io import BytesIO
from PIL import Image
import requests, base64
import random

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/random-image')
def random_image():
    width, height = 640, 480
    img_id = random.randint(0, 1084)

    # Return a random Lorem Picsum image
    img_url = f"https://picsum.photos/id/{img_id}/{width}/{height}"
    return jsonify({'url': img_url, 'id': img_id})


@app.route('/pixelate-image')
def pixelate_image():
    # Get image URL from request
    image_url = request.args.get('url')
    if not image_url:
        return jsonify({'error': 'Missing URL'}), 400

    # Pixelation level (e.g. smaller value = chunkier pixels)
    pixel_size = int(request.args.get('pixels', 32))

    # Download image
    response = requests.get(image_url)
    image = Image.open(BytesIO(response.content))

    # Get image size
    width, height = image.size

    # Resize down and back up using NEAREST interpolation
    image_small = image.resize((pixel_size, int(pixel_size * height / width)), Image.NEAREST)
    pixelated = image_small.resize((width, height), Image.NEAREST)

    # Convert to base64 for sending to frontend
    buffered = BytesIO()
    pixelated.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return jsonify({'pixelated': f"data:image/png;base64,{img_base64}"})


if __name__ == '__main__':
    app.run(debug=True)