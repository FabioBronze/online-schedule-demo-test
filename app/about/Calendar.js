"use client"
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import Calendar from 'react-calendar';
import '../globals.css'
import 'react-calendar/dist/Calendar.css';
import { BsArrowBarRight } from 'react-icons/bs'

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
  const [showPopup, setShowPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Adicione o estado para a etapa atual
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setSelectedDate(null);
    setSelectedHour('');
  };

  useEffect(() => {
    const fetchAvailableHours = async () => {
      setIsLoading(true);
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
    if (currentStep === 2) {
      if (name && selectedDate && !isNaN(selectedDate.getTime()) && selectedHour) {
        const formattedDate = selectedDate.toISOString();
        addAppointment({ name, date: formattedDate, email, phone, hour: selectedHour });
        setCurrentStep(3);
        resetForm(); // Chame a função para redefinir os campos do formulário
      }
    }
  };

  const isDayFullyBooked = () => {
    return availableHours.filter(hourObj => hourObj.available).length === 0;
  };

  const getReservationDateMessage = (date) => {
    const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dayOfWeek = daysOfWeek[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `Reserve em ${dayOfWeek}, ${month} ${day}, ${year}`;
  };

  const openPopup = () => {
    setShowPopup(true);
    document.body.classList.add('no-scroll');
    setCurrentStep(1); // Definir a etapa inicial ao abrir o popup
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderPopupContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3>Etapa 1: Escolher a data e hora</h3>
            <Calendar
              locale="pt"
              onChange={(date) => setSelectedDate(date)}
              value={selectedDate}
              minDate={new Date()}
              maxDetail="month"
              maxDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)}
              showNavigation={false}
              tileDisabled={({ date }) => {
                const today = new Date();
                return date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();
              }}
            />
            {selectedDate ? (
              <div>
                <p className="hours">{getReservationDateMessage(selectedDate)}</p>
                {isLoading ? ( // Renderizar o indicador de carregamento enquanto isLoading for verdadeiro
                  <p>Loading hours...</p>
                ) : isDayFullyBooked() ? (
                  <p>Todos os horários para este dia estão preenchidos.</p>
                ) : (
                  <ul className="ul">
                    {availableHours
                      .filter((hourObj) => hourObj.available)
                      .map((hourObj) => (
                        <li
                          className="lis"
                          key={hourObj.hour}
                          onClick={() => {
                            setSelectedHour(hourObj.hour);
                            nextStep(); // Avançar para a próxima etapa ao selecionar uma hora
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          {hourObj.hour}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ) : (
              <p>Escolha um dia para fazer a sua marcação</p>
            )}
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            <h3>Etapa 2: Preencher informações</h3>
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
            <button type="submit" onClick={handleSubmit}>
              Agendar
            </button>
            <button onClick={prevStep}>Etapa Anterior</button>
          </div>
        );
      case 3:
        if (currentStep === 3) {
          return (
            <div className="step-content">
              <h3>Etapa 3: Marcação agendada com sucesso</h3>
              <p>Sua marcação foi agendada com sucesso!</p>
              <button onClick={() => {
                setShowPopup(false);
                resetForm(); // Chame a função para redefinir os campos do formulário
              }}>Fechar</button>
            </div>
          );
        }
      default:
        return null;
    }
  };

  return (
    <div>
      {showPopup ? (
        <div className='popup-overlay'>
          <div className="popup">
            <div className="popup-content">
              <form>
                {renderPopupContent()}
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="menu">
          <div className="leftMenu">
            <ul>
              <li onClick={openPopup}>
                Corte de Cabelo <BsArrowBarRight />
              </li>
              <li onClick={openPopup}>
                Brushing <BsArrowBarRight />
              </li>
              <li onClick={openPopup}>
                Madeixas <BsArrowBarRight />
              </li>
              <li onClick={openPopup}>
                Coloração <BsArrowBarRight />
              </li>
              <li onClick={openPopup}>
                Ondulação <BsArrowBarRight />
              </li>
              <li onClick={openPopup}>
                Alisamento <BsArrowBarRight />
              </li>
              <li onClick={openPopup}>
                Mise Rolos <BsArrowBarRight />
              </li>
            </ul>
          </div>
          <div className="rightMenu">
            <p>Faça clique para fazer marcações:</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentForm;
