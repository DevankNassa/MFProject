import './App.css';
import { useState, useEffect, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { getLatestMFData } from './apiCalls.js';

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

function SearchResults({ data }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [latestNavs, setLatestNavs] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHeaders, setSelectedHeaders] = useState([
    'Code',
    'Scheme Name',
    'Scheme NAV Name',
    'ISIN Div Payout/ ISIN GrowthISIN Div Reinvestment'
  ]);

  const debounceTimerRef = useRef(null);

  const allHeaders = Object.keys(data[0] || {});

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

  const toggleHeader = (header) => {
    setSelectedHeaders(prev =>
      prev.includes(header)
        ? prev.filter(h => h !== header)
        : [...prev, header]
    );
  };

  const fetchLatestNavs = useCallback(async () => {
    if (!selectedItems.length) {
      setLatestNavs({});
      return;
    }

    const navs = {};
    await Promise.all(selectedItems.map(async (item) => {
      try {
        if(navs[item.Code]) return; // Skip if already fetched for this code
        const result = await getLatestMFData(item.Code);
        navs[item.Code] = result?.data?.[0]?.nav ?? result?.data?.netAssetValue ?? 'N/A';
      } catch (error) {
        console.error('Error fetching latest MF data for', item.Code, error);
        navs[item.Code] = 'Error';
      }
    }));

    setLatestNavs(navs);
  }, [selectedItems]);

  useEffect(() => {
    if (selectedHeaders.includes('latest')) {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        fetchLatestNavs();
      }, 5000);

      // Cleanup on unmount or next effect
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }
  }, [selectedItems, selectedHeaders, fetchLatestNavs]);

  return (
    <div>
      <div className="search-and-dropdown">
        <div className="search-container">
          <h2>Search</h2>
          <input
            type="text"
            placeholder="Search by Code, Scheme Name, Scheme NAV Name, or ISIN"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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


        <div className="dropdown-container">
          <h3>Fields to display</h3>
          <div className="dropdown-contents" >
            {allHeaders.map((header) => (
              <label key={header} style={{ display: 'block', marginBottom: '4px' }}>
                <input
                  type="checkbox"
                  checked={selectedHeaders.includes(header)}
                  onChange={() => toggleHeader(header)}
                />
                {header}
              </label>
            ))}
            <label>
              <input
                type="checkbox"
                checked={selectedHeaders.includes('latest')}
                onChange={() => toggleHeader('latest')}
              />
              Latest NAV<span className="api-tag">MF API</span>
            </label>
          </div>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div>
          <h2>Selected Items</h2>
          <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {selectedHeaders.map(header => <th key={header}>{header}</th>)}
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item, index) => (
                <tr key={index}>
                  {selectedHeaders.map(header => {
                    const value = header === 'latest'
                      ? latestNavs[item.Code] ?? 'Loading...'
                      : item[header];
                    return <td key={header}>{value}</td>;
                  })}
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
        <SearchResults data={jsonData} />
      </div>
    </div>
  );
}

export default App;
