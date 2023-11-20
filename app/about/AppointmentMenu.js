import { BsArrowBarRight } from 'react-icons/bs';
import Image from 'next/image'
import t from '../../public/teste.jpeg'

const AppointmentMenu = ({ openPopup }) => {
  return (
    <div className="menu">
      <div className="leftMenu">
        <h3>Marcacoes Online</h3>
        <p>Escolha o seu servico</p>
        <ul>
          <li onClick={() => openPopup("Corte de Cabelo")}>
            Corte de Cabelo <BsArrowBarRight />
          </li>
          <li onClick={() => openPopup("Brushing")}>
            Brushing <BsArrowBarRight />
          </li>
          <li onClick={() => openPopup("Madeixas")}>
            Madeixas <BsArrowBarRight />
          </li>
          <li onClick={() => openPopup("Coloração")}>
            Coloração <BsArrowBarRight />
          </li>
          <li onClick={() => openPopup("Ondulação")}>
            Ondulação <BsArrowBarRight />
          </li>
          <li onClick={() => openPopup("Alisamento")}>
            Alisamento <BsArrowBarRight />
          </li>
          <li onClick={() => openPopup("Mise Rolos")}>
            Mise Rolos <BsArrowBarRight />
          </li>
        </ul>
      </div>
      <div className="rightMenu">
        <Image src={t} alt='Marcacoes Online' />
      </div>
    </div>
  );
};

export default AppointmentMenu;
