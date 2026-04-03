import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';

const API_BASE = 'https://api.mfapi.in';

function App() {
  const [allFunds, setAllFunds] = useState([]);
  const [filteredFunds, setFilteredFunds] = useState([]);
  const [selectedFunds, setSelectedFunds] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllFunds();
  }, []);

  useEffect(() => {
    const filtered = allFunds.filter(fund =>
      fund.scheme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fund.scheme_code.toString().includes(searchQuery)
    );
    setFilteredFunds(filtered);
  }, [allFunds, searchQuery]);

  useEffect(() => {
    if (selectedFunds.length > 0) {
      loadPortfolioData();
    } else {
      setPortfolioData([]);
    }
  }, [selectedFunds]);

  const loadAllFunds = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/mf`, { timeout: 20000 });
      const funds = response.data.map(fund => ({
        ...fund,
        scheme_lower: fund.scheme.toLowerCase()
      }));
      setAllFunds(funds);
      setFilteredFunds(funds);
      setError(null);
    } catch (err) {
      setError('Failed to load funds list');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFundHistory = async (schemeCode) => {
    try {
      const response = await axios.get(`${API_BASE}/mf/${schemeCode}`, { timeout: 20000 });
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'API error');
      }

      const records = response.data.data.map(record => ({
        date: new Date(record.date.split('-').reverse().join('-')),
        nav: parseFloat(record.nav.replace(/,/g, ''))
      }));

      records.sort((a, b) => a.date - b.date);
      return records;
    } catch (err) {
      console.error(`Error fetching history for ${schemeCode}:`, err);
      return [];
    }
  };

  const loadPortfolioData = async () => {
    const data = [];
    for (const fundName of selectedFunds) {
      const fund = allFunds.find(f => f.scheme === fundName);
      if (fund) {
        const history = await fetchFundHistory(fund.scheme_code);
        if (history.length > 0) {
          const latest = history[history.length - 1];
          const previous = history.length > 1 ? history[history.length - 2] : latest;
          const change = latest.nav - previous.nav;
          const pctChange = previous.nav ? (change / previous.nav) * 100 : 0;

          data.push({
            name: fund.scheme,
            schemeCode: fund.scheme_code,
            nav: latest.nav,
            date: latest.date.toLocaleDateString(),
            change: parseFloat(change.toFixed(4)),
            pctChange: parseFloat(pctChange.toFixed(2)),
            history: history
          });
        }
      }
    }
    setPortfolioData(data);
  };

  const handleFundSelect = (fundName) => {
    setSelectedFunds(prev =>
      prev.includes(fundName)
        ? prev.filter(name => name !== fundName)
        : [...prev, fundName].slice(0, 10) // Max 10 funds
    );
  };

  const pickTop5 = () => {
    const top5 = allFunds.slice(0, 5).map(fund => fund.scheme);
    setSelectedFunds(top5);
  };

  if (loading) {
    return <div className="loading">Loading funds data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>Indian Mutual Fund Portfolio Dashboard</h1>
        <p>Powered by mfapi.in</p>
      </header>

      <div className="container">
        <aside className="sidebar">
          <h2>Portfolio Filters</h2>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search fund name / scheme code"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <button onClick={pickTop5} className="pick-top-btn">
            Pick Top 5 Funds
          </button>

          <div className="funds-list">
            <h3>Select Funds ({selectedFunds.length}/10)</h3>
            {filteredFunds.slice(0, 50).map(fund => (
              <label key={fund.scheme_code} className="fund-item">
                <input
                  type="checkbox"
                  checked={selectedFunds.includes(fund.scheme)}
                  onChange={() => handleFundSelect(fund.scheme)}
                  disabled={!selectedFunds.includes(fund.scheme) && selectedFunds.length >= 10}
                />
                <span className="fund-name">{fund.scheme}</span>
              </label>
            ))}
          </div>
        </aside>

        <main className="main-content">
          {selectedFunds.length === 0 ? (
            <div className="no-selection">
              <p>Select 1-10 funds from the sidebar to view your portfolio.</p>
            </div>
          ) : (
            <>
              <section className="portfolio-snapshot">
                <h2>Portfolio Snapshot</h2>
                <div className="portfolio-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Fund Name</th>
                        <th>Scheme Code</th>
                        <th>Date</th>
                        <th>NAV</th>
                        <th>Change</th>
                        <th>% Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioData.map(fund => (
                        <tr key={fund.schemeCode}>
                          <td>{fund.name}</td>
                          <td>{fund.schemeCode}</td>
                          <td>{fund.date}</td>
                          <td>{fund.nav.toFixed(4)}</td>
                          <td className={fund.change >= 0 ? 'positive' : 'negative'}>
                            {fund.change >= 0 ? '+' : ''}{fund.change.toFixed(4)}
                          </td>
                          <td className={fund.pctChange >= 0 ? 'positive' : 'negative'}>
                            {fund.pctChange >= 0 ? '+' : ''}{fund.pctChange.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="charts-section">
                <h2>Historical NAV Charts</h2>
                {portfolioData.map(fund => (
                  <div key={fund.schemeCode} className="chart-container">
                    <h3>{fund.name} ({fund.schemeCode})</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={fund.history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(date) => new Date(date).toLocaleDateString()}
                          formatter={(value) => [value.toFixed(4), 'NAV']}
                        />
                        <Line
                          type="monotone"
                          dataKey="nav"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;