from flask import Flask, request, jsonify
from query_engine.loader import query_engine as default_query_engine
from query_engine.engine import initialize_query_engine
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Variable global para recargar si es necesario
current_query_engine = default_query_engine


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/")
def index():
    return "Servidor RAG con Gemini activo", 200


# Ruta para preguntar al modelo
@app.route("/preguntar", methods=["POST"])
def preguntar():
    data = request.json
    pregunta = data.get("pregunta")
    if not pregunta:
        return jsonify({"error": "Falta la pregunta"}), 400

    pregunta = pregunta.strip() + ". Responde en español."
    respuesta = current_query_engine.query(pregunta)
    return jsonify({"respuesta": str(respuesta)}), 200


# En caso de que se necesite recargar el índice
@app.route("/reload", methods=["POST"])
def reload_engine():
    global current_query_engine
    current_query_engine = initialize_query_engine()
    return jsonify({"mensaje": "Índice regenerado exitosamente."}), 200


# Ruta para subir un archivo PDF
@app.route("/subir", methods=["POST"])
def subir_pdf():
    if "archivos" not in request.files:
        return jsonify({"error": "No se enviaron archivos."}), 400

    archivos = request.files.getlist("archivos")
    if not archivos or all(archivo.filename == "" for archivo in archivos):
        return jsonify({"error": "Ningún archivo seleccionado."}), 400

    mensajes = []
    for archivo in archivos:
        if archivo and allowed_file(archivo.filename):
            print("Archivo subido:", archivo.filename)
            filename = secure_filename(archivo.filename)
            path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            archivo.save(path)
            mensajes.append(f"'{filename}' subido correctamente.")
        else:
            mensajes.append(f"'{archivo.filename}' no es un PDF válido.")

    # Actualizar el query engine si al menos un archivo fue subido
    if any("subido correctamente" in m for m in mensajes):
        global current_query_engine
        current_query_engine = initialize_query_engine()

    return jsonify({"mensaje": "\n".join(mensajes)}), 200


if __name__ == "__main__":
    app.run(debug=False)
