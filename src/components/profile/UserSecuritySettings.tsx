
import React from 'react';
import PasswordSettings from './security/PasswordSettings';
import TwoFactorAuthSettings from './security/TwoFactorAuthSettings';
import LoginSessions from './security/LoginSessions';

const UserSecuritySettings = () => {
  return (
    <div className="space-y-6">
      <PasswordSettings />
      <TwoFactorAuthSettings />
      <LoginSessions />
    </div>
  );
};

export default UserSecuritySettings;
