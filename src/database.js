const mysql = require('mysql');
const mySqlConexion = mysql.createConnection({
    host: 'lcpbq9az4jklobvq.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'qjo6u6wws7494j3b',
    password: 'ayp4dq7o4ie548uf',
    database: 'n9n7mcbwue2jqi15'
});

mySqlConexion.connect((error) => {
    if(error){
        console.log(error);
    }else{
        console.log('BD concentada');
    }
})

module.exports = mySqlConexion;