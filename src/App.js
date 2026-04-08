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

function SearchResults({ data}) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data.filter(item => {
    if (!searchQuery) return false; // Only show when searching
    const query = searchQuery.toLowerCase();
    return (
      item.Code?.toLowerCase().includes(query) ||
      item['Scheme Name']?.toLowerCase().includes(query) ||
      item['Scheme NAV Name']?.toLowerCase().includes(query) ||
      item['ISIN Div Payout/ ISIN GrowthISIN Div Reinvestment']?.toLowerCase().includes(query)
    );
  });

  const handleCheckboxChange = (item, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, item]);
    } else {
      setSelectedItems(prev => prev.filter(selected => selected !== item));
    }
  };

  const headers = Object.keys(data[0] || {});

  return (
    <div >
      <div className="search-container">
      <div>
          <h2>Search</h2>
          <input
            type="text"
            placeholder="Search by Code, Scheme Name, Scheme NAV Name, or ISIN"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      {searchQuery && (
        <div className="dropdown-contents">
          <h3>Search Results - Select Items</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
            {filteredData.map((item, index) => (
              <label key={index} style={{ display: 'block' }}>
                <input
                  type="checkbox"
                  onChange={(e) => handleCheckboxChange(item, e.target.checked)}
                />
                {item['Scheme Name']} (Code: {item.Code})
              </label>
            ))}
          </div>
        </div>
      )}
      </div>
      {selectedItems.length > 0 && (
        <div>
          <h2>Selected Items</h2>
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {headers.map(header => <th key={header}>{header}</th>)}
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item, index) => (
                <tr key={index}>
                  {headers.map(header => <td key={header}>{item[header]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
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
        <SearchResults data={jsonData}  />
      </div>
    </div>
  );
}

export default App;
