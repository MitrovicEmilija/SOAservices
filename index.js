require('dotenv').config(); // Naloži okoljske spremenljivke iz .env datoteke
const express = require('express'); // Uvozi Express
const mongoose = require('mongoose'); // Uvozi Mongoose za povezavo z MongoDB
const bodyParser = require('body-parser'); // Uvozi body-parser za obdelavo JSON podatkov
const cors = require('cors');

const app = express(); // Ustvari Express aplikacijo
const port = process.env.PORT || 3000; // Nastavi vrata za aplikacijo
app.use(cors({
    origin: "http://localhost:3000", 
    credentials: true, 
}));


// Middleware za obdelavo JSON podatkov
app.use(express.json()); // Express že vključuje JSON parser, zato ni potrebno uporabiti body-parser

// Povezava z MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Povezava z MongoDB uspešna'))
    .catch(err => console.error('Napaka pri povezavi z MongoDB:', err));

// Definicija modela za dogodek
const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    isCancelled: { type: Boolean, default: false }
});

const Event = mongoose.model('Event', eventSchema);

// Osnovni endpoint za testiranje
app.get('/', (req, res) => {
    res.send('Event Service deluje!');
});

// 1. Ustvarjanje dogodka (POST /events)
app.post('/events', (req, res) => {
    const { name, description, location, date } = req.body;
    const newEvent = new Event({
        name,
        description,
        location,
        date
    });

    newEvent.save()
        .then(() => res.status(201).json('Dogodek uspešno ustvarjen'))
        .catch(err => res.status(400).json('Napaka pri ustvarjanju dogodka: ' + err));
});

// 2. Pridobivanje seznama dogodkov (GET /events)
app.get('/events', (req, res) => {
    Event.find()
        .then(events => res.json(events))
        .catch(err => res.status(400).json('Napaka pri pridobivanju dogodkov: ' + err));
});

// 3. Posodabljanje dogodka (PUT /events/:id)
app.put('/events/:id', (req, res) => {
    Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(updatedEvent => res.json(updatedEvent))
        .catch(err => res.status(400).json('Napaka pri posodabljanju dogodka: ' + err));
});

// 4. Brisanje dogodka (DELETE /events/:id)
app.delete('/events/:id', (req, res) => {
    Event.findByIdAndDelete(req.params.id)
        .then(() => res.json('Dogodek uspešno izbrisan'))
        .catch(err => res.status(400).json('Napaka pri brisanju dogodka: ' + err));
});

// 5. Dodajanje več dogodkov hkrati (POST /events/multiple)
app.post('/events/multiple', (req, res) => {
    const events = req.body; // pričakujemo seznam dogodkov
    Event.insertMany(events)
        .then(() => res.json('Več dogodkov uspešno ustvarjenih'))
        .catch(err => res.status(400).json('Napaka pri ustvarjanju več dogodkov: ' + err));
});

// 6. Pridobivanje dogodkov po lokaciji (GET /events/location/:location)
app.get('/events/location/:location', (req, res) => {
    Event.find({ location: req.params.location })
        .then(events => res.json(events))
        .catch(err => res.status(400).json('Napaka pri pridobivanju dogodkov za to lokacijo: ' + err));
});

// 7. Označitev dogodka kot preklican (PUT /events/:id/cancel)
app.put('/events/:id/cancel', (req, res) => {
    Event.findByIdAndUpdate(req.params.id, { isCancelled: true }, { new: true })
        .then(updatedEvent => res.json(updatedEvent))
        .catch(err => res.status(400).json('Napaka pri označevanju dogodka kot preklican: ' + err));
});

// 8. Brisanje dogodkov starejših od določenega datuma (DELETE /events/older-than/:date)
app.delete('/events/older-than/:date', (req, res) => {
    const cutoffDate = new Date(req.params.date);
    Event.deleteMany({ date: { $lt: cutoffDate } })
        .then(() => res.json('Dogodki pred določenim datumom so bili uspešno izbrisani'))
        .catch(err => res.status(400).json('Napaka pri brisanju dogodkov: ' + err));
});

// Zaženi strežnik
app.listen(port, () => {
    console.log(`Strežnik posluša na http://localhost:${port}`);
});
