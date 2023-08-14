"use client"
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import Calendar from 'react-calendar';
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
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState('');
  const [availableHours, setAvailableHours] = useState([]);

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
      setShowPopup(false);
    }
  };
  
  const handleAgendarClick = () => {
    setShowPopup(true);
  };

  const isDateAvailable = (date) => {
    const currentDate = new Date();
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 = domingo, 3 = quarta-feira
    return selectedDate >= currentDate && ![0, 3].includes(dayOfWeek);
  };

  const handleCalendarClick = () => {
    // Função vazia para desabilitar a interação do mouse
  };

  return (
    <div>
      <button type="button" onClick={handleAgendarClick}>
        Agendar
      </button>
      {showPopup && (
        <div style={popupStyle}>
          <form onSubmit={handleSubmit}>
            <h3>Agendar</h3>
            <p>*De momento apenas aceitamos marcacoes de servicos de cabelo simples.</p>
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
            <PhoneInput
              country={'pt'}
              value={phone}
              onChange={(phone) => setPhone(phone)}
              inputStyle={inputStyle}
            />
            <div>
              <Calendar
                onChange={date => setSelectedDate(date)}
                value={selectedDate}
                minDate={new Date()} // Mostrar apenas os dias atuais
                maxDetail="month" // Mostrar apenas o mês atual, ocultando meses anteriores
                onClickDay={handleCalendarClick} // Desabilitar a interação do mouse
                tileDisabled={isDateAvailable}
              />
            </div>
            <select value={selectedHour} onChange={(e) => setSelectedHour(e.target.value)} style={inputStyle}>
              <option value="" disabled>
                Selecione uma hora
              </option>
              {availableHours.map(hourObj => (
                <option
                  key={hourObj.hour}
                  value={hourObj.hour}
                  disabled={!hourObj.available}
                  style={hourObj.available ? {} : { color: 'gray' }}
                >
                  {hourObj.available ? hourObj.hour : 'Horario Preenchido'}
                </option>
              ))}
            </select>
            <button type="submit">Agendar</button>
          </form>
        </div>
      )}
    </div>
  );
};




const popupStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '300px',
  padding: '20px',
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  zIndex: '9999',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '5px',
  border: '1px solid #ccc',
};

export default AppointmentForm;