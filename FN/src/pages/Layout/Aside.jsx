import '../../css/Layout/Aside.scss'
import { Link } from 'react-router-dom';

const Aside = ({ activeChatId, setActiveChatId, chatRooms, setChatRooms, isCollapsed }) => {
    const chatRoomIds = Object.keys(chatRooms).reverse();

    const handleChatClick = (id) => {
        setActiveChatId(id);
    };

    return (
        <aside className={`side_menu_wrap ${isCollapsed ? 'collapsed' : 'expanded'}`}>
            <div className="menu_wrap">
                {/* 상단 영역 */}
                <div className="menu_top_wrap chat_list_container">
                    {/* 새 채팅 */}
                    <Link to="/" className="btn_select_wrap" onClick={() => setActiveChatId(null)}>
                        <div className="btn_wrap">
                            <span className="material-symbols-outlined">home</span>
                        </div>
                        <p>홈</p>
                    </Link>
                    {/* 채팅 목록 렌더링 */}
                    {chatRoomIds.map((id) => (
                        <Link key={id} to={`/chat/${id}`}
                            className={`btn_select_wrap chat_room_item ${id == activeChatId ? 'active' : ''}`}
                            onClick={() => handleChatClick(id)}>
                            <div className="btn_wrap">
                                <span className="material-symbols-outlined">edit_square</span>
                            </div>
                            <p>{chatRooms[id].title}</p>
                        </Link>
                    ))}
                </div>
                {/* 하단 설정 */}
                <div className="menu_bottom_wrap">
                    <Link to="/setting" className="btn_select_wrap">
                        <div className="btn_wrap">
                            <span className="material-symbols-outlined">settings</span>
                        </div>
                        <p>설정</p>
                    </Link>
                </div>
            </div>
        </aside>
    )
}

export default Aside;
