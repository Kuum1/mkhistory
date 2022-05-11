from pymongo import MongoClient, DESCENDING
from funciones import Logger
from dotenv import load_dotenv
from os import getenv
from pathlib import Path
from shutil import copy as copy_file
from datetime import datetime
import re

load_dotenv()
BASE_DIR = Path(__file__).parent
CLIENT = MongoClient(getenv("BD_URI"))
try:
    CLIENT.server_info()
except Exception:
    print("Unable to connect to the server.")

BD = CLIENT["bu7km0az7qvdgcm"]

hoy = datetime.now()

coll_imgs = BD.imagenes
imagen_elegida = [doc["nombre"] for doc in coll_imgs.find({"fecha":hoy}).sort('votos', DESCENDING).limit(1)]

regex = re.compile(r"\d{4}\-\d{2}\-\d{,2}")
dir_static = BASE_DIR / "static"

try:
    nombre_img = imagen_elegida[0]
    fecha = regex.findall(nombre_img)
    if fecha:
        dir_imgs = dir_static / "imgs"
        for dir_ in dir_imgs.iterdir():
            if dir_.name == fecha[0]:
                dir_img_ganadora = dir_ / nombre_img
                dir_elegidas = dir_imgs / "elegidas" / nombre_img
                copy_file(dir_img_ganadora, dir_elegidas)
                with open(BASE_DIR / "elegida.txt", "w") as f_nombre_img:
                    f_nombre_img.write(nombre_img)
                break
except Exception as e:
    logger = Logger()
    logger.log(e)