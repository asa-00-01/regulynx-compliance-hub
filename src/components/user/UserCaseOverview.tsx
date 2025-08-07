import React from 'react';
import { User } from '@/types/user';
import { FileText } from 'react-feather';

interface UserCaseOverviewProps {
  user: User;
}

const UserCaseOverview: React.FC<UserCaseOverviewProps> = ({ user }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">User Overview</h3>
      
      <div className="mb-4">
        <h4 className="text-md font-semibold text-gray-700 mb-2">Personal Information</h4>
        <p className="text-gray-600"><strong>Full Name:</strong> {user.fullName}</p>
        <p className="text-gray-600"><strong>Email:</strong> {user.email}</p>
        {/* Add more user details here as needed */}
      </div>
      
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-2">Documents</h4>
        {user.documents && user.documents.length > 0 ? (
          <div className="space-y-2">
            {user.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{doc.file_name}</p>
                    <p className="text-sm text-gray-500">Uploaded: {new Date(doc.upload_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                  doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No documents found for this user.</p>
        )}
      </div>
    </div>
  );
};

export default UserCaseOverview;
