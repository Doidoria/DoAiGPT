import '../../css/Layout/Header.scss'

const Header = ({ isCollapsed, setIsCollapsed }) => {
  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <header>
      <div className="header_wrap">
        <button type="button" className="hamburger_btn" onClick={handleToggle}
          style={{ cursor: 'pointer' }}>
          <span className={isCollapsed ? 'material-symbols-outlined rotated' : 'material-symbols-outlined'}>menu</span>
        </button>
        <button type="button" style={{ cursor: 'pointer' }}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </header>
  )
}
export default Header