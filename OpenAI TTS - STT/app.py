from flask import Flask, render_template, request, send_file, jsonify
import os
from io import BytesIO
import requests

app = Flask(__name__)

openai_api_key = 'I aint sharing'

if not openai_api_key:
    raise ValueError("Please set the OPENAI_API_KEY environment variable")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio_file' not in request.files:
        return 'No file part', 400
    file = request.files['audio_file']
    if file.filename == '':
        return 'No selected file', 400

    url = 'https://api.openai.com/v1/audio/transcriptions'

    headers = {
        'Authorization': f'Bearer {openai_api_key}'
    }

    files = {
        'file': (file.filename, file.stream, file.mimetype),
        'model': (None, 'whisper-1')
    }

    try:
        response = requests.post(url, headers=headers, files=files)
        response.raise_for_status()
    except requests.exceptions.HTTPError as errh:
        return jsonify({'error': str(errh), 'details': response.text}), response.status_code
    except requests.exceptions.RequestException as err:
        return jsonify({'error': str(err)}), 500

    transcript = response.json()

    return jsonify({'transcript': transcript['text']})

@app.route('/synthesize', methods=['POST'])
def synthesize():
    text = request.form.get('text_to_speak')
    if not text:
        return 'No text provided', 400

    url = 'https://api.openai.com/v1/audio/speech'

    headers = {
        'Authorization': f'Bearer {openai_api_key}',
        'Content-Type': 'application/json'
    }

    data = {
        'model': 'tts-1',
        'input': text,
        'voice': 'alloy',  # Choose from available voices
        'response_format': 'mp3'
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
    except requests.exceptions.HTTPError as errh:
        return jsonify({'error': str(errh), 'details': response.text}), response.status_code
    except requests.exceptions.RequestException as err:
        return jsonify({'error': str(err)}), 500

    # The API returns the audio file content directly
    audio_content = response.content

    return send_file(BytesIO(audio_content), mimetype='audio/mpeg')

if __name__ == '__main__':
    app.run(debug=True)