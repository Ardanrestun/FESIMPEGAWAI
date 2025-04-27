'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const Home = () => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const role = Cookies.get('role');
    const menus = Cookies.get('menus');

    console.log('Token:', token);
    console.log('Role:', role);
    console.log('Menus:', JSON.parse(menus || '[]'));
  }, []);

  if (!authorized) return null;

  return (
    <h1 className="text-xl font-semibold">Selamat datang di Dashboard</h1>
  
  );
}

export default Home