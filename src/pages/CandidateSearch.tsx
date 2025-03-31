import { useState, useEffect, useMemo } from 'react';
import { searchGithub, searchGithubUser } from '../api/API';
import { Candidate } from '../interfaces/Candidate.interface';
import { FaSearch, FaSave, FaSort, FaSortUp, FaSortDown, FaFilter } from 'react-icons/fa';

const CandidateSearch = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Candidate; 
    direction: 'ascending' | 'descending'
  } | null>(null);
  
  // Filtering state
  const [filters, setFilters] = useState({
    minRepos: 0,
    location: '',
    minFollowers: 0,
    showFilters: false
  });

  useEffect(() => {
    loadRandomCandidates();
  }, []);

  const loadRandomCandidates = async () => {
    setLoading(true);
    try {
      const data = await searchGithub();
      setCandidates(data);
      setMessage('');
    } catch (err) {
      setMessage('Failed to load candidates');
    }
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const data = await searchGithubUser(searchTerm);
      if (data.login) {
        setCandidates([data]);
        setMessage('');
      } else {
        setCandidates([]);
        setMessage('No user found with that username');
      }
    } catch (err) {
      setMessage('Error searching for user');
      setCandidates([]);
    }
    setLoading(false);
  };

  const saveCandidate = (candidate: Candidate) => {
    const savedCandidates = JSON.parse(localStorage.getItem('savedCandidates') ?? '[]');
    
    if (savedCandidates.some((saved: Candidate) => saved.id === candidate.id)) {
      setMessage('Candidate already saved!');
      return;
    }
    
    localStorage.setItem(
      'savedCandidates',
      JSON.stringify([...savedCandidates, candidate])
    );
    setMessage('Candidate saved successfully!');
  };
  
  // Sorting function
  const requestSort = (key: keyof Candidate) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Get sort icon based on current sort state
  const getSortIcon = (key: keyof Candidate) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort />;
    }
    return sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />;
  };
  
  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'location' ? value : Number(value)
    }));
  };
  
  // Toggle filter visibility
  const toggleFilters = () => {
    setFilters(prev => ({
      ...prev,
      showFilters: !prev.showFilters
    }));
  };
  
  // Apply sorting and filtering
  const processedCandidates = useMemo(() => {
    // First apply filtering
    const result = candidates.filter(candidate => {
      return (
        (!filters.minRepos || (candidate.public_repos ?? 0) >= filters.minRepos) &&
        (!filters.location || (candidate.location ?? '').toLowerCase().includes(filters.location.toLowerCase())) &&
        (!filters.minFollowers || (candidate.followers ?? 0) >= filters.minFollowers)
      );
    });
    
    // Then apply sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (bValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        
        // Regular comparison
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  }, [candidates, sortConfig, filters]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>GitHub Candidate Search</h1>
      
      <form onSubmit={handleSearch} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter GitHub username"
          style={{ padding: '8px', width: '300px' }}
        />
        <button type="submit" disabled={loading}>
          <FaSearch /> Search
        </button>
        <button type="button" onClick={loadRandomCandidates} disabled={loading}>
          Load Random
        </button>
        <button type="button" onClick={toggleFilters}>
          <FaFilter /> {filters.showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </form>
      
      {filters.showFilters && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Filter Options</h3>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div>
              <label htmlFor="minRepos">Min Repositories:</label>
              <input
                type="number"
                id="minRepos"
                name="minRepos"
                value={filters.minRepos}
                onChange={handleFilterChange}
                style={{ marginLeft: '5px', width: '80px' }}
              />
            </div>
            <div>
              <label htmlFor="location">Location:</label>
              <input
                type="text"
                id="location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                style={{ marginLeft: '5px', width: '120px' }}
                placeholder="Enter location"
              />
            </div>
            <div>
              <label htmlFor="minFollowers">Min Followers:</label>
              <input
                type="number"
                id="minFollowers"
                name="minFollowers"
                value={filters.minFollowers}
                onChange={handleFilterChange}
                style={{ marginLeft: '5px', width: '80px' }}
              />
            </div>
          </div>
        </div>
      )}
      
      {message && <p style={{ color: message.includes('successfully') ? 'lightgreen' : 'salmon' }}>{message}</p>}
      
      {loading && <p>Loading...</p>}
      
      {processedCandidates.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th onClick={() => requestSort('login')} style={{ cursor: 'pointer' }}>
                Username {getSortIcon('login')}
              </th>
              <th onClick={() => requestSort('public_repos')} style={{ cursor: 'pointer' }}>
                Repos {getSortIcon('public_repos')}
              </th>
              <th onClick={() => requestSort('followers')} style={{ cursor: 'pointer' }}>
                Followers {getSortIcon('followers')}
              </th>
              <th onClick={() => requestSort('location')} style={{ cursor: 'pointer' }}>
                Location {getSortIcon('location')}
              </th>
              <th>Profile</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {processedCandidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>
                  <img 
                    src={candidate.avatar_url} 
                    alt={`${candidate.login}'s avatar`} 
                    style={{ width: '50px', borderRadius: '50%' }} 
                  />
                </td>
                <td>{candidate.login}</td>
                <td>{candidate.public_repos ?? 'N/A'}</td>
                <td>{candidate.followers ?? 'N/A'}</td>
                <td>{candidate.location ?? 'N/A'}</td>
                <td>
                  <a href={candidate.html_url} target="_blank" rel="noopener noreferrer">
                    View Profile
                  </a>
                </td>
                <td>
                  <button onClick={() => saveCandidate(candidate)}>
                    <FaSave /> Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No candidates found</p>
      )}
    </div>
  );
};

export default CandidateSearch;