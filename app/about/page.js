"use client"
import React, { useState } from 'react';
import AppointmentForm from './Calendar';

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
          throw new Error('Erro ao agendar! Por favor, tente novamente mais tarde.');
        }
        return response.text();
      })
      .then(() => {
        console.log('Agendamento realizado com sucesso!');
        setAppointments([...appointments, appointment]);
      })
      .catch((error) => {
        console.log('Erro ao agendar:', error);
      });
  };


  return (
    <section>
      <h1 style={{ textAlign: 'center' }}>My Freelance Scheduling Calendar (DEMO VERSION)</h1>
      <AppointmentForm addAppointment={addAppointment} />
    </section >
  );
};

export default Calendar;