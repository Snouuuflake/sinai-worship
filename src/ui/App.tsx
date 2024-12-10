import "./App.css";
import Body from "./Body";
import GlobalContextProvider from "./Main/GlobalContext";

function App() {
  return (
    <GlobalContextProvider>
      <Body></Body>
    </GlobalContextProvider>
  );
}

export default App;
