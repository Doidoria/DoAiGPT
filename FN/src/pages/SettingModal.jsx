import { useEffect, useState } from "react";
import "../css/SettingModal.scss";

const SettingModal = ({ setShowSettingModal }) => {
    const [theme, setTheme] = useState("dark");

    useEffect(() => {
        const saved = localStorage.getItem("theme") || "dark";
        setTheme(saved);
        document.body.className = `theme-${saved}`;
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.body.className = `theme-${newTheme}`;
    };

    return (
        <div className="setting_modal_dim" onClick={() => setShowSettingModal(false)}>
            <div className="setting_modal_wrap" onClick={(e)=>e.stopPropagation()}>
                
                <button className="close_btn" onClick={()=> setShowSettingModal(false)}>
                    <span className="material-symbols-outlined">close</span>
                </button>

                <h2>환경 설정</h2>

                <div className="theme_switch">
                    <p>현재 테마: {theme === "dark" ? "🌙 Dark" : "☀️ Light"}</p>
                    <button onClick={toggleTheme}>
                        {theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SettingModal;
