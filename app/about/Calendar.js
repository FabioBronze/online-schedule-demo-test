"use client"
import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import Calendar from 'react-calendar';
import '../globals.css'
import 'react-calendar/dist/Calendar.css';
import { IoCheckmarkDone } from "react-icons/io5";
import AppointmentMenu from './AppointmentMenu'
import { BsX } from 'react-icons/bs';
import firebaseApp from './firebase';

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
  const [currentTipoCorte, setCurrentTipoCorte] = useState('');

  useEffect(() => {
    const fetchAvailableHours = async () => {
      setIsLoading(true);
      const formattedDate = selectedDate.toISOString();
      const appointmentsRef = collection(getFirestore(), 'appointments');
      const q = query(appointmentsRef, where('date', '==', formattedDate));
      const querySnapshot = await getDocs(q);
      const appointments = querySnapshot.docs.map(doc => doc.data());
      const startHour = 9;
      const endHour = 18;
      const appointmentDuration = 30;
      const hours = [];
      for (let currentHour = startHour; currentHour <= endHour; currentHour++) {
        for (let currentMinute = 0; currentMinute < 60; currentMinute += appointmentDuration) {
          const hour = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
          const isHourAvailable = !appointments.some(appointment => appointment.hour === hour);
          hours.push({ hour, available: isHourAvailable });
        }
      }
      setAvailableHours(hours);
      setIsLoading(false);
    };
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      fetchAvailableHours();
    }
  }, [selectedDate]);

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
    const phoneValue = e.target.value.replace(/\D/g, '');

    const formattedPhone = phoneValue
      .split('')
      .join('')
      .slice(0, 9);

    setPhone(formattedPhone);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 2) {
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

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!email || !emailRegex.test(email)) {
        setEmailError('E-mail inválido');
        isValid = false;
      } else {
        setEmailError('');
      }

      const isValidPhone = phone && phone.replace(/\D/g, '').startsWith('9') && phone.replace(/\D/g, '').length === 9;
      if (!isValidPhone) {
        setPhoneError('Telefone inválido');
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

    return `Reserve para ${dayOfWeek}, ${day} ${month}, ${year}`;
  };

  const openPopup = (tipoCorte) => {
    setShowPopup(true);
    document.body.classList.add('no-scroll');
    setCurrentStep(1); // Definir a etapa inicial ao abrir o popup
    setCurrentTipoCorte(tipoCorte)
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

  const renderPopupHeader = () => {
    return (
      <div className='step-content-title'>
        <p>Reservar Consulta</p>
        <BsX
          size={20}
          className='close-button'
          onClick={() => {
            setShowPopup(false);
            resetForm();
          }}
        />
      </div>
    );
  };

  const renderPopupContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            {renderPopupHeader()}
            <p>Serviço - {currentTipoCorte}</p>
            <span className="progress-bar">
              <span className="progress-point"></span>
              <span className="progress-line"></span>
              <span className="progress-point2"></span>
              <span className="progress-line"></span>
              <span className="progress-point2"></span>
            </span>
            <div className='text-division'>
              <p>Horário Disponíveis</p>
              <p>Escolha uma data</p>
            </div>
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
                return (
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear()
                ) || [0, 3].includes(date.getDay());
              }}
            />
            {selectedDate ? (
              <div>
                <p className="schedule-time">{getReservationDateMessage(selectedDate)}</p>
                {isLoading ? (
                  <div className="loading-animation"></div>
                ) : isDayFullyBooked() ? (
                  <p>Todos os horários para este dia estão preenchidos.</p>
                ) : (
                  <ul className="ul-list">
                    {availableHours
                      .filter((hourObj) => hourObj.available)
                      .map((hourObj) => (
                        <li
                          className="lists"
                          key={hourObj.hour}
                          onClick={() => {
                            setSelectedHour(hourObj.hour);
                            nextStep();
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
              <p className='schedule-text'>Escolha um dia para fazer a sua marcação</p>
            )}
          </div>
        );
      case 2:
        return (
          <div className="step-content">
            {renderPopupHeader()}
            <p>Serviço - {currentTipoCorte}</p>
            <span className="progress-bar">
              <span className="progress-point"></span>
              <span className="progress-line2"></span>
              <span className="progress-point"></span>
              <span className="progress-line"></span>
              <span className="progress-point2"></span>
            </span>
            <div className='text-division'>
              <p>Informações Pessoais</p>
              <p>Preencha os dados</p>
            </div>
            <div className="name-container">
              <div className="name-input">
                <label htmlFor="name">Nome:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-describedby="name-error"
                />
                {nameError && <span className="error-message">{nameError}</span>}
              </div>
              <div className="lastname-input">
                <label htmlFor="lastName">Sobrenome:</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Sobrenome"
                  value={lastName}
                  onChange={(e) => setLastname(e.target.value)}
                  aria-describedby="lastName-error"
                />
                {lastnameError && <span className="error-message">{lastnameError}</span>}
              </div>
            </div>
            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="E-mail"
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
              placeholder="Telefone"
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
            <button className='step-content-button' onClick={prevStep}>Voltar</button>
            <button className='step-content-button' type="submit" onClick={handleSubmit}>
              Agendar
            </button>
          </div>
        );
      case 3:
        if (currentStep === 3) {
          return (
            <div className="step-content">
              {renderPopupHeader()}
              <p>Serviço - {currentTipoCorte}</p>
              <span className="progress-bar">
                <span className="progress-point"></span>
                <span className="progress-line2"></span>
                <span className="progress-point"></span>
                <span className="progress-line2"></span>
                <span className="progress-point"></span>
              </span>
              <div className='text-division'>
                <p>Marcação Agendada! <IoCheckmarkDone size={18} className='icon' />
                </p>
                <p>Verifique o seu e-mail </p>
              </div>
              <p>Boa! A sua marcação foi agendada com sucesso! <IoCheckmarkDone size={18} className='icon' /></p>
              <p>Para prosseguir, clique num dos botoes abaixo.</p>
              <div className='finish-schedule'>
                <button className='step-content-button' onClick={() => {
                  resetForm();
                  setCurrentStep(1);
                }}>Agendar Novamente</button>
                <button className='step-content-button' onClick={() => {
                  setShowPopup(false);
                  resetForm();
                }}>Fechar</button>
              </div>
            </div>
          );
        }
      default:
        return null;
    }
  };

  return (
    <>
      {showPopup ? (
        <div className='modal-overlay'>
          <div className="modal">
            <div className="modal-content">
              <form autoComplete='on'>
                {renderPopupContent()}
              </form>
            </div>
          </div>
        </div>
      ) : (
        <AppointmentMenu openPopup={openPopup} />
      )}
    </>
  )
}

export default AppointmentForm;
