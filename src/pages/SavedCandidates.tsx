import { useState, useEffect } from 'react';
import { Candidate } from '../interfaces/Candidate.interface';
import { FaTrash } from 'react-icons/fa';

const SavedCandidates = () => {
  const [savedCandidates, setSavedCandidates] = useState<Candidate[]>([]);
  
  useEffect(() => {
    const candidates = JSON.parse(localStorage.getItem('savedCandidates') ?? '[]');
    setSavedCandidates(candidates);
  }, []);
  
  const removeCandidate = (id: number) => {
    const updatedCandidates = savedCandidates.filter(candidate => candidate.id !== id);
    setSavedCandidates(updatedCandidates);
    localStorage.setItem('savedCandidates', JSON.stringify(updatedCandidates));
  };
  
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Saved Candidates</h1>
      
      {savedCandidates.length > 0 ? (
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
            {savedCandidates.map((candidate) => (
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
                  <button onClick={() => removeCandidate(candidate.id)}>
                    <FaTrash /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No saved candidates yet</p>
      )}
    </div>
  );
};

export default SavedCandidates;