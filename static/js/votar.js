window.onload = voteInit;

function voteInit(){
    cargarVotosAnteriores()
    const rowsVote = document.getElementsByClassName("vote")
    for(let i=0; i<rowsVote.length; i++){
        rowsVote[i].addEventListener('click', vote)
    }
}

function vote(e){
    const element = e.target
    const tipo_voto = element.getAttribute("vote")=="up" ? 1: 0
    const name_image = element.parentElement.getAttribute("nameImage")
    
    const data = {
        "voto": tipo_voto,
        "nombre": name_image
    }

    fetch('/votarimg', {
        method: "POST",
        body: JSON.stringify(data),
        headers:{
            'Content-type': 'application/json'
        }
    })
    .then(res=>{
        if(res.status==200){
            guardar_voto_session(element.parentElement, element.getAttribute("vote"))
            setColorRow(element)
            return;
        }
        throw res.text()
    })
    .catch(async err=> alert(await err))
}

function guardar_voto_session(element, voto){
    const nombre = element.getAttribute("nameImage")
    let votos_hechos = localStorage.getItem("votos");
    if(votos_hechos){
        json = JSON.parse(votos_hechos)
        json.push({nombre, voto})
        localStorage.setItem("votos", JSON.stringify(json))
    }else{
        const json = [{nombre, voto}]
        localStorage.setItem("votos", JSON.stringify(json))
    }
}

function cargarVotosAnteriores(){
    const votos_hechos = localStorage.getItem("votos");
    if(votos_hechos){
        const array_votos = JSON.parse(votos_hechos)
        array_votos.forEach(element => {
            const imagen = document.querySelectorAll(`[nameImage="${element.nombre}"]`)
            const rows = imagen[0].children;
            for(let i=0; i<rows.length; i++){
                if(rows[i].getAttribute("vote")==element.voto){
                    setColorRow(rows[i])
                    return;
                }
            }
        });
    }
}

function setColorRow(row){
    const color = row.getAttribute("color")
    let attr_class = row.getAttribute("class")
    row.setAttribute("class", attr_class.replace("bx-", "bxs-"))
    row.style.color = color;
}