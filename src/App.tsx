import React, { useState, useEffect } from 'react';
import './App.css';

interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: {
    lat: string;
    lng: string;
  };
}

interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'contacts'>('profile');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Replace with actual API call
      const response = await fetch('https://jsonplaceholder.typicode.com/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const renderUserList = () => (
    <div className="user-list">
      <h2>User List</h2>
      <ul>
        {users.map(user => (
          <li key={user.id} onClick={() => setSelectedUser(user)}>
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );

  const renderUserDetail = () => {
    if (!selectedUser) return <div className="user-detail">Select a user to view details</div>;

    return (
      <div className="user-detail">
        <div className="tabs">
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={activeTab === 'contacts' ? 'active' : ''}
            onClick={() => setActiveTab('contacts')}
          >
            Contacts
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div>
            <p>Name: {selectedUser.name}</p>
            <p>Username: {selectedUser.username}</p>
            <p>Email: {selectedUser.email}</p>
            <p>Address: {`${selectedUser.address.street}, ${selectedUser.address.suite}, ${selectedUser.address.city}, ${selectedUser.address.zipcode}`}</p>
            <p>Company: {selectedUser.company.name}</p>
            <p>Website: {selectedUser.website}</p>
          </div>
        ) : (
          <div>
            <p>Phone: {selectedUser.phone}</p>
            <p>Email: {selectedUser.email}</p>
            <p>Website: {selectedUser.website}</p>
          </div>
        )}

        <div className="actions">
          <button>Edit</button>
          <button>Delete</button>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      {renderUserList()}
      {renderUserDetail()}
    </div>
  );
};

export default App;