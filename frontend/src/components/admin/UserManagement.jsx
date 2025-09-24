import PropTypes from 'prop-types';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import DataTable from './DataTable';

const UserManagement = ({ users, onAddUser, onViewUser, onEditUser, onDeleteUser }) => {
  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (user) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <UserGroupIcon className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.username}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => user.role || 'USER',
    },
    {
      key: 'status',
      header: 'Status',
      render: () => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Active
        </span>
      ),
    },
  ];

  return (
    <DataTable
      title="User Management"
      description="Manage all system users"
      data={users}
      columns={columns}
      onAdd={onAddUser}
      onView={onViewUser}
      onEdit={onEditUser}
      onDelete={onDeleteUser}
      addButtonText="Add User"
      emptyIcon={UserGroupIcon}
      emptyTitle="No users found"
      emptyDescription="Users will appear here when loaded from the API."
    />
  );
};

UserManagement.propTypes = {
  users: PropTypes.array.isRequired,
  onAddUser: PropTypes.func.isRequired,
  onViewUser: PropTypes.func,
  onEditUser: PropTypes.func,
  onDeleteUser: PropTypes.func,
};

export default UserManagement;