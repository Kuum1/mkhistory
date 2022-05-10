from functools import wraps
from flask import Response, request, session, abort, Response
from pathlib import Path
from datetime import datetime
from subprocess import Popen
from os import getenv


def check_voto(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        json:dict = request.get_json()
        votos_hechos = session.get("votos", [])
        if json.get("nombre") in votos_hechos: abort(Response("Ya has votado", 403))
        return function(*args, **kwargs, json=json)
    return wrapper

def buscar_img_ganadora():
    ejecutado = False
    while True:
        fecha = datetime.now()
        if fecha.hour == 23 and fecha.minute == 59:
            if not ejecutado:
                Popen(args=[getenv("PATH_EXE_PY"), "setImg.py"])
                ejecutado = True
        else: ejecutado = False

class Logger():
    def __init__(self, path:Path=Path(__file__).parent, nombre="logs.txt"):
        self.full_path = path / nombre
    
    def log(self, info):
        with open(self.full_path, "a+") as f_log:
            f_time = datetime.now().strftime("%Y-%m-%d %I:%S:%M %p")
            log = f"[{f_time}] {info}\n"
            f_log.write(log)

