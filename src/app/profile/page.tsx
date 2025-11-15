'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileView from '@/components/ProfileView';

export default function ProfilePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
        <ProfileView />
      </main>
      <Footer />
    </>
  );
}
