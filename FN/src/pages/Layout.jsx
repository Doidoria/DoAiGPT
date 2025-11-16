import { Outlet } from "react-router-dom";
import { useState } from 'react';
import Aside from './Layout/Aside'
import Header from './Layout/Header'
import Footer from './Layout/Footer'
import '../css/Layout.scss'

const Layout = ({ children }) => {
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatRooms, setChatRooms] = useState({}); // 채팅방
  const [isCollapsed, setIsCollapsed] = useState(false); // 사이드바 접힘 상태

  const chatProps = {
    activeChatId,
    setActiveChatId,
    chatRooms,
    setChatRooms,
    isCollapsed,
    setIsCollapsed
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
      </div>
    </div>
  )
}

export default Layout