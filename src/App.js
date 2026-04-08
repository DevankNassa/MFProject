import './App.css';
import {useState,useEffect} from 'react';
import Papa from 'papaparse';

function SchemeRawData({ content }) {
  return (
    <><h2>Scheme Raw Data</h2><pre>
      {content}
    </pre></>
  );
}

function ConvertedData({ data }) {
  return (
    <><h2>Converted Data</h2><pre>
      {JSON.stringify(data, null, 2)}
    </pre></>
  );
}

function App() {
  const [rawContent, setRawContent] = useState('');
  const [jsonData, setJsonData] = useState([]);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/rawData/SchemeData0704262318SS.csv')
      .then((response) => response.text())
      .then((text) => setRawContent(text))
      .catch((err) => console.error('Error loading file:', err));
  }, []);

  const convertoldDataToJson = () => {
    const parsed = Papa.parse(rawContent, { header: true });
    setJsonData(parsed.data);
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Mutual Fund</h1>
      </header>
      <div>
        <SchemeRawData content={rawContent} />
        <div className="button-container">
          <button onClick={convertoldDataToJson}>
            <span className="button_top"> Convert old data to JSON </span>
          </button>
        </div>
        <ConvertedData data={jsonData} />
      </div>
    </div>
  );
}

export default App;
