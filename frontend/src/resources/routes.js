import {BrowserRouter, Route, Routes} from 'react-router-dom';
import HomeScreen from "../screens/home/home_screen";

export default function MyRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" exact element={<HomeScreen />} />
            </Routes>
        </BrowserRouter>
    );
}