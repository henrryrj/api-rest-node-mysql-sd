const express = require( 'express' );
const app = express();

//settings
app.set('port', process.env.PORT || 3000);
// middlerwares
app.use(express.json());

// Routes
app.use(require('./routes/dispositivo'));

app.listen(app.get('port'), () => {
    console.log('node en el puerto:', app.get('port'));
});