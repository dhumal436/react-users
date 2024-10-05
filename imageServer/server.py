from flask import Flask, send_from_directory, jsonify
import os

app = Flask(__name__)

# Set the directory where your images are stored
IMAGE_DIR = 'images'

@app.route('/api/images', methods=['GET'])
def list_images():
    """List all images in the directory."""
    images = os.listdir(IMAGE_DIR)
    return jsonify(images)

@app.route('/api/images/<filename>', methods=['GET'])
def get_image(filename):
    """Get a specific image."""
    return send_from_directory(IMAGE_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")