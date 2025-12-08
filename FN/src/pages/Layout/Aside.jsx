import '../../css/Layout/Aside.scss';
import { Link } from 'react-router-dom';

const Aside = ({
  activeChatId,
  setActiveChatId,
  chatRooms,
  setChatRooms,
  isCollapsed,
  setShowSettingModal,
}) => {
  const chatRoomIds = Object.keys(chatRooms).reverse();

  const handleChatClick = (id) => {
    setActiveChatId(id);
  };

  const handleDeleteChat = (id) => {
    if (!window.confirm('이 채팅을 삭제할까요?')) return;

    setChatRooms((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };

  return (
    <aside className={`side_menu_wrap ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="logo" style={{ marginTop: '5px' }}>
        <h3>DoAi</h3>
      </div>

      <div className="menu_wrap">
        {/* 상단 영역 */}
        <div className="menu_top_wrap chat_list_container">
          {/* 홈 버튼 - 예전처럼 btn_select_wrap 사용 */}
          <Link
            to="/"
            className="btn_select_wrap"
            onClick={() => setActiveChatId(null)}
          >
            <div className="btn_wrap">
              <span className="material-symbols-outlined">home</span>
            </div>
            <p>홈</p>
          </Link>

          <div className="chat_title">
            <span>내 채팅 목록</span>
          </div>

          {/* 채팅 목록 - 새 구조 (chat_item_row + chat_room_link) */}
          {chatRoomIds.map((id) => (
            <div className="chat_item_row" key={id}>
              <Link
                to={`/chat/${id}`}
                className={`chat_room_link ${id === activeChatId ? 'active' : ''}`}
                onClick={() => handleChatClick(id)}
              >
                <div className="btn_wrap">
                  <span className="material-symbols-outlined">edit_square</span>
                </div>
                <p>{chatRooms[id].title}</p>
              </Link>

              {/* 삭제 버튼 (hover 시 노출) */}
              <button
                type="button"
                className="chat_delete_btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteChat(id);
                }}
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
        </div>

        {/* 하단 설정 */}
        <div className="menu_bottom_wrap">
          <Link
            to="#"
            className="btn_select_wrap settings"
            onClick={(e) => {
              e.preventDefault();
              setShowSettingModal(true);
            }}
          >
            <span className="material-symbols-outlined">settings</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Aside;
