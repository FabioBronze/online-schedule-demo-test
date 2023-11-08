"use client"
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
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
  const [lastName, setLastname] = useState('')
  const [observations, setObservations] = useState('')
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState('');
  const [availableHours, setAvailableHours] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [nameError, setNameError] = useState('');
  const [lastnameError, setLastnameError] = useState('')
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('')

  const resetForm = () => {
    setName('');
    setLastname('')
    setEmail('');
    setPhone('');
    setObservations('')
    setSelectedDate(null);
    setSelectedHour('');
  };

  const handlePhoneChange = (e) => {
    // Remova todos os caracteres não numéricos do valor
    const phoneValue = e.target.value.replace(/\D/g, '');

    // Divida o valor em grupos de 3 dígitos com espaço
    let formattedPhone = '';
    for (let i = 0; i < phoneValue.length; i++) {
      if (i > 0 && i % 3 === 0) {
        formattedPhone += ' ';
      }
      formattedPhone += phoneValue[i];
    }

    // Limitar o comprimento do número de telefone a 9 dígitos
    if (formattedPhone.length > 9) {
      formattedPhone = formattedPhone.slice(0, 11);
    }

    setPhone(formattedPhone);
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
      // Adicione validação para campos obrigatórios e e-mail
      let isValid = true;
      if (!name) {
        setNameError('Campo obrigatório');
        isValid = false;
      } else {
        setNameError('');
      }

      if (!lastName) {
        setLastnameError('Campo obrigatório');
        isValid = false;
      } else {
        setLastnameError('');
      }

      // Validação de e-mail usando regex
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!email || !emailRegex.test(email)) {
        setEmailError('E-mail inválido');
        isValid = false;
      } else {
        setEmailError('');
      }

      if (!phone || phone.replace(/\D/g, '').length !== 9) {
        setPhoneError('Telefone deve ter 9 dígitos');
        isValid = false;
      } else {
        setPhoneError('');
      }

      if (isValid) {
        const formattedDate = selectedDate.toISOString();
        addAppointment({ name, lastName, date: formattedDate, email, phone, observations, hour: selectedHour });
        setCurrentStep(3);
        resetForm();
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
      setNameError('')
      setLastnameError('')
      setEmailError('')
      setPhoneError('')
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

            <label htmlFor="name">Nome:</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="O seu Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-describedby="name-error"
            />
            {nameError && <span className="error-message">{nameError}</span>}

            <label htmlFor="lastName">Sobrenome:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="O seu Sobrenome"
              value={lastName}
              onChange={(e) => setLastname(e.target.value)}
              aria-describedby="lastName-error"
            />
            {lastnameError && <span className="error-message">{lastnameError}</span>}

            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="O seu E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby="email-error"
            />
            {emailError && <span className="error-message">{emailError}</span>}

            <label htmlFor="phone">Telefone:</label>
            <input
              type="text"
              id="phone"
              name="phone"
              placeholder="O seu Telefone"
              value={phone}
              onChange={handlePhoneChange}
              aria-describedby="phone-error"
            />
            {phoneError && <span className="error-message">{phoneError}</span>}

            <label>Observações:</label>
            <input
              type="text"
              id="observations"
              name="observations"
              placeholder="Observações (opcional)"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />

            <button onClick={prevStep}>Etapa Anterior</button>
            <button type="submit" onClick={handleSubmit}>
              Agendar
            </button>
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
                resetForm();
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
              <form autoComplete='on'>
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
