import './App.css';
import {useState,useEffect} from 'react';

function SchemeRawData() {
  const [content, setContent] = useState('');

  useEffect(() => {
    // Fetch the file from the public folder
    fetch(process.env.PUBLIC_URL + '/rawData/SchemeData0704262318SS.csv')
      .then((response) => response.text())
      .then((text) => setContent(text))
      .catch((err) => console.error('Error loading file:', err));
  }, []);

  return (
    <><h2>Scheme Raw Data</h2><pre>
      {content}
    </pre></>
  );
}

function App() {
  const convertoldDataToJson = () => {
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Mutual Fund</h1>
      </header>
      <div>
        <SchemeRawData />
        <div className="button-container">
          <button onClick={() => convertoldDataToJson()}>
            <span className="button_top"> Convert old data to JSON </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
