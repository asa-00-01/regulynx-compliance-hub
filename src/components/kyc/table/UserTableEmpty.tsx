
import React from 'react';
import { User } from 'lucide-react';

const UserTableEmpty: React.FC = () => {
  return (
    <div className="text-center py-8">
      <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">No users found</h3>
      <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
    </div>
  );
};

export default UserTableEmpty;
