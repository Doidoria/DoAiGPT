import { useEffect, useState } from "react";

const Setting = () => {
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
        <main className="main setting_page">
            <div className="setting_container">
                <h2>환경 설정</h2>

                <div className="theme_switch">
                    <p>현재 테마: {theme === "dark" ? "🌙 Dark" : "☀️ Light"}</p>
                    <button onClick={toggleTheme}>
                        {theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
                    </button>
                </div>
            </div>
        </main>
    );
};

export default Setting;
