from flask import Flask, request, jsonify
import os
from flask_cors import CORS 
from werkzeug.utils import secure_filename
from utils.model import LlamaModel

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}})
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx', 'xlsx', 'pptx'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    
    if not data or 'question' not in data:
        return jsonify({'error': 'No question provided'}), 400
        
    question = data['question']
    response = model.generate_text(question)
    return jsonify({'answer':response}) , 200

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        return jsonify({
            'message': 'File successfully uploaded',
            'filename': filename,
            'size': os.path.getsize(os.path.join(app.config['UPLOAD_FOLDER'], filename)),
            'type': filename.rsplit('.', 1)[1].lower()
        })
    else:
        return jsonify({
            'error': f'File type not allowed. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
        }), 400

if __name__ == '__main__':
    model = LlamaModel()
    model.load_model()
    app.run(debug=True)