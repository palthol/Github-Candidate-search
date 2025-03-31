import { NavLink } from 'react-router-dom';

const Nav = () => {
  return (
    <nav className="nav">
      <ul className="nav">
        <li className="nav-item">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            Search Candidates
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/SavedCandidates" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            Saved Candidates
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;