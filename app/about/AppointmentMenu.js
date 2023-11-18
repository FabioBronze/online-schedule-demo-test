import { BsArrowBarRight } from 'react-icons/bs';
import { IoIosReturnLeft } from "react-icons/io";

const AppointmentMenu = ({ openPopup }) => {
  return (
    <div className="menu">
      <div className="leftMenu">
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
        <p>Escolha um serviço para fazer as suas marcações.</p>
        <p>Disfrute de um serviço impecável!</p>
        <IoIosReturnLeft size={40} />
      </div>
    </div>
  );
};

export default AppointmentMenu;
