import { Outlet } from "react-router-dom";
import { useState, useEffect, useRef } from 'react';
import Aside from './Layout/Aside';
import Header from './Layout/Header';
import SettingModal from "./SettingModal";
import '../css/Layout.scss';

const Layout = () => {
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatRooms, setChatRooms] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const scrollAreaRef = useRef(null);

  /* 앱 로드 시 LocalStorage 불러오기 */
  useEffect(() => {
    const saved = localStorage.getItem("chatRooms");
    if (saved) {
      const parsed = JSON.parse(saved);
      setChatRooms(parsed);
    }
  }, []);

  /* chatRooms 바뀔 때마다 자동 저장 */
  useEffect(() => {
    localStorage.setItem("chatRooms", JSON.stringify(chatRooms));
  }, [chatRooms]);

  const chatProps = {
    activeChatId,
    setActiveChatId,
    chatRooms,
    setChatRooms,
    isCollapsed,
    setIsCollapsed,
    showSettingModal,
    setShowSettingModal,
    scrollAreaRef
  };

  return (
    <div className={`layout ${isCollapsed ? "collapsed" : ""}`}>
      <Aside {...chatProps} />
      <div className="content_wrap">
        <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className="main" ref={scrollAreaRef}>
          <Outlet context={chatProps} />
        </main>
        {/* Setting Modal */}
        {showSettingModal && (
          <SettingModal setShowSettingModal={setShowSettingModal} />
        )}
      </div>
    </div>
  );
};

export default Layout;
