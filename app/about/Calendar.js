"use client"
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import Calendar from 'react-calendar';
import '../globals.css'
import 'react-calendar/dist/Calendar.css';


const firebaseConfig = {
  apiKey: 'AIzaSyBWaUTh4SuTUe6UOES8DAmp8Kv4BmZ_otg',
  authDomain: 'teste-edc9c.firebaseapp.com',
  projectId: 'teste-edc9c',
  storageBucket: 'teste-edc9c.appspot.com',
  messagingSenderId: '1017503897558',
  appId: '1:1017503897558:web:e0f3f5a98bca95e0383677',

};

initializeApp(firebaseConfig);

const AppointmentForm = ({ addAppointment }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState('');
  const [availableHours, setAvailableHours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableHours = async () => {
      const formattedDate = selectedDate.toISOString();
      const appointmentsRef = collection(getFirestore(), 'appointments');
      const q = query(appointmentsRef, where('date', '==', formattedDate));
      const querySnapshot = await getDocs(q);
      const appointments = querySnapshot.docs.map(doc => doc.data());
  
      let currentHour = 9;
      let currentMinute = 0;
      const hours = [];
      while (currentHour <= 17) {
        const hour = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        const isHourAvailable = !appointments.some(appointment => appointment.hour === hour);
        hours.push({ hour, available: isHourAvailable });
        currentMinute += 30;
        if (currentMinute >= 60) {
          currentHour += 1;
          currentMinute = 0;
        }
      }
      setAvailableHours(hours);
      setIsLoading(false);
    };
  
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      fetchAvailableHours();
    }
  }, [selectedDate]);
  

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && selectedDate && !isNaN(selectedDate.getTime()) && selectedHour) {
      const formattedDate = selectedDate.toISOString();
      addAppointment({ name, date: formattedDate, email, phone, hour: selectedHour });
      setName('');
      setSelectedDate(null);
      setSelectedHour('');
    }
  };

  const isDayFullyBooked = () => {
    const today = new Date();
    if (today.getDate() === selectedDate.getDate()) {
      return true; // Todos os horários para este dia estão preenchidos
    }
      return availableHours.filter(hourObj => hourObj.available).length === 0;
  };
  

  return (
    <div>
      <div>
        <form onSubmit={handleSubmit}>
          <h3>Agendar</h3>
          <p>*De momento apenas aceitamos marcações de serviços de cabelo simples.</p>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PhoneInput
            country={'pt'}
            value={phone}
            onChange={(phone) => setPhone(phone)}
          />
          <div>
            <Calendar
              locale="pt" 
              onChange={date => setSelectedDate(date)}
              value={selectedDate}
              minDate={new Date()} // Mostrar apenas os dias atuais
              maxDetail="month" // Mostrar apenas o mês atual, ocultando meses anteriores
              maxDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)} // Show only the current month
              showNavigation={false}

            />
          </div>
          {selectedDate && (
        <div>
         {isLoading ? (
          <div>
            <p>A Carregar...</p>
          </div>
        ) : (
      <div>
        {isDayFullyBooked() ? (
          <p>Todos os horários para este dia estão preenchidos.</p>
        ) : (
          <ul>
            {availableHours
              .filter(hourObj => hourObj.available)
              .map(hourObj => (
                <li
                  key={hourObj.hour}
                  onClick={() => setSelectedHour(hourObj.hour)}
                  style={{ cursor: 'pointer' }}
                >
                  {hourObj.hour}
                </li>
              ))}
          </ul>
        )}
      </div>
    )}
        </div>
      )}
          <button type="submit">Agendar</button>
        </form>
      </div>
    </div>
  );
}

export default AppointmentForm;