import './App.css';
import oldData from './oldData.txt';

function App() {
  const convertoldDataToJson = () => {
    console.log(oldData);
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to MF Project</h1>
        <p>React boilerplate ready to go!</p>
      </header>
      <body>
        <div className="button-container">
          <button onClick={() => convertoldDataToJson()}>
            <span class="button_top"> Convert old data to JSON </span>
          </button>
        </div>
      </body>
    </div>
  );
}

export default App;
