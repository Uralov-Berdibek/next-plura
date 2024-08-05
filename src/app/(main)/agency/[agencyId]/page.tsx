import React from 'react';

const Page = ({ params }: { params: { agencyId: string } }) => {
  return <div className='h-screen overflow-hidden'>{params.agencyId}</div>;
};

export default Page;
