"use client"
import React, { useState } from 'react';
import AppointmentForm from './Calendar';
import AppointmentList from './AppointmentList';

const Calendar = () => {
  const [appointments, setAppointments] = useState([]);

  const addAppointment = (appointment) => {
    fetch('https://teste-marc-092694a40924.herokuapp.com/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointment),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao agendar');
        }
        return response.text();
      })
      .then((data) => {
        console.log(data);
        setAppointments([...appointments, appointment]);
      })
      .catch((error) => {
        console.log('Erro ao agendar:', error);
      });
  };
  

  return (
    <div>
      <h1>Calendário de Agendamento</h1>
      <AppointmentForm addAppointment={addAppointment} />
      <AppointmentList appointments={appointments} />
    </div>
  );
};

export default Calendar;