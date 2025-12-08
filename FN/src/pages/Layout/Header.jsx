import '../../css/Layout/Header.scss'
import { useNavigate } from 'react-router-dom';

const Header = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleClose = () => {
    // window.close();
    // // (setTimeout을 쓰는 이유는 window.close()가 비동기로 처리될 수 있기 때문입니다)
    // setTimeout(() => {
    //     if (!window.closed) {
    //         alert("브라우저 보안 설정으로 인해 창을 닫을 수 없습니다.");
    //     }
    // }, 100);

    // * 브라우저 보안 설정 대신 적용 *
    navigate('/goodbye');
  };

  return (
    <header>
      <div className="header_wrap">
        <button type="button" className="hamburger_btn" onClick={handleToggle}
          style={{ cursor: 'pointer' }}>
          <span className={isCollapsed ? 'material-symbols-outlined rotated' : 'material-symbols-outlined'}>menu</span>
        </button>
        <button type="button" style={{ cursor: 'pointer' }} onClick={handleClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </header>
  )
}
export default Header