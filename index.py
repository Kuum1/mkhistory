import pymongo
from datetime import date
from flask import Flask, render_template, request, session, abort, Response
from funciones import check_voto, buscar_img_ganadora
from secrets import token_urlsafe
from dotenv import load_dotenv
from pathlib import Path
from os import getenv, mkdir
from os.path import isdir
import base64
import threading

hilo = threading.Thread(target=buscar_img_ganadora)
hilo.start()

load_dotenv()
app = Flask(__name__)
app.secret_key = token_urlsafe(20)

CLIENT = pymongo.MongoClient(getenv("BD_URI"))
BD = CLIENT["bu7km0az7qvdgcm"]

BASE_DIR = Path(__file__).parent

@app.route("/home")
@app.get("/")
def main():
    if not "user" in session: session["user"]= {"fecha": str(date.today())}
    with open(BASE_DIR / "elegida.txt",  "r") as f:
        nombre_img_elegida = f.read()
    return render_template("home.html", img_elegida=nombre_img_elegida)

@app.post("/save")
def save_img():
    coll_img = BD.imagenes
    hoy = str(date.today())
    if session.get("subida") == hoy:
        abort(Response("Ya has subido una continuación a la historia", 403))
    elif not "user" in session: abort(401)
    
    json:dict = request.get_json()
    if not "img" in json: abort(400)
    
    name = f"{token_urlsafe(10)}-{hoy}.png"

    dir_imgs = BASE_DIR / 'static' / 'imgs'/ hoy
    if not isdir(dir_imgs): mkdir(dir_imgs)
    try:
        with open(dir_imgs / name, "wb") as f_img:
            image =  base64.b64decode(json["img"].split(",")[-1])
            f_img.write(image)
        coll_img.insert_one({
            "votos": 0,
            "nombre": name
        })
        session["subida"] = hoy
        return {"status": "subido con éxito"}
    except:
        return {"status": "Ha ocurrido un error al guardar la imagen"}

@app.get("/votar")
def votar():
    hoy = str(date.today())
    if not "user" in session: session["user"] = {"fecha": hoy}
    try:
        dir_images = BASE_DIR / "static" / "imgs" / hoy
        today_images = {}
        for img in dir_images.iterdir():
            with open(img, 'rb') as f_img:
                today_images[img.name]='data:image/png;base64,'+base64.b64encode(f_img.read()).decode()
    except FileNotFoundError:
        today_images = {}
    return render_template("votar.html", today_images=today_images)


@app.post("/votarimg")
@check_voto
def votar_img(json:dict):
    if not "user" in session: abort(401)
    coll_img = BD.imagenes
    
    nombre_img = json.get("nombre")
    voto = json.get("voto") 
    if voto==1: voto=1
    elif voto==0: voto=-1
    else: abort(Response("Acción inválida",  400))
    coll_img.update_one({"nombre":nombre_img}, {"$inc": {"votos":voto}})
    
    if session.get("votos") == None: session["votos"] = [nombre_img]
    else: session["votos"]+=[nombre_img]
    
    return {"status":"ok"}

if __name__ == '__main__':
    app.run(debug=getenv("APP_ENV"), port=5055)