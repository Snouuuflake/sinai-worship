import "./App.css";
import Body from "./Main/Body";
import GlobalContextProvider from "./Main/GlobalContext";

function App() {
  return (
    <GlobalContextProvider>
      <Body></Body>
    </GlobalContextProvider>
  );
}

export default App;
