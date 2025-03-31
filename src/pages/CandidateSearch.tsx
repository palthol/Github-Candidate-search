import { useState, useEffect } from 'react';
import { searchGithub, searchGithubUser } from '../api/API';
import { Candidate } from '../interfaces/Candidate.interface';
import { FaSearch, FaSave } from 'react-icons/fa';

const CandidateSearch = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

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
      </form>
      
      {message && <p style={{ color: message.includes('successfully') ? 'lightgreen' : 'salmon' }}>{message}</p>}
      
      {loading && <p>Loading...</p>}
      
      {candidates.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Username</th>
              <th>Profile</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>
                  <img 
                    src={candidate.avatar_url} 
                    alt={`${candidate.login}'s avatar`} 
                    style={{ width: '50px', borderRadius: '50%' }} 
                  />
                </td>
                <td>{candidate.login}</td>
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