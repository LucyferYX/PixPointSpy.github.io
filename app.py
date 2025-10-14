from flask import Flask, render_template, request, jsonify
from io import BytesIO
from PIL import Image
import requests, base64, random, time

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/game')
def game():
    return render_template('game.html')

@app.route('/statistics')
def statistics():
    return render_template('statistics.html')


@app.route('/random-image')
def random_image():
    width, height = 640, 480
    img_id = random.randint(0, 1084)

    # Return a random Lorem Picsum image
    img_url = f"https://picsum.photos/id/{img_id}/{width}/{height}"
    return jsonify({'url': img_url, 'id': img_id})


def fetch_image_safe(url, retries=3):
    for _ in range(retries):
        try:
            r = requests.get(url, timeout=5)
            if r.status_code == 200 and "image" in r.headers.get("Content-Type", ""):
                return r
        except Exception:
            pass
        time.sleep(0.5)
    return None


@app.route('/pixelate-image')
def pixelate_image():
    image_url = request.args.get('url')
    if not image_url:
        return jsonify({'error': 'Missing URL'}), 400

    # Pixelation level
    pixel_size = max(1, min(int(request.args.get('pixels', 32)), 512))

    # Download image, get its size
    response = requests.get(image_url, timeout=5)

    # Verify the response is an image
    content_type = response.headers.get("Content-Type", "")
    if "image" not in content_type or response.status_code != 200:
        print(f"⚠️ Invalid image response from {image_url} ({response.status_code})")
        return jsonify({'error': 'Invalid image data from source'}), 500
    
    response = fetch_image_safe(image_url)
    if not response:
        return jsonify({'error': 'Could not fetch a valid image'}), 500
    image = Image.open(BytesIO(response.content))

    width, height = image.size

    # Downscale and upscale (pixelate)
    image_small = image.resize((pixel_size, int(pixel_size * height / width)), Image.NEAREST)
    pixelated = image_small.resize((width, height), Image.NEAREST)

    # Make a copy for modified version
    altered = image_small.copy()
    altered_pixels = altered.load()

    # Choose random pixel to change
    changed_x = random.randint(0, altered.width - 1)
    changed_y = random.randint(0, altered.height - 1)

    # Modify color more noticeably
    r, g, b = altered_pixels[changed_x, changed_y]

    # Choose random color channel to adjust and stronger delta
    channel = random.choice(['r', 'g', 'b'])
    delta = random.choice([-60, -40, 40, 60])

    if channel == 'r':
        new_color = (max(0, min(255, r + delta)), g, b)
    elif channel == 'g':
        new_color = (r, max(0, min(255, g + delta)), b)
    else:
        new_color = (r, g, max(0, min(255, b + delta)))

    altered_pixels[changed_x, changed_y] = new_color

    # For debugging – show what was changed
    change_description = {
        'x': changed_x,
        'y': changed_y,
        'channel': channel,
        'delta': delta,
        'original_color': (r, g, b),
        'new_color': new_color
    }

    # Upscale the altered image back
    altered_big = altered.resize((width, height), Image.NEAREST)

    # Convert both to base64
    def img_to_b64(img):
        buf = BytesIO()
        img.save(buf, format='PNG')
        return base64.b64encode(buf.getvalue()).decode('utf-8')

    return jsonify({
        'original': f"data:image/png;base64,{img_to_b64(pixelated)}",
        'altered': f"data:image/png;base64,{img_to_b64(altered_big)}",
        'changed_pixel': {'x': changed_x, 'y': changed_y, 'w': altered.width, 'h': altered.height},
        'debug': change_description
    })


if __name__ == '__main__':
    app.run(debug=True)