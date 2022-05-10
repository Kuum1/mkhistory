window.onload = init
let lineas = [];
let pintarLinea = false;
let nuevaPosicionX = 0;
let nuevaPosicionY = 0;
let ColorDeLinea = "balck";
BACKGROUND_COLOR = "white";

let inputFile;

function init(){
    const miCanvas = document.getElementById('draw');
    const lista_colores = document.getElementsByClassName("color");

    // miCanvas.width = 400;//
    miCanvas.height = 400;

    miCanvas.addEventListener('mousedown', empezarDibujo);
    miCanvas.addEventListener('mousemove', dibujarLinea);
    miCanvas.addEventListener('mouseup', pararDibujar);

    miCanvas.addEventListener('touchstart', empezarDibujo);
    miCanvas.addEventListener('touchmove', dibujarLinea);

    const btn_enviar = document.getElementById("enviar")
    const btn_subir = document.getElementById("subir")
    inputFile = document.getElementById("inputFile")
    btn_enviar.addEventListener("click", enviar_img)
    btn_subir.addEventListener('click', subir_img)
    inputFile.addEventListener('change', enviar_img_desde_input)


    for(let i=0; i<lista_colores.length; i++){
        lista_colores[i].addEventListener('click', (e)=>{
            const element = e.target;
            const color = element.getAttribute("color");
            ColorDeLinea = color
        })
        lista_colores[i].style.background = lista_colores[i].getAttribute("color");
    }

    function empezarDibujo() {
        pintarLinea = true;
        lineas.push([]);
    };

    function dibujarLinea(event) {
        event.preventDefault();
        if (pintarLinea) {
            let ctx = miCanvas.getContext('2d')
            ctx.save()
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.lineWidth = 5;
            ctx.strokeStyle = ColorDeLinea;
            // Marca el nuevo punto
            if (event.changedTouches == undefined) {
                // console.log(event.layerX, posicion.width)
                nuevaPosicionX = event.clientX-this.offsetLeft;
                nuevaPosicionY = event.layerY-this.offsetTop;
            } else {
                nuevaPosicionX = event.changedTouches[0].pageX - this.offsetLeft;
                nuevaPosicionY = event.changedTouches[0].pageY - this.offsetTop;
            }
            // Guarda la linea
            guardarLinea(nuevaPosicionX, nuevaPosicionY);
            // Redibuja todas las lineas guardadas
            ctx.beginPath();
            lineas.forEach(function (segmento) {
                ctx.moveTo(segmento[0].x, segmento[0].y);
                ctx.beginPath()
                segmento.forEach(function (punto, i) {
                    ctx.lineTo(punto.x, punto.y);
                });
            });
            ctx.stroke();
        }
    }
}

function pararDibujar () {
    pintarLinea = false;
    guardarLinea();
}

function guardarLinea(nuevaPosicionX, nuevaPosicionY) {
    lineas[lineas.length - 1].push({
        x: nuevaPosicionX,
        y: nuevaPosicionY
    });
}

function borrar(){
    ColorDeLinea = BACKGROUND_COLOR;
}
function enviar_img(e){
    const miCanvas = document.getElementById('draw');
    const image = miCanvas.toDataURL("image/png")
    const data = {
        "img": image
    }
    guardar_imagen(data)
}

function guardar_imagen(data){
    fetch('/save', {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res=>{
        if(res.status!=200){
            throw res.text();
        }
        return res.json()
    })
    .then(info=>alert(info.status))
    .catch(async err=>alert(await err))
}

function subir_img(){
    inputFile.click()
}

function enviar_img_desde_input(e){
    const image = inputFile.files[0]
    let imgBs64;

    var reader = new FileReader();
    reader.onloadend = function (e) {
        imgBs64 = e.target.result.split("base64,")[1];
        const data = {
            'img': imgBs64
        }
        guardar_imagen(data)
    }
    reader.readAsDataURL(image);
}