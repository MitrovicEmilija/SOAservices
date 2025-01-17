const dotenv = require('dotenv').config;
const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();



// Uvozi model rezervacije iz Reservation.js
const Reservation = require('./models/Reservation');  // Prilagodite pot, če je drugačna

// Inicializiraj Express aplikacijo
const app = express();
app.use(express.json());

// Poveži se z MongoDB (storitev za rezervacije bo uporabljala svojo bazo)
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Povezano z MongoDB'))
  .catch((err) => console.log('Napaka pri povezavi z MongoDB:', err));


  app.post('/reservations/create', async (req, res) => {
    const { eventId, customerName, paymentStatus, confirmed, location } = req.body;
  
    // Preveri, če so vsi potrebni podatki vključeni
    if (!eventId || !customerName || !paymentStatus || !location) {
      return res.status(400).send({ error: 'Manjkajo potrebni podatki: eventId, customerName, paymentStatus, location.' });
    }
  
    try {
      // Ustvari novo rezervacijo z vsemi podatki
      const reservation = new Reservation({
        eventId,
        customerName,
        paymentStatus,
        confirmed: confirmed || false,  // Nastavimo na false, če ni podano
        reservationDate: new Date(),    // Nastavimo trenutni datum kot datum rezervacije
        location                       // Dodamo lokacijo
      });
  
      // Shrani rezervacijo v bazo
      await reservation.save();
  
      // Vrni uspešen odgovor s podrobnostmi ustvarjene rezervacije
      res.status(201).send(reservation);
    } catch (err) {
      res.status(500).send({ error: 'Napaka pri ustvarjanju rezervacije.' });
    }
  });
  


// API 1: POST /reservations/:id/tickets (Dodajanje razpoložljivih kart za obstoječ dogodek)
app.post('/reservations/:id/tickets', async (req, res) => {
  const reservationId = req.params.id;
  const { ticketsToAdd } = req.body;

  try {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).send({ error: 'Rezervacija ni bila najdena.' });
    }
    
    // Dodajanje kart lahko vključuje samo logiko za posodobitev (ali število razpoložljivih kart)
    // Lahko prilagodite ta del glede na logiko.
    res.status(200).send({ message: 'Kartice so bile dodane.' });
  } catch (err) {
    res.status(500).send({ error: 'Napaka pri dodajanju kart.' });
  }
});

// API 2: GET /reservations/location/:location (Pridobi rezervacijo na določeni lokaciji)
app.get('/reservations/location/:location', async (req, res) => {
  const location = req.params.location;
  try {
    const reservations = await Reservation.find({ location });
    res.status(200).send(reservations);
  } catch (err) {
    res.status(500).send({ error: 'Napaka pri iskanju rezervacij.' });
  }
});

// API 3: PUT /reservations/:id/cancel (Označi rezervacijo kot preklicano)
app.put('/reservations/:id/cancel', async (req, res) => {
  const reservationId = req.params.id;
  try {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).send({ error: 'Rezervacija ni bila najdena.' });
    }
    reservation.cancelled = true;
    await reservation.save();
    res.status(200).send({ message: 'Rezervacija je bila preklicana.' });
  } catch (err) {
    res.status(500).send({ error: 'Napaka pri preklicu rezervacije.' });
  }
});

// API 4: DELETE /reservations/older-than/:date (Izbriši vse rezervacije, ki so se zgodile pred določenim datumom)
app.delete('/reservations/older-than/:date', async (req, res) => {
  const date = new Date(req.params.date);
  try {
    await Reservation.deleteMany({ reservationDate: { $lt: date } });
    res.status(200).send({ message: 'Rezervacije pred določenim datumom so bile izbrisane.' });
  } catch (err) {
    res.status(500).send({ error: 'Napaka pri brisanju rezervacij.' });
  }
});

// API 5: POST /reservations/:id/payment (Dodajanje več rezervacij naenkrat)
app.post('/reservations/:id/payment', async (req, res) => {
  const reservationIds = req.body.reservations; // Niz ID-jev rezervacij
  const { paymentStatus } = req.body;

  try {
    const reservations = await Reservation.updateMany(
      { _id: { $in: reservationIds } },
      { $set: { paymentStatus } }
    );
    res.status(200).send(reservations);
  } catch (err) {
    res.status(500).send({ error: 'Napaka pri obdelavi plačila.' });
  }
});

// API 6: GET /reservations/event/:eventId (Pridobi vse rezervacije za določen dogodek)
app.get('/reservations/event/:eventId', async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const reservations = await Reservation.find({ eventId });
    res.status(200).send(reservations);
  } catch (err) {
    res.status(500).send({ error: 'Napaka pri pridobivanju rezervacij.' });
  }
});

// API 7: PUT /reservations/:id/confirm (Potrdi plačilo rezervacijo)
app.put('/reservations/:id/confirm', async (req, res) => {
  const reservationId = req.params.id;
  try {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).send({ error: 'Rezervacija ni bila najdena.' });
    }
    reservation.confirmed = true;
    await reservation.save();
    res.status(200).send({ message: 'Rezervacija je bila potrjena.' });
  } catch (err) {
    res.status(500).send({ error: 'Napaka pri potrjevanju rezervacije.' });
  }
});

// API 8: DELETE /reservations/older-than/:date (Izbriši vse rezervacije, ki so bile narejene pred določenim datumom)
app.delete('/reservations/older-than/:date', async (req, res) => {
  const date = new Date(req.params.date);
  try {
    await Reservation.deleteMany({ reservationDate: { $lt: date } });
    res.status(200).send({ message: 'Rezervacije pred določenim datumom so bile izbrisane.' });
  } catch (err) {
    res.status(500).send({ error: 'Napaka pri brisanju rezervacij.' });
  }
});

// Zaženi strežnik
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Strežnik teče na http://localhost:${port}`);
});
