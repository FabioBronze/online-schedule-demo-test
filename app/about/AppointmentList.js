import React from 'react';

const AppointmentList = ({ appointments }) => {
  return (
    <ul>
      {appointments.map((appointment, index) => (
        <li key={index}>
          <span>{appointment.name}</span> <br />
          <span>{appointment.date}</span> <br />
          <span>{appointment.phone}</span> <br />
          <span>{appointment.email}</span>
        </li>
      ))}
    </ul>
  );
};

export default AppointmentList;