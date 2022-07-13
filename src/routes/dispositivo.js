const express = require('express');
const root = express.Router();
const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));
const db = require('../database');

root.get('/getListaDeDispositivos', (_req, res) => {
    db.query('SELECT * FROM dispositivo', (err, rows) => {
        if (!err) {
            if (rows.length > 0) {
                res.status(200).send(rows);
            } else {
                res.status(200).send([]);
            }
        } else {
            res.status(400).send(err);
        }
    });
});

root.get('/getHistorial/:idDisp', (req, res) => {
    const { idDisp } = req.params;
    db.query('SELECT monitor.* FROM dispositivo, monitor WHERE dispositivo.id = monitor.idCliente AND dispositivo.id = ?', [idDisp], (err, rows) => {
        if (!err) {
            if (rows.length > 0) {
                res.status(200).send(rows);
            } else {
                res.status(200).send([]);
            }
        } else {
            res.status(400).send(`Error: ${err}`);
        }
    });
});

root.get('/getHistorialPorDia/:idDisp', (req, res) => {
    const { idDisp } = req.params;
    const listaHistorial = [];
    let fechaActual = fecha();
    const fechaFinal = fechaActual + "23:59:59.999";
    fechaActual = fechaActual + " 00:00:00.000";
    db.query('SELECT monitor.* FROM dispositivo, monitor WHERE dispositivo.id = monitor.idCliente AND dispositivo.id = ? AND monitor.time BETWEEN ? AND ? ORDER BY monitor.time ASC', [idDisp, fechaActual, fechaFinal], (err, rows) => {
        if (!err) {
            if (rows.length > 0) {
                for (const historialActual of rows) {
                    const {Tiempo, ...histoNuevo } = historialActual;
                    listaHistorial.push(histoNuevo);
                }
                res.status(200).send(listaHistorial);
            } else {
                res.status(200).send([]);
            }
        } else {
            res.status(400).send(`Errorcito: ${err}`);
        }
    });
});

root.get('/getHistorialPorSemana/:idDisp', (req, res) => {
    const { idDisp } = req.params;
    const listaHistorial = [];
    const fechaInicial = getInicioDeSemana() + " 00:00:00.000";
    const fechaActual = fecha() + " 23:59:59.999";
    db.query('SELECT monitor.* FROM dispositivo, monitor WHERE dispositivo.id = monitor.idCliente AND dispositivo.id = ? AND monitor.time BETWEEN ? AND ? ORDER BY monitor.time ASC', [idDisp, fechaInicial, fechaActual], (err, rows) => {
        if (!err) {
            if (rows.length > 0) {
                for (const historialActual of rows) {
                    const {Tiempo, ...histoNuevo } = historialActual;
                    listaHistorial.push(histoNuevo);
                }
                res.status(200).send(listaHistorial);
            } else {
                res.status(200).send([]);
            }
        } else {
            res.status(400).send(`Error: ${err}`);
        }
    });
});

root.get('/getHistorialPorMes/:idDisp', (req, res) => {
    const { idDisp } = req.params;
    const listaHistorial = [];
    const fechaInicial = getInicioDeMes() + " 00:00.000";
    const fechaActual = fecha() + " 23:59.999";
    db.query('SELECT monitor.* FROM dispositivo, monitor WHERE dispositivo.id = monitor.idCliente AND dispositivo.id = ? AND monitor.time BETWEEN ? AND ? ORDER BY monitor.time ASC', [idDisp, fechaInicial, fechaActual], (err, rows) => {
        if (!err) {
            if (rows.length > 0) {
                for (const historialActual of rows) {
                    const {Tiempo, ...histoNuevo } = historialActual;
                    listaHistorial.push(histoNuevo);
                }
                res.status(200).send(listaHistorial);
            } else {
                res.status(200).send([]);
            }
        } else {
            res.status(400).send(`Error: ${err}`);
        }
    });
});


