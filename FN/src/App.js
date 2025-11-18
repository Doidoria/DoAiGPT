import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from './pages/Layout';
import Main from './pages/main';
import ChatRoom from './pages/ChatRoom';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Main />} />
            <Route path="/chat/:id" element={<ChatRoom />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
