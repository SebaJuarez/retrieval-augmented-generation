# app.py
from llama_cpp import Llama
import os
import pathlib

class LlamaModel:
    def __init__(self):
        self.model = None
        self.llm = None

    def load_model(self):
        try:
            model_dir = pathlib.Path(__file__).parent.parent / "model"
            model_filename = "mistral-7b-instruct-v0.2.Q4_K_M.gguf"
            MODEL_PATH = os.environ.get("MODEL_PATH", str(model_dir / model_filename))
            print(f"[*] Iniciando la carga del modelo desde: {MODEL_PATH}")
            self.llm = Llama(
                model_path=MODEL_PATH,
                n_gpu_layers=0,
                n_ctx=2048,
                n_threads=os.cpu_count(),
                verbose=True
            )
            print("[*] Modelo cargado exitosamente en CPU.")
        except Exception as e:
            print(f"[!] Error al cargar o ejecutar el modelo: {e}")

    def generate_text(self, prompt, max_tokens=200):
        print(f"\n[*] Prompt: {prompt}")
        output = self.llm(
            prompt,
            max_tokens=max_tokens,
            stop=["<|im_end|>", "</s>"],
            echo=False
        )
        generated_text = output["choices"][0]["text"]
        print(f"[*] Respuesta: {generated_text}")
        return generated_text