root.get('/dispConectado/:idDisp', async (req, res) => {
    const { idDisp } = req.params;
    const urlVeriAplicacion = 'https://fcm.googleapis.com/fcm/send';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'key=AAAAWDYWalo:APA91bFH246UVkS6uIYbglP1Pqpm7K6xvCrZCtrV82bKlD7ZYikRuwdnmUXwPInXODRsGAtRtekPamy4NaN2rHx3SBguHbTR4KZZoeUb6fYyrfiKzkDt-4jWeWC_SYvy7_i0kr4YlB0F'
    };
    const body = {
        "notification": {
            "body": `Dispositivo( ${idDisp} ): Conectado!`,
            "title": "Alerta!"
        },
        "priority": "high",
        "registration_ids": await getDispositivosMoviles()
    }
    const params = { method: 'POST', headers, body: JSON.stringify(body) };
    const respVeri = await fetch(urlVeriAplicacion, params);
    const bool = await respVeri.json();
    res.status(200).send('Connected!');
});

root.get('/dispDesconectado/:idDisp', async (req, res) => {
    const { idDisp } = req.params;
    const urlVeriAplicacion = 'https://fcm.googleapis.com/fcm/send';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'key=AAAAWDYWalo:APA91bFH246UVkS6uIYbglP1Pqpm7K6xvCrZCtrV82bKlD7ZYikRuwdnmUXwPInXODRsGAtRtekPamy4NaN2rHx3SBguHbTR4KZZoeUb6fYyrfiKzkDt-4jWeWC_SYvy7_i0kr4YlB0F'
    };
    const body = {
        "notification": {
            "body": `Dispositivo( ${idDisp} ): Desconectado!`,
            "title": "Alerta!"
        },
        "priority": "high",
        "registration_ids": await getDispositivosMoviles()
    }
    const params = { method: 'POST', headers, body: JSON.stringify(body) };
    const respVeri = await fetch(urlVeriAplicacion, params);
    const bool = await respVeri.json();
    res.status(200).send('disconnected!');
});


function getDispositivosMoviles() {
    return new Promise((res, rej) => {
        db.query('SELECT * FROM tokendisp', (err, rows) => {
            if (!err) {
                if (rows.length > 0) {
                    for (const dispActual of rows) {
                        listaDisp.push(dispActual.id);
                    }
                    res(listaDisp);
                } else {
                    res([]);

                }
            } else {
                rej('-1');
            }
        });
    });
}
function fecha() {
    let fechaActual = new Date();
    let dia = fechaActual.getDate();
    let mes = fechaActual.getMonth() + 1;
    let year = fechaActual.getFullYear();
    dia = ("0" + dia).slice(-2);
    mes = ("0" + mes).slice(-2);
    return `${year}-${mes}-${dia}`;
}
function getInicioDeSemana() {
    let fechaActual = new Date();
    let dia = fechaActual.getDate();
    let mes = fechaActual.getMonth() + 1;
    let year = fechaActual.getFullYear();
    dia = dia - 7;
    if (dia < 0) {
        mes = mes - 1;
        let diasMes = new Date(year, mes, 0).getDate();
        dia = diasMes - Math.abs(dia);
    }
    if (dia == 0) {
        if (mes > 1) {
            dia = new Date(year, mes, 0).getDate();
        } else {
            mes = 12;
            dia = new Date(year - 1, mes, 0).getDate();
            year = year - 1;
        }

    }
    dia = ("0" + dia).slice(-2);
    mes = ("0" + mes).slice(-2);
    return `${year}-${mes}-${dia}`;
}
function getInicioDeMes() {
    let fechaActual = new Date();
    let dia = fechaActual.getDate();
    let mes = fechaActual.getMonth() + 1;
    let year = fechaActual.getFullYear();
    //var dia = 30;
    //var mes = 7;
    dia = dia - 31;
    if (dia < 0) {
        mes = mes - 1;
        let diasMes = new Date(year, mes, 0).getDate();
        dia = diasMes - Math.abs(dia);
    }
    if (dia == 0) {
        if (mes > 1) {
            mes = mes - 1
            dia = new Date(year, mes, 0).getDate();
        } else {
            mes = 12;
            dia = new Date(year - 1, mes, 0).getDate();
            year = year - 1;
        }

    }
    dia = ("0" + dia).slice(-2);
    mes = ("0" + mes).slice(-2);
    return `${year}-${mes}-${dia}`;
}


module.exports = root;