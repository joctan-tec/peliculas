from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from random import shuffle
import datetime


app = Flask(__name__)
# Enable CORS for all routes
CORS(app)

def get_peliculas():
    with open('data.json', 'r') as file:
        try:
            peliculas = json.load(file)
            peliculas_array = peliculas["peliculas"]
            # Shuffle the peliculas array to randomize the order
            shuffle(peliculas_array)
            peliculas["peliculas"] = peliculas_array
            return peliculas
        except json.JSONDecodeError:
            return []

def set_peliculas_vista(titulo):
    peliculas = get_peliculas()
    for pelicula in peliculas["peliculas"]:
        if pelicula['nombre'] == titulo:
            pelicula['ya_vista'] = True
            # Set the current date as the view date YYYY-MM-DD
            pelicula['fecha_vista'] = datetime.datetime.now().strftime("%Y-%m-%d")
            break
    with open('data.json', 'w') as file:
        json.dump(peliculas, file, indent=4)
    
    return peliculas

def add_pelicula(nombre, imagen, enlace):
    peliculas = get_peliculas()
    nueva_pelicula = {
        "nombre": nombre,
        "imagen": imagen,
        "enlace": enlace,
        "ya_vista": False,
        "fecha_vista": None,
        "calificacion_novio": 0,
        "calificacion_novia": 0
    }
    peliculas["peliculas"].append(nueva_pelicula)
    with open('data.json', 'w') as file:
        json.dump(peliculas, file, indent=4)
    
    return peliculas

def qualify_pelicula(nombre, calificacion_novio, calificacion_novia):
    peliculas = get_peliculas()
    for pelicula in peliculas["peliculas"]:
        if pelicula['nombre'] == nombre:
            pelicula['calificacion_novio'] = calificacion_novio
            pelicula['calificacion_novia'] = calificacion_novia
            break
    with open('data.json', 'w') as file:
        json.dump(peliculas, file, indent=4)
    
    return peliculas







"""
JSON Structure for Peliculas:
{
    "nombre": string,
    "imagen": string,
    "enlace": string,
    "ya_vista": boolean 
}
"""
@app.route('/peliculas', methods=['GET'])
def peliculas():
    peliculas = get_peliculas()
    if not peliculas:
        return jsonify({"error": "No se encontraron películas"}), 404
    return jsonify(peliculas), 200

# Recibe un ?titulo=string de una pelicula y marca como vista
@app.route('/marcar_vista', methods=['GET'])
def marcar_vista():
    titulo = request.args.get('titulo')
    if not titulo:
        return jsonify({"error": "Falta el parámetro 'titulo'"}), 400

    peliculas = set_peliculas_vista(titulo)
    return jsonify(peliculas), 200

@app.route('/agregar_pelicula', methods=['POST'])
def agregar_pelicula():
    data = request.get_json()
    if not data or not all(key in data for key in ('nombre', 'imagen', 'enlace')):
        return jsonify({"error": "Faltan datos para agregar la película"}), 400

    nombre = data['nombre']
    imagen = data['imagen']
    enlace = data['enlace']

    peliculas = add_pelicula(nombre, imagen, enlace)
    return jsonify(peliculas), 201

@app.route('/calificar_pelicula', methods=['POST'])
def calificar_pelicula():
    data = request.get_json()
    if not data or not all(key in data for key in ('nombre', 'calificacion_novio', 'calificacion_novia')):
        return jsonify({"error": "Faltan datos para calificar la película"}), 400

    nombre = data['nombre']
    calificacion_novio = data['calificacion_novio']
    calificacion_novia = data['calificacion_novia']

    peliculas = qualify_pelicula(nombre, calificacion_novio, calificacion_novia)
    return jsonify(peliculas), 200



if __name__ == '__main__':
    app.run(debug=False, host='localhost', port=5000)
