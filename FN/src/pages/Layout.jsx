import { Outlet } from "react-router-dom";
import { useState, useEffect } from 'react';
import Aside from './Layout/Aside';
import Header from './Layout/Header';
import Footer from './Layout/Footer';
import SettingModal from "./SettingModal";
import '../css/Layout.scss';

const Layout = ({ children }) => {
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatRooms, setChatRooms] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSettingModal, setShowSettingModal] = useState(false);

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
    setShowSettingModal
  };

  return (
    <div className={`layout ${isCollapsed ? "collapsed" : ""}`}>
      <Aside {...chatProps} />
      <div className="content_wrap">
        <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className="main">
          <Outlet context={chatProps} />
          {children}
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
