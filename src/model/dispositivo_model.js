class Dispositivo{
    constructor({id, temp, hum,estado,ultimoRegistro}){
        this.id = id;
        this.temp = temp;
        this.hum = hum;
        this.estado = estado;
        this.ultimoRegistro = ultimoRegistro

    }
    estadoConverter(estado){
        if(estado ==0) this.estado = false;
        if(estado == 1) this.estado = true;
    }
}
class Monitor {
    constructor({id, temp,hum,tiempo,time,idDispositivo}){
        this.id = id;
        this.temp = temp;
        this.hum = hum;
        this.tiempo =tiempo;
        this.time = time;
        this.idDispositivo = idDispositivo;
    }
}
module.exports = {Dispositivo, Monitor};