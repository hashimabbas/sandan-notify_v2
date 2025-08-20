// pages/protected.tsx
import { getSession } from 'next-auth/react';

export default function ProtectedPage() {
  return (
    <div>
      <h1>This is a protected page</h1>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
