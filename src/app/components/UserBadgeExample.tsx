import React from 'react';
import UserBadge from '@/app/shared/UserBadge';

const UserBadgeExample = () => {
  return (
    <div className="p-4">
      <UserBadge 
        username="Idris"
        amount="0.14"
        avatarUrl="/images/userImage.png"
        isOnline={true}
      />
    </div>
  );
};

export default UserBadgeExample;