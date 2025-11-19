// src/pages/SettingModal.jsx
import "../css/SettingModal.scss";
import useThemeMode from "../component/useThemeMode";

const SettingModal = ({ setShowSettingModal }) => {
    const { theme, toggleTheme } = useThemeMode();

    const handleDimClick = () => {
        setShowSettingModal(false);
    };

    const handleInnerClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="setting_modal_dim" onClick={handleDimClick}>
            <div className="setting_modal_wrap" onClick={handleInnerClick}>
                <button
                    className="close_btn"
                    type="button"
                    onClick={() => setShowSettingModal(false)}
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <h2>환경 설정</h2>

                <div className="theme_switch">
                    <p>현재 테마: {theme === "dark" ? "🌙 Dark" : "☀️ Light"}</p>
                    <button type="button" onClick={toggleTheme}>
                        {theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingModal;
