
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      tenantId: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    tenantId: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    tenantId: string;
  }
}

